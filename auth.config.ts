import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
export type {
    Account,
    DefaultSession,
    Profile,
    Session,
    User,
  } from "@auth/core/types"

export default {
  providers: [Google],
} satisfies NextAuthConfig