import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/backlog/tags - Get popular tags
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all backlogs for the user
    const backlogs = await prisma.backlog.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        tags: true,
      },
    });

    // Extract and count tags
    const tagCounts: Record<string, number> = {};

    backlogs.forEach((backlog) => {
      if (backlog.tags) {
        const tags = backlog.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);

        tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Sort by frequency and get top tags
    const popularTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20) // Top 20 tags
      .map(([tag, count]) => ({ tag, count }));

    return NextResponse.json({ tags: popularTags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
