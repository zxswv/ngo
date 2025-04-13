// react-calendarを使用したカスタムカレンダーの実装例
// 2023年10月時点の最新のreact-calendarを使用

"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Schedule = {
  date: string;
  start: string;
  end: string;
  memo: string;
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [schedules, setSchedules] = useState<Record<string, Schedule[]>>({});
  const [showMemo, setShowModal] = useState(false);
  const [form, setForm] = useState({ start: "", end: "", memo: "" });

  const onDateChange = (date: Date) => {
    setSelectedDate(date);
    setForm({ start: "", end: "", memo: "" });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toDateString();
    const newSchedule: Schedule = {
      date: dateStr,
      start: form.start,
      end: form.end,
      memo: form.memo,
    };
    setSchedules((prev) => ({
      ...prev,
      [dateStr]: [...(prev[dateStr] || []), newSchedule],
    }));
    setShowModal(false);
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const dateStr = date.toDateString();
    return schedules[dateStr] ? "bg-yellow-100 rounded" : "";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📅 カスタムカレンダー</h1>
      <Calendar onClickDay={onDateChange} tileClassName={tileClassName} />
      {showMemo && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
            <h2 className="text-lg font-bold mb-2">
              {selectedDate?.toDateString()}の予定
            </h2>
            <div className="mb-2">
              <label className="block text-sm">開始時間</label>
              <input
                type="time"
                className="w-full border px-2 py-1"
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm">終了時間</label>
              <input
                type="time"
                className="w-full border px-2 py-1"
                value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm">メモ</label>
              <textarea
                className="w-full border px-2 py-1"
                rows={2}
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
              ></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1 border rounded"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1 bg-blue-500 text-white rounded"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
