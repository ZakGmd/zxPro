"use client"

import { NextAuthProvider } from "@/components/providers/session-provider"

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NextAuthProvider>
      <div className="min-h-screen">
        {children}
      </div>
    </NextAuthProvider>
  )
} 