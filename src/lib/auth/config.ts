import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { userQueries } from '@/lib/database/queries'
import { nanoid } from 'nanoid'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Simplified sign-in for now to avoid database issues
      console.log('NextAuth signIn callback triggered for:', user?.email)
      return true
    },
    async session({ session, token }) {
      // Simplified session callback
      if (session.user?.email) {
        try {
          const dbUser = await userQueries.findByEmail(session.user.email)
          if (dbUser.length > 0) {
            session.user.id = dbUser[0].id
            session.user.subscription = dbUser[0].subscription
            session.user.credits = dbUser[0].credits
          }
        } catch (error) {
          console.error('Session callback error:', error)
          // Continue with session even if DB query fails
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
