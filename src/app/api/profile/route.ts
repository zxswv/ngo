// API: プロファイル取得
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/app/lib/permission-middleware";
import { pool } from "@/app/DB/lib/db";
import { getUserRoles } from "@/app/lib/rbac";
import { createLog, LogAction, TargetType } from "@/app/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    
    // ユーザー情報を取得
    const userResult = await pool.query(
      "SELECT id, email, created_at FROM users WHERE id = $1",
      [user.userId]
    );
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }
    
    // ユーザーのロールを取得
    const roles = await getUserRoles(user.userId);
    
    const profile = {
      ...userResult.rows[0],
      roles
    };
    
    // プロファイル閲覧をログに記録
    await createLog({
      user_id: user.userId,
      action: LogAction.VIEW,
      target_type: TargetType.USER,
      target_id: user.userId,
      details: { action: "プロファイル閲覧" }
    });
    
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("プロファイル取得エラー:", error);
    return NextResponse.json({ error: "プロファイルの取得に失敗しました" }, { status: 500 });
  }
}
