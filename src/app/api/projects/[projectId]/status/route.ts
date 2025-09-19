import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { projectQueries } from '@/lib/database/queries'
import { agentOrchestrator } from '@/lib/agents'
import { createApiResponse, getErrorMessage } from '@/lib/utils'

interface RouteContext {
  params: Promise<{
    projectId: string
  }>
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

    const { projectId } = await params
    
    // Check if project exists and belongs to user
    const [project] = await projectQueries.findById(projectId)
    if (!project || project.userId !== session.user.id) {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Project not found'),
        { status: 404 }
      )
    }

    // Get agent status
    const agentStatus = await agentOrchestrator.getAgentStatus(projectId)
    
    // Get all analysis results
    const analysisResults = await agentOrchestrator.getAllAnalysisResults(projectId)

    const response = {
      project,
      agentStatus,
      analysisResults,
    }

    return NextResponse.json(
      createApiResponse(true, response, 'Project status retrieved successfully')
    )
  } catch (error) {
    console.error('Error getting project status:', error)
    
    return NextResponse.json(
      createApiResponse(false, null, null, getErrorMessage(error)),
      { status: 500 }
    )
  }
}
