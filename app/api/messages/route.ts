import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { Prisma } from "@prisma/client";

// Define the conversation result type
type ConversationResult = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  lastmessageat: Date;
  unreadcount: bigint;
};

// GET /api/messages - Get user's conversations
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

    // Find all users that the current user has messaged or received messages from
    const conversations = await prisma.$queryRaw<ConversationResult[]>`
      SELECT 
        u.id, 
        u.name, 
        u.username, 
        u.image,
        MAX(m."createdAt") as lastMessageAt,
        (
          SELECT COUNT(*) 
          FROM "Message" 
          WHERE "toUserId" = ${currentUserId} 
          AND "fromUserId" = u.id 
          AND "isRead" = false
        ) as unreadCount
      FROM "User" u
      JOIN "Message" m ON (m."fromUserId" = u.id AND m."toUserId" = ${currentUserId})
        OR (m."toUserId" = u.id AND m."fromUserId" = ${currentUserId})
      WHERE u.id != ${currentUserId}
      GROUP BY u.id
      ORDER BY lastMessageAt DESC
    `;

    // Format the response
    const formattedConversations = conversations.map((conversation) => ({
      id: conversation.id,
      name: conversation.name,
      username: conversation.username,
      image: conversation.image,
      lastMessageAt: conversation.lastmessageat.toISOString(),
      unreadCount: Number(conversation.unreadcount),
    }));

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 