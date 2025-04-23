// DBユーティリティ
import { Pool } from "pg";

export const pool = new Pool({
  user: "tt", // ユーザー名
  host: "db", // ホスト名
  database: "DB", // データベース名
  password: "tt", // パスワード
  port: 5432, // ポート番号
});
