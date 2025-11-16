import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CanvasHeader } from "@/components/canvas/canvas-header";
import { CanvasLayout } from "@/components/canvas/canvas-layout";

interface CanvasPageProps {
  params: {
    slug: string;
  };
}

export default async function CanvasPage({ params }: CanvasPageProps) {
  const session = await getServerSession(authOptions);

  const canvas = await prisma.canvas.findUnique({
    where: {
      slug: params.slug,
    },
  });

  if (!canvas) {
    notFound();
  }

  const isOwner = session?.user?.id === canvas.userId;
  const isReadOnly = !isOwner;

  return (
    <div className="min-h-screen bg-gray-50">
      <CanvasHeader
        canvasName={canvas.name}
        canvasSlug={canvas.slug}
        isOwner={isOwner}
      />
      <CanvasLayout canvas={canvas} isReadOnly={isReadOnly} />
    </div>
  );
}
