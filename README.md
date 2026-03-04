# Mission Control (Upgraded)

Custom Next.js dashboard for OpenClaw with Neon PostgreSQL.

## What was improved

### ✅ Agent task dispatch (core missing piece fixed)
- When a task is assigned to any assignee other than `jamil`, Mission Control now attempts to dispatch it to an OpenClaw endpoint.
- Dispatch events are logged in `agent_dispatch_log`.
- Activity events are logged in `agent_activity` and shown in a live feed.

### ✅ Live activity feed
- New API: `GET /api/activity`
- Tasks page now shows real-time activity (polling every 5s).

### ✅ Dynamic assignees
- Tasks are no longer hardcoded to only `jamil` / `oto`.
- You can assign to `main`, `developer`, `researcher`, etc.

### ✅ Auto schema bootstrap
- On task APIs, required Mission Control tables are auto-created if missing.

---

## Env variables

Create `.env.local`:

```bash
NEON_DATABASE_URL=postgresql://...

# Internal dispatch endpoint in this app
OPENCLAW_TASK_WEBHOOK_URL=https://mission-control-sandy-beta.vercel.app/api/openclaw/ingest-task

# Direct OpenClaw bridge (preferred)
OPENCLAW_BASE_URL=https://openclaw.otoreach.online
OPENCLAW_GATEWAY_TOKEN=your_openclaw_gateway_token
# If your domain is protected by Basic Auth, use these instead (or alongside token)
OPENCLAW_BASIC_AUTH_USER=your_basic_auth_username
OPENCLAW_BASIC_AUTH_PASS=your_basic_auth_password

# Optional fallback bridge
OPENCLAW_FORWARD_WEBHOOK_URL=https://your-openclaw-bridge-endpoint.example/webhook

# Shared secret for webhook auth (optional)
OPENCLAW_WEBHOOK_SECRET=your-shared-secret
```

- `OPENCLAW_TASK_WEBHOOK_URL`: where Mission Control sends assigned tasks.
- `OPENCLAW_BASE_URL` + `OPENCLAW_GATEWAY_TOKEN`: Mission Control will call `<base>/v1/responses` and route to `agent:<assignee>`.
- `OPENCLAW_FORWARD_WEBHOOK_URL` (optional): fallback if direct OpenClaw dispatch is unavailable.
- `OPENCLAW_WEBHOOK_SECRET` (optional): sent as `x-webhook-secret` for simple webhook auth.

---

## Local run

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## New/updated backend behavior

### `POST /api/tasks`
Accepts:
```json
{
  "title": "Build docs screen",
  "description": "...",
  "assignee": "developer",
  "priority": "high"
}
```

If assignee != `jamil`, task is dispatched through `OPENCLAW_TASK_WEBHOOK_URL` and logged.

### `PATCH /api/tasks/:id`
- Updates task
- Logs activity
- Re-dispatches to assigned agent when relevant fields change

### `GET /api/activity`
Returns latest activity feed entries.

---

## Suggested next steps (Phase 2)

1. Add **OpenClaw inbound webhook endpoint** in this app (`/api/openclaw/events`) to mark tasks done from agent updates.
2. Add **Task-to-Session mapping** (sessionKey per task).
3. Add **Mission Control Chat** screen with per-agent threads.
4. Add **Calendar Cron Sync** with `openclaw cron list` + status.
5. Add **Projects + Docs** linking (task/doc/memory/project graph).

If you want, I can implement Phase 2 directly in this repo next.
