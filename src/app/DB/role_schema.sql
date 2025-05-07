-- src/app/DB/role_schema.sql
-- ロールベースのアクセス制御のためのテーブル

-- ロールテーブル
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- ユーザーロールの関連付けテーブル
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- 権限テーブル
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- ロールと権限の関連付けテーブル
CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- 初期ロールの挿入
INSERT INTO roles (name, description) VALUES
('admin', '管理者：すべての権限を持つ'),
('teacher', '教師：部屋の予約と管理ができる'),
('student', '学生：部屋の予約のみ可能');

-- 初期権限の挿入
INSERT INTO permissions (name, description) VALUES
('view_events', 'イベントの閲覧'),
('create_events', 'イベントの作成'),
('update_events', 'イベントの更新'),
('delete_events', 'イベントの削除'),
('view_logs', 'ログの閲覧'),
('manage_users', 'ユーザーの管理'),
('manage_roles', 'ロールの管理'),
('view_all_events', 'すべてのイベントの閲覧');

-- ロールと権限の関連付け
-- 管理者権限
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'admin';

-- 教師権限
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'teacher' AND p.name IN (
  'view_events', 'create_events', 'update_events', 'delete_events', 'view_all_events'
);

-- 学生権限
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'student' AND p.name IN (
  'view_events', 'create_events', 'update_events', 'delete_events'
);

-- usersテーブルにrole_idカラムを追加（既存のテーブルを変更）
ALTER TABLE users ADD COLUMN default_role_id INTEGER REFERENCES roles(id);
