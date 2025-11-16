import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// POST /api/backlog/[slug]/share - Enable sharing and generate share token
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backlog = await prisma.backlog.findUnique({
      where: { slug: params.slug },
    });

    if (!backlog) {
      return NextResponse.json({ error: "Backlog not found" }, { status: 404 });
    }

    if (backlog.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate unique share token
    const shareToken = randomBytes(16).toString("hex");

    const updatedBacklog = await prisma.backlog.update({
      where: { id: backlog.id },
      data: {
        isPublic: true,
        shareToken,
      },
    });

    return NextResponse.json({
      backlog: updatedBacklog,
      shareUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/share/backlog/${shareToken}`,
    });
  } catch (error) {
    console.error("Error enabling sharing:", error);
    return NextResponse.json(
      { error: "Failed to enable sharing" },
      { status: 500 }
    );
  }
}

// DELETE /api/backlog/[slug]/share - Disable sharing
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
      where: { slug: params.slug },
    });

    if (!backlog) {
      return NextResponse.json({ error: "Backlog not found" }, { status: 404 });
    }

    if (backlog.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedBacklog = await prisma.backlog.update({
      where: { id: backlog.id },
      data: {
        isPublic: false,
        shareToken: null,
      },
    });

    return NextResponse.json({ backlog: updatedBacklog });
  } catch (error) {
    console.error("Error disabling sharing:", error);
    return NextResponse.json(
      { error: "Failed to disable sharing" },
      { status: 500 }
    );
  }
}
