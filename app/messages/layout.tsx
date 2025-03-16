"use client"

import { NextAuthProvider } from "@/components/providers/session-provider"
import { NavBar } from "@/components/navbar"

export default function MessagesLayout({
  children,
  navigation,
}: {
  children: React.ReactNode
  navigation: React.ReactNode
}) {
  return (
    <NextAuthProvider>
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <main className="pt-16">
          {children}
        </main>
      </div>
    </NextAuthProvider>
  )
} 