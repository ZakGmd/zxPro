import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";

// GET /api/users/[userId]/followers - Get list of users following the specified user
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

    // Get followers
    const followers = await prisma.follow.findMany({
      where: {
        followingId: targetUserId,
      },
      include: {
        follower: {
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
          followingId: { in: followers.map((f) => f.followerId) },
        },
        select: {
          followingId: true,
        },
      })).map((f) => f.followingId)
    );

    // Format the data for client-side consumption
    const formattedFollowers = followers.map(({ follower, createdAt }) => ({
      ...follower,
      followedAt: createdAt.toISOString(),
      isFollowing: followedUserIds.has(follower.id) || follower.id === currentUserId,
      isCurrentUser: follower.id === currentUserId,
    }));

    return NextResponse.json(formattedFollowers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 