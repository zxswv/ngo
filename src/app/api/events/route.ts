// API: イベント管理（権限制御付き）
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/app/DB/lib/db";
import jwt from "jsonwebtoken";
import { createLog, LogAction, TargetType } from "@/app/lib/logger";
import { Permission, hasPermission } from "@/app/lib/rbac";
import { getUserFromRequest } from "@/app/lib/permission-middleware";

// イベント一覧を取得
export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  
  try {
    // VIEW_ALL_EVENTSの権限があるかチェック
    const canViewAll = await hasPermission(user.userId, Permission.VIEW_ALL_EVENTS);
    
    let result;
    if (canViewAll) {
      // 全てのイベントを取得できる権限がある場合
      result = await pool.query(
        "SELECT * FROM events ORDER BY created_at DESC"
      );
    } else {
      // 自分のイベントのみ取得
      result = await pool.query(
        "SELECT * FROM events WHERE user_id = $1 ORDER BY created_at DESC",
        [user.userId]
      );
    }
    
    // ログを記録
    await createLog({
      user_id: user.userId,
      action: LogAction.VIEW,
      target_type: TargetType.EVENT,
      details: { count: result.rows.length, viewAll: canViewAll }
    });
    
    return NextResponse.json({ events: result.rows });
  } catch (error) {
    console.error("イベント取得エラー:", error);
    return NextResponse.json({ error: "イベントの取得に失敗しました" }, { status: 500 });
  }
}

// 新しいイベントを作成
export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  
  try {
    // CREATE_EVENTSの権限があるかチェック
    const canCreate = await hasPermission(user.userId, Permission.CREATE_EVENTS);
    
    if (!canCreate) {
      return NextResponse.json({ error: "イベントを作成する権限がありません" }, { status: 403 });
    }
    
    const { date, text } = await request.json();
    
    if (!date || !text) {
      return NextResponse.json({ error: "日付とテキストは必須です" }, { status: 400 });
    }
    
    const result = await pool.query(
      "INSERT INTO events (user_id, date, text) VALUES ($1, $2, $3) RETURNING *",
      [user.userId, date, text]
    );
    
    const newEvent = result.rows[0];
    
    // ログを記録
    await createLog({
      user_id: user.userId,
      action: LogAction.CREATE,
      target_type: TargetType.EVENT,
      target_id: newEvent.id.toString(),
      details: { date, text }
    });
    
    return NextResponse.json({ event: newEvent });
  } catch (error) {
    console.error("イベント作成エラー:", error);
    return NextResponse.json({ error: "イベントの作成に失敗しました" }, { status: 500 });
  }
}

// イベントを削除
export async function DELETE(request: NextRequest) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: "イベントIDは必須です" }, { status: 400 });
    }
    
    // 削除前にイベント情報を取得
    const checkResult = await pool.query(
      "SELECT * FROM events WHERE id = $1",
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
    }
    
    const eventToDelete = checkResult.rows[0];
    
    // 自分のイベントか、または全てのイベントを削除できる権限があるかチェック
    const isOwnEvent = eventToDelete.user_id === user.userId;
    const canDeleteAll = await hasPermission(user.userId, Permission.DELETE_EVENTS);
    
    if (!isOwnEvent && !canDeleteAll) {
      return NextResponse.json({ error: "このイベントを削除する権限がありません" }, { status: 403 });
    }
    
    await pool.query("DELETE FROM events WHERE id = $1", [id]);
    
    // ログを記録
    await createLog({
      user_id: user.userId,
      action: LogAction.DELETE,
      target_type: TargetType.EVENT,
      target_id: id.toString(),
      details: { 
        date: eventToDelete.date,
        text: eventToDelete.text,
        isOwnEvent
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("イベント削除エラー:", error);
    return NextResponse.json({ error: "イベントの削除に失敗しました" }, { status: 500 });
  }
}
