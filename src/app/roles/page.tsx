"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiUsers, FiUserCheck, FiUserX, FiRefreshCw } from "react-icons/fi";

type Role = {
  id: number;
  name: string;
  description: string;
};

type Permission = {
  id: number;
  name: string;
  description: string;
};

type User = {
  id: number;
  email: string;
  roles: string[];
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ロールとユーザー情報を取得
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ロールとパーミッション情報を取得
      const rolesResponse = await fetch("/api/roles");
      if (!rolesResponse.ok) {
        throw new Error("ロール情報の取得に失敗しました");
      }
      const rolesData = await rolesResponse.json();
      setRoles(rolesData.roles || []);
      setPermissions(rolesData.permissions || []);
      
      // ユーザー情報を取得
      const usersResponse = await fetch("/api/users");
      if (!usersResponse.ok) {
        throw new Error("ユーザー情報の取得に失敗しました");
      }
      const usersData = await usersResponse.json();
      setUsers(usersData.users || []);
    } catch (error) {
      console.error("データ取得エラー:", error);
      setError("データの取得中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // コンポーネントマウント時にデータを取得
  useEffect(() => {
    fetchData();
  }, []);

  // ユーザーにロールを割り当てる
  const assignRole = async () => {
    if (!selectedUser || !selectedRole) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser,
          roleName: selectedRole,
        }),
      });
      
      if (!response.ok) {
        throw new Error("ロールの割り当てに失敗しました");
      }
      
      // 成功したら再取得
      await fetchData();
      
      // 選択をリセット
      setSelectedUser(null);
      setSelectedRole("");
    } catch (error) {
      console.error("ロール割り当てエラー:", error);
      setError("ロールの割り当て中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ユーザーからロールを削除
  const removeRole = async (userId: number, roleName: string) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/roles", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          roleName,
        }),
      });
      
      if (!response.ok) {
        throw new Error("ロールの削除に失敗しました");
      }
      
      // 成功したら再取得
      await fetchData();
    } catch (error) {
      console.error("ロール削除エラー:", error);
      setError("ロールの削除中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">権限管理</h1>
          <button
            onClick={fetchData}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            disabled={isLoading}
          >
            <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            更新
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-lg text-red-600 mb-6">{error}</div>
        )}
        
        {/* ロール一覧 */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">システムロール</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => (
                <div key={role.id} className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-lg">{getRoleName(role.name)}</h3>
                  <p className="text-gray-600 text-sm">{role.description}</p>
                  <div className="mt-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase mt-2">権限:</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {permissions
                        .filter(p => {
                          // ロールに応じた権限をフィルタリング（実際のデータに合わせて調整）
                          if (role.name === 'admin') return true;
                          if (role.name === 'teacher') {
                            return ['view_events', 'create_events', 'update_events', 'delete_events', 'view_all_events'].includes(p.name);
                          }
                          if (role.name === 'student') {
                            return ['view_events', 'create_events', 'update_events', 'delete_events'].includes(p.name);
                          }
                          return false;
                        })
                        .map(p => (
                          <span key={p.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {p.name}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* ユーザーロール管理 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">ユーザーロール管理</h2>
          
          {/* ロール割り当てフォーム */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-3">ロールの割り当て</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ユーザー</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={selectedUser || ""}
                  onChange={(e) => setSelectedUser(Number(e.target.value) || null)}
                  disabled={isSubmitting}
                >
                  <option value="">選択してください</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ロール</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">選択してください</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {getRoleName(role.name)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={assignRole}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors w-full"
                  disabled={!selectedUser || !selectedRole || isSubmitting}
                >
                  {isSubmitting ? '処理中...' : 'ロールを割り当て'}
                </button>
              </div>
            </div>
          </div>
          
          {/* ユーザー一覧 */}
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
              ユーザーが見つかりません
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ユーザー
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ロール
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiUsers className="mr-2 text-gray-400" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length > 0 ? (
                            user.roles.map((role, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center"
                              >
                                <FiUserCheck className="mr-1" />
                                {getRoleName(role)}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">ロールなし</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {user.roles.map((role, index) => (
                            <button
                              key={index}
                              onClick={() => removeRole(user.id, role)}
                              className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200 transition-colors flex items-center"
                              disabled={isSubmitting}
                            >
                              <FiUserX className="mr-1" />
                              {getRoleName(role)}を削除
                            </button>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
