'use server'

import { auth } from "@/auth"
import { prisma } from "@/libs/prisma"

/**
 * Get user data for a specific user ID
 */
export async function getUserData(userId: string) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new Error("Unauthorized. You must be logged in.")
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        _count: {
          select: {
            followedBy: true,
            following: true,
            posts: true
          }
        }
      }
    })
    
    if (!user) {
      throw new Error("User not found")
    }
    
    // Check if the current user is following this user
    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId
        }
      }
    })
    
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      bio: user.bio,
      followersCount: user._count.followedBy,
      followingCount: user._count.following,
      postsCount: user._count.posts,
      isFollowing: !!isFollowing,
      isCurrentUser: session.user.id === user.id
    }
  } catch (error) {
    console.error("Error getting user data:", error)
    throw error
  }
} 