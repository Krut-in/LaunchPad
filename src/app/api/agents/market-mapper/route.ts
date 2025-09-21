import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { MarketMapperAgent, MarketMapperInput, MarketMapperOutput } from '@/lib/agents/market-mapper'
import { createApiResponse, getErrorMessage } from '@/lib/utils'

function generateMockResponse(input: MarketMapperInput): MarketMapperOutput {
  // Use a consistent timestamp for SSR/client consistency
  const consistentTimestamp = new Date('2024-01-01T00:00:00Z')
  const mockResponse: MarketMapperOutput = {
    analysisId: `mock-analysis-${input.businessIdea.slice(0, 10).replace(/\s+/g, '-').toLowerCase()}`,
    timestamp: consistentTimestamp,
    processingMode: input.processingMode,
    researchDepth: input.researchDepth || 'basic',
    confidenceScore: 0.8,
    dataSources: [
      { source: 'Mock Data', type: 'manual_research', reliability: 0.8 }
    ]
  }

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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Unauthorized'),
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const input: MarketMapperInput = {
      businessIdea: body.businessIdea,
      industry: body.industry,
      targetMarket: body.targetMarket,
      answers: body.answers,
      processingMode: body.processingMode || 'discovery',
      researchDepth: body.researchDepth || 'basic',
      competitorLimit: body.competitorLimit || 10,
      includeWebResearch: body.includeWebResearch !== false,
      includeSentimentAnalysis: body.includeSentimentAnalysis !== false,
      targetGeography: body.targetGeography,
      budgetRange: body.budgetRange,
      timeHorizon: body.timeHorizon,
      existingCompetitors: body.existingCompetitors,
    }

    if (!input.businessIdea || input.businessIdea.length < 10) {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Business idea must be at least 10 characters'),
        { status: 400 }
      )
    }

    // Use real AI analysis by default, only use mock data when explicitly requested
    const useMockData = process.env.USE_MOCK_DATA === 'true'

    let result
    
    if (useMockData) {
      // Use mock data only when explicitly requested via environment variable
      console.log('Using mock data (USE_MOCK_DATA=true)')
      result = generateMockResponse(input)
    } else {
      // Initialize Market Mapper agent for real AI analysis
      console.log('Using real AI analysis with OpenAI')
      const marketMapper = new MarketMapperAgent()
      
      // Process the analysis with your sophisticated framework
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
