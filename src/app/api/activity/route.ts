import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { ensureMissionControlSchema } from "@/lib/schema";

export async function GET() {
  await ensureMissionControlSchema();
  const db = neon(process.env.NEON_DATABASE_URL!);

  const rows = await db`
    SELECT a.*, t.title as task_title
    FROM agent_activity a
    LEFT JOIN tasks t ON t.id = a.task_id
    ORDER BY a.created_at DESC
    LIMIT 50
  `;

  return NextResponse.json(rows);
}
