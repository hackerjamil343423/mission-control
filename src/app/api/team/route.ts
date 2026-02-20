import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET() {
  const db = neon(process.env.NEON_DATABASE_URL!);
  const team = await db`SELECT * FROM team ORDER BY role = 'Leader' DESC, id ASC`;
  return NextResponse.json(team);
}

export async function POST(req: Request) {
  const db = neon(process.env.NEON_DATABASE_URL!);
  const body = await req.json();
  const { name, role, status, avatar, description } = body;
  const result = await db`
    INSERT INTO team (name, role, status, avatar, description)
    VALUES (${name}, ${role}, ${status ?? "working"}, ${avatar ?? null}, ${description ?? null})
    RETURNING *
  `;
  return NextResponse.json(result[0], { status: 201 });
}
