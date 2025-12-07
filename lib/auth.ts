import NextAuth, { DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isAnonymous?: boolean;
    } & DefaultSession['user'];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Anonymous/Guest provider
    CredentialsProvider({
      id: 'anonymous',
      name: 'Continue as Guest',
      credentials: {
        anonymousId: { label: 'Anonymous ID', type: 'text' },
      },
      async authorize(credentials) {
        // Generate or use existing anonymous ID
        const anonymousId = (credentials?.anonymousId as string) || crypto.randomUUID();

        return {
          id: anonymousId,
          name: 'Guest User',
          email: null,
          image: null,
        };
      },
    }),

    // GitHub OAuth (if configured)
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),

    // Google OAuth (if configured)
    ...(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
          }),
        ]
      : []),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.userId = user.id;
        token.isAnonymous = account?.provider === 'anonymous';
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.isAnonymous = token.isAnonymous as boolean;
      }
      return session;
    },
  },

  pages: {
    signIn: '/', // Redirect to home page for sign-in
  },
});
