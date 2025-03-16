import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";

// GET /api/users/me - Get current user profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
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

    // Format the data for client-side consumption
    const formattedUser = {
      ...user,
      createdAt: user.createdAt.toISOString(),
      followingCount: user._count.following,
      followersCount: user._count.followedBy,
      postsCount: user._count.posts,
      _count: undefined,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/me - Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in." },
        { status: 401 }
      );
    }

    const { name, username, bio, image, coverImage } = await request.json();
    
    // Input validation
    if (username) {
      // Check if username is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          id: { not: session.user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        );
      }

      if (username.length < 3 || username.length > 20) {
        return NextResponse.json(
          { error: "Username must be between 3 and 20 characters" },
          { status: 400 }
        );
      }

      // Only allow letters, numbers, and underscores
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json(
          { error: "Username can only contain letters, numbers, and underscores" },
          { status: 400 }
        );
      }
    }

    if (bio && bio.length > 160) {
      return NextResponse.json(
        { error: "Bio cannot exceed 160 characters" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (image !== undefined) updateData.image = image;
    if (coverImage !== undefined) updateData.coverImage = coverImage;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        coverImage: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            following: true,
            followedBy: true,
            posts: true,
          },
        },
      },
    });

    // Format the data for client-side consumption
    const formattedUser = {
      ...updatedUser,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
      followingCount: updatedUser._count.following,
      followersCount: updatedUser._count.followedBy,
      postsCount: updatedUser._count.posts,
      _count: undefined,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 