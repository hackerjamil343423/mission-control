"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Video, Plus, Loader2 } from "lucide-react";
import type { Content } from "@/types";

const stages = [
  { id: "idea",       label: "Idea",       emoji: "💡", color: "#8B5CF6", bg: "#F5F3FF" },
  { id: "scripting",  label: "Scripting",  emoji: "✍️",  color: "#2563EB", bg: "#EFF6FF" },
  { id: "thumbnail",  label: "Thumbnail",  emoji: "🎨", color: "#D97706", bg: "#FFFBEB" },
  { id: "filming",    label: "Filming",    emoji: "🎬", color: "#DC2626", bg: "#FEF2F2" },
  { id: "editing",    label: "Editing",    emoji: "✂️",  color: "#0891B2", bg: "#ECFEFF" },
  { id: "published",  label: "Published",  emoji: "🚀", color: "#16A34A", bg: "#F0FDF4" },
] as const;

export default function ContentPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchContent = () => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((d) => { setContent(d as Content[]); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchContent(); }, []);

  const addContent = async () => {
    if (!newContent.trim() || adding) return;
    setAdding(true);
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newContent }),
    });
    setNewContent("");
    setAdding(false);
    fetchContent();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 items-center gap-4 border-b border-[#E5E5E5] px-6 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <SidebarTrigger className="text-[#555555] hover:text-[#111111]" />
        <Separator orientation="vertical" className="h-5" />
        <Video className="w-4 h-4 text-[#D4F657]" style={{ filter: "drop-shadow(0 0 4px #D4F657)" }} />
        <span className="font-semibold text-[#111111] text-sm">Content Pipeline</span>
        <div className="ml-auto flex items-center gap-2 w-72">
          <Input
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addContent()}
            placeholder="New content idea..."
            className="h-8 text-sm border-[#E5E5E5] bg-white"
          />
          <Button
            onClick={addContent}
            disabled={adding}
            size="sm"
            className="h-8 bg-[#D4F657] text-black hover:bg-[#c8ec3e] font-semibold shrink-0"
          >
            {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111111]">Content Pipeline</h1>
          <p className="text-sm text-[#555555] mt-0.5">{content.length} total pieces</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-[#555555]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {stages.map((stage) => {
              const stageContent = content.filter((c) => c.stage === stage.id);
              return (
                <div key={stage.id}>
                  <div
                    className="flex items-center gap-1.5 mb-3 px-3 py-2 rounded-lg"
                    style={{ backgroundColor: stage.bg }}
                  >
                    <span className="text-sm">{stage.emoji}</span>
                    <span className="text-xs font-semibold" style={{ color: stage.color }}>
                      {stage.label}
                    </span>
                    <span
                      className="ml-auto text-xs font-bold"
                      style={{ color: stage.color }}
                    >
                      {stageContent.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {stageContent.length === 0 ? (
                      <div className="border-2 border-dashed border-[#E5E5E5] rounded-lg p-4 text-center">
                        <p className="text-xs text-[#E5E5E5]">Empty</p>
                      </div>
                    ) : (
                      stageContent.map((item) => (
                        <Card key={item.id} className="border-[#E5E5E5] hover:shadow-sm transition-shadow">
                          <CardContent className="p-3">
                            <p className="text-xs font-medium text-[#111111] leading-snug">{item.title}</p>
                            {item.notes && (
                              <p className="text-[10px] text-[#555555] mt-1 line-clamp-2">{item.notes}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
