"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, MoreHorizontal, MessageCircle, Repeat2, Heart, Share, Bookmark, BarChart2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { CommentsSection } from "@/components/posts/comments-section"
import React from "react"

interface User {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
}

interface Post {
  id: string;
  text: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
  user: User;
  _count: {
    comments: number;
    likes: number;
  };
}

interface PageParams {
  params: {
    postId: string;
  };
}

export default function PostDetailPage({ params }: PageParams) {
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const postId = params.postId;
  
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId || !session?.user?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/${postId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Post not found');
          }
          throw new Error('Failed to fetch post');
        }
        
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (session?.user?.id) {
      fetchPost();
    }
  }, [postId, session?.user?.id]);
  
  const handleLike = async () => {
    if (!post || !session?.user?.id) return;
    
    try {
      const method = post.isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setPost(prev => {
          if (!prev) return null;
          return { 
            ...prev, 
            isLiked: !prev.isLiked,
            _count: {
              ...prev._count, 
              likes: prev.isLiked 
                ? prev._count.likes - 1 
                : prev._count.likes + 1 
            } 
          };
        });
      }
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1D1D1F] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#1D1D1F] text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">{error || 'Post not found'}</h2>
        <p className="text-gray-400 mb-4">The post you're looking for doesn't exist or you may not have permission to view it.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#1D1D1F] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center p-4 backdrop-blur-md bg-[#1D1D1F]/80 border-b border-gray-800">
        <button onClick={() => router.back()} className="mr-6">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Post</h1>
      </header>
      
      {/* Post Content */}
      <article className="p-4 border-b border-gray-800">
        <div className="flex gap-3">
          <Link href={`/users/${post.user.id}`} className="flex-shrink-0">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.user.image || "/placeholder.svg"} alt={post.user.name || post.user.username} />
              <AvatarFallback>
                {(post.user.name?.[0] || post.user.username[0])?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/users/${post.user.id}`} className="font-bold hover:underline">
                  {post.user.name || post.user.username}
                </Link>
                <div className="text-gray-500">@{post.user.username}</div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-500">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mt-3">
              <p className="whitespace-pre-wrap">{post.text}</p>
              
              {post.image && (
                <div className="mt-3 rounded-xl overflow-hidden border border-gray-800">
                  <Image
                    src={post.image}
                    width={600}
                    height={400}
                    alt="Post image"
                    className="w-full object-cover max-h-[400px]"
                  />
                </div>
              )}
              
              <div className="mt-3 text-gray-500 text-sm">
                {formatDate(post.createdAt)}
              </div>
              
              <div className="flex mt-4 pt-4 border-t border-gray-800 text-gray-500">
                <div className="flex-1 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  <span>{post._count.comments}</span>
                </div>
                <div className="flex-1 flex items-center">
                  <Repeat2 className="w-5 h-5 mr-2" />
                  <span>0</span>
                </div>
                <button 
                  className={`flex-1 flex items-center ${post.isLiked ? 'text-pink-500' : ''}`}
                  onClick={handleLike}
                >
                  <Heart className={`w-5 h-5 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span>{post._count.likes}</span>
                </button>
                <div className="flex-1 flex items-center">
                  <Share className="w-5 h-5 mr-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
      
      {/* Comments Section */}
      <CommentsSection postId={postId} />
    </div>
  );
} 