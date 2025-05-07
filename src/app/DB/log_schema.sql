-- データベースのログテーブル作成用SQL
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- インデックスを追加して検索を高速化
CREATE INDEX logs_user_id_idx ON logs(user_id);
CREATE INDEX logs_action_idx ON logs(action);
CREATE INDEX logs_created_at_idx ON logs(created_at);
