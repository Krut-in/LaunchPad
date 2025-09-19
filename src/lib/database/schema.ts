import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { AgentType } from '@/types'

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  subscription: text('subscription', { enum: ['free', 'pro', 'enterprise'] })
    .notNull()
    .default('free'),
  credits: integer('credits').notNull().default(10),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

// Projects table
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  industry: text('industry').notNull(),
  status: text('status', { enum: ['draft', 'active', 'completed', 'archived'] })
    .notNull()
    .default('draft'),
  currentAgent: text('current_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

// Agent sessions table
export const agentSessions = sqliteTable('agent_sessions', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  agentType: text('agent_type', { 
    enum: [AgentType.MARKET_MAPPER, AgentType.MVP_ARCHITECT, AgentType.COMPETITOR_GPT] 
  }).notNull(),
  status: text('status', { enum: ['pending', 'running', 'completed', 'failed'] })
    .notNull()
    .default('pending'),
  inputData: text('input_data', { mode: 'json' }).notNull(),
  outputData: text('output_data', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

// Conversations table
export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => agentSessions.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

// Analysis results table
export const analysisResults = sqliteTable('analysis_results', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  agentType: text('agent_type', { 
    enum: [AgentType.MARKET_MAPPER, AgentType.MVP_ARCHITECT, AgentType.COMPETITOR_GPT] 
  }).notNull(),
  analysisData: text('analysis_data', { mode: 'json' }).notNull(),
  version: integer('version').notNull().default(1),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

// Type exports for use in queries
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type AgentSession = typeof agentSessions.$inferSelect
export type NewAgentSession = typeof agentSessions.$inferInsert
export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert
export type AnalysisResult = typeof analysisResults.$inferSelect
export type NewAnalysisResult = typeof analysisResults.$inferInsert
