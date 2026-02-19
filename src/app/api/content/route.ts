import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { title } = await req.json();
  const db = neon(process.env.NEON_DATABASE_URL!);
  await db`INSERT INTO content (title, stage) VALUES (${title}, 'idea')`;
  return NextResponse.json({ success: true });
}
