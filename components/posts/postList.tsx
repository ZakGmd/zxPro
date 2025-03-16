// components/posts/PostList.tsx
"use client";

import { useState, useEffect } from "react";
import PostItem from "./postItem";
import { useInView } from "react-intersection-observer";

interface User {
  id: string;
  name: string;
  username: string;
  image: string;
}

interface Post {
  id: string;
  text: string;
  image: string | null;
  createdAt: string;
  user: User;
  _count: {
    comments: number;
    likes: number;
  };
  likes: any[]; // Simplified for this example
}

interface PostListProps {
  initialPosts: Post[];
}

export default function PostList({ initialPosts }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // This ref will be used to detect when the user scrolls to the bottom
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const fetchMorePosts = async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/posts?page=${nextPage}&limit=10`);
      const newPosts = await response.json();
      
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Error fetching more posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more posts when the user scrolls to the bottom
  useEffect(() => {
    if (inView) {
      fetchMorePosts();
    }
  }, [inView]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No posts yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
      
      {/* Loading indicator */}
      {hasMore && (
        <div ref={ref} className="py-4 text-center">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <button
              onClick={fetchMorePosts}
              className="text-blue-500 hover:underline"
            >
              Load more
            </button>
          )}
        </div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className="py-4 text-center text-gray-500">
          No more posts to load
        </div>
      )}
    </div>
  );
}