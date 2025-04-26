// API: ユーザー管理
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/app/lib/permission-middleware";
import { withPermission } from "@/app/lib/permission-middleware";
import { Permission, getUserRoles } from "@/app/lib/rbac";
import { pool } from "@/app/DB/lib/db";
import { createLog, LogAction, TargetType } from "@/app/lib/logger";

// ユーザー一覧を取得
export const GET = withPermission(Permission.MANAGE_USERS)(async (request: NextRequest) => {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    
    // ユーザー一覧を取得
    const usersResult = await pool.query(
      "SELECT id, email, created_at FROM users ORDER BY id"
    );
    
    // 各ユーザーのロールを取得
    const users = await Promise.all(
      usersResult.rows.map(async (user) => {
        const roles = await getUserRoles(user.id.toString());
        return {
          ...user,
          roles
        };
      })
    );
    
    // ログを記録
    await createLog({
      user_id: user.userId,
      action: LogAction.VIEW,
      target_type: TargetType.USER,
      details: { action: "ユーザー一覧取得" }
    });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error("ユーザー取得エラー:", error);
    return NextResponse.json({ error: "ユーザーの取得に失敗しました" }, { status: 500 });
  }
});
