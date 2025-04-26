"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiKey, FiShield, FiSave, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  roles: string[];
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const router = useRouter();

  // プロファイル情報を取得
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/profile");
      
      if (!response.ok) {
        if (response.status === 401) {
          // 未認証の場合はログインページにリダイレクト
          router.push("/login");
          return;
        }
        throw new Error("プロファイルの取得に失敗しました");
      }
      
      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      console.error("プロファイル取得エラー:", error);
      setError("プロファイルの取得中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // コンポーネントマウント時にプロファイルを取得
  useEffect(() => {
    fetchProfile();
  }, []);

  // ログアウト処理
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("ログアウトに失敗しました");
      }
      
      // ログインページにリダイレクト
      router.push("/login");
    } catch (error) {
      console.error("ログアウトエラー:", error);
      setError("ログアウト中にエラーが発生しました");
    }
  };

  // ロール名を日本語に変換
  const getRoleName = (roleName: string): string => {
    const roleMap: Record<string, string> = {
      'admin': '管理者',
      'teacher': '教師',
      'student': '学生'
    };
    return roleMap[roleName] || roleName;
  };

  // 日付をフォーマット
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-6">ユーザープロファイル</h1>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-lg text-red-600 mb-6">{error}</div>
        )}
        
        {saveMessage && (
          <div className={`p-4 rounded-lg mb-6 ${saveMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {saveMessage.text}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : profile ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FiUser className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="ml-4 text-xl font-semibold">アカウント情報</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                  <FiMail className="mr-2" />
                  メールアドレス
                </div>
                <p className="text-gray-900">{profile.email}</p>
              </div>
              
              <div>
                <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                  <FiShield className="mr-2" />
                  ロール
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.roles.length > 0 ? (
                    profile.roles.map((role, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {getRoleName(role)}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">ロールなし</span>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                  <FiKey className="mr-2" />
                  アカウント作成日
                </div>
                <p className="text-gray-900">{formatDate(profile.created_at)}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                >
                  <FiLogOut className="mr-2" />
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
            プロファイル情報が見つかりません
          </div>
        )}
      </motion.div>
    </div>
  );
}
