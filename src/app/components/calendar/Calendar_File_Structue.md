## ファイル構成例

```bash
/app
  /calendar
    page.tsx               #// ルーティングエントリ
  /components
    /calendar
      Calendar.tsx         #// メインカレンダーUI       //UI描画とスタイル
      CalendarCell.tsx     #// 各セル                  //UI描画とスタイル
      context.tsx          #// 状態管理用 Context
      modal.tsx            #// モーダルUI              //予定CRUD + モーダルUI
      ScheduleSidebar.tsx  #// 予定表示＆＋ボタン付きUI
      types.ts             #// 型定義
      utils.ts             #// 日付生成ロジック
  /archive                 #// 過去に使ったことのあるページ
```

```bash
isToday: true → bg-blue-100

!isCurrentMonth → text-gray-400

isSelected → bg-blue-500 text-white

祝日などは別ロジックで holidayDates.includes(date.toDateString()) で対応可能
```
