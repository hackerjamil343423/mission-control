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
import { Video, Plus, Loader2, GripVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Content } from "@/types";

/* ── Stages ─────────────────────────────────────────────────── */
type Stage = "idea" | "scripting" | "thumbnail" | "filming" | "editing" | "published";

const stages: { id: Stage; label: string; emoji: string; color: string; bg: string }[] = [
  { id: "idea",       label: "Idea",       emoji: "💡", color: "#7C3AED", bg: "#F5F3FF" },
  { id: "scripting",  label: "Scripting",  emoji: "✍️",  color: "#2563EB", bg: "#EFF6FF" },
  { id: "thumbnail",  label: "Thumbnail",  emoji: "🎨", color: "#D97706", bg: "#FFFBEB" },
  { id: "filming",    label: "Filming",    emoji: "🎬", color: "#DC2626", bg: "#FEF2F2" },
  { id: "editing",    label: "Editing",    emoji: "✂️",  color: "#0891B2", bg: "#ECFEFF" },
  { id: "published",  label: "Published",  emoji: "🚀", color: "#16A34A", bg: "#F0FDF4" },
];

/* ── Sortable content card ──────────────────────────────────── */
function ContentCard({
  item,
  onEdit,
  onDelete,
  overlay = false,
}: {
  item: Content;
  onEdit: (i: Content) => void;
  onDelete: (id: number) => void;
  overlay?: boolean;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id: String(item.id) });

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
          <div className="flex items-start gap-1.5">
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 cursor-grab active:cursor-grabbing text-[#E5E5E5] hover:text-[#555555] shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-3.5 h-3.5" />
            </button>

            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(item)}>
              <p className="text-xs font-medium text-[#111111] leading-snug">{item.title}</p>
              {item.notes && (
                <p className="text-[10px] text-[#555555] mt-1 line-clamp-2 leading-relaxed">
                  {item.notes}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-[#F0F0F0] shrink-0">
                  <MoreHorizontal className="w-3.5 h-3.5 text-[#555555]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500"
                  onClick={() => onDelete(item.id)}
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
  stage,
  items,
  onEdit,
  onDelete,
}: {
  stage: (typeof stages)[0];
  items: Content[];
  onEdit: (i: Content) => void;
  onDelete: (id: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex flex-col gap-2.5 min-w-48 w-full">
      <div
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg"
        style={{ backgroundColor: stage.bg }}
      >
        <span className="text-sm">{stage.emoji}</span>
        <span className="text-xs font-semibold" style={{ color: stage.color }}>
          {stage.label}
        </span>
        <span className="ml-auto text-xs font-bold" style={{ color: stage.color }}>
          {items.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-40 rounded-xl p-1.5 transition-colors ${
          isOver ? "bg-[#D4F657]/10 ring-1 ring-[#D4F657]" : "bg-[#F8F8F8]"
        }`}
      >
        <SortableContext
          id={stage.id}
          items={items.map((i) => String(i.id))}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5">
            {items.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-[10px] text-[#E5E5E5]">Empty</p>
              </div>
            ) : (
              items.map((item) => (
                <ContentCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

/* ── Edit modal ─────────────────────────────────────────────── */
function ContentModal({
  item,
  onClose,
  onSave,
}: {
  item: Content | null;
  onClose: () => void;
  onSave: (id: number, data: Partial<Content>) => void;
}) {
  const [title, setTitle]       = useState(item?.title ?? "");
  const [stage, setStage]       = useState<Stage>((item?.stage as Stage) ?? "idea");
  const [script, setScript]     = useState(item?.script ?? "");
  const [notes, setNotes]       = useState(item?.notes ?? "");
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setStage(item.stage as Stage);
      setScript(item.script ?? "");
      setNotes(item.notes ?? "");
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    await onSave(item.id, {
      title, stage, script: script || null, notes: notes || null,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Edit Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-bold border-0 border-b border-[#E5E5E5] rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#D4F657]"
            placeholder="Content title…"
          />

          <div className="py-3 border-y border-[#F0F0F0]">
            <label className="text-xs font-medium text-[#555555] block mb-1.5">Stage</label>
            <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
              <SelectTrigger className="h-8 text-xs border-[#E5E5E5] w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.emoji} {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#555555]">Script / Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes…"
              className="min-h-24 resize-none border-[#E5E5E5] text-sm focus-visible:ring-[#D4F657]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#555555]">Full Script</label>
            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Write the full script here…"
              className="min-h-28 resize-none border-[#E5E5E5] text-sm focus-visible:ring-[#D4F657]"
            />
          </div>

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
export default function ContentPage() {
  const [items, setItems] = useState<Record<Stage, Content[]>>({
    idea: [], scripting: [], thumbnail: [], filming: [], editing: [], published: [],
  });
  const [loading, setLoading]     = useState(true);
  const [newContent, setNewContent] = useState("");
  const [adding, setAdding]       = useState(false);
  const [editItem, setEditItem]   = useState<Content | null>(null);
  const [activeId, setActiveId]   = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchContent = () => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((data: Content[]) => {
        const grouped = stages.reduce((acc, s) => {
          acc[s.id] = data.filter((c) => c.stage === s.id);
          return acc;
        }, {} as Record<Stage, Content[]>);
        setItems(grouped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchContent(); }, []);

  const findContainer = (id: string): Stage | null => {
    if (stages.some((s) => s.id === id)) return id as Stage;
    for (const [key, arr] of Object.entries(items)) {
      if (arr.some((i) => String(i.id) === id)) return key as Stage;
    }
    return null;
  };

  const activeItem = activeId
    ? Object.values(items).flat().find((i) => String(i.id) === activeId) ?? null
    : null;

  const handleDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id));

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const from = findContainer(String(active.id));
    const to   = findContainer(String(over.id));
    if (!from || !to || from === to) return;
    setItems((prev) => {
      const item = prev[from].find((i) => String(i.id) === String(active.id));
      if (!item) return prev;
      const overIdx  = prev[to].findIndex((i) => String(i.id) === String(over.id));
      const insertAt = overIdx >= 0 ? overIdx : prev[to].length;
      return {
        ...prev,
        [from]: prev[from].filter((i) => String(i.id) !== String(active.id)),
        [to]: [...prev[to].slice(0, insertAt), item, ...prev[to].slice(insertAt)],
      };
    });
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) { setActiveId(null); return; }
    const from = findContainer(String(active.id));
    const to   = findContainer(String(over.id));
    if (!from || !to) { setActiveId(null); return; }

    if (from === to) {
      const oldIdx = items[from].findIndex((i) => String(i.id) === String(active.id));
      const newIdx = items[to].findIndex((i)   => String(i.id) === String(over.id));
      if (oldIdx !== newIdx)
        setItems((prev) => ({ ...prev, [from]: arrayMove(prev[from], oldIdx, newIdx) }));
    } else {
      await fetch(`/api/content/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: to }),
      });
    }
    setActiveId(null);
  };

  const addContent = async () => {
    if (!newContent.trim() || adding) return;
    setAdding(true);
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newContent }),
    });
    setNewContent(""); setAdding(false); fetchContent();
  };

  const saveItem = async (id: number, data: Partial<Content>) => {
    await fetch(`/api/content/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchContent();
  };

  const deleteItem = async (id: number) => {
    await fetch(`/api/content/${id}`, { method: "DELETE" });
    fetchContent();
  };

  const total = Object.values(items).flat().length;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 items-center gap-4 border-b border-[#E5E5E5] px-6 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <SidebarTrigger className="text-[#555555] hover:text-[#111111]" />
        <Separator orientation="vertical" className="h-5" />
        <Video className="w-4 h-4 text-[#D4F657]" style={{ filter: "drop-shadow(0 0 4px #D4F657)" }} />
        <span className="font-semibold text-[#111111] text-sm">Content Pipeline</span>
        <div className="ml-auto flex items-center gap-2 w-72">
          <Input
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addContent()}
            placeholder="New content idea…"
            className="h-8 text-sm border-[#E5E5E5] bg-white"
          />
          <Button
            onClick={addContent}
            disabled={adding}
            size="sm"
            className="h-8 bg-[#D4F657] text-black hover:bg-[#c8ec3e] font-semibold shrink-0"
          >
            {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-x-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-[#111111]">Content Pipeline</h1>
          <p className="text-sm text-[#555555] mt-0.5">
            {total} pieces · drag to move between stages
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
            <div className="flex gap-4 min-w-max pb-4">
              {stages.map((stage) => (
                <div key={stage.id} className="w-48">
                  <Column
                    stage={stage}
                    items={items[stage.id]}
                    onEdit={setEditItem}
                    onDelete={deleteItem}
                  />
                </div>
              ))}
            </div>
            <DragOverlay>
              {activeItem && (
                <ContentCard item={activeItem} onEdit={() => {}} onDelete={() => {}} overlay />
              )}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      <ContentModal item={editItem} onClose={() => setEditItem(null)} onSave={saveItem} />
    </div>
  );
}
