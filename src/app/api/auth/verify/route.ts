// API：認証リンク検証（ログ機能とロール連携強化版）
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/DB/lib/db";
import jwt from "jsonwebtoken";
import { createLog, LogAction, TargetType } from "@/app/lib/logger";
import { getUserRoles } from "@/app/lib/rbac";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const baseUrl = process.env.BASE_URL || "http://localhost:3100";
  if (!token) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_token`);
  }

  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE token = $1 AND token_expires_at > now()`,
      [token]
    );

    const user = result.rows[0];
    if (!user) {
      // 無効なトークンまたは期限切れをログに記録
      await createLog({
        action: LogAction.LOGIN,
        target_type: TargetType.SYSTEM,
        details: { error: "invalid_or_expired_token" },
      });

      return NextResponse.redirect(`${baseUrl}/login?error=invalid`);
    }

    // ユーザーのロールを取得
    const roles = await getUserRoles(user.id.toString());

    // JWTにユーザー情報とロールを含める
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roles: roles,
      },
      process.env.JWT_SECRET || "fallback_secret",
      {
        expiresIn: "7d",
      }
    );

    // トークンを無効化（使い捨て）
    await pool.query(
      `UPDATE users SET token = NULL, token_expires_at = NULL WHERE id = $1`,
      [user.id]
    );

    // ログイン成功をログに記録
    await createLog({
      user_id: user.id.toString(),
      action: LogAction.LOGIN,
      target_type: TargetType.USER,
      target_id: user.id.toString(),
      details: {
        email: user.email,
        method: "magic_link_verify",
        roles: roles,
      },
    });

    const res = NextResponse.redirect(`${baseUrl}/`);
    res.cookies.set("auth_token", jwtToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7日間
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (error) {
    console.error("認証検証エラー:", error);

    // エラーをログに記録
    await createLog({
      action: LogAction.LOGIN,
      target_type: TargetType.SYSTEM,
      details: {
        error: "verification_error",
        message: (error as Error).message,
      },
    });

    return NextResponse.redirect(`${baseUrl}/login?error=server`);
  }
}
