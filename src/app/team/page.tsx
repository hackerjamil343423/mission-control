"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Users, Loader2, Crown } from "lucide-react";
import Image from "next/image";
import type { TeamMember } from "@/types";

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string; pulse: boolean }> = {
  working: { label: "Working", color: "#16A34A", bg: "#F0FDF4", dot: "#16A34A", pulse: true },
  idle:    { label: "Idle",    color: "#D97706", bg: "#FFFBEB", dot: "#D97706", pulse: false },
  active:  { label: "Active",  color: "#2563EB", bg: "#EFF6FF", dot: "#2563EB", pulse: true },
};

const avatarColors = ["#D4F657", "#60D394", "#4CC9F0", "#FF6B6B", "#FFB703", "#C084FC"];

function isUrl(s: string | null) {
  return !!s && (s.startsWith("http://") || s.startsWith("https://"));
}

function Avatar({ member, color, size = 48 }: { member: TeamMember; color: string; size?: number }) {
  if (isUrl(member.avatar)) {
    return (
      <div
        className="rounded-2xl overflow-hidden shrink-0"
        style={{ width: size, height: size, border: `2px solid ${color}44` }}
      >
        <Image
          src={member.avatar!}
          alt={member.name}
          width={size}
          height={size}
          className="object-cover w-full h-full"
          unoptimized
        />
      </div>
    );
  }
  return (
    <div
      className="rounded-2xl flex items-center justify-center font-black shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color + "22",
        color,
        border: `2px solid ${color}44`,
        fontSize: size * 0.38,
      }}
    >
      {member.name.charAt(0).toUpperCase()}
    </div>
  );
}

function LeaderCard({ member }: { member: TeamMember }) {
  const sc = statusConfig[member.status] ?? statusConfig.active;
  return (
    <div
      className="relative rounded-2xl overflow-hidden p-6 flex items-center gap-5 mb-8"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        border: "1px solid #D4F65744",
        boxShadow: "0 0 40px #D4F65718, 0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Glow orb */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #D4F657, transparent)" }}
      />

      {/* Crown badge */}
      <div className="absolute top-3 right-4 flex items-center gap-1.5 rounded-full px-3 py-1"
        style={{ backgroundColor: "#D4F65720", border: "1px solid #D4F65744" }}>
        <Crown className="w-3 h-3 text-[#D4F657]" />
        <span className="text-[10px] font-bold tracking-widest text-[#D4F657] uppercase">Leader</span>
      </div>

      <Avatar member={member} color="#D4F657" size={72} />

      <div className="flex-1 min-w-0">
        <p className="text-xl font-black text-white leading-tight">{member.name}</p>
        <p className="text-sm text-[#D4F657]/70 mt-0.5 font-medium">{member.role}</p>
        {member.description && (
          <p className="text-xs text-white/50 mt-2 leading-relaxed">{member.description}</p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: sc.dot,
              boxShadow: sc.pulse ? `0 0 6px ${sc.dot}` : undefined,
            }}
          />
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: sc.bg, color: sc.color }}
          >
            {sc.label}
          </span>
        </div>
      </div>
    </div>
  );
}

function MemberCard({ member, colorIdx }: { member: TeamMember; colorIdx: number }) {
  const sc    = statusConfig[member.status] ?? statusConfig.active;
  const color = avatarColors[colorIdx % avatarColors.length];

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
      style={{ backgroundColor: "#ffffff", border: "1px solid #E5E5E5" }}
    >
      <div className="flex items-start gap-3">
        <Avatar member={member} color={color} size={48} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#111111] text-sm leading-tight">{member.name}</p>
          <p className="text-xs text-[#555555] mt-0.5 truncate">{member.role}</p>
        </div>
      </div>

      {member.description && (
        <p className="text-xs text-[#555555] leading-relaxed line-clamp-2">{member.description}</p>
      )}

      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: sc.dot, boxShadow: sc.pulse ? `0 0 5px ${sc.dot}` : undefined }}
        />
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: sc.bg, color: sc.color }}
        >
          {sc.label}
        </span>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [team, setTeam]       = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((d) => { setTeam(d as TeamMember[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const leaders = team.filter((m) => m.role === "Leader");
  const members = team.filter((m) => m.role !== "Leader");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 items-center gap-4 border-b border-[#E5E5E5] px-6 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <SidebarTrigger className="text-[#555555] hover:text-[#111111]" />
        <Separator orientation="vertical" className="h-5" />
        <Users className="w-4 h-4 text-[#D4F657]" style={{ filter: "drop-shadow(0 0 4px #D4F657)" }} />
        <span className="font-semibold text-[#111111] text-sm">Team</span>
        <div className="ml-auto text-xs text-[#999]">
          {team.filter((m) => m.status === "working").length} working · {team.length} total
        </div>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-[#555555]" />
          </div>
        ) : team.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 h-64 text-center">
            <Users className="w-10 h-10 text-[#E5E5E5]" />
            <p className="text-[#555555]">No team members yet</p>
          </div>
        ) : (
          <>
            {/* Leaders */}
            {leaders.map((m) => (
              <LeaderCard key={m.id} member={m} />
            ))}

            {/* Members grid */}
            {members.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold tracking-widest text-[#999] uppercase">Members</span>
                  <div className="flex-1 h-px bg-[#E5E5E5]" />
                  <span className="text-xs text-[#bbb]">{members.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {members.map((member, i) => (
                    <MemberCard key={member.id} member={member} colorIdx={i} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
