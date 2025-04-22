// ログインフォーム

"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleLogin = async () => {
    const res = await fetch("/api/auth/request", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) setSent(true);
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">ログイン</h1>
      {sent ? (
        <p>メールを送信しました。ご確認ください。</p>
      ) : (
        <>
          <input
            type="email"
            className="border px-4 py-2 w-full mb-4"
            placeholder="メールアドレス"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-4 py-2 w-full"
          >
            ログインリンクを送信
          </button>
        </>
      )}
    </div>
  );
}
