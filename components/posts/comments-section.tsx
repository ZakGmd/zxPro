"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { CommentForm } from "./comment-form"
import { CommentItem, CommentData } from "./comment-item"

interface CommentsSectionProps {
  postId: string;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Fetch comments on initial load
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/${postId}/comments?page=1&limit=10`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        
        const data = await response.json();
        setComments(data);
        setHasMore(data.length === 10); // If we got 10 items, there might be more
        setPage(1);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setError('Failed to load comments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [postId]);
  
  // Handler for loading more comments
  const loadMoreComments = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await fetch(`/api/posts/${postId}/comments?page=${nextPage}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch more comments');
      }
      
      const data = await response.json();
      if (data.length > 0) {
        setComments(prevComments => [...prevComments, ...data]);
        setHasMore(data.length === 10); // If we got 10 items, there might be more
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching more comments:', error);
    } finally {
      setLoadingMore(false);
    }
  };
  
  // Handler for adding a new comment
  const handleCommentAdded = (newComment: CommentData) => {
    setComments(prevComments => [newComment, ...prevComments]);
  };
  
  // Handler for deleting a comment
  const handleCommentDeleted = (commentId: string) => {
    setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
        <Button
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="px-4 pt-4 font-bold text-xl">Comments</h2>
      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      
      {comments.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <p>No comments yet. Be the first to add one!</p>
        </div>
      ) : (
        <div className="px-4">
          {comments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment}
              onDelete={handleCommentDeleted}
            />
          ))}
          
          {hasMore && (
            <div className="py-4 flex justify-center">
              <Button
                variant="outline"
                onClick={loadMoreComments}
                disabled={loadingMore}
                className="text-blue-500 border-blue-500/50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more comments'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 