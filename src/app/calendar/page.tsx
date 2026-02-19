"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { CalendarEvent } from "@/types";

const typeConfig: Record<string, { color: string; bg: string }> = {
  cron:     { color: "#2563EB", bg: "#EFF6FF" },
  reminder: { color: "#D97706", bg: "#FFFBEB" },
  task:     { color: "#8B5CF6", bg: "#F5F3FF" },
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((d) => { setEvents(d as CalendarEvent[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const upcoming = events.filter((e) => !e.completed);
  const completed = events.filter((e) => e.completed);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 items-center gap-4 border-b border-[#E5E5E5] px-6 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <SidebarTrigger className="text-[#555555] hover:text-[#111111]" />
        <Separator orientation="vertical" className="h-5" />
        <Calendar className="w-4 h-4 text-[#D4F657]" style={{ filter: "drop-shadow(0 0 4px #D4F657)" }} />
        <span className="font-semibold text-[#111111] text-sm">Calendar</span>
      </header>

      <main className="flex-1 p-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111111]">Calendar</h1>
          <p className="text-sm text-[#555555] mt-0.5">
            {upcoming.length} upcoming · {completed.length} completed
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-[#555555]" />
          </div>
        ) : events.length === 0 ? (
          <Card className="border-[#E5E5E5]">
            <CardContent className="p-12 text-center">
              <Calendar className="w-10 h-10 text-[#E5E5E5] mx-auto mb-3" />
              <p className="text-[#555555]">No scheduled events</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-[#555555] uppercase tracking-wider mb-3">
                  Upcoming ({upcoming.length})
                </h2>
                <div className="space-y-2.5">
                  {upcoming.map((event) => (
                    <Card key={event.id} className="border-[#E5E5E5] hover:shadow-sm transition-shadow">
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#D4F657]/20 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-[#5a6e00]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-[#111111] text-sm">{event.title}</p>
                            <Badge
                              variant="outline"
                              className="text-[10px] shrink-0 border-0 font-medium"
                              style={{
                                backgroundColor: typeConfig[event.type]?.bg ?? "#F0F0F0",
                                color: typeConfig[event.type]?.color ?? "#555555",
                              }}
                            >
                              {event.type}
                            </Badge>
                          </div>
                          {event.description && (
                            <p className="text-xs text-[#555555] mt-0.5">{event.description}</p>
                          )}
                          <p className="text-xs text-[#555555] mt-1.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(event.scheduled_at).toLocaleDateString("en-US", {
                              weekday: "short", month: "short", day: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Circle className="w-4 h-4 text-[#E5E5E5] shrink-0 mt-0.5" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-[#555555] uppercase tracking-wider mb-3">
                  Completed ({completed.length})
                </h2>
                <div className="space-y-2">
                  {completed.map((event) => (
                    <Card key={event.id} className="border-[#E5E5E5] opacity-60">
                      <CardContent className="p-4 flex items-center gap-4">
                        <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#555555] line-through truncate">{event.title}</p>
                        </div>
                        <span className="text-xs text-[#555555]">
                          {new Date(event.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
