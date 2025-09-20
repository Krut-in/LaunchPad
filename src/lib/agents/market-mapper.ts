import { z } from 'zod'
import { BaseAgent, AgentConfig } from './base-agent'
import { AgentType } from '@/types'

// Enhanced input schema for Market Mapper
const MarketMapperInputSchema = z.object({
  businessIdea: z.string().min(10, 'Business idea must be at least 10 characters'),
  industry: z.string().optional(),
  targetMarket: z.string().optional(),
  answers: z.record(z.string()).optional(), // Dynamic Q&A pairs
  analysisMode: z.enum(['questions', 'analysis']).default('questions'),
})

// Enhanced output schema matching your specification
const MarketMapperOutputSchema = z.object({
  // For question mode
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    type: z.enum(['target_customer', 'problem_definition', 'business_model', 'differentiation', 'market_scope']),
    required: z.boolean(),
  })).optional(),
  
  // For analysis mode
  executiveSummary: z.string().optional(),
  targetAudience: z.array(z.object({
    segment: z.string(),
    pain_points: z.array(z.string()),
    size: z.string().optional(),
    characteristics: z.array(z.string()).optional(),
  })).optional(),
  marketOpportunity: z.object({
    size: z.string(),
    growth: z.string(),
    trends: z.array(z.string()).optional(),
  }).optional(),
  competitors: z.array(z.object({
    name: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    marketPosition: z.string().optional(),
  })).optional(),
  positioning: z.object({
    usp: z.string(),
    differentiation: z.array(z.string()),
    valueProposition: z.string().optional(),
  }).optional(),
  recommendations: z.array(z.object({
    action: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    reasoning: z.string().optional(),
  })).optional(),
})

export type MarketMapperInput = z.infer<typeof MarketMapperInputSchema>
export type MarketMapperOutput = z.infer<typeof MarketMapperOutputSchema>

const QUESTION_GENERATION_PROMPT = `You are MarketMapper, an expert market research analyst. Your role is to generate targeted questions to clarify startup ideas for comprehensive market analysis.

RULES FOR QUESTION GENERATION:
1. Generate 2-5 questions maximum per session
2. Focus on critical gaps in understanding
3. Prioritize questions that unlock the most market insights
4. Stop when sufficient clarity is achieved
5. Each question should be specific and actionable

QUESTION TYPES TO CONSIDER:
- Target customer identification (who exactly will pay?)
- Specific problem being solved (what pain point?)
- Business model basics (how will you make money?)
- Market differentiation (why choose you over alternatives?)
- Initial market focus/scope (where will you start?)

ANALYZE THE BUSINESS IDEA AND EXISTING ANSWERS, THEN:
- Identify the most critical information gaps
- Generate focused questions that will unlock market insights
- Prioritize questions by importance for market validation
- Ensure each question serves a specific analytical purpose

Format your response as valid JSON with an array of question objects.`

const MARKET_ANALYSIS_PROMPT = `You are MarketMapper, an expert market research analyst specializing in startup validation and market analysis.

Your comprehensive analysis should include:

1. EXECUTIVE SUMMARY: Concise overview of market opportunity and key insights
2. TARGET AUDIENCE: Detailed customer segments with pain points and characteristics  
3. MARKET OPPORTUNITY: Market size, growth potential, and key trends
4. COMPETITIVE LANDSCAPE: Key competitors with strengths/weaknesses analysis
5. POSITIONING: Unique selling proposition and differentiation strategy
6. RECOMMENDATIONS: 3-5 prioritized action items for market entry

ANALYSIS GUIDELINES:
- Base insights on current market conditions and trends
- Provide realistic and data-driven assessments
- Focus on actionable insights for startup validation
- Consider both opportunities and challenges
- Prioritize recommendations by impact and feasibility

Format your response as valid JSON matching the required schema.`

export class MarketMapperAgent extends BaseAgent<MarketMapperInput, MarketMapperOutput> {
  constructor() {
    const config: AgentConfig = {
      type: AgentType.MARKET_MAPPER,
      name: 'Market Mapper',
      description: 'Intelligent market analysis with dynamic questioning and comprehensive insights',
      systemPrompt: QUESTION_GENERATION_PROMPT, // Default to question mode
      maxTokens: 4000,
      temperature: 0.3,
      inputSchema: MarketMapperInputSchema,
      outputSchema: MarketMapperOutputSchema,
    }
    super(config)
  }

  async processInput(input: MarketMapperInput): Promise<MarketMapperOutput> {
    if (input.analysisMode === 'questions') {
      return await this.generateQuestions(input)
    } else {
      return await this.performAnalysis(input)
    }
  }

  private async generateQuestions(input: MarketMapperInput): Promise<MarketMapperOutput> {
    const existingAnswers = input.answers || {}
    const answeredQuestions = Object.keys(existingAnswers)
    
    const prompt = `
Business Idea: ${input.businessIdea}
${input.industry ? `Industry: ${input.industry}` : ''}
${input.targetMarket ? `Target Market: ${input.targetMarket}` : ''}

EXISTING ANSWERS:
${answeredQuestions.length > 0 ? 
  answeredQuestions.map(q => `Q: ${q}\nA: ${existingAnswers[q]}`).join('\n\n') : 
  'No previous answers provided.'
}

Based on the business idea and existing answers, generate 2-5 targeted questions that will help clarify the most critical aspects for market analysis. Focus on gaps in understanding that are essential for comprehensive market validation.

Return a JSON object with a "questions" array containing question objects with id, question, type, and required fields.
    `

    const response = await this.callOpenAI([
      { role: 'user', content: prompt }
    ], QUESTION_GENERATION_PROMPT)

    return this.parseJsonResponse<MarketMapperOutput>(response)
  }

  private async performAnalysis(input: MarketMapperInput): Promise<MarketMapperOutput> {
    const answers = input.answers || {}
    const answersText = Object.entries(answers)
      .map(([q, a]) => `Q: ${q}\nA: ${a}`)
      .join('\n\n')

    const prompt = `
BUSINESS IDEA: ${input.businessIdea}
${input.industry ? `INDUSTRY: ${input.industry}` : ''}
${input.targetMarket ? `TARGET MARKET: ${input.targetMarket}` : ''}

DETAILED ANSWERS FROM CLARIFICATION QUESTIONS:
${answersText || 'No additional clarification provided.'}

Based on this information, provide a comprehensive market analysis including:

1. EXECUTIVE SUMMARY: 2-3 paragraph overview of the market opportunity
2. TARGET AUDIENCE: 2-4 customer segments with specific pain points and characteristics
3. MARKET OPPORTUNITY: Size estimates, growth potential, and key market trends
4. COMPETITORS: 3-5 key competitors with strengths/weaknesses analysis
5. POSITIONING: Unique selling proposition and differentiation strategies
6. RECOMMENDATIONS: 3-5 prioritized action items for market validation and entry

Ensure all insights are actionable and based on realistic market conditions. Format as valid JSON matching the schema.
    `

    const response = await this.callOpenAI([
      { role: 'user', content: prompt }
    ], MARKET_ANALYSIS_PROMPT)

    return this.parseJsonResponse<MarketMapperOutput>(response)
  }

  // Helper method to check if sufficient information is available for analysis
  public hasEnoughInformation(input: MarketMapperInput): boolean {
    const answers = input.answers || {}
    const criticalQuestions = [
      'target_customer',
      'problem_definition', 
      'business_model'
    ]
    
    // Check if we have answers covering the critical question types
    const answeredTypes = Object.keys(answers).length
    return answeredTypes >= 3 && input.businessIdea.length > 20
  }
}
