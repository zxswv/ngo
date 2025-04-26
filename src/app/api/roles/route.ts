// API: ロール管理
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/app/lib/permission-middleware";
import { withPermission } from "@/app/lib/permission-middleware";
import { Permission, getAllRoles, getAllPermissions, assignRoleToUser, removeRoleFromUser, getUserRoles } from "@/app/lib/rbac";
import { createLog, LogAction, TargetType } from "@/app/lib/logger";

// ロール一覧を取得
export const GET = withPermission(Permission.MANAGE_ROLES)(async (request: NextRequest) => {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    
    const roles = await getAllRoles();
    const permissions = await getAllPermissions();
    
    // ログを記録
    await createLog({
      user_id: user.userId,
      action: LogAction.VIEW,
      target_type: TargetType.SYSTEM,
      details: { action: "ロール一覧取得" }
    });
    
    return NextResponse.json({ roles, permissions });
  } catch (error) {
    console.error("ロール取得エラー:", error);
    return NextResponse.json({ error: "ロールの取得に失敗しました" }, { status: 500 });
  }
});

// ユーザーにロールを割り当て
export const POST = withPermission(Permission.MANAGE_ROLES)(async (request: NextRequest) => {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    
    const { userId, roleName } = await request.json();
    
    if (!userId || !roleName) {
      return NextResponse.json({ error: "ユーザーIDとロール名は必須です" }, { status: 400 });
    }
    
    const success = await assignRoleToUser(userId, roleName);
    
    if (!success) {
      return NextResponse.json({ error: "ロールの割り当てに失敗しました" }, { status: 500 });
    }
    
    // ログを記録
    await createLog({
      user_id: user.userId,
      action: LogAction.UPDATE,
      target_type: TargetType.USER,
      target_id: userId,
      details: { action: "ロール割り当て", roleName }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ロール割り当てエラー:", error);
    return NextResponse.json({ error: "ロールの割り当てに失敗しました" }, { status: 500 });
  }
});

// ユーザーからロールを削除
export const DELETE = withPermission(Permission.MANAGE_ROLES)(async (request: NextRequest) => {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    
    const { userId, roleName } = await request.json();
    
    if (!userId || !roleName) {
      return NextResponse.json({ error: "ユーザーIDとロール名は必須です" }, { status: 400 });
    }
    
    const success = await removeRoleFromUser(userId, roleName);
    
    if (!success) {
      return NextResponse.json({ error: "ロールの削除に失敗しました" }, { status: 500 });
    }
    
    // ログを記録
    await createLog({
      user_id: user.userId,
      action: LogAction.DELETE,
      target_type: TargetType.USER,
      target_id: userId,
      details: { action: "ロール削除", roleName }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ロール削除エラー:", error);
    return NextResponse.json({ error: "ロールの削除に失敗しました" }, { status: 500 });
  }
});
