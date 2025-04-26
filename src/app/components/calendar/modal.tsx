"use client";

import { useState } from "react";
import { useCalendarContext } from "./context";

export default function ScheduleModal() {
  const { modalOpen, closeModal, selectedDate, addEvent, isLoading } =
    useCalendarContext();
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!modalOpen || !selectedDate) return null;

  const key = selectedDate.toDateString();
  const formattedDate = new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(selectedDate);

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await addEvent(key, text);
      setText("");
      closeModal();
    } catch (error) {
      console.error("予定追加エラー:", error);
      // エラー処理を追加することも可能
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90vw]">
        <h2 className="text-xl font-bold mb-2">{formattedDate}</h2>
        <p className="text-gray-500 mb-4">予定を追加</p>
        
        <div className="mb-4">
          <label htmlFor="event-text" className="block text-sm font-medium text-gray-700 mb-1">
            予定内容
          </label>
          <input
            id="event-text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="予定を入力してください"
            className="border border-gray-300 rounded-md w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting || isLoading}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button 
            onClick={closeModal} 
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            disabled={isSubmitting || isLoading}
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md transition-colors ${
              isSubmitting || isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? '処理中...' : '追加'}
          </button>
        </div>
      </div>
    </div>
  );
}
