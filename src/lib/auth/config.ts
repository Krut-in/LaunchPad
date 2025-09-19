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
      if (account?.provider === 'google' && user.email) {
        try {
          // Check if user exists
          const existingUser = await userQueries.findByEmail(user.email)
          
          if (existingUser.length === 0) {
            // Create new user
            await userQueries.create({
              id: nanoid(),
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              subscription: 'free',
              credits: 10,
            })
          }
          return true
        } catch (error) {
          console.error('Error during sign in:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const dbUser = await userQueries.findByEmail(session.user.email)
        if (dbUser.length > 0) {
          session.user.id = dbUser[0].id
          session.user.subscription = dbUser[0].subscription
          session.user.credits = dbUser[0].credits
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
