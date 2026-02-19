import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tasks Board
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    assignee: v.union(v.literal("jamil"), v.literal("oto")),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Content Pipeline
  content: defineTable({
    title: v.string(),
    stage: v.union(
      v.literal("idea"),
      v.literal("scripting"),
      v.literal("thumbnail"),
      v.literal("filming"),
      v.literal("editing"),
      v.literal("published")
    ),
    script: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Calendar / Scheduled Tasks
  calendar: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(),
    type: v.union(v.literal("cron"), v.literal("reminder"), v.literal("task")),
    completed: v.boolean(),
    createdAt: v.number(),
  }),

  // Memories
  memories: defineTable({
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Team Members / Agents
  team: defineTable({
    name: v.string(),
    role: v.string(),
    status: v.union(v.literal("active"), v.literal("idle"), v.literal("working")),
    avatar: v.optional(v.string()),
    description: v.optional(v.string()),
  }),
});
