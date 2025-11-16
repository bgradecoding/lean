"use client";

import { Sidebar } from "./sidebar";
import { DashboardHeader } from "../dashboard/dashboard-header";

interface AppLayoutProps {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
}

export function AppLayout({ children, userName, userEmail }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userName={userName} />

      {/* Main Content */}
      <div className="lg:pl-64">
        <DashboardHeader userName={userName} userEmail={userEmail} />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
