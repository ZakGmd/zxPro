"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export interface UserCardProps {
  user: {
    id: string
    name: string | null
    username: string
    image: string | null
    bio: string | null
    isFollowing: boolean
    isCurrentUser: boolean
  }
  showBio?: boolean
  compact?: boolean
  onFollow?: (userId: string, isFollowing: boolean) => Promise<void>
}

export function UserCard({ user, showBio = true, compact = false, onFollow }: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (user.isCurrentUser || !onFollow) return
    
    setIsLoading(true)
    
    try {
      await onFollow(user.id, isFollowing)
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error("Error toggling follow:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Link
      href={`/users/${user.id}`}
      className={`block w-full hover:bg-gray-800/30 ${compact ? 'py-2 px-3' : 'p-4'} rounded-lg transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <Avatar className={compact ? "w-10 h-10" : "w-12 h-12"}>
            <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || user.username} />
            <AvatarFallback className="bg-blue-600">
              {(user.name?.[0] || user.username[0])?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              <span className="font-semibold text-white truncate">
                {user.name || user.username}
              </span>
              <span className="text-gray-400 text-sm truncate">
                @{user.username}
              </span>
              
              {showBio && user.bio && (
                <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {!user.isCurrentUser && onFollow && (
          <Button
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            className={`rounded-full shrink-0 ${isFollowing ? 'border-gray-700 text-white hover:bg-gray-900' : ''} ${compact ? 'px-3' : 'px-4'}`}
            onClick={handleFollowToggle}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFollowing ? (
              "Following"
            ) : (
              "Follow"
            )}
          </Button>
        )}
      </div>
    </Link>
  )
} 