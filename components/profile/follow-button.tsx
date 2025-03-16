"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"

interface FollowButtonProps {
  userId: string
  isFollowing: boolean
  isCurrentUser?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  onFollowChange?: (isFollowing: boolean) => void
}

export function FollowButton({ 
  userId, 
  isFollowing: initialIsFollowing, 
  isCurrentUser = false,
  size = "md",
  className = "",
  onFollowChange 
}: FollowButtonProps) {
  const { data: session } = useSession()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollowToggle = async () => {
    if (isCurrentUser || !session?.user?.id) return
    
    setIsLoading(true)
    
    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const response = await fetch(`/api/users/${userId}/follow`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setIsFollowing(!isFollowing)
        if (onFollowChange) {
          onFollowChange(!isFollowing)
        }
      } else {
        throw new Error("Failed to update follow status")
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render for current user
  if (isCurrentUser) {
    return null
  }

  const sizeClasses = {
    sm: "text-xs px-3 py-1 h-7",
    md: "text-sm px-4 py-1.5 h-9",
    lg: "px-6 py-2 h-10"
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      className={`rounded-full min-w-[80px] ${isFollowing ? 'border-gray-700 text-white hover:bg-gray-900' : ''} ${sizeClasses[size]} ${className}`}
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
  )
} 