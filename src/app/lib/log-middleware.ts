// src/app/lib/log-middleware.ts
// ミドルウェア: ログ記録
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createLog, LogAction, TargetType } from "@/app/lib/logger";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;

// JWT検証（ユーザーID取得）
async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.userId === "string" ? payload.userId : null;
  } catch (err) {
    console.error("JWT検証エラー:", err);
    return null;
  }
}

// イベント操作をログに記録するミドルウェア
export async function logEventAction(
  req: NextRequest,
  action: LogAction,
  targetId?: string,
  details?: Record<string, unknown>
) {
  try {
    const userId = await getUserIdFromRequest(req);

    await createLog({
      user_id: userId ?? undefined,
      action,
      target_type: TargetType.EVENT,
      target_id: targetId,
      details,
    });
  } catch (error) {
    console.error("ログ記録エラー:", error);
  }
}

// API ルートをラップしてログを記録する高階関数
export function withEventLogging(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      let action: LogAction;
      switch (req.method) {
        case "POST":
          action = LogAction.CREATE;
          break;
        case "PUT":
        case "PATCH":
          action = LogAction.UPDATE;
          break;
        case "DELETE":
          action = LogAction.DELETE;
          break;
        default:
          action = LogAction.VIEW;
      }

      const response = await handler(req);

      if (response.status >= 200 && response.status < 300) {
        const body = await req.json().catch(() => ({}));
        await logEventAction(req, action, body.id, body);
      }

      return response;
    } catch (error) {
      console.error("API処理エラー:", error);
      throw error;
    }
  };
}
