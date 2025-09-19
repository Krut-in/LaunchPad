import { z } from 'zod'
import { Anthropic } from '@anthropic-ai/sdk'
import { AgentType, AgentError } from '@/types'
import { agentSessionQueries, conversationQueries } from '@/lib/database/queries'
import { nanoid } from 'nanoid'

export interface AgentConfig {
  type: AgentType
  name: string
  description: string
  systemPrompt: string
  maxTokens: number
  temperature: number
  inputSchema: z.ZodSchema
  outputSchema: z.ZodSchema
}

export abstract class BaseAgent<TInput = any, TOutput = any> {
  protected anthropic: Anthropic
  protected config: AgentConfig

  constructor(config: AgentConfig) {
    this.config = config
    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY!,
    })
  }

  abstract processInput(input: TInput): Promise<TOutput>

  protected async callClaude(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt?: string
  ): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemPrompt || this.config.systemPrompt,
        messages,
      })

      const content = response.content[0]
      if (content.type === 'text') {
        return content.text
      }
      
      throw new AgentError(
        'Unexpected response format from Claude',
        this.config.type,
        'INVALID_RESPONSE'
      )
    } catch (error) {
      if (error instanceof AgentError) {
        throw error
      }
      
      throw new AgentError(
        `Failed to call Claude API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.config.type,
        'API_ERROR',
        error
      )
    }
  }

  protected validateInput(input: unknown): TInput {
    try {
      return this.config.inputSchema.parse(input) as TInput
    } catch (error) {
      throw new AgentError(
        `Invalid input data: ${error instanceof Error ? error.message : 'Unknown validation error'}`,
        this.config.type,
        'VALIDATION_ERROR',
        error
      )
    }
  }

  protected validateOutput(output: unknown): TOutput {
    try {
      return this.config.outputSchema.parse(output) as TOutput
    } catch (error) {
      throw new AgentError(
        `Invalid output data: ${error instanceof Error ? error.message : 'Unknown validation error'}`,
        this.config.type,
        'OUTPUT_VALIDATION_ERROR',
        error
      )
    }
  }

  async run(projectId: string, input: TInput): Promise<{
    sessionId: string
    output: TOutput
  }> {
    // Validate input
    const validatedInput = this.validateInput(input)

    // Create agent session
    const sessionData = {
      id: nanoid(),
      projectId,
      agentType: this.config.type,
      status: 'running' as const,
      inputData: validatedInput,
    }

    const [session] = await agentSessionQueries.create(sessionData)
    
    try {
      // Log start of conversation
      await conversationQueries.create({
        id: nanoid(),
        sessionId: session.id,
        role: 'system',
        content: `Starting ${this.config.name} analysis...`,
      })

      // Process the input
      const output = await this.processInput(validatedInput)
      
      // Validate output
      const validatedOutput = this.validateOutput(output)

      // Update session with results
      await agentSessionQueries.updateStatus(
        session.id,
        'completed',
        validatedOutput
      )

      // Log completion
      await conversationQueries.create({
        id: nanoid(),
        sessionId: session.id,
        role: 'assistant',
        content: `Analysis completed successfully.`,
      })

      return {
        sessionId: session.id,
        output: validatedOutput,
      }
    } catch (error) {
      // Update session status to failed
      await agentSessionQueries.updateStatus(session.id, 'failed')

      // Log error
      await conversationQueries.create({
        id: nanoid(),
        sessionId: session.id,
        role: 'system',
        content: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })

      throw error
    }
  }

  // Utility method for parsing JSON responses from Claude
  protected parseJsonResponse<T>(response: string): T {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
      const jsonString = jsonMatch ? jsonMatch[1] : response

      return JSON.parse(jsonString.trim())
    } catch (error) {
      throw new AgentError(
        `Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.config.type,
        'JSON_PARSE_ERROR',
        { response, error }
      )
    }
  }

  // Utility method for formatting structured prompts
  protected formatPrompt(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match
    })
  }
}
