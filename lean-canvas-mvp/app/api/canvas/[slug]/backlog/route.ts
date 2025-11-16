import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/canvas/[slug]/backlog - Get all backlogs linked to a canvas
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const canvas = await prisma.canvas.findUnique({
      where: {
        slug: params.slug,
      },
      include: {
        backlogLinks: {
          include: {
            backlog: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!canvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    const backlogs = canvas.backlogLinks.map((link) => ({
      ...link.backlog,
      linkId: link.id,
      linkNotes: link.notes,
      linkCreatedAt: link.createdAt,
    }));

    return NextResponse.json({ backlogs });
  } catch (error) {
    console.error("Error fetching canvas backlogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch canvas backlogs" },
      { status: 500 }
    );
  }
}

// POST /api/canvas/[slug]/backlog - Link a backlog to a canvas
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canvas = await prisma.canvas.findUnique({
      where: {
        slug: params.slug,
      },
    });

    if (!canvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    if (canvas.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { backlogId, notes } = await req.json();

    if (!backlogId) {
      return NextResponse.json(
        { error: "Backlog ID is required" },
        { status: 400 }
      );
    }

    // Verify backlog exists and belongs to the user
    const backlog = await prisma.backlog.findUnique({
      where: {
        id: backlogId,
      },
    });

    if (!backlog) {
      return NextResponse.json({ error: "Backlog not found" }, { status: 404 });
    }

    if (backlog.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Cannot link backlog from another user" },
        { status: 403 }
      );
    }

    // Check if link already exists
    const existingLink = await prisma.canvasBacklogLink.findUnique({
      where: {
        canvasId_backlogId: {
          canvasId: canvas.id,
          backlogId: backlogId,
        },
      },
    });

    if (existingLink) {
      return NextResponse.json(
        { error: "Backlog already linked to this canvas" },
        { status: 409 }
      );
    }

    const link = await prisma.canvasBacklogLink.create({
      data: {
        canvasId: canvas.id,
        backlogId,
        notes,
      },
      include: {
        backlog: true,
      },
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    console.error("Error linking backlog to canvas:", error);
    return NextResponse.json(
      { error: "Failed to link backlog to canvas" },
      { status: 500 }
    );
  }
}
