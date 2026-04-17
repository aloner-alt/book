import { getServerSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "./db/schema";
import bcrypt from "bcryptjs";
import {
  isLoginBlocked,
  incrementLoginAttempts,
  resetLoginAttempts,
  getBlockTtl,
} from "./redis";

export type UserRole = "BUSINESS" | "CLIENT" | "EMPLOYEE" | "FREELANCER";

export const ROLE_REDIRECT: Record<UserRole, string> = {
  BUSINESS: "/cabinet/business",
  CLIENT: "/cabinet/client",
  EMPLOYEE: "/cabinet/employee",
  FREELANCER: "/cabinet/freelancer",
};

export const authOption: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        login: { label: "Логин", type: "text" },
        password: { label: "Пароль", type: "password" },
        role: { label: "Роль", type: "text" },
      },
      async authorize(credentials) {
        const login = credentials?.login ?? "";
        const password = credentials?.password ?? "";
        const role = credentials?.role as UserRole | undefined;

        if (!login || !password) {
          throw new Error("EMPTY_FIELDS");
        }

        // Check brute-force block
        if (await isLoginBlocked(login)) {
          const ttl = await getBlockTtl(login);
          const minutes = Math.ceil(ttl / 60);
          throw new Error(`BLOCKED:${minutes}`);
        }

        // Find user by login (or email fallback)
        const user = await db.query.users.findFirst({
          where: eq(users.login, login),
        });

        if (!user || !user.isActive) {
          await incrementLoginAttempts(login);
          throw new Error("INVALID_CREDENTIALS");
        }

        // Verify role if specified
        if (role && user.role !== role) {
          await incrementLoginAttempts(login);
          throw new Error("INVALID_CREDENTIALS");
        }

        const isPasswordCorrect = await bcrypt.compare(
          password,
          user.hashedPassword,
        );

        if (!isPasswordCorrect) {
          await incrementLoginAttempts(login);
          throw new Error("INVALID_CREDENTIALS");
        }

        // Success — reset attempts
        await resetLoginAttempts(login);

        return {
          id: user.id,
          login: user.login,
          email: user.email ?? undefined,
          role: user.role as UserRole,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.login = (user as { login?: string }).login ?? "";
        token.role = (user as { role?: UserRole }).role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.login = token.login as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
};

export const getAuthServerSession = () => getServerSession(authOption);
