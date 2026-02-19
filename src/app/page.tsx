"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckSquare, Video, Calendar, Brain, Users,
  TrendingUp, Clock, ArrowRight,
} from "lucide-react";
import type { Task, Content, CalendarEvent, Memory, TeamMember } from "@/types";
import Link from "next/link";

interface DashboardData {
  tasksData: Task[];
  contentData: Content[];
  calendarData: CalendarEvent[];
  memoriesData: Memory[];
  teamData: TeamMember[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const stats = data
    ? [
        {
          title: "Tasks",
          value: data.tasksData.length,
          sub: `${data.tasksData.filter((t) => t.status === "in_progress").length} in progress`,
          icon: CheckSquare,
          href: "/tasks",
          accent: "#3B82F6",
        },
        {
          title: "Content",
          value: data.contentData.length,
          sub: `${data.contentData.filter((c) => c.stage === "published").length} published`,
          icon: Video,
          href: "/content",
          accent: "#8B5CF6",
        },
        {
          title: "Events",
          value: data.calendarData.length,
          sub: `${data.calendarData.filter((e) => !e.completed).length} upcoming`,
          icon: Calendar,
          href: "/calendar",
          accent: "#10B981",
        },
        {
          title: "Memories",
          value: data.memoriesData.length,
          sub: "stored entries",
          icon: Brain,
          href: "/memories",
          accent: "#F59E0B",
        },
        {
          title: "Team",
          value: data.teamData.length,
          sub: `${data.teamData.filter((m) => m.status === "working").length} working now`,
          icon: Users,
          href: "/team",
          accent: "#EC4899",
        },
      ]
    : [];

  const recentTasks = data?.tasksData.slice(0, 5) ?? [];
  const upcomingEvents = data?.calendarData.filter((e) => !e.completed).slice(0, 4) ?? [];

  const statusColors: Record<string, string> = {
    todo: "bg-[#F0F0F0] text-[#555555]",
    in_progress: "bg-blue-100 text-blue-700",
    done: "bg-[#D4F657]/30 text-[#5a6e00]",
  };
  const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-600",
    medium: "bg-amber-100 text-amber-600",
    low: "bg-[#D4F657]/20 text-[#5a6e00]",
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex h-14 items-center gap-4 border-b border-[#E5E5E5] px-6 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <SidebarTrigger className="text-[#555555] hover:text-[#111111]" />
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#D4F657]" style={{ filter: "drop-shadow(0 0 4px #D4F657)" }} />
          <span className="font-semibold text-[#111111] text-sm">Dashboard</span>
        </div>
        <span className="ml-auto text-xs text-[#555555]">{today}</span>
      </header>

      {/* Main */}
      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-[#111111] tracking-tight">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"} 👋
          </h1>
          <p className="text-[#555555] mt-1">Here&apos;s what&apos;s happening in Mission Control.</p>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-[#E5E5E5] animate-pulse">
                <CardContent className="p-5">
                  <div className="h-4 bg-[#F0F0F0] rounded w-1/2 mb-3" />
                  <div className="h-8 bg-[#F0F0F0] rounded w-1/3 mb-2" />
                  <div className="h-3 bg-[#F0F0F0] rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.map((stat) => (
              <Link key={stat.title} href={stat.href}>
                <Card className="border-[#E5E5E5] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${stat.accent}15` }}
                      >
                        <stat.icon className="w-4 h-4" style={{ color: stat.accent }} />
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E5E5E5] group-hover:text-[#555555] transition-colors" />
                    </div>
                    <p className="text-2xl font-bold text-[#111111]">{stat.value}</p>
                    <p className="text-xs text-[#555555] mt-0.5">{stat.title}</p>
                    <p className="text-xs text-[#555555]/60 mt-1">{stat.sub}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <Card className="border-[#E5E5E5]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#111111]">Recent Tasks</CardTitle>
              <Link href="/tasks" className="text-xs text-[#555555] hover:text-[#111111] flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentTasks.length === 0 ? (
                <p className="text-sm text-[#555555] py-4 text-center">No tasks yet</p>
              ) : (
                recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 py-2 border-b border-[#F0F0F0] last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111111] truncate">{task.title}</p>
                      <p className="text-xs text-[#555555]">{task.assignee === "jamil" ? "Jamil" : "Oto"}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {task.priority && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[task.status]}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-[#E5E5E5]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#111111]">Upcoming Events</CardTitle>
              <Link href="/calendar" className="text-xs text-[#555555] hover:text-[#111111] flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-[#555555] py-4 text-center">No upcoming events</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 py-2 border-b border-[#F0F0F0] last:border-0">
                    <div className="w-9 h-9 rounded-lg bg-[#D4F657]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-[#5a6e00]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111111] truncate">{event.title}</p>
                      <p className="text-xs text-[#555555]">
                        {new Date(event.scheduled_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-[#E5E5E5] text-[#555555] shrink-0">
                      {event.type}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
