// 日付生成ロジック

export function generateCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();

  const days = [];
  const totalCells = Math.ceil((lastDay.getDate() + startDayOfWeek) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    const date = new Date(year, month, i - startDayOfWeek + 1);
    days.push({
      date,
      isCurrentMonth: date.getMonth() === month,
      isToday: isToday(date),
    });
  }

  return days;
}

function isToday(date: Date) {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}
