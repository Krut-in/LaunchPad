/**
 * MARKET MAPPER API ROUTE
 * 
 * Purpose: Handles AI-powered market analysis requests for startup ideas
 * Contains: Authentication, input validation, mock data generation, and AI agent orchestration
 * Requirements: Processes business ideas through multi-mode analysis (questions, deep analysis, strategy)
 * Dependencies: NextAuth for auth, MarketMapperAgent for AI processing, utility functions for responses
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { MarketMapperAgent, MarketMapperInput, MarketMapperOutput } from '@/lib/agents/market-mapper'
import { createApiResponse, getErrorMessage } from '@/lib/utils'

/**
 * Generates mock market analysis data for development and testing
 * @param {MarketMapperInput} input - User's business idea and analysis preferences
 * @returns {MarketMapperOutput} Structured mock analysis with questions or recommendations
 * 
 * Purpose: Provides consistent, realistic sample data without AI API calls
 * Logic: Creates different response types based on processingMode (questions vs analysis)
 * Edge cases: Uses consistent timestamp to prevent hydration mismatches in SSR
 */
function generateMockResponse(input: MarketMapperInput): MarketMapperOutput {
  // Use a consistent timestamp for SSR/client consistency (prevents hydration errors)
  const consistentTimestamp = new Date('2024-01-01T00:00:00Z')
  // Base response structure with metadata and source attribution
  const mockResponse: MarketMapperOutput = {
    analysisId: `mock-analysis-${input.businessIdea.slice(0, 10).replace(/\s+/g, '-').toLowerCase()}`, // Generate deterministic ID
    timestamp: consistentTimestamp,
    processingMode: input.processingMode,
    researchDepth: input.researchDepth || 'basic',
    confidenceScore: 0.8, // Mock confidence score for realistic UX
    dataSources: [
      { source: 'Mock Data', type: 'manual_research', reliability: 0.8 }
    ]
  }

  // Branch logic: Generate different content based on processing mode
  if (input.processingMode === 'questions') {
    mockResponse.questions = [
      {
        id: 'target_customer',
        question: 'Who is your primary target customer? Please describe their demographics, job roles, and key characteristics.',
        type: 'target_customer',
        priority: 'critical',
        required: true,
        industrySpecific: false,
      },
      {
        id: 'problem_definition',
        question: 'What specific problem does your solution solve? How do your customers currently handle this problem?',
        type: 'problem_definition',
        priority: 'critical',
        required: true,
        industrySpecific: false,
      },
      {
        id: 'business_model',
        question: 'How do you plan to make money? What is your pricing strategy and revenue model?',
        type: 'business_model',
        priority: 'high',
        required: true,
        industrySpecific: false,
      },
      {
        id: 'differentiation',
        question: 'What makes your solution unique compared to existing alternatives? What is your competitive advantage?',
        type: 'differentiation',
        priority: 'high',
        required: false,
        industrySpecific: false,
      }
    ]
    return mockResponse
  } else {
    mockResponse.executiveSummary = {
      overview: `Based on your business idea "${input.businessIdea.substring(0, 50)}...", this appears to be a promising opportunity in the ${input.industry || 'technology'} space.`,
      keyFindings: [
        'Market shows strong potential with growing demand',
        'Clear customer pain points identified',
        'Competitive landscape has opportunities for differentiation'
      ],
      marketOpportunity: 'Large addressable market with strong growth trends',
      competitiveLandscape: 'Fragmented market with room for innovation',
      recommendations: [
        'Conduct customer discovery interviews',
        'Build MVP focusing on core features',
        'Develop strategic partnerships'
      ],
      investmentReadiness: 'needs_work'
    }

    mockResponse.recommendations = [
      {
        category: 'market_entry',
        action: 'Conduct customer discovery interviews with 20+ potential customers',
        priority: 'critical',
        timeline: '4-6 weeks',
        resources: ['Customer research team', 'Interview budget'],
        expectedOutcome: 'Validated problem-solution fit',
        successMetrics: ['20+ interviews completed', 'Problem validation score >80%'],
        reasoning: 'Essential to validate market demand before significant investment'
      },
      {
        category: 'product_development',
        action: 'Build a minimum viable product (MVP) focusing on core features',
        priority: 'high',
        timeline: '3-4 months',
        resources: ['Development team', 'Design resources', 'Technical infrastructure'],
        expectedOutcome: 'Functional prototype for market testing',
        successMetrics: ['MVP completion', 'User testing feedback >7/10'],
        reasoning: 'Demonstrate concept viability and gather user feedback'
      },
      {
        category: 'partnerships',
        action: 'Develop strategic partnerships with complementary service providers',
        priority: 'medium',
        timeline: '2-3 months',
        resources: ['Business development', 'Legal support'],
        expectedOutcome: 'Partnership agreements signed',
        successMetrics: ['2+ strategic partnerships', 'Channel partner agreements'],
        reasoning: 'Accelerate market entry and customer acquisition through existing networks'
      }
    ]

    return mockResponse
  }
}

/**
 * Handles POST requests for market analysis
 * @param {NextRequest} request - Next.js request object containing business idea data
 * @returns {NextResponse} JSON response with analysis results or error message
 * 
 * Purpose: Main API endpoint for processing market analysis requests
 * Authentication: Requires valid NextAuth session
 * Processing modes: 'questions' (generates clarification questions) or 'deep_analysis' (full analysis)
 * Data sources: Uses real AI analysis via OpenAI or mock data based on environment variable
 * 
 * Complex logic: 
 * 1. Validates user authentication and input data
 * 2. Chooses between mock data (development) or AI analysis (production)
 * 3. Processes business idea through MarketMapperAgent
 * 4. Returns structured analysis with recommendations
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user authentication - all analysis requests require login
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Unauthorized'),
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Parse and validate input data with sensible defaults
    const input: MarketMapperInput = {
      businessIdea: body.businessIdea,
      industry: body.industry,
      targetMarket: body.targetMarket,
      answers: body.answers, // User responses to clarification questions
      processingMode: body.processingMode || 'discovery', // Default to discovery mode
      researchDepth: body.researchDepth || 'basic', // Basic analysis unless specified
      competitorLimit: body.competitorLimit || 10, // Limit competitor research scope
      includeWebResearch: body.includeWebResearch !== false, // Default to true (opt-out)
      includeSentimentAnalysis: body.includeSentimentAnalysis !== false, // Default to true
      targetGeography: body.targetGeography, // Optional geographic focus
      budgetRange: body.budgetRange, // Optional budget constraints
      timeHorizon: body.timeHorizon, // Optional timeline for market entry
      existingCompetitors: body.existingCompetitors, // User-provided competitor list
    }

    // Validate minimum business idea length for meaningful analysis
    if (!input.businessIdea || input.businessIdea.length < 10) {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Business idea must be at least 10 characters'),
        { status: 400 }
      )
    }

    // Determine data source: AI analysis (production) vs mock data (development/testing)
    const useMockData = process.env.USE_MOCK_DATA === 'true'

    let result
    
    if (useMockData) {
      // Development mode: Use mock data to avoid API costs and enable offline development
      console.log('Using mock data (USE_MOCK_DATA=true)')
      result = generateMockResponse(input)
    } else {
      // Production mode: Use real AI analysis with OpenAI for authentic insights
      console.log('Using real AI analysis with OpenAI')
      const marketMapper = new MarketMapperAgent()
      
      // Process through sophisticated AI framework with multi-source research
      result = await marketMapper.processInput(input)
    }
    
    return NextResponse.json(
      createApiResponse(true, result, 'Market analysis completed successfully')
    )
  } catch (error) {
    console.error('Market Mapper API error:', error)
    
    return NextResponse.json(
      createApiResponse(false, null, null, getErrorMessage(error)),
      { status: 500 }
    )
  }
}
