"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Video, Plus, Loader2, GripVertical, MoreHorizontal,
  Pencil, Trash2, X, Eye, FileText, ChevronRight, Calendar,
  Bold, Italic, List, ListOrdered, Heading2, Quote, Code, Minus,
} from "lucide-react";
import type { Content } from "@/types";

/* ── Stages ─────────────────────────────────────────────────── */
type Stage = "idea" | "scripting" | "thumbnail" | "filming" | "editing" | "published";

const stages: { id: Stage; label: string; emoji: string; color: string; bg: string; border: string }[] = [
  { id: "idea",      label: "Idea",      emoji: "💡", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  { id: "scripting", label: "Scripting", emoji: "✍️",  color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { id: "thumbnail", label: "Thumbnail", emoji: "🎨", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { id: "filming",   label: "Filming",   emoji: "🎬", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  { id: "editing",   label: "Editing",   emoji: "✂️",  color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  { id: "published", label: "Published", emoji: "🚀", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
];

function stageById(id: string) {
  return stages.find((s) => s.id === id) ?? stages[0];
}

/* ── Markdown toolbar ───────────────────────────────────────── */
function MarkdownToolbar({ onInsert }: { onInsert: (before: string, after?: string) => void }) {
  const tools = [
    { icon: <Heading2 className="w-3.5 h-3.5" />, label: "H2",     before: "## ",   after: "" },
    { icon: <Bold      className="w-3.5 h-3.5" />, label: "Bold",   before: "**",    after: "**" },
    { icon: <Italic    className="w-3.5 h-3.5" />, label: "Italic", before: "_",     after: "_" },
    { icon: <Code      className="w-3.5 h-3.5" />, label: "Code",   before: "`",     after: "`" },
    { icon: <Quote     className="w-3.5 h-3.5" />, label: "Quote",  before: "> ",    after: "" },
    { icon: <List      className="w-3.5 h-3.5" />, label: "UL",     before: "- ",    after: "" },
    { icon: <ListOrdered className="w-3.5 h-3.5" />, label: "OL",   before: "1. ",   after: "" },
    { icon: <Minus     className="w-3.5 h-3.5" />, label: "HR",     before: "\n---\n", after: "" },
  ];
  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-[#F0F0F0] bg-[#FAFAFA]">
      {tools.map((t) => (
        <button
          key={t.label}
          type="button"
          title={t.label}
          onClick={() => onInsert(t.before, t.after)}
          className="p-1.5 rounded hover:bg-[#EFEFEF] text-[#555] hover:text-[#111] transition-colors"
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}

/* ── Full-screen Notion-style editor ────────────────────────── */
function ContentEditor({
  item,
  onClose,
  onSave,
  onDelete,
}: {
  item: Content;
  onClose: () => void;
  onSave: (id: number, data: Partial<Content>) => Promise<void>;
  onDelete: (id: number) => void;
}) {
  const [title, setTitle]     = useState(item.title);
  const [notes, setNotes]     = useState(item.notes ?? "");
  const [script, setScript]   = useState(item.script ?? "");
  const [stage, setStage]     = useState<Stage>(item.stage as Stage);
  const [tab, setTab]         = useState<"write" | "preview">("write");
  const [scriptTab, setScriptTab] = useState<"write" | "preview">("write");
  const [saving, setSaving]   = useState(false);
  const [dirty, setDirty]     = useState(false);
  const notesRef  = useRef<HTMLTextAreaElement>(null);
  const scriptRef = useRef<HTMLTextAreaElement>(null);
  const titleRef  = useRef<HTMLTextAreaElement>(null);

  const stg = stageById(stage);

  // auto-resize textareas
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => { autoResize(titleRef.current); }, [title]);
  useEffect(() => { autoResize(notesRef.current); }, [notes]);
  useEffect(() => { autoResize(scriptRef.current); }, [script]);

  const markDirty = () => setDirty(true);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await onSave(item.id, { title, notes: notes || null, script: script || null, stage });
    setSaving(false);
    setDirty(false);
  }, [item.id, title, notes, script, stage, onSave]);

  // Cmd/Ctrl+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave, onClose]);

  const insertMarkdown = (ref: React.RefObject<HTMLTextAreaElement | null>, setter: (v: string) => void, before: string, after = "") => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const sel   = el.value.slice(start, end);
    const newVal = el.value.slice(0, start) + before + sel + after + el.value.slice(end);
    setter(newVal);
    markDirty();
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + sel.length);
    }, 0);
  };

  const createdDate = new Date(item.created_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-[#E5E5E5] bg-white shrink-0">
        {/* Stage badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: stg.bg, color: stg.color, border: `1px solid ${stg.border}` }}
        >
          <span>{stg.emoji}</span>
          <span>{stg.label}</span>
        </div>

        <Select value={stage} onValueChange={(v) => { setStage(v as Stage); markDirty(); }}>
          <SelectTrigger className="h-7 w-36 text-xs border-[#E5E5E5]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {stages.map((s) => (
              <SelectItem key={s.id} value={s.id} className="text-xs">
                {s.emoji} {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 text-xs text-[#999] ml-2">
          <Calendar className="w-3 h-3" />
          <span>{createdDate}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {dirty && (
            <span className="text-xs text-[#999]">Unsaved changes</span>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-8 bg-[#D4F657] text-black hover:bg-[#c8ec3e] font-semibold text-xs"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
            {saving ? "Saving…" : "Save"}
          </Button>
          <button
            onClick={() => { onDelete(item.id); onClose(); }}
            className="p-1.5 rounded hover:bg-red-50 text-[#ccc] hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#F5F5F5] text-[#999] hover:text-[#111] transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-10">

          {/* Title */}
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => { setTitle(e.target.value); markDirty(); }}
            placeholder="Untitled"
            rows={1}
            className="w-full resize-none outline-none text-4xl font-bold text-[#111] placeholder:text-[#DDD] leading-tight mb-6 overflow-hidden bg-transparent"
            style={{ border: "none", padding: 0 }}
          />

          <div className="h-px bg-[#F0F0F0] mb-8" />

          {/* Notes / Content section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#999]" />
                <span className="text-sm font-semibold text-[#555]">Notes</span>
              </div>
              <div className="flex items-center gap-1 rounded-lg overflow-hidden border border-[#E5E5E5] text-xs">
                <button
                  onClick={() => setTab("write")}
                  className={`px-3 py-1 transition-colors ${tab === "write" ? "bg-[#111] text-white" : "text-[#555] hover:bg-[#F5F5F5]"}`}
                >
                  Write
                </button>
                <button
                  onClick={() => setTab("preview")}
                  className={`px-3 py-1 flex items-center gap-1 transition-colors ${tab === "preview" ? "bg-[#111] text-white" : "text-[#555] hover:bg-[#F5F5F5]"}`}
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
              </div>
            </div>

            {tab === "write" ? (
              <div className="rounded-xl border border-[#E5E5E5] overflow-hidden">
                <MarkdownToolbar onInsert={(b, a) => insertMarkdown(notesRef, setNotes, b, a)} />
                <textarea
                  ref={notesRef}
                  value={notes}
                  onChange={(e) => { setNotes(e.target.value); markDirty(); }}
                  placeholder="Add notes… supports **markdown**"
                  rows={6}
                  className="w-full resize-none outline-none text-sm text-[#333] font-mono leading-relaxed p-4 bg-white placeholder:text-[#CCC]"
                  style={{ border: "none", minHeight: 140 }}
                />
              </div>
            ) : (
              <div
                className="min-h-24 rounded-xl border border-[#E5E5E5] px-4 py-3 prose prose-sm max-w-none text-[#333]"
                onClick={() => setTab("write")}
              >
                {notes ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
                ) : (
                  <p className="text-[#CCC] text-sm">Nothing here yet…</p>
                )}
              </div>
            )}
          </div>

          {/* Script section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#999]" />
                <span className="text-sm font-semibold text-[#555]">Script</span>
              </div>
              <div className="flex items-center gap-1 rounded-lg overflow-hidden border border-[#E5E5E5] text-xs">
                <button
                  onClick={() => setScriptTab("write")}
                  className={`px-3 py-1 transition-colors ${scriptTab === "write" ? "bg-[#111] text-white" : "text-[#555] hover:bg-[#F5F5F5]"}`}
                >
                  Write
                </button>
                <button
                  onClick={() => setScriptTab("preview")}
                  className={`px-3 py-1 flex items-center gap-1 transition-colors ${scriptTab === "preview" ? "bg-[#111] text-white" : "text-[#555] hover:bg-[#F5F5F5]"}`}
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
              </div>
            </div>

            {scriptTab === "write" ? (
              <div className="rounded-xl border border-[#E5E5E5] overflow-hidden">
                <MarkdownToolbar onInsert={(b, a) => insertMarkdown(scriptRef, setScript, b, a)} />
                <textarea
                  ref={scriptRef}
                  value={script}
                  onChange={(e) => { setScript(e.target.value); markDirty(); }}
                  placeholder="Write the full script here… supports **markdown**"
                  rows={10}
                  className="w-full resize-none outline-none text-sm text-[#333] font-mono leading-relaxed p-4 bg-white placeholder:text-[#CCC]"
                  style={{ border: "none", minHeight: 200 }}
                />
              </div>
            ) : (
              <div
                className="min-h-24 rounded-xl border border-[#E5E5E5] px-4 py-3 prose prose-sm max-w-none text-[#333]"
                onClick={() => setScriptTab("write")}
              >
                {script ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{script}</ReactMarkdown>
                ) : (
                  <p className="text-[#CCC] text-sm">Nothing here yet…</p>
                )}
              </div>
            )}
          </div>

          <div className="h-20" />
        </div>
      </div>

      {/* Bottom hint */}
      <div className="shrink-0 border-t border-[#F0F0F0] px-6 py-2 flex items-center gap-4">
        <span className="text-[10px] text-[#CCC]">⌘S to save · Esc to close · Markdown supported</span>
      </div>
    </div>
  );
}

/* ── Kanban card ─────────────────────────────────────────────── */
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

  const hasNotes  = !!item.notes?.trim();
  const hasScript = !!item.script?.trim();
  const date = new Date(item.updated_at ?? item.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`bg-white rounded-xl border border-[#E5E5E5] group hover:border-[#D4F657] hover:shadow-md transition-all cursor-pointer ${
          overlay ? "rotate-1 shadow-2xl scale-105" : ""
        }`}
        onClick={() => onEdit(item)}
      >
        {/* Drag handle row */}
        <div className="flex items-center gap-1 px-3 pt-2.5 pb-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-[#E5E5E5] hover:text-[#AAAAAA] shrink-0 -ml-1"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1" />
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-[#CCC] hover:text-red-400 shrink-0"
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Body */}
        <div className="px-3 pb-3">
          <p className="text-sm font-semibold text-[#111] leading-snug mb-2">{item.title}</p>

          {hasNotes && (
            <p className="text-[11px] text-[#888] line-clamp-2 leading-relaxed mb-2">
              {item.notes}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-[#BBB]">{date}</span>
            <div className="flex-1" />
            {hasNotes && (
              <div className="flex items-center gap-0.5 text-[10px] text-[#BBB]" title="Has notes">
                <FileText className="w-2.5 h-2.5" />
              </div>
            )}
            {hasScript && (
              <div className="flex items-center gap-0.5 text-[10px] text-[#BBB]" title="Has script">
                <Pencil className="w-2.5 h-2.5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Column ──────────────────────────────────────────────────── */
function Column({
  stage,
  items,
  onEdit,
  onDelete,
  onAdd,
}: {
  stage: (typeof stages)[0];
  items: Content[];
  onEdit: (i: Content) => void;
  onDelete: (id: number) => void;
  onAdd: (stage: Stage) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex flex-col gap-2 w-64 shrink-0">
      {/* Column header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ backgroundColor: stage.bg, border: `1px solid ${stage.border}` }}
      >
        <span className="text-base">{stage.emoji}</span>
        <span className="text-xs font-bold" style={{ color: stage.color }}>{stage.label}</span>
        <div
          className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
          style={{ backgroundColor: stage.color + "20", color: stage.color }}
        >
          {items.length}
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-48 rounded-xl p-2 flex flex-col gap-2 transition-all ${
          isOver
            ? "bg-[#D4F657]/10 ring-2 ring-[#D4F657] ring-dashed"
            : "bg-[#F8F8F8]"
        }`}
      >
        <SortableContext
          id={stage.id}
          items={items.map((i) => String(i.id))}
          strategy={verticalListSortingStrategy}
        >
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-6">
              <p className="text-[11px] text-[#CCC]">Drop here</p>
            </div>
          ) : (
            items.map((item) => (
              <ContentCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
            ))
          )}
        </SortableContext>

        {/* Inline add */}
        <button
          onClick={() => onAdd(stage.id)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-[#BBB] hover:text-[#555] hover:bg-white transition-all group/add"
        >
          <Plus className="w-3 h-3 group-hover/add:text-[#D4F657]" />
          Add card
        </button>
      </div>
    </div>
  );
}

/* ── Quick-add modal ─────────────────────────────────────────── */
function QuickAdd({
  defaultStage,
  onClose,
  onAdd,
}: {
  defaultStage: Stage;
  onClose: () => void;
  onAdd: (title: string, stage: Stage) => Promise<void>;
}) {
  const [title, setTitle]   = useState("");
  const [stage, setStage]   = useState<Stage>(defaultStage);
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleAdd = async () => {
    if (!title.trim() || adding) return;
    setAdding(true);
    await onAdd(title, stage);
    setAdding(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-4">
          <p className="text-xs font-bold text-[#999] uppercase tracking-widest mb-3">New Content</p>
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") onClose(); }}
            placeholder="Content title…"
            className="w-full text-xl font-bold text-[#111] outline-none placeholder:text-[#DDD] mb-4"
          />
          <div className="flex items-center gap-3">
            <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
              <SelectTrigger className="h-8 text-xs border-[#E5E5E5] w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.emoji} {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <button onClick={onClose} className="text-xs text-[#BBB] hover:text-[#555]">Cancel</button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={adding || !title.trim()}
              className="h-8 bg-[#D4F657] text-black hover:bg-[#c8ec3e] font-semibold text-xs"
            >
              {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function ContentPage() {
  const [items, setItems] = useState<Record<Stage, Content[]>>({
    idea: [], scripting: [], thumbnail: [], filming: [], editing: [], published: [],
  });
  const [loading, setLoading]         = useState(true);
  const [editItem, setEditItem]       = useState<Content | null>(null);
  const [quickAdd, setQuickAdd]       = useState<Stage | null>(null);
  const [activeId, setActiveId]       = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchContent = useCallback(() => {
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
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

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

  const addContent = async (title: string, stage: Stage) => {
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, stage }),
    });
    fetchContent();
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
    setEditItem(null);
    fetchContent();
  };

  const total     = Object.values(items).flat().length;
  const published = items.published.length;

  return (
    <>
      <div className="flex flex-col h-screen bg-white overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b border-[#E5E5E5] px-6 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <SidebarTrigger className="text-[#555] hover:text-[#111]" />
          <Separator orientation="vertical" className="h-5" />
          <Video className="w-4 h-4 text-[#D4F657]" style={{ filter: "drop-shadow(0 0 4px #D4F657)" }} />
          <span className="font-semibold text-[#111] text-sm">Content Pipeline</span>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-[#999]">{total} pieces · {published} published</span>
            <Button
              onClick={() => setQuickAdd("idea")}
              size="sm"
              className="h-8 bg-[#D4F657] text-black hover:bg-[#c8ec3e] font-semibold text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </Button>
          </div>
        </header>

        {/* Pipeline progress bar */}
        {!loading && total > 0 && (
          <div className="flex h-1 w-full shrink-0">
            {stages.map((s) => {
              const pct = total > 0 ? (items[s.id].length / total) * 100 : 0;
              return (
                <div
                  key={s.id}
                  style={{ width: `${pct}%`, backgroundColor: s.color, opacity: 0.6 }}
                  title={`${s.label}: ${items[s.id].length}`}
                />
              );
            })}
          </div>
        )}

        {/* Board */}
        <main className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-[#CCC]" />
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-4 px-6 py-6 min-w-max">
                {stages.map((stage) => (
                  <Column
                    key={stage.id}
                    stage={stage}
                    items={items[stage.id]}
                    onEdit={setEditItem}
                    onDelete={deleteItem}
                    onAdd={(s) => setQuickAdd(s)}
                  />
                ))}
              </div>
              <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
                {activeItem && (
                  <ContentCard item={activeItem} onEdit={() => {}} onDelete={() => {}} overlay />
                )}
              </DragOverlay>
            </DndContext>
          )}
        </main>
      </div>

      {/* Full-screen editor */}
      {editItem && (
        <ContentEditor
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={saveItem}
          onDelete={deleteItem}
        />
      )}

      {/* Quick add modal */}
      {quickAdd && (
        <QuickAdd
          defaultStage={quickAdd}
          onClose={() => setQuickAdd(null)}
          onAdd={addContent}
        />
      )}
    </>
  );
}
