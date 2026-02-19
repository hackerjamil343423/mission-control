"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CheckSquare, Plus, Circle, Loader2 } from "lucide-react";
import type { Task } from "@/types";

const columns = [
  { id: "todo", label: "To Do", color: "#555555", bg: "#F0F0F0" },
  { id: "in_progress", label: "In Progress", color: "#2563EB", bg: "#EFF6FF" },
  { id: "done", label: "Done", color: "#16A34A", bg: "#F0FDF4" },
] as const;

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  high:   { label: "High",   color: "#DC2626", bg: "#FEF2F2" },
  medium: { label: "Medium", color: "#D97706", bg: "#FFFBEB" },
  low:    { label: "Low",    color: "#16A34A", bg: "#F0FDF4" },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchTasks = () => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((d) => { setTasks(d as Task[]); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  const addTask = async () => {
    if (!newTask.trim() || adding) return;
    setAdding(true);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask }),
    });
    setNewTask("");
    setAdding(false);
    fetchTasks();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 items-center gap-4 border-b border-[#E5E5E5] px-6 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <SidebarTrigger className="text-[#555555] hover:text-[#111111]" />
        <Separator orientation="vertical" className="h-5" />
        <CheckSquare className="w-4 h-4 text-[#D4F657]" style={{ filter: "drop-shadow(0 0 4px #D4F657)" }} />
        <span className="font-semibold text-[#111111] text-sm">Tasks</span>
        <div className="ml-auto flex items-center gap-2 w-72">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add new task..."
            className="h-8 text-sm border-[#E5E5E5] bg-white"
          />
          <Button
            onClick={addTask}
            disabled={adding}
            size="sm"
            className="h-8 bg-[#D4F657] text-black hover:bg-[#c8ec3e] font-semibold shrink-0"
          >
            {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#111111]">Tasks Board</h1>
            <p className="text-sm text-[#555555] mt-0.5">{tasks.length} total tasks</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-[#555555]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div key={col.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                    <span className="text-sm font-semibold text-[#111111]">{col.label}</span>
                    <span
                      className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: col.bg, color: col.color }}
                    >
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {colTasks.length === 0 ? (
                      <div className="border-2 border-dashed border-[#E5E5E5] rounded-xl p-6 text-center">
                        <Circle className="w-5 h-5 text-[#E5E5E5] mx-auto mb-2" />
                        <p className="text-xs text-[#555555]">No tasks</p>
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <Card key={task.id} className="border-[#E5E5E5] hover:shadow-sm transition-shadow">
                          <CardContent className="p-4">
                            <p className="text-sm font-medium text-[#111111] mb-2 leading-snug">{task.title}</p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs text-[#555555]">
                                {task.assignee === "jamil" ? "👤 Jamil" : "🤖 Oto"}
                              </span>
                              {task.priority && (
                                <span
                                  className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: priorityConfig[task.priority].bg,
                                    color: priorityConfig[task.priority].color,
                                  }}
                                >
                                  {priorityConfig[task.priority].label}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
