import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: process.env.NODE_ENV === "development"? '/login': '/learninglang/login',
    newUser: process.env.NODE_ENV === "development"? '/signup':'/learninglang/signup'
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLoginPage = nextUrl.pathname.startsWith(process.env.NODE_ENV === "development"? '/login': '/learninglang/login')
      const isOnSignupPage = nextUrl.pathname.startsWith(process.env.NODE_ENV === "development"? '/signup':'/learninglang/signup')

      if (isLoggedIn) {
        if (isOnLoginPage || isOnSignupPage) {
          return Response.redirect(new URL(process.env.NODE_ENV === "development"? '/': '/learninglang', nextUrl))
        }
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token = { ...token, id: user.id }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        const { id } = token as { id: string }
        const { user } = session

        session = { ...session, user: { ...user, id } }
      }

      return session
    }
  },
  providers: []
} satisfies NextAuthConfig
