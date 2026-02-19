import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const db = neon(process.env.NEON_DATABASE_URL!);
  const tasks = await db`SELECT * FROM tasks ORDER BY created_at DESC`;
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const { title } = await req.json();
  const db = neon(process.env.NEON_DATABASE_URL!);
  await db`INSERT INTO tasks (title, status, assignee) VALUES (${title}, 'todo', 'jamil')`;
  return NextResponse.json({ success: true });
}
