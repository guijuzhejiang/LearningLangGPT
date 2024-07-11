import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  trustHost:true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: process.env.NODE_ENV === "development"? '/learninglang/login': '/learninglang/login',
    signOut: process.env.NODE_ENV === "development"? '/learninglang': '/learninglang',
    newUser: process.env.NODE_ENV === "development"? '/learninglang/signup':'/learninglang/signup'
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLoginPage = nextUrl.pathname.startsWith(process.env.NODE_ENV === "development"? '/learninglang/login': '/learninglang/login')
      const isOnSignupPage = nextUrl.pathname.startsWith(process.env.NODE_ENV === "development"? '/learninglang/signup':'/learninglang/signup')

      if (isLoggedIn) {
        if (isOnLoginPage || isOnSignupPage) {
          return Response.redirect(new URL(process.env.NODE_ENV === "development"? '/learninglang': '/learninglang', nextUrl))
        }
      }

      return true
    },
    async jwt({ token, user, account, profile, isNewUser, session }) {
      if (user) {
        token = { ...token, id: user.id }
      }
      // console.log("use!!!!!!!!!!!!!!!!!!!r");
      // console.log(account);
      // console.log(user);
      // console.log(token);
      try {
        token.name = user.nickname;
      } catch (e){

      }
      return token
    },
    async session({ session, token, user }) {
      if (token) {
        const { id } = token as { id: string }
        const { user } = session

        session = { ...session, user: { ...user, id, name: token.name} }
      }

      return session
    }
  },
  providers: []
} satisfies NextAuthConfig
