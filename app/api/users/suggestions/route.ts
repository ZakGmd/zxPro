import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";

// Define user type with count for suggestions
type UserWithFollowerCount = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
  _count: {
    followedBy: number;
  };
};

// GET /api/users/suggestions - Get suggested users to follow
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in." },
        { status: 401 }
      );
    }

    const currentUserId = session.user.id;

    // Get URL parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    // Get users that the current user is already following
    const following = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((f) => f.followingId);
    
    // Include current user ID in the exclusion list
    const excludeIds = [...followingIds, currentUserId];

    // Approach 1: Get popular users (users with most followers)
    // Prioritize popular users, sorting by follower count
    let popularUsers = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        _count: {
          select: {
            followedBy: true,
          },
        },
      },
      orderBy: {
        followedBy: { _count: "desc" },
      },
      take: limit,
    });

    // Approach 2: If not enough popular users, get users followed by people you follow
    // (users that people you follow are following)
    let recommendedUsers: UserWithFollowerCount[] = [];
    if (popularUsers.length < limit && followingIds.length > 0) {
      const followsOfFollowing = await prisma.follow.findMany({
        where: {
          followerId: { in: followingIds },
          followingId: { notIn: excludeIds },
        },
        select: {
          followingId: true,
        },
        distinct: ["followingId"],
        take: limit - popularUsers.length,
      });

      const recommendedIds = followsOfFollowing.map((f) => f.followingId);

      if (recommendedIds.length > 0) {
        recommendedUsers = await prisma.user.findMany({
          where: {
            id: { in: recommendedIds },
          },
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
            _count: {
              select: {
                followedBy: true,
              },
            },
          },
        });
      }
    }

    // Approach 3: If still not enough users, get random users to reach the limit
    let randomUsers: UserWithFollowerCount[] = [];
    if (popularUsers.length + recommendedUsers.length < limit) {
      const excludeIdsWithNewUsers = [
        ...excludeIds,
        ...popularUsers.map(user => user.id),
        ...recommendedUsers.map(user => user.id)
      ];

      randomUsers = await prisma.user.findMany({
        where: {
          id: { notIn: excludeIdsWithNewUsers },
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          bio: true,
          _count: {
            select: {
              followedBy: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc", // Prefer newer users
        },
        take: limit - popularUsers.length - recommendedUsers.length,
      });
    }

    // Combine all suggestion types
    const suggestedUsers = [
      ...popularUsers,
      ...recommendedUsers,
      ...randomUsers
    ];

    // Format the data for client-side consumption
    const formattedUsers = suggestedUsers.map(user => ({
      ...user,
      followerCount: user._count.followedBy,
      _count: undefined,
      isFollowing: false,
      isCurrentUser: false
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching user suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 