import type { Config } from 'drizzle-kit'

export default {
  schema: './src/lib/database/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:dev.db',
  },
} satisfies Config
