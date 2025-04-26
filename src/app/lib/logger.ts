// ログユーティリティ
import { pool } from "../DB/lib/db";

// ログアクションの種類
export enum LogAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LOGIN = "login",
  LOGOUT = "logout",
  VIEW = "view"
}

// ターゲットの種類
export enum TargetType {
  EVENT = "event",
  USER = "user",
  ROOM = "room",
  SYSTEM = "system"
}

// ログエントリの型定義
export interface LogEntry {
  id?: number;
  user_id?: string;
  action: LogAction;
  target_type: TargetType;
  target_id?: string;
  details?: Record<string, any>;
  created_at?: string;
}

/**
 * システムログを記録する関数
 */
export async function createLog(logEntry: LogEntry): Promise<void> {
  try {
    const { user_id, action, target_type, target_id, details } = logEntry;
    
    await pool.query(
      `INSERT INTO logs (user_id, action, target_type, target_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id || null, action, target_type, target_id || null, details ? JSON.stringify(details) : null]
    );
  } catch (error) {
    console.error("ログ記録エラー:", error);
    // エラーが発生してもアプリケーションは継続させる
  }
}

/**
 * ログを取得する関数
 */
export async function getLogs(options: {
  limit?: number;
  offset?: number;
  user_id?: string;
  action?: LogAction;
  target_type?: TargetType;
  from_date?: Date;
  to_date?: Date;
} = {}): Promise<LogEntry[]> {
  try {
    const {
      limit = 100,
      offset = 0,
      user_id,
      action,
      target_type,
      from_date,
      to_date
    } = options;
    
    let query = `SELECT * FROM logs WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (user_id) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(user_id);
    }
    
    if (action) {
      query += ` AND action = $${paramIndex++}`;
      params.push(action);
    }
    
    if (target_type) {
      query += ` AND target_type = $${paramIndex++}`;
      params.push(target_type);
    }
    
    if (from_date) {
      query += ` AND created_at >= $${paramIndex++}`;
      params.push(from_date);
    }
    
    if (to_date) {
      query += ` AND created_at <= $${paramIndex++}`;
      params.push(to_date);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("ログ取得エラー:", error);
    return [];
  }
}
