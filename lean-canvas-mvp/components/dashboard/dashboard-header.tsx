"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface DashboardHeaderProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function DashboardHeader({ userName, userEmail }: DashboardHeaderProps) {
  return (
    <div className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Canvases</h1>
          <p className="text-sm text-gray-500">
            Welcome back, {userName || userEmail}
          </p>
        </div>
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
          Logout
        </Button>
      </div>
    </div>
  );
}
