import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email Address", type: "email", placeholder: "name@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const res = await fetch("http://localhost:8080/auth/jwt", {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" }
        })
        const user = await res.json();
        if (user) {
          return user;
        }
        return null;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        return {
          ...token,
          access_token: user.access_token,
          details: user.user
        };
      }

      return token;
    },
    async session({ session, token }: any) {
      session.user = token.details;
      session.user.access_token = token.access_token;

      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },
  secret: process.env.JWT_SECRET,
};
export default NextAuth(authOptions);

