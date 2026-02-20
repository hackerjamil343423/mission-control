import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const db = neon(process.env.NEON_DATABASE_URL!);
  const content = await db`SELECT * FROM content ORDER BY created_at DESC`;
  return NextResponse.json(content);
}

export async function POST(req: NextRequest) {
  const { title, stage } = await req.json();
  const db = neon(process.env.NEON_DATABASE_URL!);
  await db`INSERT INTO content (title, stage) VALUES (${title}, ${stage ?? "idea"})`;
  return NextResponse.json({ success: true });
}
