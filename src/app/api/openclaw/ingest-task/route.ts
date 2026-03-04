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

  const body = await req.json();
  const task = body?.task;

  if (!task?.id || !task?.title || !task?.assignee) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  await db`INSERT INTO agent_activity (agent, action, task_id, details)
           VALUES (${task.assignee}, 'task_ingested', ${task.id}, ${task.title})`;

  // Optional: forward to external OpenClaw automation endpoint (n8n, worker, gateway bridge, etc.)
  const forwardUrl = process.env.OPENCLAW_FORWARD_WEBHOOK_URL;
  if (forwardUrl) {
    try {
      const res = await fetch(forwardUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { "x-webhook-secret": secret } : {}),
        },
        body: JSON.stringify(body),
      });

      const txt = await res.text();
      await db`INSERT INTO agent_dispatch_log (task_id, assignee, status, response)
               VALUES (${task.id}, ${task.assignee}, ${res.ok ? "forwarded" : "forward_failed"}, ${txt.slice(0, 1000)})`;

      return NextResponse.json({ success: true, forwarded: res.ok });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "forward_error";
      await db`INSERT INTO agent_dispatch_log (task_id, assignee, status, response)
               VALUES (${task.id}, ${task.assignee}, 'forward_failed', ${msg})`;
      return NextResponse.json({ success: true, forwarded: false, error: msg });
    }
  }

  await db`INSERT INTO agent_dispatch_log (task_id, assignee, status, response)
           VALUES (${task.id}, ${task.assignee}, 'queued_local', 'No OPENCLAW_FORWARD_WEBHOOK_URL set')`;

  return NextResponse.json({ success: true, queued: true });
}
