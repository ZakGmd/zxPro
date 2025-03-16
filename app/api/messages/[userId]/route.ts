import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";

// GET /api/messages/[userId] - Get messages with a specific user
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
    const otherUserId = params.userId;

    // Get URL parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Check if the other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true },
    });

    if (!otherUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get messages between the current user and the other user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            fromUserId: currentUserId,
            toUserId: otherUserId,
          },
          {
            fromUserId: otherUserId,
            toUserId: currentUserId,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
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
    });

    // Mark all unread messages from the other user as read
    await prisma.message.updateMany({
      where: {
        fromUserId: otherUserId,
        toUserId: currentUserId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Format the data for client-side consumption
    const formattedMessages = messages.map((message) => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
      isOwnMessage: message.fromUserId === currentUserId,
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/messages/[userId] - Send a message to a specific user
export async function POST(
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
    const recipientId = params.userId;

    // Check if trying to message themselves
    if (currentUserId === recipientId) {
      return NextResponse.json(
        { error: "You cannot send a message to yourself" },
        { status: 400 }
      );
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    const { content } = await request.json();

    // Validate input
    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Message content cannot exceed 1000 characters" },
        { status: 400 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        fromUserId: currentUserId,
        toUserId: recipientId,
      },
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
    });

    // Format the data for client-side consumption
    const formattedMessage = {
      ...message,
      createdAt: message.createdAt.toISOString(),
      isOwnMessage: true,
    };

    return NextResponse.json(formattedMessage, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 