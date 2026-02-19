"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Building2, Loader2 } from "lucide-react";
import type { TeamMember } from "@/types";

/* ── Pixel art helpers ──────────────────────────────────────── */
const SHIRT_COLORS = ["#4A90D9","#E84393","#F5A623","#7ED321","#9B59B6","#1ABC9C","#E74C3C","#F39C12"];

function PixelChar({ color = "#4A90D9", sitting = false }: { color?: string; sitting?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 20"
      width={sitting ? 20 : 16}
      height={sitting ? 20 : 20}
      style={{ imageRendering: "pixelated", display: "block" }}
    >
      {/* Hair */}
      <rect x="4" y="0" width="8" height="2" fill="#3D1F00" />
      {/* Head */}
      <rect x="4" y="2" width="8" height="6" fill="#F4C2A1" />
      {/* Eyes */}
      <rect x="6" y="5" width="1" height="1" fill="#333" />
      <rect x="9" y="5" width="1" height="1" fill="#333" />
      {/* Ear */}
      <rect x="3" y="4" width="1" height="2" fill="#F4C2A1" />
      <rect x="12" y="4" width="1" height="2" fill="#F4C2A1" />
      {/* Body */}
      <rect x="3" y="8" width="10" height="6" fill={color} />
      {/* Arms */}
      <rect x="1" y="8" width="2" height="5" fill={color} />
      <rect x="13" y="8" width="2" height="5" fill={color} />
      {sitting ? (
        /* Sitting legs */
        <>
          <rect x="3" y="14" width="4" height="3" fill="#2C3E7A" />
          <rect x="9" y="14" width="4" height="3" fill="#2C3E7A" />
          <rect x="3" y="17" width="4" height="2" fill="#1A1A2E" />
          <rect x="9" y="17" width="4" height="2" fill="#1A1A2E" />
        </>
      ) : (
        /* Standing legs */
        <>
          <rect x="3" y="14" width="4" height="4" fill="#2C3E7A" />
          <rect x="9" y="14" width="4" height="4" fill="#2C3E7A" />
          <rect x="3" y="18" width="4" height="2" fill="#1A1A2E" />
          <rect x="9" y="18" width="4" height="2" fill="#1A1A2E" />
        </>
      )}
    </svg>
  );
}

function PixelDesk({ width = 48 }: { width?: number }) {
  return (
    <div style={{ width, height: 22 }} className="relative">
      <div className="absolute inset-x-0 top-0 h-3 rounded-sm" style={{ backgroundColor: "#5C3A1E", border: "1px solid #7A5230" }} />
      <div className="absolute bottom-0 left-1 w-1.5 h-2" style={{ backgroundColor: "#3D2510" }} />
      <div className="absolute bottom-0 right-1 w-1.5 h-2" style={{ backgroundColor: "#3D2510" }} />
      {/* Monitor */}
      <div className="absolute top-0.5 right-2 w-5 h-3" style={{ backgroundColor: "#111", border: "1px solid #333" }}>
        <div className="w-3 h-0.5 mt-0.5 ml-0.5" style={{ backgroundColor: "#4A90D9" }} />
        <div className="w-2 h-0.5 mt-0.5 ml-0.5" style={{ backgroundColor: "#1A3A5C" }} />
      </div>
    </div>
  );
}

function PixelConferenceTable() {
  return (
    <div className="w-24 h-10 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: "#5C3A1E", border: "2px solid #7A5230" }}>
      <div className="w-16 h-6 rounded-full" style={{ backgroundColor: "#4A2E14" }} />
    </div>
  );
}

function PixelKitchenCounter() {
  return (
    <div className="flex flex-col gap-1">
      <div className="w-full h-3 rounded-sm" style={{ backgroundColor: "#B0BEC5", border: "1px solid #90A4AE" }}>
        {/* sink */}
        <div className="w-3 h-2 mx-auto mt-0.5 rounded-sm" style={{ backgroundColor: "#78909C" }} />
      </div>
      <div className="flex gap-1">
        <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: "#FF7043" }} /> {/* coffee machine */}
        <div className="w-3 h-2.5 rounded-sm" style={{ backgroundColor: "#FFCA28" }} /> {/* mug */}
      </div>
    </div>
  );
}

function PixelGymEquipment() {
  return (
    <div className="flex flex-col gap-1.5 items-center">
      {/* Punching bag */}
      <div className="w-4 h-6 rounded-b-full" style={{ backgroundColor: "#E53935", border: "1px solid #B71C1C" }} />
      <div className="w-1 h-2 mx-auto" style={{ backgroundColor: "#888" }} />
      {/* Weights */}
      <div className="flex items-center gap-0.5">
        <div className="w-2 h-4 rounded-sm" style={{ backgroundColor: "#424242" }} />
        <div className="w-5 h-2 rounded-sm" style={{ backgroundColor: "#616161" }} />
        <div className="w-2 h-4 rounded-sm" style={{ backgroundColor: "#424242" }} />
      </div>
      {/* Treadmill */}
      <div className="w-10 h-3 rounded" style={{ backgroundColor: "#37474F", border: "1px solid #546E7A" }}>
        <div className="h-1 w-8 mx-1 mt-1 rounded" style={{ backgroundColor: "#D4F657" }} />
      </div>
    </div>
  );
}

/* ── Room component ─────────────────────────────────────────── */
function Room({
  label,
  status,
  children,
  className = "",
}: {
  label: string;
  status?: "working" | "idle" | "active" | null;
  children?: React.ReactNode;
  className?: string;
}) {
  const dotColor = status === "working" ? "#4CAF50" : status === "idle" ? "#F44336" : status === "active" ? "#2196F3" : "transparent";

  return (
    <div
      className={`relative rounded border flex flex-col overflow-hidden ${className}`}
      style={{ backgroundColor: "#0D1B2A", borderColor: "#1E2D3D" }}
    >
      {/* Room label */}
      <div className="flex items-center gap-1.5 px-2 py-1">
        {status && <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />}
        <span className="text-[10px] font-bold text-white/80 tracking-wide truncate">{label}</span>
      </div>
      {/* Room interior */}
      <div className="flex-1 flex flex-col items-center justify-end pb-2 px-2 gap-1">
        {children}
      </div>
    </div>
  );
}

/* ── Agent room ─────────────────────────────────────────────── */
function AgentRoom({ member, colorIdx }: { member: TeamMember; colorIdx: number }) {
  const shirtColor = SHIRT_COLORS[colorIdx % SHIRT_COLORS.length];
  const status = member.status as "working" | "idle" | "active";
  return (
    <Room label={member.name} status={status}>
      <PixelDesk width={52} />
      <PixelChar color={shirtColor} sitting />
    </Room>
  );
}

/* ── Floor pattern ──────────────────────────────────────────── */
const FLOOR_STYLE: React.CSSProperties = {
  backgroundImage:
    "repeating-conic-gradient(#0B1520 0% 25%, #0E1B2A 0% 50%)",
  backgroundSize: "20px 20px",
};

/* ── Page ───────────────────────────────────────────────────── */
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
  const idle    = team.filter((m) => m.status === "idle");

  return (
    <div className="flex flex-col min-h-screen bg-[#071015]">
      {/* Header */}
      <header className="flex h-14 items-center gap-4 border-b border-[#1E2D3D] px-6 bg-[#0B1520]/80 backdrop-blur-sm sticky top-0 z-10">
        <SidebarTrigger className="text-white/40 hover:text-white/80" />
        <Separator orientation="vertical" className="h-5 bg-white/10" />
        <Building2 className="w-4 h-4 text-[#D4F657]" style={{ filter: "drop-shadow(0 0 6px #D4F657)" }} />
        <span className="font-semibold text-white/90 text-sm">Digital Office</span>
        {!loading && (
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
              <span className="text-xs text-white/50">{working.length} working</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#F44336]" />
              <span className="text-xs text-white/50">{idle.length} idle</span>
            </div>
          </div>
        )}
      </header>

      {/* Office floor */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-white/40" />
          </div>
        ) : (
          <>
            {/* Floor area */}
            <div className="flex-1 p-4 overflow-auto" style={FLOOR_STYLE}>
              {/* Grid layout */}
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: "repeat(4, 1fr)",
                  maxWidth: 900,
                  margin: "0 auto",
                }}
              >
                {/* Row 1: Special rooms */}
                <Room label="Conference" className="col-span-1 h-32">
                  <PixelConferenceTable />
                  <div className="flex gap-3 mt-1">
                    <PixelChar color="#9B59B6" sitting />
                    <PixelChar color="#E84393" sitting />
                  </div>
                </Room>

                <Room label="Main Office" className="col-span-2 h-32">
                  <div className="flex gap-4 items-end w-full justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <PixelDesk width={60} />
                      <PixelChar color="#4A90D9" sitting />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <PixelDesk width={60} />
                      <PixelChar color="#D4F657" sitting />
                    </div>
                  </div>
                </Room>

                <Room label="Kitchen" className="col-span-1 h-32">
                  <PixelKitchenCounter />
                  <div className="mt-auto">
                    <PixelChar color="#F5A623" />
                  </div>
                </Room>

                {/* Row 2-N: Agent rooms (dynamic) */}
                {team.map((member, i) => (
                  <AgentRoom key={member.id} member={member} colorIdx={i} />
                ))}

                {/* GYM room — always shown */}
                <Room label="Gym" className="col-span-1 row-span-2 h-full min-h-40">
                  <PixelGymEquipment />
                </Room>

                {/* Pad with Council if team count leaves odd */}
                {team.length % 4 >= 1 && team.length % 4 <= 2 && (
                  <div
                    className="col-span-2 rounded border flex items-center justify-center"
                    style={{ backgroundColor: "#0A1420", borderColor: "#1E2D3D", minHeight: 96 }}
                  >
                    <span className="text-white/20 text-sm font-semibold">🏛 Council</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Status bar ── */}
            <div
              className="border-t flex flex-wrap items-center gap-x-5 gap-y-1.5 px-5 py-3"
              style={{ backgroundColor: "#06101A", borderColor: "#1E2D3D" }}
            >
              {team.map((member, i) => {
                const color = SHIRT_COLORS[i % SHIRT_COLORS.length];
                const dotColor =
                  member.status === "working" ? "#4CAF50" :
                  member.status === "idle"    ? "#F44336" : "#2196F3";
                return (
                  <div key={member.id} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
                    <span className="text-[11px] font-semibold" style={{ color }}>
                      {member.name}
                    </span>
                    <span className="text-[11px] text-white/30 capitalize">{member.status}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
