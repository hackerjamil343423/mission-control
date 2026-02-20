"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Building2, Loader2, Wifi, WifiOff, Clock, Crown } from "lucide-react";
import Image from "next/image";
import type { TeamMember } from "@/types";

function isUrl(s: string | null) {
  return !!s && (s.startsWith("http://") || s.startsWith("https://"));
}

/* ── Shirt colours ──────────────────────────────────────────── */
const SHIRT_COLORS = [
  "#4A90D9", "#E84393", "#F5A623", "#7ED321",
  "#9B59B6", "#1ABC9C", "#E74C3C", "#F39C12",
];

/* ── Pixel character ────────────────────────────────────────── */
function PixelChar({ color = "#4A90D9" }: { color?: string }) {
  return (
    <svg
      viewBox="0 0 16 20"
      width={28}
      height={28}
      style={{ imageRendering: "pixelated", display: "block" }}
    >
      <rect x="4" y="0" width="8" height="2" fill="#3D1F00" />
      <rect x="4" y="2" width="8" height="6" fill="#F4C2A1" />
      <rect x="6" y="5" width="1" height="1" fill="#333" />
      <rect x="9" y="5" width="1" height="1" fill="#333" />
      <rect x="3" y="4" width="1" height="2" fill="#F4C2A1" />
      <rect x="12" y="4" width="1" height="2" fill="#F4C2A1" />
      <rect x="3" y="8" width="10" height="6" fill={color} />
      <rect x="1" y="8" width="2" height="5" fill={color} />
      <rect x="13" y="8" width="2" height="5" fill={color} />
      <rect x="3" y="14" width="4" height="3" fill="#2C3E7A" />
      <rect x="9" y="14" width="4" height="3" fill="#2C3E7A" />
      <rect x="3" y="17" width="4" height="2" fill="#1A1A2E" />
      <rect x="9" y="17" width="4" height="2" fill="#1A1A2E" />
    </svg>
  );
}

/* ── Pixel desk ─────────────────────────────────────────────── */
function PixelDesk() {
  return (
    <div style={{ width: 56, height: 24 }} className="relative shrink-0">
      <div
        className="absolute inset-x-0 top-0 h-3 rounded-sm"
        style={{ backgroundColor: "#5C3A1E", border: "1px solid #7A5230" }}
      />
      {/* Monitor */}
      <div
        className="absolute top-0.5 right-2 w-6 h-4"
        style={{ backgroundColor: "#111", border: "1px solid #2A2A2A", borderRadius: 1 }}
      >
        <div className="w-4 h-0.5 mt-1 ml-0.5" style={{ backgroundColor: "#4A90D9" }} />
        <div className="w-3 h-0.5 mt-0.5 ml-0.5" style={{ backgroundColor: "#1A3A5C" }} />
        <div className="w-2 h-0.5 mt-0.5 ml-0.5" style={{ backgroundColor: "#0A2030" }} />
      </div>
      {/* Keyboard */}
      <div
        className="absolute bottom-2 left-2 w-8 h-1 rounded-sm"
        style={{ backgroundColor: "#3A3A3A" }}
      />
      {/* Legs */}
      <div className="absolute bottom-0 left-1 w-1.5 h-2" style={{ backgroundColor: "#3D2510" }} />
      <div className="absolute bottom-0 right-1 w-1.5 h-2" style={{ backgroundColor: "#3D2510" }} />
    </div>
  );
}

/* ── Status helpers ─────────────────────────────────────────── */
const STATUS_CONFIG = {
  working: { dot: "#4CAF50", label: "Working", bg: "rgba(76,175,80,0.12)", border: "rgba(76,175,80,0.3)", glow: "#4CAF50" },
  idle:    { dot: "#F44336", label: "Idle",    bg: "rgba(244,67,54,0.10)", border: "rgba(244,67,54,0.25)", glow: "#F44336" },
  active:  { dot: "#2196F3", label: "Active",  bg: "rgba(33,150,243,0.12)", border: "rgba(33,150,243,0.3)", glow: "#2196F3" },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

function statusCfg(s: string) {
  return STATUS_CONFIG[s as StatusKey] ?? STATUS_CONFIG.idle;
}

/* ── Member card ────────────────────────────────────────────── */
function MemberCard({ member, colorIdx }: { member: TeamMember; colorIdx: number }) {
  const color  = SHIRT_COLORS[colorIdx % SHIRT_COLORS.length];
  const cfg    = statusCfg(member.status ?? "idle");
  const isWork = member.status === "working";

  return (
    <div
      className="relative flex flex-col rounded-xl overflow-hidden transition-transform hover:-translate-y-0.5"
      style={{
        backgroundColor: "#0D1B2A",
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 0 18px ${cfg.glow}18, inset 0 0 0 1px ${cfg.border}`,
      }}
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ backgroundColor: cfg.dot, opacity: 0.7 }} />

      {/* Status badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-2 py-0.5"
        style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: cfg.dot,
            boxShadow: isWork ? `0 0 6px ${cfg.dot}` : undefined,
            animation: isWork ? "pulse 2s infinite" : undefined,
          }}
        />
        <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: cfg.dot }}>
          {cfg.label}
        </span>
      </div>

      {/* Scene */}
      <div
        className="flex flex-col items-center justify-end gap-1 pt-6 pb-3 px-4"
        style={{
          backgroundImage: "repeating-conic-gradient(#0B1520 0% 25%, #0E1B2A 0% 50%)",
          backgroundSize: "12px 12px",
          minHeight: 110,
        }}
      >
        <PixelDesk />
        <PixelChar color={color} />
      </div>

      {/* Info */}
      <div className="px-4 py-3 flex flex-col gap-1.5" style={{ borderTop: "1px solid #1E2D3D" }}>
        <div className="flex items-center gap-2">
          {/* Avatar */}
          {isUrl(member.avatar) ? (
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0" style={{ border: `1px solid ${color}55` }}>
              <Image src={member.avatar!} alt={member.name} width={28} height={28} className="object-cover w-full h-full" unoptimized />
            </div>
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
              style={{ backgroundColor: color + "22", color, border: `1px solid ${color}44` }}
            >
              {member.name.charAt(0)}
            </div>
          )}
          <span className="text-sm font-semibold text-white/90 truncate">{member.name}</span>
          {member.role === "Leader" && (
            <Crown className="w-3 h-3 ml-auto shrink-0 text-[#D4F657]" />
          )}
        </div>

        {member.role && (
          <span className="text-[10px] uppercase tracking-wider truncate"
            style={{ color: member.role === "Leader" ? "#D4F657" : "rgba(255,255,255,0.4)" }}>
            {member.role}
          </span>
        )}

        {member.description && (
          <div className="mt-1 rounded-md px-2 py-1.5 text-[10px] text-white/60 leading-snug"
            style={{ backgroundColor: "#ffffff08", border: "1px solid #ffffff0a" }}>
            {member.description}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Floor pattern ──────────────────────────────────────────── */
const FLOOR_STYLE: React.CSSProperties = {
  backgroundImage: "repeating-conic-gradient(#0B1520 0% 25%, #0E1B2A 0% 50%)",
  backgroundSize: "20px 20px",
};

/* ── Empty state ────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <WifiOff className="w-8 h-8 text-white/20" />
      <p className="text-white/30 text-sm">No team members found</p>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function OfficePage() {
  const [team, setTeam]       = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime]       = useState("");

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((d) => { setTeam(d as TeamMember[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Live clock
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const working = team.filter((m) => m.status === "working");
  const idle    = team.filter((m) => m.status === "idle");
  const active  = team.filter((m) => m.status === "active");

  return (
    <div className="flex flex-col min-h-screen bg-[#071015]">
      {/* ── Header ── */}
      <header className="flex h-14 items-center gap-4 border-b border-[#1E2D3D] px-6 bg-[#0B1520]/80 backdrop-blur-sm sticky top-0 z-10">
        <SidebarTrigger className="text-white/40 hover:text-white/80" />
        <Separator orientation="vertical" className="h-5 bg-white/10" />
        <Building2 className="w-4 h-4 text-[#D4F657]" style={{ filter: "drop-shadow(0 0 6px #D4F657)" }} />
        <span className="font-semibold text-white/90 text-sm">Digital Office</span>

        <div className="ml-auto flex items-center gap-4">
          {/* Clock */}
          <div className="flex items-center gap-1.5 text-white/30">
            <Clock className="w-3 h-3" />
            <span className="text-xs tabular-nums">{time}</span>
          </div>

          {!loading && (
            <>
              <Separator orientation="vertical" className="h-4 bg-white/10" />
              {working.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
                  <span className="text-xs text-white/50">{working.length} working</span>
                </div>
              )}
              {active.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#2196F3]" />
                  <span className="text-xs text-white/50">{active.length} active</span>
                </div>
              )}
              {idle.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#F44336]" />
                  <span className="text-xs text-white/50">{idle.length} idle</span>
                </div>
              )}
              <Separator orientation="vertical" className="h-4 bg-white/10" />
              <div className="flex items-center gap-1.5 text-white/30">
                <Wifi className="w-3 h-3 text-[#4CAF50]" />
                <span className="text-xs">{team.length} online</span>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4F657]" />
            <span className="text-xs text-white/30">Loading team...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-auto" style={FLOOR_STYLE}>
            <div className="max-w-5xl mx-auto px-6 py-8">

              {/* Section title */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold tracking-widest text-white/30 uppercase">Team Workspace</span>
                <div className="flex-1 h-px" style={{ backgroundColor: "#1E2D3D" }} />
                <span className="text-xs text-white/20">{team.length} members</span>
              </div>

              {/* Grid */}
              {team.length === 0 ? (
                <EmptyState />
              ) : (
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
                >
                  {team.map((member, i) => (
                    <MemberCard key={member.id} member={member} colorIdx={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
