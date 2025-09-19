import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { projectQueries } from '@/lib/database/queries'
import { CreateProjectFormSchema } from '@/types'
import { nanoid } from 'nanoid'
import { createApiResponse, getErrorMessage } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Unauthorized'),
        { status: 401 }
      )
    }

    const projects = await projectQueries.findByUserId(session.user.id)
    
    return NextResponse.json(
      createApiResponse(true, projects, 'Projects retrieved successfully')
    )
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      createApiResponse(false, null, null, getErrorMessage(error)),
      { status: 500 }
    )
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
    
    // Validate request data
    const validatedData = CreateProjectFormSchema.parse(body)
    
    // Create project
    const projectData = {
      id: nanoid(),
      userId: session.user.id,
      name: validatedData.name,
      description: validatedData.description,
      industry: validatedData.industry,
      status: 'draft' as const,
      currentAgent: null,
    }

    const [project] = await projectQueries.create(projectData)
    
    return NextResponse.json(
      createApiResponse(true, project, 'Project created successfully'),
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating project:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        createApiResponse(false, null, null, 'Invalid request data'),
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      createApiResponse(false, null, null, getErrorMessage(error)),
      { status: 500 }
    )
  }
}
