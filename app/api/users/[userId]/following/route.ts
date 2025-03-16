import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";

// GET /api/users/[userId]/following - Get list of users that the specified user follows
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

    // Get URL parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get following
    const following = await prisma.follow.findMany({
      where: {
        followerId: targetUserId,
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get the subset of IDs that the current user follows
    const followedUserIds = new Set(
      (await prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: { in: following.map((f) => f.followingId) },
        },
        select: {
          followingId: true,
        },
      })).map((f) => f.followingId)
    );

    // Format the data for client-side consumption
    const formattedFollowing = following.map(({ following, createdAt }) => ({
      ...following,
      followedAt: createdAt.toISOString(),
      isFollowing: followedUserIds.has(following.id) || following.id === currentUserId,
      isCurrentUser: following.id === currentUserId,
    }));

    return NextResponse.json(formattedFollowing);
  } catch (error) {
    console.error("Error fetching following:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 