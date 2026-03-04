import { neon } from "@neondatabase/serverless";

export async function dispatchTaskToAgent(input: {
  taskId: number;
  title: string;
  description?: string | null;
  assignee: string;
  priority?: string | null;
  status?: string | null;
}) {
  const db = neon(process.env.NEON_DATABASE_URL!);
  const webhook = process.env.OPENCLAW_TASK_WEBHOOK_URL;

  const payload = {
    event: "mission_control.task_assigned",
    task: {
      id: input.taskId,
      title: input.title,
      description: input.description ?? null,
      assignee: input.assignee,
      priority: input.priority ?? null,
      status: input.status ?? null,
    },
    source: "mission-control",
    at: new Date().toISOString(),
  };

  if (!webhook) {
    await db`INSERT INTO agent_dispatch_log (task_id, assignee, status, response)
             VALUES (${input.taskId}, ${input.assignee}, 'pending_no_webhook', 'Set OPENCLAW_TASK_WEBHOOK_URL')`;
    return { status: "pending_no_webhook" as const };
  }

  try {
    const secret = process.env.OPENCLAW_WEBHOOK_SECRET;
    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-webhook-secret": secret } : {}),
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    const status = res.ok ? "sent" : "failed";

    await db`INSERT INTO agent_dispatch_log (task_id, assignee, status, response)
             VALUES (${input.taskId}, ${input.assignee}, ${status}, ${text.slice(0, 1000)})`;

    return { status, response: text };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "dispatch_error";
    await db`INSERT INTO agent_dispatch_log (task_id, assignee, status, response)
             VALUES (${input.taskId}, ${input.assignee}, 'failed', ${msg})`;
    return { status: "failed" as const, error: msg };
  }
}

export async function logAgentActivity(input: {
  agent: string;
  action: string;
  taskId?: number;
  details?: string;
}) {
  const db = neon(process.env.NEON_DATABASE_URL!);
  await db`INSERT INTO agent_activity (agent, action, task_id, details)
           VALUES (${input.agent}, ${input.action}, ${input.taskId ?? null}, ${input.details ?? null})`;
}
