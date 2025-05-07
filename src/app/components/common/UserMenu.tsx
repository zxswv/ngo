"use client";

import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";

export default function UserMenu() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // クライアントで cookie をチェック（簡易JWTデコード）
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setEmail(payload.email);
      } catch (e) {
        console.error("Invalid JWT", e);
      }
    }
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout");
    location.reload();
  };

  return (
    <div className="flex items-center gap-4 text-gray-600">
      <FaUserCircle size={20} />
      {email ? (
        <>
          <span>{email}</span>
          <button
            onClick={handleLogout}
            className="text-blue-600 hover:underline text-sm"
          >
            ログアウト
          </button>
        </>
      ) : (
        <Link href="/login" className="hover:underline text-sm">
          ゲスト（ログイン）
        </Link>
      )}
    </div>
  );
}
