// 予定表示＆＋ボタン付きUI

"use client";

import { useCalendarContext } from "./context";

export default function ScheduleSidebar() {
  const { selectedDate, openModal, events, deleteEvent } = useCalendarContext();

  if (!selectedDate) return null;

  const key = selectedDate
    .toLocaleDateString("ja-JP", {
      weekday: "long", // 曜日
      year: "numeric", // 年
      month: "2-digit", // 月（2桁表示）
      day: "2-digit", // 日（2桁表示）
    })
    .replace(/(\d{4})\/(\d{2})\/(\d{2})/, "$2月$3日"); // フォーマットを変更

  const list = events[key] || [];

  return (
    <div className="mt-6 border-t pt-4 animate-slideUp">
      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">{key} の予定</h2>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={openModal}
          >
            ＋
          </button>
        </div>
        {list.length === 0 ? (
          <p className="text-gray-500">予定はありません</p>
        ) : (
          <ul className="space-y-1">
            {list.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{item}</span>
                <button
                  onClick={() => deleteEvent(key, idx)}
                  className="text-red-500 text-sm"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
