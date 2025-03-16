"use client"

import React, { useState, useEffect, useRef, FormEvent } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type User = {
  id: string
  name: string | null
  username: string
  image: string | null
}

type Message = {
  id: string
  content: string
  createdAt: string
  isRead: boolean
  isOwnMessage: boolean
  fromUserId: string
  toUserId: string
  fromUser: User
}

type ChatProps = {
  userId: string
}

export function Chat({ userId }: ChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messageText, setMessageText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch messages and user data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch user details
        const userResponse = await fetch(`/api/users/${userId}`)
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user details')
        }
        const userData = await userResponse.json()
        setUser(userData)
        
        // Fetch messages
        const messagesResponse = await fetch(`/api/messages/${userId}`)
        if (!messagesResponse.ok) {
          throw new Error('Failed to fetch messages')
        }
        const messagesData = await messagesResponse.json()
        setMessages(messagesData)
      } catch (error) {
        console.error('Error:', error)
        setError(error instanceof Error ? error.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    
    // Set up polling every 5 seconds to check for new messages
    const intervalId = setInterval(() => {
      if (!sending) {
        fetchData()
      }
    }, 5000)
    
    return () => clearInterval(intervalId)
  }, [userId, sending])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!messageText.trim()) return
    if (!session?.user?.id) return
    
    try {
      setSending(true)
      const response = await fetch(`/api/messages/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageText,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }
      
      const newMessage = await response.json()
      
      // Add the new message to the list
      setMessages((prevMessages) => [newMessage, ...prevMessages])
      setMessageText("")
    } catch (error) {
      console.error('Error sending message:', error)
      setError(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-red-500 p-4">
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-white hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>User not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-800">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={user.image || undefined} />
          <AvatarFallback>
            {user.name?.[0] || user.username[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{user.name || user.username}</p>
          <p className="text-sm text-gray-400">@{user.username}</p>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
        <div ref={messagesEndRef} />
        
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex mb-4 ${
                message.isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              {!message.isOwnMessage && (
                <Avatar className="h-8 w-8 mr-2 mt-1">
                  <AvatarImage src={message.fromUser.image || undefined} />
                  <AvatarFallback>
                    {message.fromUser.name?.[0] || message.fromUser.username[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                  message.isOwnMessage
                    ? "bg-blue-600 text-white"
                    : "bg-[#2F3037] text-white"
                }`}
              >
                <div className="break-words">{message.content}</div>
                <div className="text-xs text-right mt-1 opacity-70">
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="resize-none bg-[#202327] border-gray-700 focus-visible:ring-gray-600"
            maxLength={1000}
            rows={1}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (messageText.trim()) {
                  const syntheticEvent = { preventDefault: () => {} } as FormEvent
                  handleSendMessage(syntheticEvent)
                }
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={!messageText.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        {messageText.length > 900 && (
          <div className="text-right mt-1 text-xs text-gray-400">
            {messageText.length}/1000
          </div>
        )}
      </form>
    </div>
  )
} 