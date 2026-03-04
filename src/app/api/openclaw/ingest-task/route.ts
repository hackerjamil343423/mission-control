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

  // Preferred path: direct dispatch to OpenClaw gateway (/v1/responses)
  const openclawBaseUrl = process.env.OPENCLAW_BASE_URL;
  const openclawToken = process.env.OPENCLAW_GATEWAY_TOKEN;
  const openclawBasicUser = process.env.OPENCLAW_BASIC_AUTH_USER;
  const openclawBasicPass = process.env.OPENCLAW_BASIC_AUTH_PASS;

  if (openclawBaseUrl && (openclawToken || (openclawBasicUser && openclawBasicPass))) {
    try {
      const dispatchPrompt = [
        "Mission Control assigned a task to you.",
        `Task ID: ${task.id}`,
        `Title: ${task.title}`,
        `Description: ${task.description ?? "(none)"}`,
        `Priority: ${task.priority ?? "(none)"}`,
        `Assignee: ${task.assignee}`,
        "Reply with a short acknowledgement and start execution.",
      ].join("\n");

      const authHeader = openclawBasicUser && openclawBasicPass
        ? `Basic ${Buffer.from(`${openclawBasicUser}:${openclawBasicPass}`).toString("base64")}`
        : `Bearer ${openclawToken}`;

      const res = await fetch(`${openclawBaseUrl.replace(/\/$/, "")}/v1/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          model: `agent:${task.assignee}`,
          user: `mission-control-task-${task.id}`,
          input: dispatchPrompt,
        }),
      });

      const txt = await res.text();
      await db`INSERT INTO agent_dispatch_log (task_id, assignee, status, response)
               VALUES (${task.id}, ${task.assignee}, ${res.ok ? "openclaw_sent" : "openclaw_failed"}, ${txt.slice(0, 1000)})`;

      if (res.ok) {
        return NextResponse.json({ success: true, routed: "openclaw" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "openclaw_dispatch_error";
      await db`INSERT INTO agent_dispatch_log (task_id, assignee, status, response)
               VALUES (${task.id}, ${task.assignee}, 'openclaw_failed', ${msg})`;
    }
  }

  // Fallback path: forward to external bridge endpoint (n8n/worker/custom router)
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

      return NextResponse.json({ success: true, routed: "forward", forwarded: res.ok });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "forward_error";
      await db`INSERT INTO agent_dispatch_log (task_id, assignee, status, response)
               VALUES (${task.id}, ${task.assignee}, 'forward_failed', ${msg})`;
      return NextResponse.json({ success: true, routed: "none", forwarded: false, error: msg });
    }
  }

  await db`INSERT INTO agent_dispatch_log (task_id, assignee, status, response)
           VALUES (${task.id}, ${task.assignee}, 'queued_local', 'No OPENCLAW_BASE_URL/OPENCLAW_GATEWAY_TOKEN or OPENCLAW_FORWARD_WEBHOOK_URL set')`;

  return NextResponse.json({ success: true, queued: true });
}
