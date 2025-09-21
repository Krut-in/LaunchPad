/**
 * NEXTAUTH AUTHENTICATION HANDLER
 * 
 * Purpose: Handles all authentication routes for the application
 * Contains: NextAuth.js handler for login, logout, session management, and OAuth callbacks
 * Requirements: Processes authentication requests using Google OAuth provider
 * Dependencies: NextAuth library, authentication configuration from @/lib/auth/config
 */

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/config'

/**
 * NextAuth handler configured with Google OAuth and JWT strategy
 * Handles all authentication routes: /api/auth/signin, /api/auth/signout, /api/auth/callback, etc.
 */
const handler = NextAuth(authOptions)

// Export handler for both GET and POST requests (NextAuth handles routing internally)
export { handler as GET, handler as POST }
