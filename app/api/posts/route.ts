import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";

// GET /api/posts - Get posts feed (with pagination)
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
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const followingOnly = searchParams.get("following") === "true";

    // Get posts
    const currentUserId = session.user.id;
    
    // Get the IDs of users that the current user follows
    const following = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
      },
      select: {
        followingId: true,
      },
    });
    
    const followingIds = following.map(f => f.followingId);
    console.log(`User ${currentUserId} follows ${followingIds.length} users: ${followingIds.join(', ')}`);
    
    let whereClause: any = {};
    
    if (followingOnly) {
      // Only posts from users the current user follows
      if (followingIds.length === 0) {
        // If not following anyone, return empty array
        return NextResponse.json([]);
      }
      
      whereClause = {
        userId: {
          in: followingIds
        }
      };
    } else {
      // Default: mix of followed users' posts and own posts
      const userIds = [...followingIds, currentUserId];
      whereClause = {
        userId: {
          in: userIds
        }
      };
    }
    
    console.log(`Fetching posts for user ${currentUserId}, followingOnly: ${followingOnly}`);
    
    const posts = await prisma.post.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    console.log(`Found ${posts.length} posts`);

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
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in." },
        { status: 401 }
      );
    }

    const { text, image } = await request.json();

    // Validate input
    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "Post text is required" },
        { status: 400 }
      );
    }

    if (text.length > 280) {
      return NextResponse.json(
        { error: "Post text cannot exceed 280 characters" },
        { status: 400 }
      );
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        text,
        image,
        userId: session.user.id,
      },
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
      },
    });

    // Format the data for client-side consumption
    const formattedPost = {
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      isLiked: false,
    };

    return NextResponse.json(formattedPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 