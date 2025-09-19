import { z } from 'zod'
import { BaseAgent, AgentConfig } from './base-agent'
import { AgentType, MarketMapperInput, MarketMapperOutput } from '@/types'

const MarketMapperInputSchema = z.object({
  industry: z.string().min(1, 'Industry is required'),
  targetMarket: z.string().min(1, 'Target market is required'),
  businessIdea: z.string().min(10, 'Business idea must be at least 10 characters'),
})

const MarketMapperOutputSchema = z.object({
  marketSize: z.object({
    tam: z.number().min(0),
    sam: z.number().min(0),
    som: z.number().min(0),
  }),
  trends: z.array(z.object({
    trend: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
    timeframe: z.string(),
  })),
  opportunities: z.array(z.object({
    opportunity: z.string(),
    potential: z.enum(['high', 'medium', 'low']),
    difficulty: z.enum(['high', 'medium', 'low']),
  })),
  threats: z.array(z.object({
    threat: z.string(),
    severity: z.enum(['high', 'medium', 'low']),
    likelihood: z.enum(['high', 'medium', 'low']),
  })),
})

const MARKET_MAPPER_SYSTEM_PROMPT = `You are MarketMapper, an expert market research analyst specializing in startup validation and market analysis. Your role is to provide comprehensive market insights for new business ideas.

Your analysis should include:
1. Market Size Analysis (TAM, SAM, SOM with realistic estimates)
2. Current Market Trends (with impact assessment and timeframes)
3. Market Opportunities (with potential and difficulty ratings)
4. Market Threats (with severity and likelihood ratings)

Always provide:
- Data-driven insights based on current market conditions
- Realistic market size estimates with clear reasoning
- Actionable opportunities and threat assessments
- Clear timeframes for trends and opportunities

Format your response as valid JSON matching the required schema.`

export class MarketMapperAgent extends BaseAgent<MarketMapperInput, MarketMapperOutput> {
  constructor() {
    const config: AgentConfig = {
      type: AgentType.MARKET_MAPPER,
      name: 'Market Mapper',
      description: 'Analyzes market opportunities, trends, and threats for startup validation',
      systemPrompt: MARKET_MAPPER_SYSTEM_PROMPT,
      maxTokens: 4000,
      temperature: 0.3,
      inputSchema: MarketMapperInputSchema,
      outputSchema: MarketMapperOutputSchema,
    }
    super(config)
  }

  async processInput(input: MarketMapperInput): Promise<MarketMapperOutput> {
    const prompt = this.formatPrompt(`
Analyze the market for this business idea:

Industry: {{industry}}
Target Market: {{targetMarket}}
Business Idea: {{businessIdea}}

Please provide a comprehensive market analysis including:

1. Market Size Analysis:
   - TAM (Total Addressable Market) in USD
   - SAM (Serviceable Addressable Market) in USD
   - SOM (Serviceable Obtainable Market) in USD

2. Current Market Trends (3-5 trends):
   - Trend description
   - Impact level (high/medium/low)
   - Expected timeframe

3. Market Opportunities (3-5 opportunities):
   - Opportunity description
   - Potential for success (high/medium/low)
   - Implementation difficulty (high/medium/low)

4. Market Threats (3-5 threats):
   - Threat description
   - Severity level (high/medium/low)
   - Likelihood of occurrence (high/medium/low)

Provide realistic estimates based on current market data and trends. Format your response as valid JSON.
    `, input)

    const response = await this.callClaude([
      { role: 'user', content: prompt }
    ])

    return this.parseJsonResponse<MarketMapperOutput>(response)
  }
}
