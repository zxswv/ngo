// テスト用スクリプト
import { pool } from "../app/DB/lib/db";
import { createLog, LogAction, TargetType } from "../app/lib/logger";
import { Permission, Role, hasPermission, assignRoleToUser, getUserRoles } from "../app/lib/rbac";

/**
 * 各機能の単体テスト
 */
async function runTests() {
  console.log("=== 学校の部屋予約サイト 機能テスト ===");
  
  try {
    // データベース接続テスト
    console.log("\n--- データベース接続テスト ---");
    await testDatabaseConnection();
    
    // ロギング機能テスト
    console.log("\n--- ロギング機能テスト ---");
    await testLoggingSystem();
    
    // ロールベースアクセス制御テスト
    console.log("\n--- ロールベースアクセス制御テスト ---");
    await testRBAC();
    
    console.log("\n=== テスト完了 ===");
  } catch (error) {
    console.error("テスト実行中にエラーが発生しました:", error);
  } finally {
    // テスト終了時にデータベース接続を閉じる
    await pool.end();
  }
}

/**
 * データベース接続テスト
 */
async function testDatabaseConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ データベース接続成功:", result.rows[0].now);
    return true;
  } catch (error) {
    console.error("❌ データベース接続エラー:", error);
    return false;
  }
}

/**
 * ロギング機能テスト
 */
async function testLoggingSystem() {
  try {
    // テスト用ログを作成
    const testLog = {
      user_id: "test_user",
      action: LogAction.VIEW,
      target_type: TargetType.SYSTEM,
      details: { test: true, message: "テストログ" }
    };
    
    await createLog(testLog);
    console.log("✅ ログ作成成功:", testLog);
    
    // ログが正しく保存されたか確認
    const result = await pool.query(
      "SELECT * FROM logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [testLog.user_id]
    );
    
    if (result.rows.length > 0) {
      console.log("✅ ログ取得成功:", result.rows[0]);
    } else {
      console.error("❌ ログが見つかりません");
    }
    
    return true;
  } catch (error) {
    console.error("❌ ロギングシステムテストエラー:", error);
    return false;
  }
}

/**
 * ロールベースアクセス制御テスト
 */
async function testRBAC() {
  try {
    // テスト用ユーザーID
    const testUserId = "test_rbac_user";
    
    // ロールの割り当てテスト
    console.log("ロール割り当てテスト...");
    const assignResult = await assignRoleToUser(testUserId, Role.TEACHER);
    console.log("✅ ロール割り当て結果:", assignResult);
    
    // ユーザーのロール取得テスト
    console.log("ユーザーロール取得テスト...");
    const roles = await getUserRoles(testUserId);
    console.log("✅ ユーザーロール:", roles);
    
    // 権限チェックテスト
    console.log("権限チェックテスト...");
    const canViewEvents = await hasPermission(testUserId, Permission.VIEW_EVENTS);
    console.log("✅ VIEW_EVENTS権限:", canViewEvents);
    
    const canManageUsers = await hasPermission(testUserId, Permission.MANAGE_USERS);
    console.log("✅ MANAGE_USERS権限:", canManageUsers);
    
    return true;
  } catch (error) {
    console.error("❌ RBACテストエラー:", error);
    return false;
  }
}

// テスト実行
runTests();
