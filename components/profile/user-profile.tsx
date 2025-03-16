"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MoreHorizontal, RefreshCw, Search, Mail, Users, LinkIcon, Calendar, MapPin, Loader2, Check, MessageCircle, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { FollowButton } from "./follow-button"

interface User {
  id: string
  name: string | null
  username: string
  image: string | null
  bio: string | null
  createdAt: string
  location?: string | null
  website?: string | null
  followingCount: number
  followersCount: number
  isFollowing: boolean
  isCurrentUser: boolean
  postsCount: number
}

interface Post {
  id: string
  text: string
  image: string | null
  createdAt: string
  updatedAt: string
  isLiked: boolean
  user: {
    id: string
    name: string | null
    username: string
    image: string | null
  }
  _count: {
    comments: number
    likes: number
  }
}

interface UserProfileProps {
  userId?: string
}

export function UserProfile({ userId }: UserProfileProps) {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")
  const [hasMorePosts, setHasMorePosts] = useState(false)
  const [page, setPage] = useState(1)
  
  // Get the userId from props or from the URL params
  const targetUserId = userId || (params?.userId as string)

  useEffect(() => {
    async function fetchUserData() {
      if (!targetUserId || !session?.user?.id) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/users/${targetUserId}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }
        
        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [targetUserId, session?.user?.id])

  useEffect(() => {
    async function fetchUserPosts() {
      if (!targetUserId || !session?.user?.id || !user) return
      
      try {
        setPostsLoading(true)
        const response = await fetch(`/api/users/${targetUserId}/posts?page=1&limit=10`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch user posts")
        }
        
        const data = await response.json()
        setPosts(data.items || [])
        setHasMorePosts(data.hasMore || false)
        setPage(1)
      } catch (error) {
        console.error("Error fetching user posts:", error)
      } finally {
        setPostsLoading(false)
      }
    }
    
    if (user) {
      fetchUserPosts()
    }
  }, [targetUserId, session?.user?.id, user])

  const loadMorePosts = async () => {
    if (!targetUserId || !session?.user?.id || !hasMorePosts) return
    
    try {
      const nextPage = page + 1
      const response = await fetch(`/api/users/${targetUserId}/posts?page=${nextPage}&limit=10`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch more posts")
      }
      
      const data = await response.json()
      if (data.items?.length) {
        setPosts(prev => [...prev, ...data.items])
        setHasMorePosts(data.hasMore || false)
        setPage(nextPage)
      } else {
        setHasMorePosts(false)
      }
    } catch (error) {
      console.error("Error fetching more posts:", error)
    }
  }

  const handleFollowChange = (isFollowing: boolean) => {
    if (!user) return
    
    setUser(prev => prev ? {
      ...prev,
      isFollowing: isFollowing,
      followersCount: isFollowing 
        ? prev.followersCount + 1 
        : prev.followersCount - 1
    } : null)
  }

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!session?.user?.id) {
      router.push('/');
      return;
    }
    
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/posts/${postId}/like`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Update the post in state
        setPosts(prev => 
          prev.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  isLiked: !isLiked,
                  _count: {
                    ...post._count, 
                    likes: isLiked 
                      ? post._count.likes - 1 
                      : post._count.likes + 1 
                  } 
                } 
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1D1D1F] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1D1D1F] text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">User not found</h2>
        <p className="text-gray-400 mb-4">The user you're looking for doesn't exist or you may not have permission to view this profile.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const formatPostDate = (dateString: string) => {
    const postDate = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h`
    } else {
      return postDate.toLocaleDateString()
    }
  }

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

      {/* Cover Photos - This is just a placeholder, we can update if we have user cover photos */}
      <div className="relative h-[150px] bg-gradient-to-r from-gray-800 to-gray-900">
        {/* Cover image could go here */}
      </div>

      {/* Profile Section */}
      <div className="relative px-4 pb-4">
        <div className="absolute -top-16 left-4 border-4 border-[#1D1D1F] rounded-full">
          <Avatar className="w-32 h-32">
            <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || user.username} />
            <AvatarFallback className="bg-blue-600">{(user.name?.[0] || user.username[0])?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          {user && !user.isCurrentUser && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full w-10 h-10"
                onClick={() => router.push(`/messages/${user.id}`)}
                title="Send a message"
              >
                <Mail className="w-5 h-5" />
              </Button>
              <FollowButton 
                userId={user.id} 
                isFollowing={user.isFollowing} 
                isCurrentUser={user.isCurrentUser}
                size="lg"
                onFollowChange={handleFollowChange}
              />
            </>
          )}
          {user.isCurrentUser && (
            <Button 
              className="rounded-full px-6 border border-gray-700"
              variant="outline"
              onClick={() => router.push('/settings/profile')}
            >
              Edit profile
            </Button>
          )}
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">
              {user.name || user.username}
              {/* Verified badge if needed */}
            </h2>
          </div>
          <p className="text-gray-500">@{user.username}</p>

          {user.bio && (
            <div className="mt-4">
              <p>{user.bio}</p>
            </div>
          )}

          <div className="flex items-center gap-4 mt-4 text-gray-400 flex-wrap">
            {user.website && (
              <div className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4" />
                <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="text-blue-500">
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>

          <div className="flex gap-5 mt-4">
            <Link href={`/users/${user.id}/following`} className="hover:underline">
              <span className="font-bold">{user.followingCount}</span>
              <span className="text-gray-500"> following</span>
            </Link>
            <Link href={`/users/${user.id}/followers`} className="hover:underline">
              <span className="font-bold">{user.followersCount}</span>
              <span className="text-gray-500"> followers</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        defaultValue="posts" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mt-4"
      >
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
          {postsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex justify-center p-8 text-gray-500">
              No posts to display
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {posts.map(post => (
                <div key={post.id} className="p-4 hover:bg-gray-900/20">
                  <div className="flex gap-3">
                    <Link href={`/users/${post.user.id}`}>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.user.image || "/placeholder.svg"} alt={post.user.name || post.user.username} />
                        <AvatarFallback>{(post.user.name?.[0] || post.user.username[0])?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Link>
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div>
                          <Link href={`/users/${post.user.id}`} className="font-semibold hover:underline">
                            {post.user.name || post.user.username}
                          </Link>
                          <span className="text-gray-500 ml-1">@{post.user.username}</span>
                          <span className="text-gray-500 mx-1">·</span>
                          <span className="text-gray-500">{formatPostDate(post.createdAt)}</span>
                        </div>
                        <button className="ml-auto text-gray-500 hover:text-white">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="mt-1">
                        <Link href={`/posts/${post.id}`} className="text-white">
                          <p className="whitespace-pre-wrap">{post.text}</p>
                        </Link>
                        
                        {post.image && (
                          <div className="mt-3 relative rounded-xl overflow-hidden">
                            <Image 
                              src={post.image} 
                              alt="Post image" 
                              width={500} 
                              height={300} 
                              className="object-cover max-h-[350px] w-full"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center mt-3 text-gray-500 gap-6">
                        <Link href={`/posts/${post.id}`} className="flex items-center gap-1 hover:text-blue-500">
                          <MessageCircle className="w-5 h-5" />
                          <span>{post._count.comments}</span>
                        </Link>
                        
                        <button 
                          className={`flex items-center gap-1 hover:text-red-500 ${post.isLiked ? 'text-red-500' : ''}`}
                          onClick={(e) => {
                            e.preventDefault(); // Prevent navigation when clicking the like button
                            handleLike(post.id, post.isLiked);
                          }}
                        >
                          <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-red-500' : ''}`} />
                          <span>{post._count.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {hasMorePosts && (
                <div className="p-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={loadMorePosts}
                    className="text-blue-500 border-blue-500/50 hover:bg-blue-500/10"
                  >
                    Load more
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="replies" className="mt-0">
          <div className="flex justify-center p-8 text-gray-500">
            No replies to display
          </div>
        </TabsContent>
        
        <TabsContent value="media" className="mt-0">
          <div className="flex justify-center p-8 text-gray-500">
            No media to display
          </div>
        </TabsContent>
        
        <TabsContent value="likes" className="mt-0">
          <div className="flex justify-center p-8 text-gray-500">
            No likes to display
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 