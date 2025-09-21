/**
 * NEXTAUTH CONFIGURATION
 * 
 * Purpose: Configures authentication providers, callbacks, and session management
 * Contains: Google OAuth setup, user session handling, database integration
 * Requirements: Manages secure user authentication with JWT tokens and database persistence
 * Dependencies: NextAuth.js, Google OAuth provider, database queries for user management
 */

import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { userQueries } from '@/lib/database/queries'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    /**
     * Handles user sign-in attempts with Google OAuth
     * @param user - User information from Google
     * @param account - OAuth account details
     * @param profile - Google profile information
     * @returns boolean - Whether to allow sign-in
     * 
     * Purpose: Validates and processes new user sign-ins
     * Current: Simplified to always allow sign-in (database integration disabled for stability)
     */
    async signIn({ user, account, profile }) {
      // TODO: Re-enable database user creation once DB issues are resolved
      return true
    },
    /**
     * Enriches session data with user information from database
     * @param session - Current session object
     * @param token - JWT token data
     * @returns Enhanced session with user ID, subscription, and credits
     * 
     * Purpose: Adds database user information to client session
     * Error handling: Continues gracefully if database query fails
     */
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const dbUser = await userQueries.findByEmail(session.user.email)
          if (dbUser.length > 0) {
            session.user.id = dbUser[0].id
            session.user.subscription = dbUser[0].subscription
            session.user.credits = dbUser[0].credits
          }
        } catch (error) {
          // Silently handle database errors to maintain session stability
          console.error('Session callback error:', error)
        }
      }
      return session
    },

    /**
     * Manages JWT token data persistence
     * @param token - Current JWT token
     * @param user - User object (only present on sign-in)
     * @returns Updated token with user ID
     * 
     * Purpose: Stores user ID in JWT for session continuity
     */
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
