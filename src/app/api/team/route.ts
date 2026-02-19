import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET() {
  const db = neon(process.env.NEON_DATABASE_URL!);
  const team = await db`SELECT * FROM team`;
  return NextResponse.json(team);
}
