// ログアウト機能
import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect("/login");
  res.cookies.set("auth_token", "", { maxAge: 0 });
  return res;
}
