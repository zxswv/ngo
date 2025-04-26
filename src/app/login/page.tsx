"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiArrowRight } from "react-icons/fi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // クエリパラメータからエラーを取得
  const getErrorFromQuery = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      
      if (error === "invalid") {
        return "リンクが無効または期限切れです。再度ログインリンクをリクエストしてください。";
      } else if (error === "server") {
        return "サーバーエラーが発生しました。しばらく経ってから再度お試しください。";
      } else if (error === "no_token") {
        return "トークンが見つかりません。再度ログインリンクをリクエストしてください。";
      }
    }
    return "";
  };

  // ログインリンクをリクエスト
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;
    
    try {
      setIsSubmitting(true);
      setStatus("idle");
      setErrorMessage("");
      
      const response = await fetch("/api/auth/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "ログインリンクの送信に失敗しました");
      }
      
      setStatus("success");
    } catch (error) {
      console.error("ログインエラー:", error);
      setStatus("error");
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            学校の部屋予約サイト
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            メールアドレスを入力してログインリンクを取得してください
          </p>
        </div>
        
        {/* エラーメッセージ */}
        {(status === "error" || getErrorFromQuery()) && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">エラー</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorMessage || getErrorFromQuery()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 成功メッセージ */}
        {status === "success" && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">メール送信完了</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>ログインリンクを {email} に送信しました。メールをご確認ください。</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                メールアドレス
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting || status === "success"}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting || status === "success"
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
              disabled={isSubmitting || status === "success"}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {isSubmitting ? (
                  <div className="animate-spin h-5 w-5 text-blue-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <FiArrowRight className="h-5 w-5 text-blue-300 group-hover:text-blue-200" />
                )}
              </span>
              {isSubmitting ? "送信中..." : "ログインリンクを送信"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
