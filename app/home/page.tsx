"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ImageIcon,
  Gift,
  BarChart2,
  Smile,
  Calendar,
  MapPin,
  MessageCircle,
  Repeat2,
  Heart,
  Bookmark,
  Share,
  MoreHorizontal,
} from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useEffect, useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Post {
  id: string;
  text: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
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

export default function Home() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("for-you");
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let endpoint = '/api/posts';
        
        if (activeTab === "following") {
          endpoint = '/api/posts?following=true';
        }
        
        console.log(`Fetching posts from ${endpoint}`);
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch posts');
        
        const data = await response.json();
        setPosts(data);
        console.log(`Fetched ${data.length} posts`);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchPosts();
    } else {
      setLoading(false);
    }
  }, [session?.user?.id, activeTab]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!postText.trim()) return;
    if (!session?.user?.id) {
      router.push('/signin');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: postText,
          image: postImage || null,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create post');
      
      const newPost = await response.json();
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setPostText("");
      setPostImage("");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setSubmitting(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    const postDate = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      return postDate.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b to-[#fc7348] to-[490%] from-[70%] from-[#1D1D1F] text-white">
      {/* Feed Header */}
      <header className="sticky top-0 z-10 bg-[#1D1D1F]/80 backdrop-blur-md border-b border-gray-800">
        <Tabs 
          defaultValue="for-you" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full h-auto grid grid-cols-2 bg-transparent p-0">
            <TabsTrigger
              value="for-you"
              className="py-4 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:font-bold"
            >
              For You
            </TabsTrigger>
            <TabsTrigger 
              value="following" 
              className="py-4 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:font-bold text-gray-500 data-[state=active]:text-white"
            >
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* Compose Post */}
      {session?.user?.id && (
        <div className="border-b border-gray-800 p-4">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={session.user.image || "/placeholder.svg"} alt={session.user.name || "User"} />
                <AvatarFallback>{session.user.name?.substring(0, 2).toUpperCase() || "ME"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
      <div className="mb-4">
                  <input
                    type="text"
                    value={postText}
                    onChange={e => setPostText(e.target.value)}
                    placeholder="What's happening?"
                    className="w-full bg-transparent text-xl placeholder-gray-500 focus:outline-none"
                  />
                  {postImage && (
                    <div className="mt-2 relative">
                      <Image
                        src={postImage}
                        width={400}
                        height={300}
                        alt="Post image preview"
                        className="rounded-lg max-h-60 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setPostImage("")}
                        className="absolute top-2 right-2 bg-gray-800/80 rounded-full p-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-blue-500">
                    <button 
                      type="button" 
                      className="p-2 hover:bg-blue-500/10 rounded-full"
                      onClick={() => {
                        // This would typically open a file dialog
                        const imageUrl = prompt("Enter image URL (for demo purposes):");
                        if (imageUrl) setPostImage(imageUrl);
                      }}
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 hover:bg-blue-500/10 rounded-full">
                      <Gift className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 hover:bg-blue-500/10 rounded-full">
                      <BarChart2 className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 hover:bg-blue-500/10 rounded-full">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 hover:bg-blue-500/10 rounded-full">
                      <Calendar className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 hover:bg-blue-500/10 rounded-full">
                      <MapPin className="w-5 h-5" />
                    </button>
                  </div>
                  <Button 
                    type="submit" 
                    className="rounded-full bg-blue-500 hover:bg-blue-600"
                    disabled={!postText.trim() || submitting}
                  >
                    {submitting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Feed Content */}
      <div className="divide-y divide-gray-800">
        {posts.length > 0 ? (
          posts.map(post => (
            <article key={post.id} className="p-4">
              <div className="flex gap-3">
                <Link href={`/users/${post.user.id}`}>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.user.image || "/placeholder.svg"} alt={post.user.name || ""} />
                    <AvatarFallback>{post.user.name?.substring(0, 2).toUpperCase() || post.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-wrap items-center gap-1">
                      <Link href={`/users/${post.user.id}`} className="font-bold hover:underline cursor-pointer">
                        {post.user.name}
                      </Link>
                      <span className="text-gray-500">@{post.user.username} · {formatDate(post.createdAt)}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-gray-500">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
      </div>
      
                  <div className="mt-2">
                    <Link href={`/posts/${post.id}`}>
                      <p className="mb-3">{post.text}</p>
                    </Link>
                    {post.image && (
                      <div className="rounded-2xl overflow-hidden border border-gray-800 mt-3">
                        <Image
                          src={post.image}
                          width={600}
                          height={400}
                          alt="Post image"
                          className="w-full object-cover max-h-[400px]"
                        />
                      </div>
                    )}

                    <div className="flex justify-between mt-3 text-gray-500">
                      <Link 
                        href={`/posts/${post.id}`} 
                        className="flex items-center gap-2 hover:text-blue-500"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs">{post._count.comments}</span>
                      </Link>
                      <button className="flex items-center gap-2 hover:text-green-500">
                        <Repeat2 className="w-4 h-4" />
                        <span className="text-xs">0</span>
                      </button>
                      <button 
                        className={`flex items-center gap-2 ${post.isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleLike(post.id, post.isLiked);
                        }}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-xs">{post._count.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-blue-500">
                        <BarChart2 className="w-4 h-4" />
                        <span className="text-xs">0</span>
                      </button>
                      <div className="flex items-center gap-4">
                        <button className="hover:text-blue-500">
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button className="hover:text-blue-500">
                          <Share className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="p-6 text-center text-gray-400">
            <p>{activeTab === "for-you" ? "No posts to show." : "No posts from people you follow yet."}</p>
            {activeTab === "following" && (
              <p className="mt-2">Follow more people to see their posts here.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}