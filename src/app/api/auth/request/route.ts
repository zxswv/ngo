// API：認証リクエスト（ログ機能とロール連携強化版）
import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../../DB/lib/db";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { createLog, LogAction, TargetType } from "@/app/lib/logger";
import { Role, assignRoleToUser } from "@/app/lib/rbac";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email)
    return NextResponse.json({ error: "メール必須" }, { status: 400 });

  try {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 10); // 10分有効

    // ユーザーが存在するか確認
    const checkResult = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    const isNewUser = checkResult.rows.length === 0;

    // ユーザーを作成または更新
    const userResult = await pool.query(
      `
      INSERT INTO users (email, token, token_expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET token = $2, token_expires_at = $3
      RETURNING id
    `,
      [email, token, expires]
    );

    const userId = userResult.rows[0].id;

    // 新規ユーザーの場合、デフォルトロール（学生）を割り当て
    if (isNewUser) {
      await assignRoleToUser(userId.toString(), Role.STUDENT);
      
      // 新規ユーザー作成をログに記録
      await createLog({
        action: LogAction.CREATE,
        target_type: TargetType.USER,
        target_id: userId.toString(),
        details: { email, isNewUser: true }
      });
    }

    const verifyUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail", // Gmail を使う場合（送信元設定は事前に必要）
      auth: {
        user: process.env.MAIL_USER || 'test@example.com',
        pass: process.env.MAIL_PASS || 'password',
      },
    });

    await transporter.sendMail({
      to: email,
      from: process.env.MAIL_USER || 'test@example.com',
      subject: "学校の部屋予約サイト - ログインリンク",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a5568;">学校の部屋予約サイト</h2>
          <p>以下のリンクからログインしてください。このリンクは10分間有効です。</p>
          <div style="margin: 20px 0;">
            <a href="${verifyUrl}" style="background-color: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              ログインする
            </a>
          </div>
          <p style="color: #718096; font-size: 0.9em;">
            このメールに心当たりがない場合は、無視してください。
          </p>
        </div>
      `,
    });

    // ログイン試行をログに記録
    await createLog({
      action: LogAction.LOGIN,
      target_type: TargetType.USER,
      target_id: userId.toString(),
      details: { email, method: "magic_link_request" }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("認証リクエストエラー:", error);
    return NextResponse.json({ error: "認証リクエストに失敗しました" }, { status: 500 });
  }
}
