import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/backlog/[slug]/canvas - Get all canvases linked to a backlog
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
        canvasLinks: {
          include: {
            canvas: {
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

    if (!backlog) {
      return NextResponse.json({ error: "Backlog not found" }, { status: 404 });
    }

    const canvases = backlog.canvasLinks.map((link) => ({
      ...link.canvas,
      linkId: link.id,
      linkNotes: link.notes,
      linkCreatedAt: link.createdAt,
    }));

    return NextResponse.json({ canvases });
  } catch (error) {
    console.error("Error fetching backlog canvases:", error);
    return NextResponse.json(
      { error: "Failed to fetch backlog canvases" },
      { status: 500 }
    );
  }
}
