import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { MarketMapperAgent, MarketMapperInput } from '@/lib/agents/market-mapper'
import { createApiResponse, getErrorMessage } from '@/lib/utils'

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

    // Initialize Market Mapper agent
    const marketMapper = new MarketMapperAgent()
    
    // Process the analysis
    const result = await marketMapper.processInput(input)
    
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
