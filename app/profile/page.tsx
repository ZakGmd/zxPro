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

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        // This would normally fetch from API
        // For now, setting mock data
        setProfile({
          id: "1",
          name: "Zak",
          username: "Zak_Gmd",
          bio: "Design engineer | Turning designs into reality .",
          image: "/placeholder.svg", // Replace with real image path
          coverImage: "", // Replace with real cover image
          createdAt: "2014-07-01T00:00:00.000Z",
          _count: {
            following: 102,
            followedBy: 17,
            posts: 13
          }
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
          <h2 className="text-4xl font-bold text-white">Make it Real</h2>
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
          {session?.user?.id === profile.id ? (
            <Button variant="outline" className="rounded-full border-gray-600 text-white">
              Éditer le profil
            </Button>
          ) : (
            <Button variant="outline" className="rounded-full border-gray-600 text-white">
              Follow
            </Button>
          )}
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <Badge variant="outline" className="rounded-full bg-blue-500 border-0 flex items-center gap-1 px-2">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <span className="text-xs">Obtenez la certification</span>
            </Badge>
          </div>
          <p className="text-gray-400">@{profile.username}</p>

          <p className="mt-3">{profile.bio}</p>
          <p className="text-blue-400 mt-1">Traduire la biographie</p>

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
            value="highlights"
            className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-gray-400"
          >
            Tweets marquants
          </TabsTrigger>
          <TabsTrigger
            value="articles"
            className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-gray-400"
          >
            Articles
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
          <div className="border-b border-gray-800 p-3 flex items-start gap-2">
            <div className="flex items-center gap-1 text-gray-400">
              <Pin className="w-4 h-4" />
              <span className="text-sm">Épinglé</span>
            </div>
          </div>

          {/* Pinned Tweet */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={profile.image || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback className="bg-blue-600">{profile.name.substring(0, 3).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{profile.name}</span>
                    <span className="text-gray-400">@{profile.username} · 12 janv.</span>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                <p className="mt-1">When 19th century meets React & Three Js !</p>

                <div className="flex gap-2 mt-2">
                  <span className="text-blue-400">#ReactJs</span>
                  <span className="text-blue-400">#Threejs</span>
                  <span className="text-blue-400">#tailwindCss</span>
                </div>

                <div className="mt-3 rounded-xl overflow-hidden border border-gray-800">
                  <Image
                    src="/placeholder.svg"
                    width={600}
                    height={400}
                    alt="Tweet image"
                    className="w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="replies">
          <div className="flex justify-center p-8 text-gray-400">No replies yet</div>
        </TabsContent>

        <TabsContent value="highlights">
          <div className="flex justify-center p-8 text-gray-400">No highlighted tweets</div>
        </TabsContent>

        <TabsContent value="articles">
          <div className="flex justify-center p-8 text-gray-400">No articles yet</div>
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