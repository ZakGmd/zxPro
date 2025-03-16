"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Check } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { FollowButton } from "@/components/profile/follow-button"

interface Notification {
  id: string
  type: string
  createdAt: string
  isRead: boolean
  actor: {
    id: string
    name: string | null
    username: string
    image: string | null
    isFollowing: boolean
    isCurrentUser: boolean
  }
  post?: {
    id: string
    content: string
  }
  comment?: {
    id: string
    content: string
  }
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingAsRead, setMarkingAsRead] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      if (status !== 'authenticated') return

      try {
        setLoading(true)
        const response = await fetch('/api/users/notifications')
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications')
        }
        
        const data = await response.json()
        setNotifications(data.items || [])
        setHasUnread(data.items?.some((notification: Notification) => !notification.isRead) || false)
      } catch (error) {
        console.error('Error fetching notifications:', error)
        setError('Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [status])

  const markAllAsRead = async () => {
    if (markingAsRead || !hasUnread) return
    
    try {
      setMarkingAsRead(true)
      
      const response = await fetch('/api/users/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ all: true })
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            isRead: true
          }))
        )
        setHasUnread(false)
      } else {
        throw new Error('Failed to mark notifications as read')
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    } finally {
      setMarkingAsRead(false)
    }
  }

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffSecs < 60) return 'just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case "FOLLOW":
        return "followed you"
      case "LIKE":
        return "liked your post"
      case "COMMENT":
        return "commented on your post"
      case "MENTION":
        return "mentioned you in a post"
      default:
        return "interacted with you"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1D1D1F] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1D1D1F] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 backdrop-blur-md bg-[#1D1D1F]/80 border-b border-gray-800">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
        
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 hover:text-blue-400"
            onClick={markAllAsRead}
            disabled={markingAsRead}
          >
            {markingAsRead ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-1" />
            )}
            Mark all as read
          </Button>
        )}
      </header>

      {/* Notifications List */}
      <div className="divide-y divide-gray-800">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p>No notifications yet</p>
            <p className="text-sm mt-2">When someone interacts with you, you'll see it here</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 flex items-start gap-3 ${notification.isRead ? '' : 'bg-blue-950/20'}`}
            >
              <Link href={`/users/${notification.actor.id}`}>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={notification.actor.image || "/placeholder.svg"} alt={notification.actor.name || notification.actor.username} />
                  <AvatarFallback className="bg-blue-600">{(notification.actor.name?.[0] || notification.actor.username[0])?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link href={`/users/${notification.actor.id}`} className="font-semibold hover:underline">
                      {notification.actor.name || notification.actor.username}
                    </Link>{' '}
                    <span className="text-gray-400">
                      {getNotificationText(notification)}
                    </span>
                    
                    {notification.post && (
                      <Link 
                        href={`/posts/${notification.post.id}`} 
                        className="block mt-1 text-gray-400 line-clamp-2 hover:underline"
                      >
                        {notification.post.content}
                      </Link>
                    )}
                    
                    {notification.comment && (
                      <div className="mt-1 p-2 rounded bg-gray-800/50 text-gray-300 line-clamp-2">
                        {notification.comment.content}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-sm text-gray-500 ml-2 whitespace-nowrap">
                    {formatNotificationTime(notification.createdAt)}
                  </span>
                </div>
                
                {notification.type === "FOLLOW" && (
                  <div className="mt-2">
                    <FollowButton 
                      userId={notification.actor.id}
                      isFollowing={notification.actor.isFollowing}
                      isCurrentUser={notification.actor.isCurrentUser}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 