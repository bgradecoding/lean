import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

// GET /api/canvas - List all user's canvases
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canvases = await prisma.canvas.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ canvases });
  } catch (error) {
    console.error("Error fetching canvases:", error);
    return NextResponse.json(
      { error: "Failed to fetch canvases" },
      { status: 500 }
    );
  }
}

// POST /api/canvas - Create new canvas
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Canvas name is required" },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);

    const canvas = await prisma.canvas.create({
      data: {
        name,
        description,
        slug,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ canvas }, { status: 201 });
  } catch (error) {
    console.error("Error creating canvas:", error);
    return NextResponse.json(
      { error: "Failed to create canvas" },
      { status: 500 }
    );
  }
}
