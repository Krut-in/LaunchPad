/**
 * COMPETITOR INTELLIGENCE AGENT
 * 
 * Purpose: Specialized AI agent for competitive analysis and market positioning intelligence
 * Contains: Competitor identification, strength/weakness analysis, market share estimation, strategic recommendations
 * Requirements: Provides comprehensive competitive intelligence for startup market entry strategies
 * Dependencies: BaseAgent framework, Zod validation, type definitions for competitive analysis
 */

import { z } from 'zod'
import { BaseAgent, AgentConfig } from './base-agent'
import { AgentType, CompetitorGPTInput, CompetitorGPTOutput } from '@/types'

/**
 * Input validation schema for competitive analysis requests
 * Ensures minimum data quality for meaningful competitive intelligence
 */
const CompetitorGPTInputSchema = z.object({
  /** Business concept description (minimum 10 chars for context) */
  businessIdea: z.string().min(10, 'Business idea must be at least 10 characters'),
  /** Industry classification for competitive landscape scoping */
  industry: z.string().min(1, 'Industry is required'),
  /** Target market definition for competitor relevance filtering */
  targetMarket: z.string().min(1, 'Target market is required'),
})

/**
 * Output schema defining comprehensive competitive analysis structure
 * Ensures consistent, structured competitive intelligence delivery
 */
const CompetitorGPTOutputSchema = z.object({
  /** Direct competitors offering similar products/services */
  directCompetitors: z.array(z.object({
    name: z.string(),
    description: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    marketShare: z.number().min(0).max(100), // Percentage of market share
    funding: z.string(), // Funding status/amount
    website: z.string(),
  })),
  /** Indirect competitors with overlapping customer segments */
  indirectCompetitors: z.array(z.object({
    name: z.string(),
    description: z.string(),
    overlap: z.string(), // How they overlap with target business
    threat: z.enum(['high', 'medium', 'low']), // Threat level assessment
  })),
  /** Potential competitive advantages for the new business */
  competitiveAdvantages: z.array(z.object({
    advantage: z.string(),
    sustainability: z.enum(['high', 'medium', 'low']), // How defensible
    implementation: z.string(), // How to achieve this advantage
  })),
  /** Strategic recommendations for competitive positioning */
  recommendations: z.array(z.object({
    recommendation: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    reasoning: z.string(), // Why this recommendation matters
  })),
})

const COMPETITOR_GPT_SYSTEM_PROMPT = `You are CompetitorGPT, an expert competitive intelligence analyst specializing in startup market positioning and competitive strategy.

Your role is to:
1. Identify direct and indirect competitors in the market
2. Analyze competitor strengths, weaknesses, and market positioning
3. Identify potential competitive advantages for the new business
4. Provide strategic recommendations for market differentiation

Always provide:
- Comprehensive competitor analysis with real companies when possible
- Clear distinction between direct and indirect competition
- Realistic market share estimates and funding information
- Actionable competitive advantages and implementation strategies
- Strategic recommendations prioritized by impact and feasibility

Focus on:
- Current market leaders and emerging players
- Competitive gaps and opportunities
- Sustainable differentiation strategies
- Market positioning recommendations

Format your response as valid JSON matching the required schema.`

export class CompetitorGPTAgent extends BaseAgent<CompetitorGPTInput, CompetitorGPTOutput> {
  constructor() {
    const config: AgentConfig = {
      type: AgentType.COMPETITOR_GPT,
      name: 'Competitor GPT',
      description: 'Analyzes competitive landscape and identifies strategic advantages',
      systemPrompt: COMPETITOR_GPT_SYSTEM_PROMPT,
      maxTokens: 4000,
      temperature: 0.3,
      inputSchema: CompetitorGPTInputSchema,
      outputSchema: CompetitorGPTOutputSchema,
    }
    super(config)
  }

  async processInput(input: CompetitorGPTInput): Promise<CompetitorGPTOutput> {
    const prompt = this.formatPrompt(`
Analyze the competitive landscape for this business idea:

Business Idea: {{businessIdea}}
Indu: {{targetstry: {{industry}}
Target MarketMarket}}

Please provide a comprehensive competitive analysis including:

1. Direct Competitors (3-5 companies):
   - Company name
   - Brief description
   - Key strengths (3-4 points)
   - Key weaknesses (2-3 points)
   - Estimated market share percentage
   - Funding status/amount
   - Website URL

2. Indirect Competitors (3-4 companies):
   - Company name
   - Brief description
   - How they overlap with the business idea
   - Threat level (high/medium/low)

3. Potential Competitive Advantages (4-6 advantages):
   - Competitive advantage description
   - Sustainability rating (high/medium/low)
   - Implementation approach

4. Strategic Recommendations (4-5 recommendations):
   - Recommendation description
   - Priority level (high/medium/low)
   - Reasoning behind the recommendation

Focus on real companies and current market conditions. Provide actionable insights for market positioning and differentiation.

Format your response as valid JSON.
    `, input)

    const response = await this.callOpenAI([
      { role: 'user', content: prompt }
    ])

    return this.parseJsonResponse<CompetitorGPTOutput>(response)
  }
}
