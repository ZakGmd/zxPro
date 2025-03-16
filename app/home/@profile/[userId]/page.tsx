"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MoreHorizontal, RefreshCw, Search, Mail, Users, LinkIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface UserProfile {
  id: string
  name: string | null
  username: string
  image: string | null
  bio: string | null
  followersCount: number
  followingCount: number
  postsCount: number
  isFollowing: boolean
  isCurrentUser: boolean
  coverImages?: string[]
  joinedAt: string
  location?: string
  website?: string
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/users/${params.userId}`)
        if (!response.ok) throw new Error('Failed to fetch user')
        const data = await response.json()
        setUser(data)
      } catch (error) {
        console.error('Error fetching user:', error)
        // Handle error appropriately
      }
    }

    if (params.userId) {
      fetchUser()
    }
  }, [params.userId])

  const handleFollowToggle = async () => {
    if (!user || !session?.user) return

    setIsFollowLoading(true)
    try {
      const method = user.isFollowing ? 'DELETE' : 'POST'
      const response = await fetch(`/api/users/${user.id}/follow`, {
        method,
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        setUser(prev => prev ? {
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: prev.followersCount + (prev.isFollowing ? -1 : 1)
        } : null)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setIsFollowLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#1D1D1F] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center p-4 backdrop-blur-md bg-[#1D1D1F]/80">
        <button onClick={() => router.back()} className="mr-6">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">{user.name || user.username}</h1>
          <p className="text-sm text-gray-400">{user.postsCount} posts</p>
        </div>
      </header>

      {/* Cover Photos */}
      <div className="relative h-[200px] grid grid-cols-3 gap-0.5">
        {(user.coverImages || ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg']).map((src, i) => (
          <div key={i} className="relative overflow-hidden">
            <Image
              src={src}
              alt={`Cover ${i + 1}`}
              width={200}
              height={200}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Profile Section */}
      <div className="relative px-4 pb-4">
        <div className="absolute -top-16 left-4 border-4 border-[#1D1D1F] rounded-full">
          <Avatar className="w-32 h-32">
            <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || user.username} />
            <AvatarFallback>{user.name?.[0] || user.username[0]}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          {!user.isCurrentUser && (
            <>
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                <Mail className="w-5 h-5" />
              </Button>
              <Button 
                className="rounded-full px-6 bg-white text-black hover:bg-white/90"
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
              >
                {isFollowLoading ? "Loading..." : user.isFollowing ? "Following" : "Follow"}
              </Button>
            </>
          )}
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{user.name || user.username}</h2>
            {/* Add verified badge if needed */}
          </div>
          <p className="text-gray-500">@{user.username}</p>

          {user.bio && (
            <div className="mt-4 whitespace-pre-wrap">{user.bio}</div>
          )}

          <div className="flex items-center gap-4 mt-4 text-gray-400">
            {user.location && (
              <div className="flex items-center gap-1">
                <span>📍</span>
                <span>{user.location}</span>
              </div>
            )}
            {user.website && (
              <div className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4" />
                <Link href={user.website} className="text-blue-500" target="_blank">
                  {user.website.replace(/^https?:\/\//, '')}
                </Link>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>📅</span>
              <span>Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="flex gap-5 mt-4">
            <Link href={`/users/${user.id}/following`} className="hover:underline">
              <span className="font-bold">{user.followingCount}</span>
              <span className="text-gray-500"> Following</span>
            </Link>
            <Link href={`/users/${user.id}/followers`} className="hover:underline">
              <span className="font-bold">{user.followersCount}</span>
              <span className="text-gray-500"> Followers</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full mt-4">
        <TabsList className="w-full bg-transparent border-b border-gray-800 h-auto p-0 justify-between">
          <TabsTrigger
            value="posts"
            className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-gray-500"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="replies"
            className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-gray-500"
          >
            Replies
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-gray-500"
          >
            Media
          </TabsTrigger>
          <TabsTrigger
            value="likes"
            className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-gray-500"
          >
            Likes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {/* Posts will be implemented in a separate component */}
          <div className="p-4 text-center text-gray-500">
            Loading posts...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 