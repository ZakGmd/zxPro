"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MoreHorizontal, Pin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  image: string;
  coverImage: string;
  createdAt: string;
  _count: {
    following: number;
    followedBy: number;
    posts: number;
  }
}

export default function UserProfilePage() {
  const { data: session } = useSession();
  const params = useParams();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    // Fetch user profile data based on username
    const fetchProfile = async () => {
      try {
        // This would normally fetch from API using the username param
        // For now, setting mock data
        setProfile({
          id: "2", // Different from current user
          name: username,
          username: username,
          bio: "This is a sample profile for demonstration purposes.",
          image: "/placeholder.svg", // Replace with real image path
          coverImage: "", // Replace with real cover image
          createdAt: "2020-01-01T00:00:00.000Z",
          _count: {
            following: 153,
            followedBy: 42,
            posts: 25
          }
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const handleFollow = async () => {
    // This would normally call an API endpoint
    setIsFollowing(!isFollowing);
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
        <Link href="/home" className="mr-6">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{profile.name}</h1>
          <p className="text-sm text-gray-400">{profile._count.posts} posts</p>
        </div>
      </header>

      {/* Cover Image */}
      <div className="relative h-48 bg-[#1D1D1F]">
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-4xl font-bold text-white">Connect & Share</h2>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-amber-500 rounded-full"></div>
            <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-amber-500 rounded-full"></div>
            <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-amber-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="relative px-4 pb-4">
        <div className="absolute -top-16 left-4 border-4 border-[#1D1D1F] rounded-full">
          <Avatar className="w-32 h-32">
            <AvatarImage src={profile.image || "/placeholder.svg"} alt={profile.name} />
            <AvatarFallback className="bg-blue-600">{profile.name.substring(0, 3).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex justify-end mt-2">
          {session?.user?.id !== profile.id && (
            <Button 
              variant="outline" 
              className={`rounded-full ${isFollowing ? 'border-gray-600 bg-transparent text-white' : 'bg-blue-500 border-0 text-white'}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{profile.name}</h2>
          </div>
          <p className="text-gray-400">@{profile.username}</p>

          <p className="mt-3">{profile.bio}</p>

          <div className="flex items-center gap-1 mt-3 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">A rejoint X en {month} {year}</span>
          </div>

          <div className="flex gap-5 mt-3">
            <div className="flex gap-1">
              <span className="font-bold">{profile._count.following}</span>
              <span className="text-gray-400">abonnements</span>
            </div>
            <div className="flex gap-1">
              <span className="font-bold">{profile._count.followedBy}</span>
              <span className="text-gray-400">abonnés</span>
            </div>
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
            Réponses
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-gray-400"
          >
            Médias
          </TabsTrigger>
          <TabsTrigger
            value="likes"
            className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-gray-400"
          >
            J'aime
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          <div className="flex justify-center p-8 text-gray-400">
            No posts yet
          </div>
        </TabsContent>

        <TabsContent value="replies">
          <div className="flex justify-center p-8 text-gray-400">No replies yet</div>
        </TabsContent>

        <TabsContent value="media">
          <div className="flex justify-center p-8 text-gray-400">No media yet</div>
        </TabsContent>

        <TabsContent value="likes">
          <div className="flex justify-center p-8 text-gray-400">No likes yet</div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 