import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = neon(process.env.NEON_DATABASE_URL!);

  await db`
    UPDATE content SET
      title      = COALESCE(${body.title      ?? null}::text, title),
      stage      = COALESCE(${body.stage      ?? null}::text, stage),
      script     = COALESCE(${body.script     ?? null}::text, script),
      notes      = COALESCE(${body.notes      ?? null}::text, notes),
      updated_at = NOW()
    WHERE id = ${id}
  `;
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = neon(process.env.NEON_DATABASE_URL!);
  await db`DELETE FROM content WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
