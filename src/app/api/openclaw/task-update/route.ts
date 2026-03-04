import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { ensureMissionControlSchema } from "@/lib/schema";

export async function POST(req: NextRequest) {
  await ensureMissionControlSchema();
  const db = neon(process.env.NEON_DATABASE_URL!);

  const secret = process.env.OPENCLAW_WEBHOOK_SECRET;
  if (secret) {
    const got = req.headers.get("x-webhook-secret");
    if (got !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const { taskId, status, details, agent } = await req.json();

  if (!taskId || !status) {
    return NextResponse.json({ error: "taskId and status required" }, { status: 400 });
  }

  const updated = await db`
    UPDATE tasks
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${taskId}
    RETURNING *
  `;

  await db`INSERT INTO agent_activity (agent, action, task_id, details)
           VALUES (${agent ?? "unknown"}, 'task_status_update', ${taskId}, ${details ?? status})`;

  return NextResponse.json({ success: true, task: updated[0] ?? null });
}
