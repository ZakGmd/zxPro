import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";

// GET /api/users/search - Search for users by name or username
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

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Search for users matching the query
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
      },
      orderBy: [
        { username: "asc" },
        { name: "asc" },
      ],
      skip,
      take: limit,
    });

    // Get the subset of IDs that the current user follows
    const followedUserIds = new Set(
      (await prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: { in: users.map((user) => user.id) },
        },
        select: {
          followingId: true,
        },
      })).map((f) => f.followingId)
    );

    // Format the data for client-side consumption
    const formattedUsers = users.map((user) => ({
      ...user,
      isFollowing: followedUserIds.has(user.id) || user.id === currentUserId,
      isCurrentUser: user.id === currentUserId,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 