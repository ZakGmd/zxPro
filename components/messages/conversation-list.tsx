"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

type Conversation = {
  id: string
  name: string | null
  username: string
  image: string | null
  lastMessageAt: string
  unreadCount: number
}

export function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function fetchConversations() {
      try {
        setLoading(true)
        const response = await fetch('/api/messages')
        
        if (!response.ok) {
          throw new Error('Failed to fetch conversations')
        }
        
        const data = await response.json()
        setConversations(data)
      } catch (error) {
        console.error('Error fetching conversations:', error)
        setError(error instanceof Error ? error.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    
    fetchConversations()
    
    // Set up polling every 30 seconds to check for new messages
    const intervalId = setInterval(fetchConversations, 30000)
    
    return () => clearInterval(intervalId)
  }, [])

  const handleSelectConversation = (userId: string) => {
    router.push(`/messages/${userId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error loading conversations: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-white hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p>No conversations yet.</p>
        <p className="mt-2">Search for users to start messaging!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-1">
      {conversations.map((conversation) => {
        const isActive = pathname === `/messages/${conversation.id}`
        
        return (
          <div
            key={conversation.id}
            className={`flex items-center p-3 cursor-pointer rounded-md hover:bg-[#202327] transition-colors ${
              isActive ? 'bg-[#202327]' : ''
            }`}
            onClick={() => handleSelectConversation(conversation.id)}
          >
            <Avatar className="h-12 w-12 mr-3">
              <AvatarImage src={conversation.image || undefined} />
              <AvatarFallback>
                {conversation.name?.[0] || conversation.username[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold truncate">
                  {conversation.name || conversation.username}
                </p>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-400 truncate">
                  @{conversation.username}
                </p>
                {conversation.unreadCount > 0 && (
                  <Badge className="text-xs bg-blue-600 hover:bg-blue-700">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 