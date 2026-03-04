import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { dispatchTaskToAgent, logAgentActivity } from "@/lib/agent-dispatch";
import { ensureMissionControlSchema } from "@/lib/schema";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureMissionControlSchema();
  const { id } = await params;
  const body = await req.json();
  const db = neon(process.env.NEON_DATABASE_URL!);

  const prev = await db`SELECT * FROM tasks WHERE id = ${id} LIMIT 1`;
  const prevTask = prev[0];

  const result = await db`
    UPDATE tasks SET
      title       = COALESCE(${body.title       ?? null}::text,    title),
      description = COALESCE(${body.description ?? null}::text,    description),
      status      = COALESCE(${body.status      ?? null}::text,    status),
      priority    = COALESCE(${body.priority    ?? null}::text,    priority),
      assignee    = COALESCE(${body.assignee    ?? null}::text,    assignee),
      updated_at  = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  const task = result[0];

  await logAgentActivity({
    agent: task.assignee,
    action: "task_updated",
    taskId: task.id,
    details: `status=${task.status}`,
  });

  const assigneeChanged = prevTask && prevTask.assignee !== task.assignee;
  if (task.assignee !== "jamil" && (assigneeChanged || body.status || body.title || body.description)) {
    await dispatchTaskToAgent({
      taskId: task.id,
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      priority: task.priority,
      status: task.status,
    });

    await logAgentActivity({
      agent: task.assignee,
      action: "task_dispatched",
      taskId: task.id,
      details: `Task update sent to ${task.assignee}`,
    });
  }

  return NextResponse.json({ success: true, task });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureMissionControlSchema();
  const { id } = await params;
  const db = neon(process.env.NEON_DATABASE_URL!);
  await db`DELETE FROM tasks WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
