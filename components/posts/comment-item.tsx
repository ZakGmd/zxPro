"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2 } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

export interface CommentData {
  id: string;
  text: string;
  postId: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
}

interface CommentItemProps {
  comment: CommentData;
  onDelete?: (commentId: string) => void;
}

export function CommentItem({ comment, onDelete }: CommentItemProps) {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const isCurrentUserComment = session?.user?.id === comment.userId;

  const handleDelete = async () => {
    if (!isCurrentUserComment || !onDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        onDelete(comment.id);
      } else {
        console.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsDeleting(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="flex gap-3 py-3 border-b border-gray-800">
      <Link href={`/users/${comment.user.id}`} className="flex-shrink-0">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.user.image || "/placeholder.svg"} alt={comment.user.name || comment.user.username} />
          <AvatarFallback>
            {(comment.user.name?.[0] || comment.user.username[0])?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1">
            <Link href={`/users/${comment.user.id}`} className="font-medium hover:underline">
              {comment.user.name || comment.user.username}
            </Link>
            <span className="text-gray-500 text-sm">@{comment.user.username}</span>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">{formatDate(comment.createdAt)}</span>
          </div>
          
          {isCurrentUserComment && (
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-full text-gray-500"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-1 bg-gray-800 rounded-md shadow-lg overflow-hidden z-10">
                  <button 
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-700"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <p className="text-sm mt-1 whitespace-pre-wrap break-words">{comment.text}</p>
      </div>
    </div>
  );
} 