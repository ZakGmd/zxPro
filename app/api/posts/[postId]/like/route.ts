import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";

// POST /api/posts/[postId]/like - Like a post
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

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: params.postId },
      include: {
        user: {
          select: {
            id: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await prisma.like.findFirst({
      where: {
        postId: params.postId,
        userId: session.user.id,
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "You have already liked this post" },
        { status: 400 }
      );
    }

    // Create like
    await prisma.like.create({
      data: {
        postId: params.postId,
        userId: session.user.id,
      },
    });

    // Don't create notification if liking your own post
    if (post.user.id !== session.user.id) {
      // Create notification for the post owner
      await prisma.notification.create({
        data: {
          type: "LIKE",
          fromUserId: session.user.id,
          toUserId: post.user.id,
          postId: params.postId,
        },
      });
    }

    return NextResponse.json({ message: "Post liked successfully" });
  } catch (error) {
    console.error("Error liking post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[postId]/like - Unlike a post
export async function DELETE(
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

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: params.postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Delete like
    await prisma.like.deleteMany({
      where: {
        postId: params.postId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("Error unliking post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 