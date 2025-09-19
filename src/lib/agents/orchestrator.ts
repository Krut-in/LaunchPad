import { AgentType, AgentError } from '@/types'
import { MarketMapperAgent } from './market-mapper'
import { MVPArchitectAgent } from './mvp-architect'
import { CompetitorGPTAgent } from './competitor-gpt'
import { BaseAgent } from './base-agent'
import { projectQueries, analysisResultQueries } from '@/lib/database/queries'
import { nanoid } from 'nanoid'

export class AgentOrchestrator {
  private agents: Map<AgentType, BaseAgent>

  constructor() {
    this.agents = new Map([
      [AgentType.MARKET_MAPPER, new MarketMapperAgent()],
      [AgentType.MVP_ARCHITECT, new MVPArchitectAgent()],
      [AgentType.COMPETITOR_GPT, new CompetitorGPTAgent()],
    ])
  }

  /**
   * Get all available agent types
   */
  getAvailableAgents(): AgentType[] {
    return Array.from(this.agents.keys())
  }

  /**
   * Get agent configuration
   */
  getAgentConfig(agentType: AgentType) {
    const agent = this.agents.get(agentType)
    if (!agent) {
      throw new AgentError(
        `Agent type ${agentType} is not available`,
        agentType,
        'AGENT_NOT_FOUND'
      )
    }
    return (agent as any).config
  }

  /**
   * Run a specific agent for a project
   */
  async runAgent<TInput = any, TOutput = any>(
    projectId: string,
    agentType: AgentType,
    input: TInput
  ): Promise<{
    sessionId: string
    output: TOutput
  }> {
    const agent = this.agents.get(agentType)
    if (!agent) {
      throw new AgentError(
        `Agent type ${agentType} is not available`,
        agentType,
        'AGENT_NOT_FOUND'
      )
    }

    try {
      // Update project's current agent
      await projectQueries.updateCurrentAgent(projectId, agentType)

      // Run the agent
      const result = await agent.run(projectId, input)

      // Store analysis results
      await this.storeAnalysisResult(projectId, agentType, result.output)

      // Clear current agent from project
      await projectQueries.updateCurrentAgent(projectId, null)

      return result
    } catch (error) {
      // Clear current agent from project on error
      await projectQueries.updateCurrentAgent(projectId, null)
      throw error
    }
  }

  /**
   * Run multiple agents in sequence
   */
  async runAgentSequence(
    projectId: string,
    sequence: Array<{
      agentType: AgentType
      input: any
    }>
  ): Promise<Array<{
    agentType: AgentType
    sessionId: string
    output: any
  }>> {
    const results: Array<{
      agentType: AgentType
      sessionId: string
      output: any
    }> = []

    for (const { agentType, input } of sequence) {
      try {
        const result = await this.runAgent(projectId, agentType, input)
        results.push({
          agentType,
          sessionId: result.sessionId,
          output: result.output,
        })
      } catch (error) {
        // If one agent fails, we still want to continue with the others
        console.error(`Agent ${agentType} failed:`, error)
        throw error // Or continue depending on requirements
      }
    }

    return results
  }

  /**
   * Get the latest analysis result for a project and agent
   */
  async getLatestAnalysis(projectId: string, agentType: AgentType) {
    return await analysisResultQueries.findByProjectAndAgent(projectId, agentType)
  }

  /**
   * Get all analysis results for a project
   */
  async getAllAnalysisResults(projectId: string) {
    return await analysisResultQueries.findByProjectId(projectId)
  }

  /**
   * Check if an agent can run (e.g., user has enough credits)
   */
  async canRunAgent(userId: string, agentType: AgentType): Promise<boolean> {
    // This could include credit checks, subscription limits, etc.
    // For now, we'll just return true
    return true
  }

  /**
   * Get agent execution status for a project
   */
  async getAgentStatus(projectId: string): Promise<{
    currentAgent: AgentType | null
    completedAgents: AgentType[]
    availableAgents: AgentType[]
  }> {
    const [project] = await projectQueries.findById(projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    const analysisResults = await this.getAllAnalysisResults(projectId)
    const completedAgents = analysisResults.map(result => result.agentType as AgentType)
    const availableAgents = this.getAvailableAgents().filter(
      agent => !completedAgents.includes(agent)
    )

    return {
      currentAgent: project.currentAgent as AgentType | null,
      completedAgents,
      availableAgents,
    }
  }

  /**
   * Store analysis results in the database
   */
  private async storeAnalysisResult(
    projectId: string,
    agentType: AgentType,
    analysisData: any
  ) {
    const version = await analysisResultQueries.getLatestVersion(projectId, agentType) + 1

    await analysisResultQueries.create({
      id: nanoid(),
      projectId,
      agentType,
      analysisData,
      version,
    })
  }

  /**
   * Validate agent input based on agent type
   */
  validateAgentInput(agentType: AgentType, input: any): boolean {
    const agent = this.agents.get(agentType)
    if (!agent) {
      return false
    }

    try {
      (agent as any).validateInput(input)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get recommended agent sequence based on project type
   */
  getRecommendedSequence(industry: string): AgentType[] {
    // This could be more sophisticated based on industry, project type, etc.
    return [
      AgentType.MARKET_MAPPER,
      AgentType.COMPETITOR_GPT,
      AgentType.MVP_ARCHITECT,
    ]
  }
}

// Singleton instance
export const agentOrchestrator = new AgentOrchestrator()
