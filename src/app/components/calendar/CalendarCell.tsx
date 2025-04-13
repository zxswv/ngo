// 各セル

"use client";

import { useCalendarContext } from "./context";

type Props = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export default function CalendarCell({ date, isCurrentMonth, isToday }: Props) {
  const { selectedDate, setSelectedDate } = useCalendarContext();

  const isSelected = selectedDate?.toDateString() === date.toDateString();

  const style = `
    p-2 text-center border rounded cursor-pointer 
    ${isCurrentMonth ? "text-black" : "text-gray-400"}
    ${isToday ? "bg-blue-100" : ""}
    ${isSelected ? "bg-blue-500 text-white" : ""}
    `;

  return (
    <div className={style} onClick={() => setSelectedDate(date)}>
      {date.getDate()}
    </div>
  );
}
