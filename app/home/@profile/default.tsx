"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, MoreHorizontal, Pin } from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string;
  name: string | null;
  username: string;
  bio: string | null;
  image: string | null;
  coverImage: string | null;
  createdAt: string;
  followingCount: number;
  followersCount: number;
  postsCount: number;
  isFollowing?: boolean;
  isCurrentUser?: boolean;
}

interface Post {
  id: string;
  text: string;
  image: string | null;
  createdAt: string;
  isLiked: boolean;
  user: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
  _count: {
    comments: number;
    likes: number;
  };
}

export default function ProfileDefault() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!session?.user?.id) return;
        
        // Fetch current user's profile
        const response = await fetch('/api/users/me');
        if (!response.ok) throw new Error('Failed to fetch profile');
        
        const data = await response.json();
        setProfile(data);
        
        // Fetch user's posts
        const postsResponse = await fetch(`/api/users/${data.id}/posts`);
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData.items || []);
          console.log("User's posts:", postsData.items);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session?.user?.id]);

  const handleFollowToggle = async () => {
    if (!profile || !session?.user?.id) return;
    
    setFollowLoading(true);
    try {
      const url = `/api/users/${profile.id}/follow`;
      const method = profile.isFollowing ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setProfile(prev => 
          prev ? { 
            ...prev, 
            isFollowing: !prev.isFollowing,
            followersCount: prev.isFollowing 
              ? prev.followersCount - 1 
              : prev.followersCount + 1
          } : null
        );
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!session?.user?.id) return;
    
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">User not found</div>
      </div>
    );
  }

  const joinDate = new Date(profile.createdAt);
  const month = joinDate.toLocaleString('default', { month: 'long' });
  const year = joinDate.getFullYear();

  return (
    <div className="min-h-screen bg-[#1D1D1F] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center p-4 backdrop-blur-md bg-[#1D1D1F]/80">
        <button onClick={() => router.back()} className="mr-6">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">{profile.name}</h1>
          <p className="text-sm text-gray-400">{profile.postsCount} posts</p>
        </div>
      </header>

      {/* Cover Image */}
      <div className="relative h-48 bg-[#1D1D1F]">
        {profile.coverImage ? (
          <Image 
            src={profile.coverImage} 
            fill 
            alt="Cover" 
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-4xl font-bold text-white">Make it Real</h2>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-amber-500 rounded-full"></div>
              <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-amber-500 rounded-full"></div>
              <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-amber-500 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-4 pb-4">
        <div className="absolute -top-16 left-4 border-4 border-[#1D1D1F] rounded-full">
          <Avatar className="w-32 h-32">
            <AvatarImage src={profile.image || "/placeholder.svg"} alt={profile.name || ''} />
            <AvatarFallback className="bg-blue-600">{profile.name?.substring(0, 3).toUpperCase() || 'USR'}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex justify-end mt-2">
          {profile.isCurrentUser ? (
            <Button 
              variant="outline" 
              className="rounded-full border-gray-600 text-white"
              onClick={() => router.push('/settings/profile')}
            >
              Edit profile
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className={`rounded-full ${profile.isFollowing ? 'bg-transparent border-gray-600 text-white' : 'bg-white text-black border-0'}`}
              onClick={handleFollowToggle}
              disabled={followLoading}
            >
              {profile.isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{profile.name}</h2>
            {/* You can conditionally render a verified badge here if needed */}
          </div>
          <p className="text-gray-400">@{profile.username}</p>

          {profile.bio && <p className="mt-3">{profile.bio}</p>}

          <div className="flex items-center gap-1 mt-3 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Joined {month} {year}</span>
          </div>

          <div className="flex gap-5 mt-3">
            <Link href={`/users/${profile.id}/following`} className="flex gap-1">
              <span className="font-bold">{profile.followingCount}</span>
              <span className="text-gray-400">Following</span>
            </Link>
            <Link href={`/users/${profile.id}/followers`} className="flex gap-1">
              <span className="font-bold">{profile.followersCount}</span>
              <span className="text-gray-400">Followers</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full bg-transparent border-b border-gray-800 h-auto p-0 justify-between">
          <TabsTrigger
            value="posts"
            className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-gray-400"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="replies"
            className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-gray-400"
          >
            Replies
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-gray-400"
          >
            Media
          </TabsTrigger>
          <TabsTrigger
            value="likes"
            className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-gray-400"
          >
            Likes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="p-4 border-b border-gray-800">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.user.image || "/placeholder.svg"} alt={post.user.name || ''} />
                    <AvatarFallback className="bg-blue-600">{post.user.name?.substring(0, 3).toUpperCase() || 'USR'}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="font-bold">{post.user.name}</span>
                        <span className="text-gray-400">@{post.user.username} · {new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    <Link href={`/posts/${post.id}`}>
                      <p className="mt-1">{post.text}</p>
                    </Link>

                    {post.image && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-gray-800">
                        <Image
                          src={post.image}
                          width={600}
                          height={400}
                          alt="Post image"
                          className="w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex mt-3 text-gray-400 gap-4">
                      <Link href={`/posts/${post.id}`} className="flex items-center gap-1 hover:text-blue-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post._count.comments}</span>
                      </Link>
                      
                      <button 
                        className={`flex items-center gap-1 hover:text-red-500 ${post.isLiked ? 'text-red-500' : ''}`}
                        onClick={() => handleLike(post.id, post.isLiked)}
                      >
                        <svg 
                          className="w-5 h-5" 
                          fill={post.isLiked ? "currentColor" : "none"} 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{post._count.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400">
              <p>No posts yet</p>
              <p className="text-sm mt-2">When you post, it will show up here</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="replies" className="mt-0">
          <div className="p-6 text-center text-gray-400">
            <p>No replies yet.</p>
          </div>
        </TabsContent>

        <TabsContent value="media" className="mt-0">
          <div className="p-6 text-center text-gray-400">
            <p>No media posts yet.</p>
          </div>
        </TabsContent>

        <TabsContent value="likes" className="mt-0">
          <div className="p-6 text-center text-gray-400">
            <p>No liked posts yet.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 