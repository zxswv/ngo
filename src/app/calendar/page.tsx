"use client";

import Calendar from "../components/calendar/Calendar";
import ScheduleModal from "../components/calendar/modal";
import ScheduleSidebar from "../components/calendar/ScheduleSidebar";
import TimelineView from "../components/calendar/TimelineView";
import { CalendarProvider } from "../components/calendar/context";
import { motion } from "framer-motion";

export default function CalendarPage() {
  return (
    <CalendarProvider>
      <motion.div 
        className="p-8 max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-6">部屋予約カレンダー</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Calendar />
          </div>
          <div>
            <ScheduleSidebar />
          </div>
        </div>
        
        <TimelineView />
        <ScheduleModal />
      </motion.div>
    </CalendarProvider>
  );
}
