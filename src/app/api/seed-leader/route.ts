import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET() {
  const db = neon(process.env.NEON_DATABASE_URL!);

  // Skip if Jamil already exists
  const existing = await db`SELECT id FROM team WHERE name = 'Jamil' LIMIT 1`;
  if (existing.length > 0) {
    return NextResponse.json({ message: "Jamil already exists", id: existing[0].id });
  }

  const result = await db`
    INSERT INTO team (name, role, status, avatar, description)
    VALUES (
      'Jamil',
      'Leader',
      'working',
      'https://pbs.twimg.com/profile_images/2010807296595574784/AhvK-9zc_400x400.jpg',
      'Team Leader — driving vision and execution.'
    )
    RETURNING *
  `;

  return NextResponse.json({ message: "Jamil added as Leader", member: result[0] });
}
