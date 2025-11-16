"use client";

import { useState } from "react";
import { CanvasCard } from "./canvas-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface Canvas {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CanvasListProps {
  canvases: Canvas[];
}

export function CanvasList({ canvases }: CanvasListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCanvasName, setNewCanvasName] = useState("");
  const [newCanvasDescription, setNewCanvasDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const filteredCanvases = canvases.filter((canvas) =>
    canvas.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCanvas = async () => {
    if (!newCanvasName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/canvas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCanvasName,
          description: newCanvasDescription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/canvas/${data.canvas.slug}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create canvas:", error);
    } finally {
      setIsCreating(false);
      setShowCreateDialog(false);
      setNewCanvasName("");
      setNewCanvasDescription("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search canvases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Canvas
        </Button>
      </div>

      {filteredCanvases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? "No canvases found matching your search"
              : "No canvases yet"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first canvas
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCanvases.map((canvas) => (
            <CanvasCard
              key={canvas.id}
              slug={canvas.slug}
              name={canvas.name}
              description={canvas.description}
              updatedAt={canvas.updatedAt}
            />
          ))}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Canvas</DialogTitle>
            <DialogDescription>
              Start mapping your business model with a new Lean Canvas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="canvas-name" className="text-sm font-medium block mb-2">
                Canvas Name *
              </label>
              <Input
                id="canvas-name"
                placeholder="e.g., My Startup Idea"
                value={newCanvasName}
                onChange={(e) => setNewCanvasName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="canvas-description" className="text-sm font-medium block mb-2">
                Description (optional)
              </label>
              <Input
                id="canvas-description"
                placeholder="Brief description of your project"
                value={newCanvasDescription}
                onChange={(e) => setNewCanvasDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCanvas}
              disabled={!newCanvasName.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Create Canvas"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
