"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogAction, TargetType, LogEntry } from "@/app/lib/logger";
import { FiClock, FiUser, FiTarget, FiActivity, FiInfo } from "react-icons/fi";

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    action: "" as LogAction | "",
    targetType: "" as TargetType | "",
  });

  // ログを取得する関数
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let url = "/api/logs?limit=100";
      if (filter.action) url += `&action=${filter.action}`;
      if (filter.targetType) url += `&target_type=${filter.targetType}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("ログの取得に失敗しました");
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("ログ取得エラー:", error);
      setError("ログの取得中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // コンポーネントマウント時とフィルター変更時にログを取得
  useEffect(() => {
    fetchLogs();
  }, [filter]);

  // アクション名を日本語に変換
  const getActionLabel = (action: LogAction): string => {
    const actionMap: Record<LogAction, string> = {
      [LogAction.CREATE]: "作成",
      [LogAction.UPDATE]: "更新",
      [LogAction.DELETE]: "削除",
      [LogAction.LOGIN]: "ログイン",
      [LogAction.LOGOUT]: "ログアウト",
      [LogAction.VIEW]: "閲覧"
    };
    return actionMap[action] || action;
  };

  // ターゲットタイプを日本語に変換
  const getTargetTypeLabel = (targetType: TargetType): string => {
    const targetTypeMap: Record<TargetType, string> = {
      [TargetType.EVENT]: "予定",
      [TargetType.USER]: "ユーザー",
      [TargetType.ROOM]: "部屋",
      [TargetType.SYSTEM]: "システム"
    };
    return targetTypeMap[targetType] || targetType;
  };

  // 日時をフォーマット
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-6">システムログ</h1>
        
        {/* フィルターセクション */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-3">フィルター</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">アクション</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={filter.action}
                onChange={(e) => setFilter({ ...filter, action: e.target.value as LogAction | "" })}
              >
                <option value="">すべて</option>
                {Object.values(LogAction).map((action) => (
                  <option key={action} value={action}>
                    {getActionLabel(action)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">対象タイプ</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={filter.targetType}
                onChange={(e) => setFilter({ ...filter, targetType: e.target.value as TargetType | "" })}
              >
                <option value="">すべて</option>
                {Object.values(TargetType).map((type) => (
                  <option key={type} value={type}>
                    {getTargetTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* ログ一覧 */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-600">{error}</div>
        ) : logs.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
            ログが見つかりません
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ユーザー
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      対象
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      詳細
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiClock className="mr-2 text-gray-400" />
                          {log.created_at ? formatDate(log.created_at) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiUser className="mr-2 text-gray-400" />
                          {log.user_id || 'システム'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiActivity className="mr-2 text-blue-500" />
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {getActionLabel(log.action)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiTarget className="mr-2 text-gray-400" />
                          {getTargetTypeLabel(log.target_type)}
                          {log.target_id && ` (${log.target_id})`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiInfo className="mr-2 text-gray-400" />
                          {log.details ? JSON.stringify(log.details) : '-'}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
