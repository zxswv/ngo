# .env.local

MAIL_USER=your@gmail.com #メールアドレス
MAIL_PASS=your-gmail-app-password #Gmail のアプリパスワード

BASE_URL=http://localhost:3100 #API の URL
JWT_SECRET=super_strong_and_random_secret_key #JWT のシークレットキー

# 実装予定

ハンバーガーメニュー化
予定表示
認証メール送信＆トークン DB 保存の動作確認

ログイン後のカレンダー連携

# 技術スタック

## 共通

Node.js
Next.js

## フロントエンド

React

## バックエンド

## データベース

PostgreSQL

## ライブラリー

framer-motion
react-icons
nodemailer
npm install nodemailer
TypeScript を使用している場合は、型定義もインストールする
npm install --save-dev @types/nodemailer

# サーバーコマンド一覧

## 起動コマンド

```bash
npm run dev # next.jsの起動コマンド
# or
npm run build # 確認コマンド
# or
docker-compose up # 起動コマンド
# or

```

## docker 操作

```bash
docker-compose up # 起動コマンド
# or
docker-compose up -d # 動作確認
# or
docker compose exec database bash # dockerからMySQLコンテナ(database)に接続
# or
docker inspect -f '{{.Name}} - {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -aq) # コンテナのIPアドレスを表示
# or
docker volume rm ボリューム名 # volumeの削除
# or
docker volume ls # ボリューム一覧
# or
docker ps -a --filter volume=my-app_database # コンテナID一覧
# or
docker stop コンテナID # コンテナを止める
# or
docker rm コンテナID # コンテナの削除
# or
```

## データベース操作

```bash
docker compose exec database bash # dockerからMySQLコンテナ(database)に接続
# or
mysql -u # MySQLにアクセス
# or
mysql -u root -p # MySQLコンテナ内で、MySQLシェルにrootにログイン
# or
SHOW DATABASES; # データベースの一覧を表示する
# or
SHOW TABLES; # データベースのテーブル一覧を表示する
# or
USE データベース名; # 使用するデータベースを選択する
# or
SHOW TABLES; # テーブルの一覧を表示する
# or
DESCRIBE table_name; # テーブルの構造を表示する
# or
docker ps -a
# or
docker exec -it next.js-test-network-db psql -U tt -d DB  # コンテナ内でユーザー（ロール）を確認
# or
docker exec -it <正しいコンテナ名> psql -U postgres -d DB

docker exec -it next.js-test-network-db ls -l /docker-entrypoint-initdb.d/

```

## SQl

```bash
CREATE DATABASE IF NOT EXISTS データベース名;
#
CREATE DATABASE # 新しいデータベースを作成するコマンドです。
# or
IF NOT EXISTS # 同名のデータベースが既に存在する場合にエラーを防ぐための条件です。


```

### SQL の情報

```bash
  database: #コンテナ2
    image: mysql:8.3.0
    container_name: database #コンテナ名
      MYSQL_ROOT_PASSWORD: tt #rootパスワード
      MYSQL_USER: tt #ユーザ名
      MYSQL_PASSWORD: tt #パスワード
      MYSQL_DATABASE: Reservation_Site #データベース名
    volumes:
      - database:/var/lib/mysql
      - ./../DB/mysql/:/docker-entrypoint-initdb.d #/init.sql #初期化スクリプト
```

### SHOW DATABASES; を実行した際

```bash
    Reservation_Site # 今回使うデータベース名
    information_schema # MySQLデータベースのメタデータ
    mysql # MySQLサーバーに関するユーザーアカウントや特権情報
    performance_schema # MySQLサーバーのパフォーマンスに関する情報
    shop # 今回準備した初期データを入れる用のデータベース
    sys # MySQLの内部管理、セッション、ステートメントなどの情報
```

# docker 説明

### docker-compose.yml と docker-compose-prod.yml 主な違いのまとめ

- 用途の違い\
  docker-compose.yml: 開発環境用。ローカルでの開発とデバッグに最適。\
  docker-compose-prod.yml: 本番環境用。デプロイと運用に最適。\

- 設定の違い:\
  開発用では、ホットリロードやデバッグツールの設定を含むことが多い。\
  本番用では、パフォーマンスやセキュリティを考慮し、不要な開発ツールやデバッグ設定を省略。\

- 環境変数:\
  本番用では NODE_ENV=production のように環境変数を設定し、最適なパフォーマンスを発揮するようにします。\

### docker-compose.yml

主な用途: 開発環境の設定。

- 特徴:

- ローカル開発で必要な設定を含む。
  より頻繁なコード変更やデバッグに対応。\
  デバッグツールやホットリロードなど、開発を助けるための設定が含まれることが多い。\
  ボリュームマウントを利用して、ホストのファイルシステムとコンテナ内のファイルシステムを同期。\

#

### docker-compose-prod.yml

主な用途: 本番環境の設定。

- 特徴:

- 本番環境でのデプロイに必要な設定を含む。\
  高可用性、スケーラビリティ、セキュリティを考慮した設定。\
  デバッグツールやホットリロードなどの開発用の設定を省略。\
  パフォーマンス最適化のための設定が含まれることが多い。

# エラー

401 → JWT Cookie が送られていない / 無効（未ログイン）

403 → ロールに CREATE_EVENTS パーミッションがない

400 → text や date が空

500 → サーバー側で何らかのエラー（DB, SQL 文, 予期しない null など）
