// API: ログ管理
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getLogs, LogAction, TargetType } from "@/app/lib/logger";

// ユーザー認証を確認する関数
async function getUserFromToken(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    ) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// ログ一覧を取得
export async function GET(request: NextRequest) {
  const user = await getUserFromToken(request);

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    // クエリパラメータを取得
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const action = searchParams.get("action") as LogAction | null;
    const targetType = searchParams.get("target_type") as TargetType | null;
    const fromDate = searchParams.get("from_date")
      ? new Date(searchParams.get("from_date")!)
      : undefined;
    const toDate = searchParams.get("to_date")
      ? new Date(searchParams.get("to_date")!)
      : undefined;

    // ログを取得
    const logs = await getLogs({
      limit,
      offset,
      action,
      target_type: targetType,
      from_date: fromDate,
      to_date: toDate,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("ログ取得エラー:", error);
    return NextResponse.json(
      { error: "ログの取得に失敗しました" },
      { status: 500 }
    );
  }
}
