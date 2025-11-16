import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

// GET /api/backlog - List all user's backlogs
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const priority = searchParams.get("priority");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {
      userId: session.user.id,
    };

    if (priority) {
      where.priority = priority;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const backlogs = await prisma.backlog.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        canvasLinks: {
          include: {
            canvas: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ backlogs });
  } catch (error) {
    console.error("Error fetching backlogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch backlogs" },
      { status: 500 }
    );
  }
}

// POST /api/backlog - Create new backlog
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, source, priority, status, tags } =
      await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Backlog title is required" },
        { status: 400 }
      );
    }

    const slug = generateSlug(title);

    const backlog = await prisma.backlog.create({
      data: {
        title,
        description,
        source,
        priority: priority || "Medium",
        status: status || "New",
        tags,
        slug,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ backlog }, { status: 201 });
  } catch (error) {
    console.error("Error creating backlog:", error);
    return NextResponse.json(
      { error: "Failed to create backlog" },
      { status: 500 }
    );
  }
}
