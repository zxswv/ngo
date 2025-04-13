// ルートティングセグメント

import Calendar from "../components/calendar/Calendar";
import ScheduleModal from "../components/calendar/modal";
import ScheduleSidebar from "../components/calendar/ScheduleSidebar";
import { CalendarProvider } from "../components/calendar/context";

export default function CalendarPage() {
  return (
    <CalendarProvider>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">オリジナルカレンダー</h1>
        <Calendar />
        <ScheduleSidebar />
        <ScheduleModal />
      </div>
    </CalendarProvider>
  );
}
