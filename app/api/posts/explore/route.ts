import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";

// GET /api/posts/explore - Get trending/popular posts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in." },
        { status: 401 }
      );
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Get trending posts based on like count and recency
    const currentUserId = session.user.id;
    
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        // Check if the current user has liked the post
        likes: {
          where: {
            userId: currentUserId,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        { likes: { _count: "desc" }},
        { comments: { _count: "desc" }},
        { createdAt: "desc" },
      ],
      skip,
      take: limit,
    });

    // Format the data for client-side consumption
    const formattedPosts = posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      isLiked: post.likes.length > 0,
      likes: undefined, // Remove the likes array from the response
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching explore posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 