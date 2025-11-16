import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CanvasList } from "@/components/dashboard/canvas-list";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm text-center">
          <h1 className="text-4xl font-bold mb-4">
            Lean Canvas MVP
          </h1>
          <p className="text-gray-600 mb-8">
            Map your business model and validate assumptions
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">Register</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const canvases = await prisma.canvas.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <AppLayout userName={session.user.name} userEmail={session.user.email}>
      <div className="max-w-7xl mx-auto">
        <CanvasList canvases={canvases} />
      </div>
    </AppLayout>
  );
}
