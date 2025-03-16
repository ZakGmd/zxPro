import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";

// GET /api/users/[userId] - Get user profile by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in." },
        { status: 401 }
      );
    }

    const currentUserId = session.user.id;
    const targetUserId = params.userId;

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        coverImage: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            following: true,
            followedBy: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if the current user is following this user
    const isFollowing = currentUserId !== targetUserId
      ? await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: targetUserId,
            },
          },
        })
      : null;

    // Format the data for client-side consumption
    const formattedUser = {
      ...user,
      createdAt: user.createdAt.toISOString(),
      followingCount: user._count.following,
      followersCount: user._count.followedBy,
      postsCount: user._count.posts,
      isFollowing: !!isFollowing,
      isCurrentUser: currentUserId === targetUserId,
      _count: undefined,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 