// DBユーティリティ
import { Pool } from "pg";

export const pool = new Pool({
  user: "calendar_user",
  host: "localhost",
  database: "calendar_db",
  password: "calendar_pass",
  port: 5432,
});
