"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ConversationList } from "@/components/messages/conversation-list"

export default function MessagesPage() {
  const { status } = useSession()
  const router = useRouter()
  
  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Messages</h1>
      
      <div className="bg-[#1D1D1F] rounded-lg overflow-hidden">
        <ConversationList />
      </div>
    </div>
  )
} 