// 月送りボタンの UI
"use client";

import { useCalendarContext } from "./context";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function MonthHeader() {
  const { currentYear, currentMonth, prevMonth, nextMonth } =
    useCalendarContext();

  const monthLabel = new Date(currentYear, currentMonth).toLocaleString(
    "ja-JP",
    {
      year: "numeric",
      month: "long",
    }
  );

  return (
    <div className="flex items-center justify-between mb-4 px-4">
      <button
        onClick={prevMonth}
        className="text-xl text-gray-600 hover:text-blue-600"
        aria-label="前月"
      >
        <FaChevronLeft />
      </button>

      <h2 className="text-xl font-semibold">{monthLabel}</h2>

      <button
        onClick={nextMonth}
        className="text-xl text-gray-600 hover:text-blue-600"
        aria-label="次月"
      >
        <FaChevronRight />
      </button>
    </div>
  );
}
