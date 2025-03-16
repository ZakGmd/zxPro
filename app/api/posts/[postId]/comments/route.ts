import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";

// GET /api/posts/[postId]/comments - Get comments for a specific post
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in." },
        { status: 401 }
      );
    }

    // Extract postId from params
    const postId = params.postId;
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Get comments
    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
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
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Format comments for response without trying to access likes
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      text: comment.text,
      postId: comment.postId,
      userId: comment.userId,
      user: comment.user,
      createdAt: comment.createdAt.toISOString(),
      likeCount: 0, // Since we don't have comment likes in the schema
      isLiked: false
    }));

    return NextResponse.json(formattedComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/posts/[postId]/comments - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in." },
        { status: 401 }
      );
    }

    // Extract postId from params
    const postId = params.postId;
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const { text } = await request.json();

    // Validate the text field
    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 }
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: "Comment text cannot exceed 500 characters" },
        { status: 400 }
      );
    }

    // Check if post exists and get post owner
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        userId: true
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        text,
        postId: postId,
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
      },
    });

    // Don't create notification if commenting on your own post
    if (post.userId !== session.user.id) {
      // Create notification for the post owner
      await prisma.notification.create({
        data: {
          type: "COMMENT",
          fromUserId: session.user.id,
          toUserId: post.userId,
          postId: postId,
          body: text.substring(0, 100) // Include part of the comment text in the notification body
        },
      });
    }

    // Return formatted response
    return NextResponse.json({
      id: comment.id,
      text: comment.text,
      postId: comment.postId,
      userId: comment.userId,
      user: comment.user,
      createdAt: comment.createdAt.toISOString(),
      likeCount: 0,
      isLiked: false
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 