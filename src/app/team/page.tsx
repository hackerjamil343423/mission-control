"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, Loader2 } from "lucide-react";
import type { TeamMember } from "@/types";

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  working: { label: "Working",  color: "#16A34A", bg: "#F0FDF4", dot: "bg-[#16A34A]" },
  idle:    { label: "Idle",     color: "#D97706", bg: "#FFFBEB", dot: "bg-[#D97706]" },
  active:  { label: "Active",   color: "#2563EB", bg: "#EFF6FF", dot: "bg-[#2563EB]" },
};

const avatarColors = ["#D4F657", "#60D394", "#4CC9F0", "#FF6B6B", "#FFB703", "#C084FC"];

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((d) => { setTeam(d as TeamMember[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 items-center gap-4 border-b border-[#E5E5E5] px-6 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <SidebarTrigger className="text-[#555555] hover:text-[#111111]" />
        <Separator orientation="vertical" className="h-5" />
        <Users className="w-4 h-4 text-[#D4F657]" style={{ filter: "drop-shadow(0 0 4px #D4F657)" }} />
        <span className="font-semibold text-[#111111] text-sm">Team</span>
      </header>

      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111111]">Team</h1>
          <p className="text-sm text-[#555555] mt-0.5">
            {team.filter((m) => m.status === "working").length} working ·{" "}
            {team.length} total members
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-[#555555]" />
          </div>
        ) : team.length === 0 ? (
          <Card className="border-[#E5E5E5]">
            <CardContent className="p-12 text-center">
              <Users className="w-10 h-10 text-[#E5E5E5] mx-auto mb-3" />
              <p className="text-[#555555]">No team members yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {team.map((member, i) => {
              const sc = statusConfig[member.status] ?? statusConfig.active;
              const color = avatarColors[i % avatarColors.length];
              return (
                <Card key={member.id} className="border-[#E5E5E5] hover:shadow-md transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-black shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {member.avatar ?? member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#111111] text-sm leading-tight">{member.name}</p>
                        <p className="text-xs text-[#555555] mt-0.5 truncate">{member.role}</p>
                      </div>
                    </div>

                    {member.description && (
                      <p className="text-xs text-[#555555] leading-relaxed mb-4 line-clamp-2">
                        {member.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${sc.dot} animate-pulse`} />
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: sc.bg, color: sc.color }}
                      >
                        {sc.label}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
