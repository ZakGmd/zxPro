"use client"

import "@/app/globals.css"
import { SessionProvider } from "@/components/providers/SessionProvider"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
} 