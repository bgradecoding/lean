import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Canvas Not Found</h1>
        <p className="text-gray-600 mb-6">
          The canvas you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Link href="/">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
