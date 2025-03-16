import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";

// GET /api/users/notifications - Get current user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in." },
        { status: 401 }
      );
    }

    // Get URL parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Build where clause based on filters
    const whereClause: any = {
      toUserId: session.user.id,
    };

    if (unreadOnly) {
      whereClause.isRead = false;
    }

    // Get total count for pagination
    const totalCount = await prisma.notification.count({
      where: whereClause,
    });

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        fromUser: {
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

    // Fetch post data for notifications that reference posts
    const postIds = notifications
      .filter(n => n.type === "LIKE" || n.type === "COMMENT" || n.type === "MENTION")
      .filter(n => n.postId !== null)
      .map(n => n.postId as string);
    
    const posts = postIds.length > 0 
      ? await prisma.post.findMany({
          where: {
            id: { in: postIds }
          },
          select: {
            id: true,
            text: true
          }
        })
      : [];
    
    const postsMap = new Map(posts.map(post => [post.id, post]));

    // Check if there are more notifications to fetch
    const hasMore = totalCount > skip + notifications.length;

    // Format the data for client-side consumption
    const formattedNotifications = notifications.map((notification) => {
      // Check if the current user is following the notification sender
      const actor = notification.fromUser ? {
        id: notification.fromUser.id,
        name: notification.fromUser.name,
        username: notification.fromUser.username,
        image: notification.fromUser.image,
        isFollowing: false, // We will set this separately if needed
        isCurrentUser: notification.fromUser.id === session.user.id
      } : null;

      let postData = null;
      if (notification.postId && postsMap.has(notification.postId)) {
        const post = postsMap.get(notification.postId);
        postData = {
          id: post!.id,
          content: post!.text
        };
      }

      return {
        id: notification.id,
        type: notification.type,
        createdAt: notification.createdAt.toISOString(),
        isRead: notification.isRead,
        actor,
        post: postData,
        comment: notification.type === "COMMENT" && notification.body 
          ? { content: notification.body } 
          : null
      };
    });

    console.log(`Returning ${formattedNotifications.length} notifications for user ${session.user.id}`);

    return NextResponse.json({
      items: formattedNotifications,
      totalCount,
      hasMore,
      page,
      limit
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in." },
        { status: 401 }
      );
    }

    const { notificationIds, all = false } = await request.json();

    if (!all && (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0)) {
      return NextResponse.json(
        { error: "Notification IDs are required unless marking all as read" },
        { status: 400 }
      );
    }

    if (all) {
      // Mark all user's notifications as read
      await prisma.notification.updateMany({
        where: {
          toUserId: session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    } else {
      // Mark specific notifications as read, ensuring they belong to the user
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          toUserId: session.user.id,
        },
        data: {
          isRead: true,
        },
      });
    }

    return NextResponse.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 