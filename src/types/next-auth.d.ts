import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/server/auth";

declare module "next-auth" {
  interface User {
    id: string;
    login: string;
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      login: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    login: string;
    role: UserRole;
  }
}
