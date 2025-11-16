import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/canvas/[slug] - Get canvas by slug
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!canvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    return NextResponse.json({ canvas });
  } catch (error) {
    console.error("Error fetching canvas:", error);
    return NextResponse.json(
      { error: "Failed to fetch canvas" },
      { status: 500 }
    );
  }
}

// PATCH /api/canvas/[slug] - Update canvas block(s)
export async function PATCH(
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

    const updates = await req.json();

    const updatedCanvas = await prisma.canvas.update({
      where: {
        slug: params.slug,
      },
      data: updates,
    });

    return NextResponse.json({ canvas: updatedCanvas });
  } catch (error) {
    console.error("Error updating canvas:", error);
    return NextResponse.json(
      { error: "Failed to update canvas" },
      { status: 500 }
    );
  }
}

// DELETE /api/canvas/[slug] - Delete canvas
export async function DELETE(
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

    await prisma.canvas.delete({
      where: {
        slug: params.slug,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting canvas:", error);
    return NextResponse.json(
      { error: "Failed to delete canvas" },
      { status: 500 }
    );
  }
}
