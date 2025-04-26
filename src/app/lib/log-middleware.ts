// ミドルウェア: ログ記録
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createLog, LogAction, TargetType } from "@/app/lib/logger";

// イベント操作をログに記録するミドルウェア
export async function logEventAction(
  req: NextRequest,
  action: LogAction,
  targetId?: string,
  details?: Record<string, any>
) {
  try {
    // ユーザー情報を取得
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;
    let userId = null;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string, email: string };
        userId = decoded.userId;
      } catch (error) {
        console.error("トークン検証エラー:", error);
      }
    }
    
    // ログを記録
    await createLog({
      user_id: userId,
      action,
      target_type: TargetType.EVENT,
      target_id: targetId,
      details
    });
  } catch (error) {
    console.error("ログ記録エラー:", error);
    // エラーが発生してもアプリケーションは継続させる
  }
}

// API ルートをラップしてログを記録する高階関数
export function withEventLogging(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // リクエストメソッドに基づいてアクションを決定
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
      
      // ハンドラを実行
      const response = await handler(req);
      
      // 成功した場合のみログを記録
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
