// モーダルUI

"use client";

import { useState } from "react";
import { useCalendarContext } from "./context";

export default function ScheduleModal() {
  const { modalOpen, closeModal, selectedDate, addEvent } =
    useCalendarContext();
  const [text, setText] = useState("");

  if (!modalOpen || !selectedDate) return null;

  const key = selectedDate.toDateString();

  const handleSubmit = () => {
    if (!text.trim()) return;
    addEvent(key, text);
    setText("");
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">{key} に予定を追加</h2>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="予定を入力"
          className="border w-full p-2 mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={closeModal} className="text-gray-500">
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
