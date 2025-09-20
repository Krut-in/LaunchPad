import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { MarketMapperAgent, MarketMapperInput, MarketMapperOutput } from '@/lib/agents/market-mapper'
import { createApiResponse, getErrorMessage } from '@/lib/utils'

function generateMockResponse(input: MarketMapperInput): MarketMapperOutput {
  if (input.analysisMode === 'questions') {
    return {
      questions: [
        {
          id: 'target_customer',
          question: 'Who is your primary target customer? Please describe their demographics, job roles, and key characteristics.',
          type: 'target_customer',
          required: true,
        },
        {
          id: 'problem_definition',
          question: 'What specific problem does your solution solve? How do your customers currently handle this problem?',
          type: 'problem_definition',
          required: true,
        },
        {
          id: 'business_model',
          question: 'How do you plan to make money? What is your pricing strategy and revenue model?',
          type: 'business_model',
          required: true,
        },
        {
          id: 'differentiation',
          question: 'What makes your solution unique compared to existing alternatives? What is your competitive advantage?',
          type: 'differentiation',
          required: false,
        }
      ]
    }
  } else {
    return {
      executiveSummary: `Based on your business idea "${input.businessIdea.substring(0, 50)}...", this appears to be a promising opportunity in the ${input.industry || 'technology'} space. The market shows strong potential with growing demand and clear customer pain points that your solution addresses.`,
      targetAudience: [
        {
          segment: 'Small to Medium Businesses',
          pain_points: [
            'Limited resources for manual processes',
            'Need for cost-effective solutions',
            'Difficulty scaling operations'
          ],
          size: '10M+ businesses globally',
          characteristics: ['Budget-conscious', 'Growth-focused', 'Tech-adopters']
        },
        {
          segment: 'Enterprise Clients',
          pain_points: [
            'Complex operational requirements',
            'Need for scalable solutions',
            'Compliance and security concerns'
          ],
          size: '500K+ large enterprises',
          characteristics: ['Quality-focused', 'Risk-averse', 'Long sales cycles']
        }
      ],
      marketOpportunity: {
        size: '$50B+ addressable market with 15% annual growth',
        growth: 'Strong growth driven by digital transformation trends',
        trends: [
          'Increasing adoption of automation tools',
          'Remote work driving demand for digital solutions',
          'Focus on operational efficiency and cost reduction'
        ]
      },
      competitors: [
        {
          name: 'Market Leader A',
          strengths: ['Strong brand recognition', 'Large customer base', 'Comprehensive features'],
          weaknesses: ['High pricing', 'Complex onboarding', 'Legacy technology'],
          marketPosition: 'Enterprise-focused'
        },
        {
          name: 'Emerging Player B',
          strengths: ['Modern interface', 'Competitive pricing', 'Fast implementation'],
          weaknesses: ['Limited features', 'Small team', 'Unproven at scale'],
          marketPosition: 'SMB-focused'
        }
      ],
      positioning: {
        usp: 'The only solution that combines enterprise-grade capabilities with small business simplicity and pricing',
        differentiation: [
          'Intuitive user experience requiring minimal training',
          'Flexible pricing model that scales with business growth',
          'Rapid deployment and time-to-value',
          'Industry-specific customization options'
        ],
        valueProposition: 'Reduce operational costs by 30% while improving efficiency and scalability'
      },
      recommendations: [
        {
          action: 'Conduct customer discovery interviews with 20+ potential customers',
          priority: 'high',
          reasoning: 'Validate problem-solution fit and refine value proposition'
        },
        {
          action: 'Build a minimum viable product (MVP) focusing on core features',
          priority: 'high',
          reasoning: 'Test market demand with a functional prototype'
        },
        {
          action: 'Develop strategic partnerships with complementary service providers',
          priority: 'medium',
          reasoning: 'Accelerate market entry and customer acquisition'
        },
        {
          action: 'Create content marketing strategy to establish thought leadership',
          priority: 'medium',
          reasoning: 'Build brand awareness and generate inbound leads'
        }
      ]
    }
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
      analysisMode: body.analysisMode || 'questions',
    }

    if (!input.businessIdea || input.businessIdea.length < 10) {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Business idea must be at least 10 characters'),
        { status: 400 }
      )
    }

    // Check if we're in development mode and should use mock data
    const isDevelopment = process.env.NODE_ENV === 'development'
    const useMockData = isDevelopment && process.env.USE_MOCK_DATA === 'true'

    let result
    
    if (useMockData) {
      // Use mock data for development when API credits are low
      result = generateMockResponse(input)
    } else {
      // Initialize Market Mapper agent
      const marketMapper = new MarketMapperAgent()
      
      // Process the analysis
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
