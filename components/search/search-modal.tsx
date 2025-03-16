"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Search, X, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

interface User {
  id: string
  name: string | null
  username: string
  image: string | null
  bio: string | null
  isFollowing: boolean
  isCurrentUser: boolean
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [recentSearches, setRecentSearches] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({})
  const modalRef = useRef<HTMLDivElement>(null)

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Load recent searches from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const savedSearches = localStorage.getItem("recentSearches")
        if (savedSearches) {
          setRecentSearches(JSON.parse(savedSearches))
        }
      } catch (error) {
        console.error("Error loading recent searches:", error)
      }
    }
  }, [isOpen])

  // Search users when the debounced search term changes
  useEffect(() => {
    async function searchUsers() {
      if (!debouncedSearchTerm.trim() || !session?.user?.id) return
      
      setIsLoading(true)
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedSearchTerm)}`)
        if (!response.ok) throw new Error("Search failed")
        
        const data = await response.json()
        setSearchResults(data)
      } catch (error) {
        console.error("Error searching users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    searchUsers()
  }, [debouncedSearchTerm, session?.user?.id])

  // Save user to recent searches
  const saveToRecentSearches = (user: User) => {
    try {
      const updatedSearches = [user, ...recentSearches.filter(s => s.id !== user.id)].slice(0, 10)
      setRecentSearches(updatedSearches)
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
    } catch (error) {
      console.error("Error saving recent search:", error)
    }
  }

  // Clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recentSearches")
  }

  // Remove a specific recent search
  const removeRecentSearch = (userId: string) => {
    const updatedSearches = recentSearches.filter(user => user.id !== userId)
    setRecentSearches(updatedSearches)
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
  }

  // Handle user profile click
  const handleUserClick = (user: User) => {
    saveToRecentSearches(user)
    router.push(`/users/${user.id}`)
    onClose()
  }

  // Handle follow/unfollow
  const handleFollowToggle = async (user: User, event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (!session?.user?.id || user.isCurrentUser) return
    
    setFollowLoading(prev => ({ ...prev, [user.id]: true }))
    
    try {
      const method = user.isFollowing ? 'DELETE' : 'POST'
      const response = await fetch(`/api/users/${user.id}/follow`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        // Update local state to reflect the change
        setSearchResults(prev => 
          prev.map(u => 
            u.id === user.id 
              ? { ...u, isFollowing: !u.isFollowing } 
              : u
          )
        )
        
        // Also update in recent searches if present
        setRecentSearches(prev => 
          prev.map(u => 
            u.id === user.id 
              ? { ...u, isFollowing: !u.isFollowing } 
              : u
          )
        )
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
    } finally {
      setFollowLoading(prev => ({ ...prev, [user.id]: false }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50">
      <div className="relative max-w-xl mx-auto" ref={modalRef}>
        <div className="mt-2 rounded-2xl bg-[#1D1D1F] shadow-lg">
          {/* Search Input */}
          <div className="flex items-center gap-4 p-4 border-b border-gray-800">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for people"
              className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-white/[0.1]"
                onClick={() => setSearchTerm("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          )}

          {/* Search Results */}
          {debouncedSearchTerm && !isLoading && (
            <div className="overflow-y-auto max-h-[60vh]">
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <UserItem 
                    key={user.id} 
                    user={user} 
                    onClick={() => handleUserClick(user)}
                    onFollow={(e) => handleFollowToggle(user, e)}
                    isFollowLoading={followLoading[user.id] || false}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No users found
                </div>
              )}
            </div>
          )}

          {/* Recent Searches */}
          {!debouncedSearchTerm && recentSearches.length > 0 && (
            <>
              <div className="px-4 py-3 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-white">Recent Searches</h2>
                  <button 
                    className="text-blue-500 text-sm hover:text-blue-400"
                    onClick={clearRecentSearches}
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[80vh]">
                {recentSearches.map((user) => (
                  <UserItem 
                    key={user.id} 
                    user={user} 
                    onClick={() => handleUserClick(user)}
                    onFollow={(e) => handleFollowToggle(user, e)}
                    onRemove={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(user.id);
                    }}
                    isFollowLoading={followLoading[user.id] || false}
                  />
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {!debouncedSearchTerm && recentSearches.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              Try searching for people, topics, or keywords
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// User item component for both search results and recent searches
function UserItem({ 
  user, 
  onClick, 
  onFollow, 
  onRemove,
  isFollowLoading 
}: { 
  user: User
  onClick: () => void
  onFollow: (e: React.MouseEvent) => void
  onRemove?: (e: React.MouseEvent) => void
  isFollowLoading: boolean
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.image || "/placeholder.svg"} />
          <AvatarFallback className="bg-blue-600">{user.name?.[0] || user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-white">{user.name || user.username}</span>
            {/* We could add verified badges here later */}
          </div>
          <div className="text-gray-500">@{user.username}</div>
          {user.bio && <div className="text-gray-400 text-sm line-clamp-1">{user.bio}</div>}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {!user.isCurrentUser && (
          <Button
            variant={user.isFollowing ? "outline" : "default"}
            size="sm"
            className={`rounded-full ${user.isFollowing ? 'border-gray-700 text-white hover:bg-gray-900' : ''}`}
            onClick={onFollow}
            disabled={isFollowLoading}
          >
            {isFollowLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : user.isFollowing ? (
              "Following"
            ) : (
              "Follow"
            )}
          </Button>
        )}
        
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-white/[0.1]"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
} 