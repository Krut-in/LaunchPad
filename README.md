# LaunchPad 🚀

A comprehensive multi-agent startup validation platform built with Next.js 15, powered by Claude AI agents for market research, MVP architecture, and competitive analysis.

## ✨ Features

### 🤖 Multi-Agent System
- **Market Mapper**: Comprehensive market analysis with TAM/SAM/SOM calculations, trend identification, and opportunity assessment
- **MVP Architect**: Technical architecture planning with feature prioritization, tech stack recommendations, and development roadmaps
- **Competitor GPT**: Competitive landscape analysis with strategic positioning recommendations

### 🏗️ Architecture
- **Next.js 15** with App Router and React 19
- **TypeScript** with strict mode
- **Tailwind CSS** + shadcn/ui components
- **SQLite** with Drizzle ORM
- **NextAuth.js** with Google OAuth 2.0
- **Claude API** integration
- Extensible plugin-like architecture for easy agent additions

### 🗄️ Database Schema
- Users with subscription management
- Projects with multi-agent workflow tracking
- Agent sessions with conversation history
- Analysis results with versioning

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google OAuth 2.0 credentials
- Claude API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LaunchPad
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   CLAUDE_API_KEY=your_claude_api_key_here
   DATABASE_URL=file:./dev.db
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Generate and run database migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                     # Next.js 15 App Router
│   ├── api/                 # API routes
│   ├── auth/                # Authentication pages
│   └── (dashboard)/         # Protected dashboard routes
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── agents/              # Agent-specific components
│   └── shared/              # Reusable components
├── lib/
│   ├── agents/              # Agent logic & orchestration
│   ├── database/            # Schema, connections, queries
│   ├── auth/                # NextAuth configuration
│   └── utils/               # Shared utilities
├── types/                   # TypeScript type definitions
└── hooks/                   # Custom React hooks
```

## 🤖 Agent System

### Base Agent Architecture
All agents extend the `BaseAgent` class which provides:
- Input/output validation with Zod schemas
- Claude API integration
- Session management
- Error handling
- Conversation logging

### Adding New Agents
1. Create a new agent class extending `BaseAgent`
2. Define input/output schemas
3. Implement the `processInput` method
4. Register the agent in the orchestrator
5. Create UI components for the agent

### Example Agent Implementation
```typescript
export class CustomAgent extends BaseAgent<CustomInput, CustomOutput> {
  constructor() {
    super({
      type: AgentType.CUSTOM,
      name: 'Custom Agent',
      description: 'Custom analysis agent',
      systemPrompt: 'Your system prompt here',
      maxTokens: 4000,
      temperature: 0.3,
      inputSchema: CustomInputSchema,
      outputSchema: CustomOutputSchema,
    })
  }

  async processInput(input: CustomInput): Promise<CustomOutput> {
    // Your agent logic here
  }
}
```

## 🗄️ Database

### Schema Overview
- **users**: User accounts with subscription and credits
- **projects**: User projects with workflow state
- **agent_sessions**: Individual agent execution sessions
- **conversations**: Chat history for each session
- **analysis_results**: Structured analysis outputs with versioning

### Database Commands
```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

## 🔐 Authentication

Uses NextAuth.js with Google OAuth 2.0:
- Automatic user creation on first sign-in
- Session management with JWT
- Credit system for API usage
- Subscription tiers (free, pro, enterprise)

## 🎨 UI Components

Built with shadcn/ui components:
- Consistent design system
- Dark mode support
- Responsive design
- Accessible components

## 📡 API Routes

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project

### Agents
- `POST /api/projects/[id]/agents/[type]` - Run agent analysis
- `GET /api/projects/[id]/agents/[type]` - Get analysis results

### Status
- `GET /api/projects/[id]/status` - Get project status and agent progress

## 🚀 Deployment

### Environment Setup
1. Set production environment variables
2. Configure database for production
3. Set up Google OAuth for production domain

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Database Migration in Production
```bash
# Run migrations in production
npm run db:migrate
```

## 🧪 Development

### Code Quality
- ESLint configuration
- TypeScript strict mode
- Zod validation throughout
- Error boundaries

### Database Development
```bash
# Reset database
rm dev.db
npm run db:generate
npm run db:migrate
```

### Adding Dependencies
```bash
# Add new dependency
npm install package-name

# Add dev dependency
npm install -D package-name
```

## 📊 Monitoring & Analytics

### Error Tracking
- Structured error logging
- Agent-specific error types
- Session tracking

### Usage Analytics
- Credit usage tracking
- Agent performance metrics
- User engagement analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use Zod for all data validation
- Implement proper error handling
- Add JSDoc comments for complex functions
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Anthropic](https://www.anthropic.com/) for Claude AI
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations

## 📞 Support

For support, email support@launchpad.dev or join our Discord community.

---

Built with ❤️ using Next.js 15 and Claude AI
