// API: ログアウト
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserFromRequest } from "@/app/lib/permission-middleware";
import { createLog, LogAction, TargetType } from "@/app/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    // ログアウトをログに記録（ユーザーが認証されている場合のみ）
    if (user) {
      await createLog({
        user_id: user.userId,
        action: LogAction.LOGOUT,
        target_type: TargetType.USER,
        target_id: user.userId,
        details: { email: user.email }
      });
    }
    
    // Cookieを削除
    const response = NextResponse.json({ success: true });
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    });
    
    return response;
  } catch (error) {
    console.error("ログアウトエラー:", error);
    return NextResponse.json({ error: "ログアウトに失敗しました" }, { status: 500 });
  }
}
