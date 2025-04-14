// APIルート作成（App Router）
// （POSTとGET）
import { pool } from "../DB/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "userId missing" }, { status: 400 });

  const { rows } = await pool.query("SELECT * FROM events WHERE user_id = $1", [
    userId,
  ]);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, date, text } = body;

  if (!user_id || !date || !text) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const { rows } = await pool.query(
    "INSERT INTO events (user_id, date, text) VALUES ($1, $2, $3) RETURNING *",
    [user_id, date, text]
  );

  return NextResponse.json(rows[0]);
}
