import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/canvas/[slug]/backlog/[backlogId] - Unlink backlog from canvas
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string; backlogId: string } }
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

    const link = await prisma.canvasBacklogLink.findUnique({
      where: {
        canvasId_backlogId: {
          canvasId: canvas.id,
          backlogId: params.backlogId,
        },
      },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Backlog link not found" },
        { status: 404 }
      );
    }

    await prisma.canvasBacklogLink.delete({
      where: {
        id: link.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unlinking backlog from canvas:", error);
    return NextResponse.json(
      { error: "Failed to unlink backlog from canvas" },
      { status: 500 }
    );
  }
}
