-- PostgreSQLの初期化スクリプト
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

--ユーザーのトークンを保存するテーブル
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  token TEXT,
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

\i /docker-entrypoint-initdb.d/log_schema.sql;
\i /docker-entrypoint-initdb.d/role_schema.sql;