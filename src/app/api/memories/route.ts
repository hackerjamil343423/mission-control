import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET() {
  const db = neon(process.env.NEON_DATABASE_URL!);
  const memories = await db`SELECT * FROM memories ORDER BY created_at DESC`;
  return NextResponse.json(memories);
}
