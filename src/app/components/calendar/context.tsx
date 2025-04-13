// 状態管理用 Context

"use client";

import { createContext, useContext, useState } from "react";

type CalendarContextType = {
  currentYear: number;
  currentMonth: number;
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  events: Record<string, string[]>;
  addEvent: (dateKey: string, text: string) => void;
  deleteEvent: (dateKey: string, index: number) => void;
};

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const today = new Date();
  const [currentYear] = useState(today.getFullYear());
  const [currentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [events, setEvents] = useState<Record<string, string[]>>({});

  const addEvent = (dateKey: string, text: string) => {
    setEvents((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), text],
    }));
  };

  const deleteEvent = (dateKey: string, index: number) => {
    setEvents((prev) => {
      const updated = { ...prev };
      updated[dateKey].splice(index, 1);
      return { ...updated };
    });
  };

  return (
    <CalendarContext.Provider
      value={{
        currentYear,
        currentMonth,
        selectedDate,
        setSelectedDate,
        modalOpen,
        openModal: () => setModalOpen(true),
        closeModal: () => setModalOpen(false),
        events,
        addEvent,
        deleteEvent,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarContext() {
  const context = useContext(CalendarContext);
  if (!context)
    throw new Error("useCalendarContext must be used inside Provider");
  return context;
}
