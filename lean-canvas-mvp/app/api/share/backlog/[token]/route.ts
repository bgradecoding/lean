import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/share/backlog/[token] - Get shared backlog by token (public)
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const backlog = await prisma.backlog.findUnique({
      where: {
        shareToken: params.token,
      },
    });

    if (!backlog || !backlog.isPublic) {
      return NextResponse.json(
        { error: "Backlog not found or sharing is disabled" },
        { status: 404 }
      );
    }

    // Return backlog without sensitive user information
    const { userId, ...safeBacklog } = backlog;

    return NextResponse.json({ backlog: safeBacklog });
  } catch (error) {
    console.error("Error fetching shared backlog:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared backlog" },
      { status: 500 }
    );
  }
}
