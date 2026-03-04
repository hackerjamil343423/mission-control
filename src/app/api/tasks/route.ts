import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { dispatchTaskToAgent, logAgentActivity } from "@/lib/agent-dispatch";
import { ensureMissionControlSchema } from "@/lib/schema";

export async function GET() {
  await ensureMissionControlSchema();
  const db = neon(process.env.NEON_DATABASE_URL!);
  const tasks = await db`SELECT * FROM tasks ORDER BY created_at DESC`;
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  await ensureMissionControlSchema();
  const { title, description = null, assignee = "jamil", priority = null } = await req.json();
  const db = neon(process.env.NEON_DATABASE_URL!);

  const result = await db`
    INSERT INTO tasks (title, description, status, assignee, priority)
    VALUES (${title}, ${description}, 'todo', ${assignee}, ${priority})
    RETURNING *
  `;

  const task = result[0];

  await logAgentActivity({
    agent: assignee,
    action: "task_created",
    taskId: task.id,
    details: title,
  });

  if (assignee !== "jamil") {
    await dispatchTaskToAgent({
      taskId: task.id,
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      priority: task.priority,
      status: task.status,
    });

    await logAgentActivity({
      agent: assignee,
      action: "task_dispatched",
      taskId: task.id,
      details: `Task sent to ${assignee}`,
    });
  }

  return NextResponse.json({ success: true, task });
}
