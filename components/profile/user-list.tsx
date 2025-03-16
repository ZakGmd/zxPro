"use client"

import { useEffect, useState } from "react"
import { UserCard } from "./user-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"

interface User {
  id: string
  name: string | null
  username: string
  image: string | null
  bio: string | null
  isFollowing: boolean
  isCurrentUser: boolean
}

interface UserListProps {
  userId: string
  type: "followers" | "following"
  title?: string
}

export function UserList({ userId, type, title }: UserListProps) {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    async function fetchUsers() {
      if (!userId || !session?.user?.id) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/users/${userId}/${type}?page=1&limit=20`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${type}`)
        }
        
        const data = await response.json()
        setUsers(data.items || [])
        setHasMore(data.hasMore || false)
        setPage(1)
      } catch (error) {
        console.error(`Error fetching ${type}:`, error)
        setError(`Failed to load ${type}. Please try again.`)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [userId, type, session?.user?.id])

  const loadMore = async () => {
    if (loadingMore || !hasMore || !userId) return
    
    try {
      setLoadingMore(true)
      const nextPage = page + 1
      const response = await fetch(`/api/users/${userId}/${type}?page=${nextPage}&limit=20`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch more ${type}`)
      }
      
      const data = await response.json()
      if (data.items?.length) {
        setUsers(prev => [...prev, ...data.items])
        setHasMore(data.hasMore || false)
        setPage(nextPage)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error(`Error fetching more ${type}:`, error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleFollow = async (targetUserId: string, isFollowing: boolean) => {
    if (!session?.user?.id) return

    const method = isFollowing ? 'DELETE' : 'POST'
    const response = await fetch(`/api/users/${targetUserId}/follow`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to update follow status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => {
            setLoading(true)
            setError(null)
            // Force re-fetching
            setPage(1)
            setUsers([])
          }}
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {type === "followers" 
          ? "This user doesn't have any followers yet." 
          : "This user isn't following anyone yet."}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {title && (
        <h2 className="text-xl font-bold px-4 pt-4 pb-2">{title}</h2>
      )}
      
      <div className="space-y-1">
        {users.map(user => (
          <UserCard 
            key={user.id} 
            user={user}
            onFollow={handleFollow}
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="py-4 text-center">
          <Button 
            variant="outline" 
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  )
} 