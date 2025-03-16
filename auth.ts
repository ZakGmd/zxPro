import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { customPrismaAdapter } from "./libs/auth-adapter";

export const { handlers, auth, signIn, signOut } = NextAuth({
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        // @ts-ignore - Adding custom properties to the session
        session.user.id = token.sub;
        // @ts-ignore - Adding custom properties to the session
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      
      return token;
    },
  },
  adapter: customPrismaAdapter,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  ...authConfig,
});
