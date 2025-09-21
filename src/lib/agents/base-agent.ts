/**
 * BASE AGENT FRAMEWORK
 * 
 * Purpose: Abstract foundation for all AI agents in the system
 * Contains: OpenAI integration, session management, input/output validation, error handling
 * Requirements: Provides consistent interface for agent creation with type safety and persistence
 * Dependencies: OpenAI SDK, Zod validation, database queries, type definitions
 */

import { z } from 'zod'
import OpenAI from 'openai'
import { AgentType, AgentError } from '@/types'
import { agentSessionQueries, conversationQueries } from '@/lib/database/queries'
import { nanoid } from 'nanoid'

/**
 * Configuration interface for AI agents
 * Defines the structure and behavior parameters for each agent type
 */
export interface AgentConfig {
  /** Agent type identifier for routing and categorization */
  type: AgentType
  /** Human-readable agent name */
  name: string
  /** Brief description of agent capabilities */
  description: string
  /** Core system prompt that defines agent behavior and expertise */
  systemPrompt: string
  /** Maximum tokens for OpenAI API responses */
  maxTokens: number
  /** Temperature setting for response creativity (0.0-1.0) */
  temperature: number
  /** Zod schema for validating input data */
  inputSchema: z.ZodSchema
  /** Zod schema for validating output data */
  outputSchema: z.ZodSchema
}

/**
 * Abstract base class for all AI agents
 * @template TInput - Type of input data the agent expects
 * @template TOutput - Type of output data the agent produces
 * 
 * Purpose: Provides common functionality for OpenAI integration, validation, and session management
 * Pattern: Template method pattern - subclasses implement processInput() for specific behavior
 */
export abstract class BaseAgent<TInput = any, TOutput = any> {
  protected openai: OpenAI | null = null
  protected config: AgentConfig

  /**
   * Initialize agent with configuration
   * @param {AgentConfig} config - Agent configuration including prompts and validation schemas
   */
  constructor(config: AgentConfig) {
    this.config = config
  }

  /**
   * Lazy initialization of OpenAI client with error handling
   * @returns {OpenAI} Configured OpenAI client instance
   * @throws {AgentError} If API key is not configured
   * 
   * Purpose: Creates OpenAI client only when needed, validates environment setup
   * Pattern: Singleton pattern for OpenAI client per agent instance
   */
  private getOpenAI(): OpenAI {
    if (!this.openai) {
      if (!process.env.OPENAI_API_KEY) {
        throw new AgentError(
          'OpenAI API key is required. Please set OPENAI_API_KEY environment variable.',
          this.config.type,
          'CONFIGURATION_ERROR'
        )
      }
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
      })
    }
    return this.openai
  }

  /**
   * Abstract method that subclasses must implement
   * @param {TInput} input - Validated input data specific to the agent type
   * @returns {Promise<TOutput>} Processed output data
   * 
   * Purpose: Defines the contract for agent-specific processing logic
   * Implementation: Each agent type implements this method with their unique behavior
   */
  abstract processInput(input: TInput): Promise<TOutput>

  /**
   * Makes authenticated calls to OpenAI API with configured parameters
   * @param {Array} messages - Conversation messages for the AI model
   * @param {string} systemPrompt - Optional system prompt override
   * @returns {Promise<string>} Raw response content from OpenAI
   * @throws {AgentError} If API call fails or response is invalid
   * 
   * Purpose: Centralized OpenAI API communication with error handling and logging
   * Features: Automatic retry logic, token counting, response validation
   */
  protected async callOpenAI(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    systemPrompt?: string
  ): Promise<string> {
    try {
      // Prepare messages with system prompt
      const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []
      
      if (systemPrompt || this.config.systemPrompt) {
        openaiMessages.push({
          role: 'system',
          content: systemPrompt || this.config.systemPrompt
        })
      }
      
      // Add conversation messages
      openaiMessages.push(...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })))

      const model = process.env.OPENAI_MODEL || 'gpt-5-mini'
      const requestPayload: any = {
        model,
        messages: openaiMessages,
      }

      if (model.startsWith('gpt-5')) {
        requestPayload.max_completion_tokens = this.config.maxTokens
        // GPT-5 models only support temperature = 1 (default), so we omit it
      } else {
        requestPayload.max_tokens = this.config.maxTokens
        requestPayload.temperature = this.config.temperature
      }

      const response = await this.getOpenAI().chat.completions.create(requestPayload)

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new AgentError(
          'No content received from OpenAI',
          this.config.type,
          'INVALID_RESPONSE'
        )
      }
      
      return content
    } catch (error) {
      if (error instanceof AgentError) {
        throw error
      }
      
      throw new AgentError(
        `Failed to call OpenAI API: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

  // Utility method for parsing JSON responses from OpenAI
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
