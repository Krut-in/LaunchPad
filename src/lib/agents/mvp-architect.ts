import { z } from 'zod'
import { BaseAgent, AgentConfig } from './base-agent'
import { AgentType, MVPArchitectInput, MVPArchitectOutput } from '@/types'

const MVPArchitectInputSchema = z.object({
  businessIdea: z.string().min(10, 'Business idea must be at least 10 characters'),
  targetAudience: z.string().min(5, 'Target audience is required'),
  budget: z.number().min(0, 'Budget must be a positive number'),
  timeline: z.string().min(1, 'Timeline is required'),
  technicalExpertise: z.enum(['beginner', 'intermediate', 'advanced']),
})

const MVPArchitectOutputSchema = z.object({
  features: z.array(z.object({
    feature: z.string(),
    priority: z.enum(['must-have', 'should-have', 'nice-to-have']),
    complexity: z.enum(['low', 'medium', 'high']),
    estimatedHours: z.number().min(0),
  })),
  techStack: z.object({
    frontend: z.array(z.string()),
    backend: z.array(z.string()),
    database: z.string(),
    hosting: z.string(),
    thirdParty: z.array(z.string()),
  }),
  timeline: z.array(z.object({
    phase: z.string(),
    duration: z.string(),
    deliverables: z.array(z.string()),
  })),
  budget: z.object({
    development: z.number().min(0),
    tools: z.number().min(0),
    hosting: z.number().min(0),
    total: z.number().min(0),
  }),
})

const MVP_ARCHITECT_SYSTEM_PROMPT = `You are MVP Architect, an expert product strategist and technical architect specializing in building Minimum Viable Products (MVPs) for startups.

Your role is to:
1. Define core features prioritized by importance and complexity
2. Recommend appropriate technology stacks based on team expertise
3. Create realistic development timelines with clear phases
4. Estimate development costs and resource requirements

Always provide:
- Feature prioritization using MoSCoW method (Must-have, Should-have, Nice-to-have)
- Technology recommendations suited to the team's expertise level
- Realistic time estimates for development phases
- Accurate budget breakdowns including development, tools, and hosting costs
- Actionable implementation roadmap

Consider factors like:
- Team technical expertise level
- Budget constraints
- Time to market requirements
- Scalability needs for MVP stage

Format your response as valid JSON matching the required schema.`

export class MVPArchitectAgent extends BaseAgent<MVPArchitectInput, MVPArchitectOutput> {
  constructor() {
    const config: AgentConfig = {
      type: AgentType.MVP_ARCHITECT,
      name: 'MVP Architect',
      description: 'Designs comprehensive MVP architecture with features, tech stack, timeline, and budget',
      systemPrompt: MVP_ARCHITECT_SYSTEM_PROMPT,
      maxTokens: 4000,
      temperature: 0.2,
      inputSchema: MVPArchitectInputSchema,
      outputSchema: MVPArchitectOutputSchema,
    }
    super(config)
  }

  async processInput(input: MVPArchitectInput): Promise<MVPArchitectOutput> {
    const prompt = this.formatPrompt(`
Design an MVP architecture for this business idea:

Business Idea: {{businessIdea}}
Target Audience: {{targetAudience}}
Budget: $\{{budget}} USD
Timeline: {{timeline}}
Technical Expertise: {{technicalExpertise}}

Please provide a comprehensive MVP architecture including:

1. Feature List (8-12 features):
   - Feature description
   - Priority level (must-have/should-have/nice-to-have)
   - Development complexity (low/medium/high)
   - Estimated development hours

2. Technology Stack Recommendations:
   - Frontend technologies (appropriate for expertise level)
   - Backend technologies
   - Database solution
   - Hosting platform
   - Third-party services/APIs needed

3. Development Timeline (3-5 phases):
   - Phase name
   - Duration estimate
   - Key deliverables for each phase

4. Budget Breakdown:
   - Development costs (based on estimated hours)
   - Tools and software licenses
   - Hosting and infrastructure costs
   - Total estimated cost

Consider the team's {{technicalExpertise}} expertise level when recommending technologies.
Ensure recommendations fit within the $\{{budget}} budget and {{timeline}} timeline.

Format your response as valid JSON.
    `, input)

    const response = await this.callOpenAI([
      { role: 'user', content: prompt }
    ])

    return this.parseJsonResponse<MVPArchitectOutput>(response)
  }
}
