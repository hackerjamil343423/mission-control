"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, ChevronLeft, ChevronRight, Clock, CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { CalendarEvent } from "@/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const typeConfig: Record<string, { color: string; bg: string; dot: string }> = {
  cron:     { color: "#2563EB", bg: "#DBEAFE", dot: "#2563EB" },
  reminder: { color: "#D97706", bg: "#FEF3C7", dot: "#D97706" },
  task:     { color: "#7C3AED", bg: "#EDE9FE", dot: "#7C3AED" },
};
const fallback = { color: "#555555", bg: "#F0F0F0", dot: "#555555" };

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((d) => { setEvents(d as CalendarEvent[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* Calendar grid maths */
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth     = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const firstDayRaw     = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset     = (firstDayRaw + 6) % 7;            // shift to Mon=0
  const totalCells      = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  type Cell = { day: number; cur: boolean; date: Date };
  const cells: Cell[] = Array.from({ length: totalCells }, (_, i) => {
    if (i < startOffset) {
      const day = daysInPrevMonth - startOffset + i + 1;
      return { day, cur: false, date: new Date(year, month - 1, day) };
    } else if (i >= startOffset + daysInMonth) {
      const day = i - startOffset - daysInMonth + 1;
      return { day, cur: false, date: new Date(year, month + 1, day) };
    } else {
      const day = i - startOffset + 1;
      return { day, cur: true, date: new Date(year, month, day) };
    }
  });

  function getEventsForDate(date: Date) {
    return events.filter((e) => {
      const d = new Date(e.scheduled_at);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth()    === date.getMonth() &&
        d.getDate()     === date.getDate()
      );
    });
  }

  function isToday(date: Date) {
    return (
      date.getDate()     === today.getDate() &&
      date.getMonth()    === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  /* Upcoming events (within 30 days, not completed) */
  const upcoming = events
    .filter((e) => !e.completed && new Date(e.scheduled_at) >= today)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 8);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex h-14 items-center gap-4 border-b border-[#E5E5E5] px-6 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <SidebarTrigger className="text-[#555555] hover:text-[#111111]" />
        <Separator orientation="vertical" className="h-5" />
        <Calendar className="w-4 h-4 text-[#D4F657]" style={{ filter: "drop-shadow(0 0 4px #D4F657)" }} />
        <span className="font-semibold text-[#111111] text-sm">Calendar</span>
      </header>

      <main className="flex-1 flex gap-0 overflow-hidden">
        {/* ── Left: Month grid ─────────────────────────────── */}
        <div className="flex-1 p-6 flex flex-col min-w-0">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#111111]">
                {MONTHS[month]} {year}
              </h1>
              <p className="text-sm text-[#555555] mt-0.5">
                {events.filter((e) => !e.completed).length} upcoming events
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-[#555555]" />
              </button>
              <button
                onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
                className="px-3 py-1.5 text-xs font-medium bg-[#D4F657] text-black rounded-lg hover:bg-[#c8ec3e] transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-[#555555]" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="w-6 h-6 animate-spin text-[#555555]" />
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map((d) => (
                  <div key={d} className="py-2 text-center text-xs font-semibold text-[#555555] uppercase tracking-wide">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 border-l border-t border-[#E5E5E5] flex-1">
                {cells.map((cell, idx) => {
                  const cellEvents = getEventsForDate(cell.date);
                  const todayCell  = isToday(cell.date);
                  return (
                    <div
                      key={idx}
                      className={`border-r border-b border-[#E5E5E5] p-1.5 min-h-24 flex flex-col ${
                        !cell.cur ? "bg-[#FAFAFA]" : "bg-white hover:bg-[#FDFDF8]"
                      } transition-colors`}
                    >
                      {/* Day number */}
                      <div className="flex justify-end mb-1">
                        <span
                          className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                            todayCell
                              ? "bg-[#D4F657] text-black"
                              : cell.cur
                              ? "text-[#111111]"
                              : "text-[#CCCCCC]"
                          }`}
                        >
                          {cell.day}
                        </span>
                      </div>

                      {/* Events */}
                      <div className="flex flex-col gap-0.5">
                        {cellEvents.slice(0, 3).map((ev) => {
                          const cfg = typeConfig[ev.type] ?? fallback;
                          return (
                            <div
                              key={ev.id}
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded truncate leading-snug"
                              style={{ backgroundColor: cfg.bg, color: cfg.color }}
                            >
                              {ev.completed && "✓ "}
                              {ev.title}
                            </div>
                          );
                        })}
                        {cellEvents.length > 3 && (
                          <span className="text-[10px] text-[#555555] pl-1">
                            +{cellEvents.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar: Upcoming ──────────────────────── */}
        <div className="w-72 border-l border-[#E5E5E5] flex flex-col bg-white">
          <div className="px-4 py-4 border-b border-[#F0F0F0]">
            <h2 className="text-sm font-semibold text-[#111111]">Upcoming</h2>
            <p className="text-xs text-[#555555] mt-0.5">{upcoming.length} events</p>
          </div>

          {/* Type legend */}
          <div className="px-4 py-3 border-b border-[#F0F0F0] flex gap-3">
            {Object.entries(typeConfig).map(([type, cfg]) => (
              <div key={type} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
                <span className="text-[10px] text-[#555555] capitalize">{type}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Calendar className="w-8 h-8 text-[#E5E5E5]" />
                <p className="text-xs text-[#555555]">No upcoming events</p>
              </div>
            ) : (
              upcoming.map((ev) => {
                const cfg = typeConfig[ev.type] ?? fallback;
                const dt  = new Date(ev.scheduled_at);
                return (
                  <Card key={ev.id} className="border-[#E5E5E5] hover:shadow-sm transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-1 self-stretch rounded-full shrink-0"
                          style={{ backgroundColor: cfg.dot }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#111111] leading-snug truncate">
                            {ev.title}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-2.5 h-2.5 text-[#555555]" />
                            <span className="text-[10px] text-[#555555]">
                              {dt.toLocaleDateString("en-US", {
                                month: "short", day: "numeric",
                              })}{" "}
                              ·{" "}
                              {dt.toLocaleTimeString("en-US", {
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="mt-1.5 text-[9px] h-4 border-0 font-medium"
                            style={{ backgroundColor: cfg.bg, color: cfg.color }}
                          >
                            {ev.type}
                          </Badge>
                        </div>
                        {ev.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-[#E5E5E5] shrink-0 mt-0.5" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
