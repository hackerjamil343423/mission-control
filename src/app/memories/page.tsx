"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Brain, Search, Loader2 } from "lucide-react";
import type { Memory } from "@/types";

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/memories")
      .then((r) => r.json())
      .then((d) => { setMemories(d as Memory[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = memories.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      (m.tags ?? []).some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 items-center gap-4 border-b border-[#E5E5E5] px-6 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <SidebarTrigger className="text-[#555555] hover:text-[#111111]" />
        <Separator orientation="vertical" className="h-5" />
        <Brain className="w-4 h-4 text-[#D4F657]" style={{ filter: "drop-shadow(0 0 4px #D4F657)" }} />
        <span className="font-semibold text-[#111111] text-sm">Memory Bank</span>
        <div className="ml-auto w-64 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555555]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="h-8 pl-8 text-sm border-[#E5E5E5] bg-white"
          />
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111111]">Memory Bank</h1>
          <p className="text-sm text-[#555555] mt-0.5">
            {filtered.length} {search ? "matching" : "stored"} {filtered.length === 1 ? "memory" : "memories"}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-[#555555]" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-[#E5E5E5]">
            <CardContent className="p-12 text-center">
              <Brain className="w-10 h-10 text-[#E5E5E5] mx-auto mb-3" />
              <p className="text-[#555555]">{search ? "No memories match your search" : "No memories stored yet"}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((memory) => (
              <Card key={memory.id} className="border-[#E5E5E5] hover:shadow-md transition-all duration-200 group">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[#111111] leading-snug">
                    {memory.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-[#555555] leading-relaxed line-clamp-3">{memory.content}</p>
                  {(memory.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(memory.tags ?? []).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#D4F657]/20 text-[#5a6e00]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-[#E5E5E5] mt-3">
                    {new Date(memory.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
