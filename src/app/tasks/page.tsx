"use client";

import { useState, useEffect } from "react";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, DragStartEvent, DragEndEvent, DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CheckSquare, Plus, Loader2, GripVertical, MoreHorizontal,
  Pencil, Trash2, Circle,
} from "lucide-react";
import type { Task } from "@/types";

/* ── Types ─────────────────────────────────────────────────── */
type Status = "todo" | "in_progress" | "done";
type Priority = "low" | "medium" | "high";

const columns: { id: Status; label: string; color: string; bg: string }[] = [
  { id: "todo",        label: "To Do",       color: "#555555", bg: "#F0F0F0" },
  { id: "in_progress", label: "In Progress",  color: "#2563EB", bg: "#EFF6FF" },
  { id: "done",        label: "Done",         color: "#16A34A", bg: "#F0FDF4" },
];

const priorityBadge: Record<string, string> = {
  high:   "bg-red-100 text-red-600",
  medium: "bg-amber-100 text-amber-600",
  low:    "bg-[#D4F657]/20 text-[#5a6e00]",
};

/* ── Sortable card ──────────────────────────────────────────── */
function TaskCard({
  task,
  onEdit,
  onDelete,
  overlay = false,
}: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: number) => void;
  overlay?: boolean;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id: String(task.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !overlay ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`border-[#E5E5E5] bg-white group hover:shadow-md transition-shadow ${
          overlay ? "rotate-2 shadow-xl" : ""
        }`}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 cursor-grab active:cursor-grabbing text-[#E5E5E5] hover:text-[#555555] transition-colors shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </button>

            {/* Content — click to edit */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => onEdit(task)}
            >
              <p className="text-sm font-medium text-[#111111] leading-snug">{task.title}</p>
              {task.description && (
                <p className="text-xs text-[#555555] mt-1 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] text-[#555555]">
                  {task.assignee === "jamil" ? "👤 Jamil" : "🤖 Oto"}
                </span>
                {task.priority && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${priorityBadge[task.priority]}`}>
                    {task.priority}
                  </span>
                )}
              </div>
            </div>

            {/* 3-dots menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-[#F0F0F0] shrink-0">
                  <MoreHorizontal className="w-4 h-4 text-[#555555]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Droppable column ───────────────────────────────────────── */
function Column({
  col,
  tasks,
  onEdit,
  onDelete,
}: {
  col: (typeof columns)[0];
  tasks: Task[];
  onEdit: (t: Task) => void;
  onDelete: (id: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div className="flex flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
        <span className="text-sm font-semibold text-[#111111]">{col.label}</span>
        <span
          className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: col.bg, color: col.color }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`min-h-48 rounded-xl p-2 transition-colors ${
          isOver ? "bg-[#D4F657]/10 ring-1 ring-[#D4F657]" : "bg-[#F5F5F5]"
        }`}
      >
        <SortableContext
          id={col.id}
          items={tasks.map((t) => String(t.id))}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Circle className="w-5 h-5 text-[#E5E5E5]" />
                <p className="text-xs text-[#555555]/60">Drop tasks here</p>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

/* ── Edit modal ─────────────────────────────────────────────── */
function TaskModal({
  task,
  onClose,
  onSave,
}: {
  task: Task | null;
  onClose: () => void;
  onSave: (id: number, data: Partial<Task>) => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<Status>((task?.status as Status) ?? "todo");
  const [priority, setPriority] = useState<Priority | "">(task?.priority ?? "");
  const [assignee, setAssignee] = useState(task?.assignee ?? "jamil");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status as Status);
      setPriority(task.priority ?? "");
      setAssignee(task.assignee);
    }
  }, [task]);

  const handleSave = async () => {
    if (!task) return;
    setSaving(true);
    await onSave(task.id, {
      title,
      description: description || null,
      status,
      priority: (priority as Priority) || null,
      assignee,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={!!task} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-bold border-0 border-b border-[#E5E5E5] rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#D4F657]"
            placeholder="Task title…"
          />

          {/* Properties grid */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-[#F0F0F0]">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#555555]">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger className="h-8 text-xs border-[#E5E5E5]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#555555]">Priority</label>
              <Select value={priority || "none"} onValueChange={(v) => setPriority(v === "none" ? "" : v as Priority)}>
                <SelectTrigger className="h-8 text-xs border-[#E5E5E5]">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#555555]">Assignee</label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="h-8 text-xs border-[#E5E5E5]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jamil">👤 Jamil</SelectItem>
                  <SelectItem value="oto">🤖 Oto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#555555]">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description…"
              className="min-h-28 resize-none border-[#E5E5E5] text-sm focus-visible:ring-[#D4F657]"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose} className="border-[#E5E5E5]">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="bg-[#D4F657] text-black hover:bg-[#c8ec3e] font-semibold"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function TasksPage() {
  const [items, setItems] = useState<Record<Status, Task[]>>({
    todo: [], in_progress: [], done: [],
  });
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [adding, setAdding] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchTasks = () => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data: Task[]) => {
        setItems({
          todo:        data.filter((t) => t.status === "todo"),
          in_progress: data.filter((t) => t.status === "in_progress"),
          done:        data.filter((t) => t.status === "done"),
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  /* DnD helpers */
  const findContainer = (id: string): Status | null => {
    if (id in items) return id as Status;
    for (const [key, tasks] of Object.entries(items)) {
      if (tasks.some((t) => String(t.id) === id)) return key as Status;
    }
    return null;
  };

  const activeTask = activeId
    ? Object.values(items).flat().find((t) => String(t.id) === activeId) ?? null
    : null;

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const from = findContainer(String(active.id));
    const to   = findContainer(String(over.id));
    if (!from || !to || from === to) return;

    setItems((prev) => {
      const task = prev[from].find((t) => String(t.id) === String(active.id));
      if (!task) return prev;
      const overIdx = prev[to].findIndex((t) => String(t.id) === String(over.id));
      const insertAt = overIdx >= 0 ? overIdx : prev[to].length;
      return {
        ...prev,
        [from]: prev[from].filter((t) => String(t.id) !== String(active.id)),
        [to]: [...prev[to].slice(0, insertAt), task, ...prev[to].slice(insertAt)],
      };
    });
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) { setActiveId(null); return; }
    const from = findContainer(String(active.id));
    const to   = findContainer(String(over.id));
    if (!from || !to) { setActiveId(null); return; }

    if (from === to) {
      const oldIdx = items[from].findIndex((t) => String(t.id) === String(active.id));
      const newIdx = items[to].findIndex((t)   => String(t.id) === String(over.id));
      if (oldIdx !== newIdx) {
        setItems((prev) => ({ ...prev, [from]: arrayMove(prev[from], oldIdx, newIdx) }));
      }
    } else {
      // Persist status change to DB
      await fetch(`/api/tasks/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: to }),
      });
    }
    setActiveId(null);
  };

  /* CRUD */
  const addTask = async () => {
    if (!newTask.trim() || adding) return;
    setAdding(true);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask }),
    });
    setNewTask(""); setAdding(false); fetchTasks();
  };

  const saveTask = async (id: number, data: Partial<Task>) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchTasks();
  };

  const deleteTask = async (id: number) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  const total = Object.values(items).flat().length;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
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
            placeholder="Add new task…"
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
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-[#111111]">Tasks Board</h1>
          <p className="text-sm text-[#555555] mt-0.5">
            {total} tasks · drag to reorder or move between columns
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-[#555555]" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {columns.map((col) => (
                <Column
                  key={col.id}
                  col={col}
                  tasks={items[col.id]}
                  onEdit={setEditTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>

            {/* Ghost while dragging */}
            <DragOverlay>
              {activeTask && (
                <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} overlay />
              )}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {/* Edit modal */}
      <TaskModal task={editTask} onClose={() => setEditTask(null)} onSave={saveTask} />
    </div>
  );
}
