"use client"

import { NextAuthProvider } from "@/components/providers/session-provider"

export default function NotificationsLayout({
  children,
  navigation,
}: {
  children: React.ReactNode
  navigation: React.ReactNode
}) {
  return (
    <NextAuthProvider>
      {children}
    </NextAuthProvider>
  )
} 