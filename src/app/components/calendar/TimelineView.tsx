"use client";

import { useCalendarContext } from "./context";
import { motion } from "framer-motion";

export default function TimelineView() {
  const { eventObjects, isLoading } = useCalendarContext();
  
  // イベントを日付でソート（新しい順）
  const sortedEvents = [...eventObjects].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // 日付をフォーマットする関数
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="mt-8 p-4">
        <h2 className="text-xl font-bold mb-4">タイムライン表示</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (sortedEvents.length === 0) {
    return (
      <div className="mt-8 p-4">
        <h2 className="text-xl font-bold mb-4">タイムライン表示</h2>
        <p className="text-gray-500 text-center py-8">予定がありません</p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-4">
      <h2 className="text-xl font-bold mb-4">タイムライン表示</h2>
      <div className="relative">
        {/* 縦線 */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {sortedEvents.map((event, index) => (
          <motion.div 
            key={event.id}
            className="relative pl-12 pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* 丸いマーカー */}
            <div className="absolute left-2 top-1.5 w-5 h-5 rounded-full bg-blue-500 transform -translate-x-1/2"></div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm text-gray-500 mb-1">{formatDate(event.date)}</div>
              <div className="text-lg">{event.text}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
