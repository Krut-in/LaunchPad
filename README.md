## LaunchPad

LaunchPad is an AI co-pilot for validating startup ideas. It turns a rough concept into clear market insights, a practical MVP plan, and a competitive playbook. Describe your idea; specialized agents do the heavy lifting. Concise reports help you decide what to build, why, and how—quickly and confidently every time.

### The challenge we tackled

Most early founders get stuck between inspiration and execution. Market reports are expensive, competitor research is time-consuming, and turning an idea into a realistic MVP plan often requires multiple experts. Current approaches are scattered across endless tabs, generic templates, and guesswork—slow, overwhelming, and prone to bias. LaunchPad unifies this journey into a single, guided experience that produces practical, decision-ready outputs.

### What LaunchPad does

We built LaunchPad to compress the validation cycle from weeks to hours. You provide a simple description of your idea; our orchestrated AI agents independently analyze the market, map the competition, and design a feasible MVP roadmap. Each agent produces structured, verifiable outputs that feed back into your project, so you can refine fast and move with confidence.

### Core features

#### Market Mapper

- Estimates TAM/SAM/SOM with plain-language reasoning
- Surfaces current trends with impact and timeframes
- Highlights opportunities and risks with clear trade-offs
- Produces structured, copyable outputs for easy sharing

#### Competitor GPT

- Maps direct and indirect competitors with positioning
- Summarizes strengths, weaknesses, funding, and market share
- Identifies differentiation angles you can actually sustain
- Suggests strategic moves prioritized by impact and effort

#### MVP Architect

- Translates your idea into a scoped, buildable feature set
- Recommends tech stack options matched to constraints
- Outlines a realistic timeline across phases and milestones
- Provides a transparent budget estimate and resourcing plan

#### Projects & Dashboard

- Create projects to track analyses in one place
- Versioned analysis results you can revisit and compare
- Session history for transparency and reproducibility
- Clear status of what ran, what’s next, and what’s pending

#### Authentication & Credits

- Sign in with Google securely
- Fair-use credit system to manage AI workloads
- Designed to scale from side projects to serious teams

### Technical foundation

- Next.js 15 (App Router) and React 19
- TypeScript (strict mode) and Zod validation end-to-end
- Tailwind CSS with shadcn/ui components
- SQLite with Drizzle ORM (schema, queries, migrations)
- NextAuth.js with Google OAuth 2.0
- OpenAI GPT-4o integration (OpenAI SDK)
- Extensible, plugin-like agent architecture with a central orchestrator

### Getting started

Prerequisites

- Node.js 18+
- Google OAuth credentials (Client ID and Secret)
- OpenAI API key

1. Clone and install

```bash
git clone <your-repo-url>
cd LaunchPad
npm install
```

2. Configure environment

```bash
cp env.example .env.local
```

Fill in these variables in `.env.local`:

```
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Generate and run migrations

```bash
npm run db:generate
npm run db:migrate
```

4. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

5. Production build (optional)

```bash
npm run build
npm start
```

### Project structure (high level)

```
src/
  app/            # App Router, API routes, pages
  components/     # ui/, agents/, shared/
  lib/            # agents/, database/, auth/, utils/
  types/          # TypeScript types and enums
  hooks/          # Custom React hooks
```

### Extending LaunchPad (adding an agent)

- Implement a class extending the BaseAgent (define input/output Zod schemas)
- Add your system prompt and `processInput` implementation
- Register the agent in the orchestrator
- (Optional) Add a small form and results component under `components/agents`

Clear boundaries between agent logic, orchestration, database, and UI keep changes contained and safe to evolve over time.
