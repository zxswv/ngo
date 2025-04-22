// クライアントでログイン状態取得
"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export function getUserFromCookie() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return null;

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    return user;
  } catch {
    return null;
  }
}
