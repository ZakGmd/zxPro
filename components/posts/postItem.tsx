
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Repeat, Share } from "lucide-react";

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

interface PostItemProps {
  post: Post;
}

export default function PostItem({ post }: PostItemProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(
    post.likes.some(like => like.userId === session?.user?.id)
  );
  const [likeCount, setLikeCount] = useState(post._count.likes);

  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  const handleLike = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/posts/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post.id }),
      });

      if (response.ok) {
        // Toggle like state
        setLiked(!liked);
        // Update like count
        setLikeCount(prevCount => (liked ? prevCount - 1 : prevCount + 1));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition">
      <div className="flex space-x-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <Link href={`/profile/${post.user.username}`}>
            <Image
              src={post.user.image || "/placeholder-avatar.png"}
              alt={post.user.name}
              width={48}
              height={48}
              className="rounded-full"
            />
          </Link>
        </div>

        {/* Post Content */}
        <div className="flex-grow min-w-0">
          {/* Post Header */}
          <div className="flex items-center mb-1">
            <Link href={`/profile/${post.user.username}`} className="font-semibold text-gray-900 hover:underline mr-2">
              {post.user.name}
            </Link>
            <Link href={`/profile/${post.user.username}`} className="text-gray-500 hover:underline mr-2">
              @{post.user.username}
            </Link>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm ml-2">{formattedDate}</span>
          </div>

          {/* Post Text */}
          <Link href={`/posts/${post.id}`}>
            <p className="text-gray-900 whitespace-pre-line">{post.text}</p>
          </Link>

          {/* Post Image (if any) */}
          {post.image && (
            <div className="mt-3 mb-2">
              <Link href={`/posts/${post.id}`}>
                <Image
                  src={post.image}
                  alt="Post image"
                  width={500}
                  height={300}
                  className="rounded-lg max-h-96 w-auto object-contain"
                />
              </Link>
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between mt-3 text-gray-500">
            {/* Comment button */}
            <Link
              href={`/posts/${post.id}`}
              className="flex items-center space-x-1 hover:text-blue-500"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{post._count.comments}</span>
            </Link>

            {/* Retweet button */}
            <button className="flex items-center space-x-1 hover:text-green-500">
              <Repeat className="h-5 w-5" />
              <span>0</span>
            </button>

            {/* Like button */}
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                liked ? "text-pink-600" : "hover:text-pink-600"
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </button>

            {/* Share button */}
            <button className="flex items-center space-x-1 hover:text-blue-500">
              <Share className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}