"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Building2, Loader2, Coffee, Monitor, Eye } from "lucide-react";
import type { TeamMember } from "@/types";

const avatarColors = ["#D4F657", "#60D394", "#4CC9F0", "#FF6B6B", "#FFB703", "#C084FC"];

const statusIcon: Record<string, React.ReactNode> = {
  working: <Monitor className="w-5 h-5 text-white" />,
  idle:    <Coffee className="w-5 h-5 text-white" />,
  active:  <Eye className="w-5 h-5 text-white" />,
};
const statusBg: Record<string, string> = {
  working: "#111111",
  idle:    "#D97706",
  active:  "#2563EB",
};

export default function OfficePage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((d) => { setTeam(d as TeamMember[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const working = team.filter((m) => m.status === "working");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 items-center gap-4 border-b border-[#E5E5E5] px-6 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <SidebarTrigger className="text-[#555555] hover:text-[#111111]" />
        <Separator orientation="vertical" className="h-5" />
        <Building2 className="w-4 h-4 text-[#D4F657]" style={{ filter: "drop-shadow(0 0 4px #D4F657)" }} />
        <span className="font-semibold text-[#111111] text-sm">Digital Office</span>
        {!loading && (
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#D4F657] animate-pulse" />
            <span className="text-xs text-[#555555]">{working.length} active now</span>
          </div>
        )}
      </header>

      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111111]">Digital Office</h1>
          <p className="text-sm text-[#555555] mt-0.5">Watch your agents work in real-time</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-[#555555]" />
          </div>
        ) : team.length === 0 ? (
          <Card className="border-[#E5E5E5]">
            <CardContent className="p-12 text-center">
              <Building2 className="w-10 h-10 text-[#E5E5E5] mx-auto mb-3" />
              <p className="text-[#555555]">The office is empty</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {team.map((member, i) => {
              const color = avatarColors[i % avatarColors.length];
              const bg = statusBg[member.status] ?? "#555555";
              const icon = statusIcon[member.status] ?? statusIcon.active;
              const isWorking = member.status === "working";
              return (
                <Card
                  key={member.id}
                  className={`border-[#E5E5E5] transition-all duration-200 ${isWorking ? "ring-1 ring-[#D4F657] shadow-md" : ""}`}
                >
                  <CardContent className="p-5 text-center">
                    {/* Avatar */}
                    <div className="relative mx-auto w-16 h-16 mb-3">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-black"
                        style={{ backgroundColor: color }}
                      >
                        {member.avatar ?? member.name.charAt(0).toUpperCase()}
                      </div>
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: bg }}
                      >
                        {icon}
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-[#111111]">{member.name}</p>
                    <p className="text-xs text-[#555555] mt-0.5 truncate">{member.role}</p>

                    {/* Status label */}
                    <div
                      className="mt-3 text-xs font-medium px-3 py-1 rounded-full inline-block capitalize"
                      style={{
                        backgroundColor: isWorking ? "#D4F657" : "#F0F0F0",
                        color: isWorking ? "#111111" : "#555555",
                      }}
                    >
                      {member.status}
                    </div>

                    {/* Progress bar for working members */}
                    {isWorking && (
                      <div className="mt-3">
                        <Progress
                          value={60}
                          className="h-1.5 bg-[#F0F0F0]"
                        />
                        <p className="text-[10px] text-[#555555] mt-1">In progress...</p>
                      </div>
                    )}
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
