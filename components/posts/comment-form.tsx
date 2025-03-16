"use client"

import { useState, FormEvent } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CommentData } from "./comment-item"

interface CommentFormProps {
  postId: string;
  onCommentAdded?: (comment: CommentData) => void;
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    if (!session?.user?.id) {
      router.push('/');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: commentText }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add comment');
      }
      
      const newComment = await response.json();
      
      // Clear the form
      setCommentText("");
      
      // Notify parent component
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      setError(error instanceof Error ? error.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!session?.user) {
    return (
      <div className="p-4 text-center border-b border-gray-800">
        <Button variant="link" onClick={() => router.push('/')}>
          Sign in to comment
        </Button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-gray-800">
      <div className="flex gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={session.user.image || "/placeholder.svg"} alt={session.user.name || ""} />
          <AvatarFallback>
            {session.user.name?.substring(0, 2).toUpperCase() || "ME"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="w-full min-h-[80px] p-2 bg-transparent border border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 placeholder-gray-500 resize-none"
            maxLength={500}
          />
          
          {error && (
            <p className="mt-1 text-red-500 text-sm">{error}</p>
          )}
          
          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              className="rounded-full bg-blue-500 hover:bg-blue-600"
              disabled={!commentText.trim() || isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
} 