// メインカレンダーUI

"use client";

import { generateCalendar } from "./utils";
import { useCalendarContext } from "./context";
import CalendarCell from "./CalendarCell";
import MonthHeader from "./MonthHeader";

export default function Calendar() {
  const { currentMonth, currentYear } = useCalendarContext();
  const days = generateCalendar(currentYear, currentMonth);

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <MonthHeader />
      <div className="grid grid-cols-7 gap-1">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day} className="text-center font-bold">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <CalendarCell key={index} {...day} />
        ))}
      </div>
      <div className="text-center text-gray-500">
        表示中の月: {currentYear}年 {currentMonth + 1}月
      </div>
    </div>
  );
}
