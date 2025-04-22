// API：認証リンク検証
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect("/login");

  const result = await pool.query(
    `SELECT * FROM users WHERE token = $1 AND token_expires_at > now()`,
    [token]
  );

  const user = result.rows[0];
  if (!user) return NextResponse.redirect("/login?error=invalid");

  const jwtToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    }
  );

  const res = NextResponse.redirect("/");
  res.cookies.set("auth_token", jwtToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
