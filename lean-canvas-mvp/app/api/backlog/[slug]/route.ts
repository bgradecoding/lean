import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/backlog/[slug] - Get backlog by slug
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const backlog = await prisma.backlog.findUnique({
      where: {
        slug: params.slug,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        canvasLinks: {
          include: {
            canvas: {
              select: {
                id: true,
                slug: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!backlog) {
      return NextResponse.json({ error: "Backlog not found" }, { status: 404 });
    }

    return NextResponse.json({ backlog });
  } catch (error) {
    console.error("Error fetching backlog:", error);
    return NextResponse.json(
      { error: "Failed to fetch backlog" },
      { status: 500 }
    );
  }
}

// PATCH /api/backlog/[slug] - Update backlog
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backlog = await prisma.backlog.findUnique({
      where: {
        slug: params.slug,
      },
    });

    if (!backlog) {
      return NextResponse.json({ error: "Backlog not found" }, { status: 404 });
    }

    if (backlog.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates = await req.json();

    const updatedBacklog = await prisma.backlog.update({
      where: {
        slug: params.slug,
      },
      data: updates,
    });

    return NextResponse.json({ backlog: updatedBacklog });
  } catch (error) {
    console.error("Error updating backlog:", error);
    return NextResponse.json(
      { error: "Failed to update backlog" },
      { status: 500 }
    );
  }
}

// DELETE /api/backlog/[slug] - Delete backlog
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backlog = await prisma.backlog.findUnique({
      where: {
        slug: params.slug,
      },
    });

    if (!backlog) {
      return NextResponse.json({ error: "Backlog not found" }, { status: 404 });
    }

    if (backlog.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.backlog.delete({
      where: {
        slug: params.slug,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting backlog:", error);
    return NextResponse.json(
      { error: "Failed to delete backlog" },
      { status: 500 }
    );
  }
}
