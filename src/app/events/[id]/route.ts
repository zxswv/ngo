// （DELETE）
// /app/api/events/[id]/route.ts
import { pool } from "../../DB/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  await pool.query("DELETE FROM events WHERE id = $1", [params.id]);
  return NextResponse.json({ success: true });
}
