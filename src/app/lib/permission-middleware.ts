// src/app/lib/permission-middleware.ts
// ミドルウェア: 権限チェック
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { Permission, hasPermission } from "./rbac";
import { createLog, LogAction, TargetType } from "./logger";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined.");

// JWT 検証ヘルパー
async function verifyToken(
  token: string
): Promise<{ userId: string; email: string } | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (
      typeof payload.userId === "string" &&
      typeof payload.email === "string"
    ) {
      return { userId: payload.userId, email: payload.email };
    }
    return null;
  } catch (err) {
    console.error("JWT 検証失敗:", err);
    return null;
  }
}

// クッキーからユーザー情報を取得
export async function getUserFromRequest(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

// 権限チェックミドルウェア
export function withPermission(permission: Permission) {
  return async (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const user = await getUserFromRequest(req);
      if (!user) {
        return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
      }

      const hasRequiredPermission = await hasPermission(
        user.userId,
        permission
      );
      if (!hasRequiredPermission) {
        await createLog({
          user_id: user.userId,
          action: LogAction.VIEW,
          target_type: TargetType.SYSTEM,
          details: {
            message: "権限不足",
            requiredPermission: permission,
            path: req.nextUrl.pathname,
          },
        });
        return NextResponse.json(
          { error: "この操作を行う権限がありません" },
          { status: 403 }
        );
      }

      return handler(req);
    };
  };
}
