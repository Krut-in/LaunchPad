import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { projectQueries, userQueries } from '@/lib/database/queries'
import { agentOrchestrator } from '@/lib/agents'
import { AgentType, AgentError } from '@/types'
import { createApiResponse, getErrorMessage } from '@/lib/utils'

interface RouteContext {
  params: {
    projectId: string
    agentType: string
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Unauthorized'),
        { status: 401 }
      )
    }

    const { projectId, agentType } = params
    
    // Validate agent type
    if (!Object.values(AgentType).includes(agentType as AgentType)) {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Invalid agent type'),
        { status: 400 }
      )
    }

    // Check if project exists and belongs to user
    const [project] = await projectQueries.findById(projectId)
    if (!project || project.userId !== session.user.id) {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Project not found'),
        { status: 404 }
      )
    }

    // Check if user has enough credits
    const [user] = await userQueries.findById(session.user.id)
    if (!user || user.credits < 1) {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Insufficient credits'),
        { status: 402 }
      )
    }

    // Get input data from request body
    const inputData = await request.json()

    // Validate input for the specific agent
    if (!agentOrchestrator.validateAgentInput(agentType as AgentType, inputData)) {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Invalid input data for agent'),
        { status: 400 }
      )
    }

    // Deduct credit
    await userQueries.decrementCredits(session.user.id, 1)

    try {
      // Run the agent
      const result = await agentOrchestrator.runAgent(
        projectId,
        agentType as AgentType,
        inputData
      )

      return NextResponse.json(
        createApiResponse(true, result, 'Agent completed successfully')
      )
    } catch (error) {
      // Refund credit if agent fails
      await userQueries.update(session.user.id, { 
        credits: user.credits // Restore original credit count
      })
      
      throw error
    }
  } catch (error) {
    console.error(`Error running agent ${params.agentType}:`, error)
    
    if (error instanceof AgentError) {
      return NextResponse.json(
        createApiResponse(false, null, null, error.message),
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      createApiResponse(false, null, null, getErrorMessage(error)),
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Unauthorized'),
        { status: 401 }
      )
    }

    const { projectId, agentType } = params
    
    // Validate agent type
    if (!Object.values(AgentType).includes(agentType as AgentType)) {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Invalid agent type'),
        { status: 400 }
      )
    }

    // Check if project exists and belongs to user
    const [project] = await projectQueries.findById(projectId)
    if (!project || project.userId !== session.user.id) {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Project not found'),
        { status: 404 }
      )
    }

    // Get latest analysis result
    const analysisResults = await agentOrchestrator.getLatestAnalysis(
      projectId,
      agentType as AgentType
    )

    return NextResponse.json(
      createApiResponse(true, analysisResults, 'Analysis results retrieved successfully')
    )
  } catch (error) {
    console.error(`Error getting agent results ${params.agentType}:`, error)
    
    return NextResponse.json(
      createApiResponse(false, null, null, getErrorMessage(error)),
      { status: 500 }
    )
  }
}
