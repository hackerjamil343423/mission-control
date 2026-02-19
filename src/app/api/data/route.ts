import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET() {
  const db = neon(process.env.NEON_DATABASE_URL!);

  const [tasksData, contentData, calendarData, memoriesData, teamData] = await Promise.all([
    db`SELECT * FROM tasks ORDER BY created_at DESC`,
    db`SELECT * FROM content ORDER BY created_at DESC`,
    db`SELECT * FROM calendar ORDER BY scheduled_at ASC`,
    db`SELECT * FROM memories ORDER BY created_at DESC`,
    db`SELECT * FROM team`,
  ]);

  return NextResponse.json({ tasksData, contentData, calendarData, memoriesData, teamData });
}
