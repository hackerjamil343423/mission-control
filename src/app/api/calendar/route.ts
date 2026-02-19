import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET() {
  const db = neon(process.env.NEON_DATABASE_URL!);
  const events = await db`SELECT * FROM calendar ORDER BY scheduled_at ASC`;
  return NextResponse.json(events);
}
