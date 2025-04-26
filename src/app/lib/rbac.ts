// ロールベースのアクセス制御ユーティリティ
import { pool } from "../DB/lib/db";

// 権限の種類
export enum Permission {
  VIEW_EVENTS = "view_events",
  CREATE_EVENTS = "create_events",
  UPDATE_EVENTS = "update_events",
  DELETE_EVENTS = "delete_events",
  VIEW_LOGS = "view_logs",
  MANAGE_USERS = "manage_users",
  MANAGE_ROLES = "manage_roles",
  VIEW_ALL_EVENTS = "view_all_events"
}

// ロールの種類
export enum Role {
  ADMIN = "admin",
  TEACHER = "teacher",
  STUDENT = "student"
}

// ユーザーのロール情報を取得
export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const result = await pool.query(
      `SELECT r.name 
       FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId]
    );
    
    return result.rows.map(row => row.name);
  } catch (error) {
    console.error("ユーザーロール取得エラー:", error);
    return [];
  }
}

// ユーザーの権限を取得
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const result = await pool.query(
      `SELECT DISTINCT p.name 
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId]
    );
    
    return result.rows.map(row => row.name);
  } catch (error) {
    console.error("ユーザー権限取得エラー:", error);
    return [];
  }
}

// ユーザーが特定の権限を持っているか確認
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(userId);
    return permissions.includes(permission);
  } catch (error) {
    console.error("権限確認エラー:", error);
    return false;
  }
}

// ユーザーが特定のロールを持っているか確認
export async function hasRole(userId: string, role: Role): Promise<boolean> {
  try {
    const roles = await getUserRoles(userId);
    return roles.includes(role);
  } catch (error) {
    console.error("ロール確認エラー:", error);
    return false;
  }
}

// ユーザーにロールを割り当てる
export async function assignRoleToUser(userId: string, roleName: Role): Promise<boolean> {
  try {
    // ロールIDを取得
    const roleResult = await pool.query(
      "SELECT id FROM roles WHERE name = $1",
      [roleName]
    );
    
    if (roleResult.rows.length === 0) {
      throw new Error(`ロール '${roleName}' が見つかりません`);
    }
    
    const roleId = roleResult.rows[0].id;
    
    // ユーザーにロールを割り当て（既に割り当てられている場合は無視）
    await pool.query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, role_id) DO NOTHING`,
      [userId, roleId]
    );
    
    return true;
  } catch (error) {
    console.error("ロール割り当てエラー:", error);
    return false;
  }
}

// ユーザーからロールを削除
export async function removeRoleFromUser(userId: string, roleName: Role): Promise<boolean> {
  try {
    // ロールIDを取得
    const roleResult = await pool.query(
      "SELECT id FROM roles WHERE name = $1",
      [roleName]
    );
    
    if (roleResult.rows.length === 0) {
      throw new Error(`ロール '${roleName}' が見つかりません`);
    }
    
    const roleId = roleResult.rows[0].id;
    
    // ユーザーからロールを削除
    await pool.query(
      "DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2",
      [userId, roleId]
    );
    
    return true;
  } catch (error) {
    console.error("ロール削除エラー:", error);
    return false;
  }
}

// 全ロール一覧を取得
export async function getAllRoles(): Promise<{id: number, name: string, description: string}[]> {
  try {
    const result = await pool.query(
      "SELECT id, name, description FROM roles ORDER BY id"
    );
    
    return result.rows;
  } catch (error) {
    console.error("ロール一覧取得エラー:", error);
    return [];
  }
}

// 全権限一覧を取得
export async function getAllPermissions(): Promise<{id: number, name: string, description: string}[]> {
  try {
    const result = await pool.query(
      "SELECT id, name, description FROM permissions ORDER BY id"
    );
    
    return result.rows;
  } catch (error) {
    console.error("権限一覧取得エラー:", error);
    return [];
  }
}
