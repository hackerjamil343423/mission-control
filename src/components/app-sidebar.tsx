"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  CheckSquare,
  Video,
  Calendar,
  Brain,
  Users,
  Building2,
  Zap,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Content", url: "/content", icon: Video },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Memory", url: "/memories", icon: Brain },
  { title: "Team", url: "/team", icon: Users },
  { title: "Office", url: "/office", icon: Building2 },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4F657] flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <div>
            <p className="text-[#FAF9F6] font-bold text-sm leading-tight">Mission Control</p>
            <p className="text-[#FAF9F6]/40 text-xs">Jamil & Oto</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#FAF9F6]/30 text-[10px] uppercase tracking-widest px-2 mb-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu className="gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`
                      rounded-lg px-3 py-2 h-9 transition-all duration-150
                      ${isActive
                        ? "bg-[#D4F657] text-black font-semibold hover:bg-[#D4F657]"
                        : "text-[#FAF9F6]/70 hover:bg-[#1c1c1c] hover:text-[#FAF9F6]"
                      }
                    `}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4 border-t border-[#222222]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#D4F657] animate-pulse shrink-0" />
          <p className="text-[#FAF9F6]/40 text-xs">Connected · Neon DB</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
