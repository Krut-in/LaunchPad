import { eq, desc, and } from 'drizzle-orm'
import { db } from './index'
import { users, projects, agentSessions, conversations, analysisResults } from './schema'
import type { 
  NewUser, 
  NewProject, 
  NewAgentSession, 
  NewConversation, 
  NewAnalysisResult 
} from './schema'
import { AgentType } from '@/types'

// User queries
export const userQueries = {
  findById: async (id: string) => {
    return await db.select().from(users).where(eq(users.id, id)).limit(1)
  },

  findByEmail: async (email: string) => {
    return await db.select().from(users).where(eq(users.email, email)).limit(1)
  },

  create: async (userData: NewUser) => {
    return await db.insert(users).values(userData).returning()
  },

  update: async (id: string, userData: Partial<NewUser>) => {
    return await db.update(users).set(userData).where(eq(users.id, id)).returning()
  },

  decrementCredits: async (id: string, amount: number = 1) => {
    const user = await userQueries.findById(id)
    if (user.length > 0 && user[0].credits >= amount) {
      return await db
        .update(users)
        .set({ credits: user[0].credits - amount })
        .where(eq(users.id, id))
        .returning()
    }
    throw new Error('Insufficient credits')
  },
}

// Project queries
export const projectQueries = {
  findById: async (id: string) => {
    return await db.select().from(projects).where(eq(projects.id, id)).limit(1)
  },

  findByUserId: async (userId: string) => {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt))
  },

  create: async (projectData: NewProject) => {
    return await db.insert(projects).values(projectData).returning()
  },

  update: async (id: string, projectData: Partial<NewProject>) => {
    return await db
      .update(projects)
      .set(projectData)
      .where(eq(projects.id, id))
      .returning()
  },

  delete: async (id: string) => {
    return await db.delete(projects).where(eq(projects.id, id))
  },

  updateCurrentAgent: async (id: string, agentType: AgentType | null) => {
    return await db
      .update(projects)
      .set({ currentAgent: agentType })
      .where(eq(projects.id, id))
      .returning()
  },
}

// Agent session queries
export const agentSessionQueries = {
  findById: async (id: string) => {
    return await db.select().from(agentSessions).where(eq(agentSessions.id, id)).limit(1)
  },

  findByProjectId: async (projectId: string) => {
    return await db
      .select()
      .from(agentSessions)
      .where(eq(agentSessions.projectId, projectId))
      .orderBy(desc(agentSessions.createdAt))
  },

  findByProjectAndAgent: async (projectId: string, agentType: AgentType) => {
    return await db
      .select()
      .from(agentSessions)
      .where(
        and(
          eq(agentSessions.projectId, projectId),
          eq(agentSessions.agentType, agentType)
        )
      )
      .orderBy(desc(agentSessions.createdAt))
      .limit(1)
  },

  create: async (sessionData: NewAgentSession) => {
    return await db.insert(agentSessions).values(sessionData).returning()
  },

  updateStatus: async (
    id: string, 
    status: 'pending' | 'running' | 'completed' | 'failed',
    outputData?: any
  ) => {
    const updateData: any = { status }
    if (outputData) {
      updateData.outputData = outputData
    }
    return await db
      .update(agentSessions)
      .set(updateData)
      .where(eq(agentSessions.id, id))
      .returning()
  },
}

// Conversation queries
export const conversationQueries = {
  findBySessionId: async (sessionId: string) => {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.sessionId, sessionId))
      .orderBy(conversations.timestamp)
  },

  create: async (conversationData: NewConversation) => {
    return await db.insert(conversations).values(conversationData).returning()
  },

  createMany: async (conversationsData: NewConversation[]) => {
    return await db.insert(conversations).values(conversationsData).returning()
  },
}

// Analysis result queries
export const analysisResultQueries = {
  findByProjectId: async (projectId: string) => {
    return await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.projectId, projectId))
      .orderBy(desc(analysisResults.createdAt))
  },

  findByProjectAndAgent: async (projectId: string, agentType: AgentType) => {
    return await db
      .select()
      .from(analysisResults)
      .where(
        and(
          eq(analysisResults.projectId, projectId),
          eq(analysisResults.agentType, agentType)
        )
      )
      .orderBy(desc(analysisResults.version))
      .limit(1)
  },

  create: async (analysisData: NewAnalysisResult) => {
    return await db.insert(analysisResults).values(analysisData).returning()
  },

  getLatestVersion: async (projectId: string, agentType: AgentType) => {
    const result = await db
      .select({ version: analysisResults.version })
      .from(analysisResults)
      .where(
        and(
          eq(analysisResults.projectId, projectId),
          eq(analysisResults.agentType, agentType)
        )
      )
      .orderBy(desc(analysisResults.version))
      .limit(1)
    
    return result.length > 0 ? result[0].version : 0
  },
}
