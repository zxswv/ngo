// API：認証リクエスト
// メールアドレスを受け取り、トークンを生成してDBに保存し、メールで送信する
// 10分後に期限切れ
import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../../DB//lib/db";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email)
    return NextResponse.json({ error: "メール必須" }, { status: 400 });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 10); // 10分有効

  await pool.query(
    `
    INSERT INTO users (email, token, token_expires_at)
    VALUES ($1, $2, $3)
    ON CONFLICT (email) DO UPDATE SET token = $2, token_expires_at = $3
  `,
    [email, token, expires]
  );

  const verifyUrl = `${process.env.BASE_URL}/api/auth/verify?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail", // Gmail を使う場合（送信元設定は事前に必要）
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: email,
    from: process.env.MAIL_USER,
    subject: "ログインリンク",
    html: `<p>以下のリンクからログインしてください。</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });

  return NextResponse.json({ success: true });
}
