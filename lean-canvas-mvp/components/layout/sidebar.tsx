"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, FileText, ClipboardList, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Canvas {
  id: string;
  slug: string;
  name: string;
  updatedAt: Date | string;
}

interface SidebarProps {
  userName?: string | null;
}

const navItems = [
  {
    href: "/",
    label: "대시보드",
    icon: Home,
  },
  {
    href: "/backlog",
    label: "백로그 목록",
    icon: ClipboardList,
  },
];

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [recentCanvases, setRecentCanvases] = useState<Canvas[]>([]);

  useEffect(() => {
    fetchRecentCanvases();
  }, []);

  const fetchRecentCanvases = async () => {
    try {
      const response = await fetch("/api/canvas");
      if (response.ok) {
        const data = await response.json();
        const canvases = data.canvases || [];
        setRecentCanvases(canvases.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching recent canvases:", error);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/" onClick={closeSidebar}>
              <h1 className="text-xl font-bold text-gray-900">Lean Canvas</h1>
              {userName && (
                <p className="text-sm text-gray-500 mt-1">{userName}</p>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Recent Canvases */}
            {recentCanvases.length > 0 && (
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  최근 캔버스
                </h3>
                <div className="space-y-1">
                  {recentCanvases.map((canvas) => {
                    const isActive = pathname === `/canvas/${canvas.slug}`;
                    return (
                      <Link
                        key={canvas.id}
                        href={`/canvas/${canvas.slug}`}
                        onClick={closeSidebar}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{canvas.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Lean Canvas MVP v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
