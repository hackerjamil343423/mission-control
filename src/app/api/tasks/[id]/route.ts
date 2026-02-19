import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = neon(process.env.NEON_DATABASE_URL!);

  await db`
    UPDATE tasks SET
      title       = COALESCE(${body.title       ?? null}::text,    title),
      description = COALESCE(${body.description ?? null}::text,    description),
      status      = COALESCE(${body.status      ?? null}::text,    status),
      priority    = COALESCE(${body.priority    ?? null}::text,    priority),
      assignee    = COALESCE(${body.assignee    ?? null}::text,    assignee),
      updated_at  = NOW()
    WHERE id = ${id}
  `;
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = neon(process.env.NEON_DATABASE_URL!);
  await db`DELETE FROM tasks WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
