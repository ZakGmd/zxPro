"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Chat } from "@/components/messages/chat"

// In Next.js 15, we don't need React.use() here as we're using a client component
// The params are passed synchronously to client components
export default function ChatPage({ params }: { params: { userId: string } }) {
  const { status } = useSession()
  const router = useRouter()
  
  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)]">
      <div className="h-full flex flex-col">
        <h1 className="text-xl font-bold p-4">Messages</h1>
        
        <div className="flex-1 bg-[#1D1D1F] rounded-lg overflow-hidden">
          <Chat userId={params.userId} />
        </div>
      </div>
    </div>
  )
} 