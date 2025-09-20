import { z } from 'zod'

// User Types
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  subscription: z.enum(['free', 'pro', 'enterprise']).default('free'),
  credits: z.number().default(10),
  createdAt: z.date(),
})

export type User = z.infer<typeof UserSchema>

// Project Types
export const ProjectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string(),
  industry: z.string(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft'),
  currentAgent: z.string().nullable(),
  createdAt: z.date(),
})

export type Project = z.infer<typeof ProjectSchema>

// Agent Types
export enum AgentType {
  MARKET_MAPPER = 'market_mapper',
  MVP_ARCHITECT = 'mvp_architect',
  COMPETITOR_GPT = 'competitor_gpt',
}

export const AgentSessionSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  agentType: z.nativeEnum(AgentType),
  status: z.enum(['pending', 'running', 'completed', 'failed']).default('pending'),
  inputData: z.record(z.any()),
  outputData: z.record(z.any()).nullable(),
  createdAt: z.date(),
})

export type AgentSession = z.infer<typeof AgentSessionSchema>

// Conversation Types
export const ConversationSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.date(),
})

export type Conversation = z.infer<typeof ConversationSchema>

// Analysis Results Types
export const AnalysisResultSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  agentType: z.nativeEnum(AgentType),
  analysisData: z.record(z.any()),
  version: z.number().default(1),
  createdAt: z.date(),
})

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>

// Legacy Agent Input/Output Types (keeping for backward compatibility)
export interface LegacyMarketMapperInput {
  industry: string
  targetMarket: string
  businessIdea: string
}

export interface LegacyMarketMapperOutput {
  marketSize: {
    tam: number
    sam: number
    som: number
  }
  trends: Array<{
    trend: string
    impact: 'high' | 'medium' | 'low'
    timeframe: string
  }>
  opportunities: Array<{
    opportunity: string
    potential: 'high' | 'medium' | 'low'
    difficulty: 'high' | 'medium' | 'low'
  }>
  threats: Array<{
    threat: string
    severity: 'high' | 'medium' | 'low'
    likelihood: 'high' | 'medium' | 'low'
  }>
}

export interface MVPArchitectInput {
  businessIdea: string
  targetAudience: string
  budget: number
  timeline: string
  technicalExpertise: 'beginner' | 'intermediate' | 'advanced'
}

export interface MVPArchitectOutput {
  features: Array<{
    feature: string
    priority: 'must-have' | 'should-have' | 'nice-to-have'
    complexity: 'low' | 'medium' | 'high'
    estimatedHours: number
  }>
  techStack: {
    frontend: string[]
    backend: string[]
    database: string
    hosting: string
    thirdParty: string[]
  }
  timeline: Array<{
    phase: string
    duration: string
    deliverables: string[]
  }>
  budget: {
    development: number
    tools: number
    hosting: number
    total: number
  }
}

export interface CompetitorGPTInput {
  businessIdea: string
  industry: string
  targetMarket: string
}

export interface CompetitorGPTOutput {
  directCompetitors: Array<{
    name: string
    description: string
    strengths: string[]
    weaknesses: string[]
    marketShare: number
    funding: string
    website: string
  }>
  indirectCompetitors: Array<{
    name: string
    description: string
    overlap: string
    threat: 'high' | 'medium' | 'low'
  }>
  competitiveAdvantages: Array<{
    advantage: string
    sustainability: 'high' | 'medium' | 'low'
    implementation: string
  }>
  recommendations: Array<{
    recommendation: string
    priority: 'high' | 'medium' | 'low'
    reasoning: string
  }>
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// UI Component Types
export interface AgentCardProps {
  agentType: AgentType
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  isActive?: boolean
  onSelect?: () => void
}

export interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onDelete?: (projectId: string) => void
  onView?: (project: Project) => void
}

// Form Types
export const CreateProjectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  industry: z.string().min(1, 'Industry is required'),
})

export type CreateProjectFormData = z.infer<typeof CreateProjectFormSchema>

// Agent Configuration Types
export interface AgentConfig {
  type: AgentType
  name: string
  description: string
  capabilities: string[]
  inputSchema: z.ZodSchema
  outputSchema: z.ZodSchema
  maxTokens: number
  temperature: number
}

// Error Types
export class AgentError extends Error {
  constructor(
    message: string,
    public agentType: AgentType,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AgentError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Utility Types
export type Nullable<T> = T | null
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>
