import { neon } from "@neondatabase/serverless";

let bootstrapped = false;

export async function ensureMissionControlSchema() {
  if (bootstrapped) return;

  const db = neon(process.env.NEON_DATABASE_URL!);

  await db`CREATE TABLE IF NOT EXISTS agent_activity (
    id SERIAL PRIMARY KEY,
    agent TEXT NOT NULL,
    action TEXT NOT NULL,
    task_id INTEGER,
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  await db`CREATE TABLE IF NOT EXISTS agent_dispatch_log (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    assignee TEXT NOT NULL,
    status TEXT NOT NULL,
    response TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  // Optional migration: remove strict assignee constraint to support any agent name.
  try {
    await db`ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assignee_check`;
  } catch {
    // no-op
  }

  bootstrapped = true;
}
