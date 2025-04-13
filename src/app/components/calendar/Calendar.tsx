// メインカレンダーUI

"use client";

import { generateCalendar } from "./utils";
import CalendarCell from "./CalendarCell";
import { useCalendarContext } from "./context";

export default function Calendar() {
  const { currentMonth, currentYear } = useCalendarContext();
  const days = generateCalendar(currentYear, currentMonth);

  return (
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
  );
}
