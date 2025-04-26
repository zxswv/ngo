// ミドルウェア: 権限チェック
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { Permission, hasPermission } from "./rbac";
import { createLog, LogAction, TargetType } from "./logger";

// ユーザー情報を取得する関数
export async function getUserFromRequest(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string, email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// 権限チェックミドルウェア
export function withPermission(permission: Permission) {
  return async (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
      }
      
      const hasRequiredPermission = await hasPermission(user.userId, permission);
      
      if (!hasRequiredPermission) {
        // 権限不足をログに記録
        await createLog({
          user_id: user.userId,
          action: LogAction.VIEW,
          target_type: TargetType.SYSTEM,
          details: { 
            message: "権限不足", 
            requiredPermission: permission,
            path: req.nextUrl.pathname
          }
        });
        
        return NextResponse.json({ error: "この操作を行う権限がありません" }, { status: 403 });
      }
      
      return handler(req);
    };
  };
}
