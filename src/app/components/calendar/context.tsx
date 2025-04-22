// 状態管理用 Context

"use client";

import { createContext, useContext, useState } from "react";

type CalendarContextType = {
  modalOpen: boolean;
  currentYear: number; //現在の年
  currentMonth: number; //現在の月
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  openModal: () => void;
  closeModal: () => void;
  events: Record<string, string[]>;
  addEvent: (dateKey: string, text: string) => void;
  deleteEvent: (dateKey: string, index: number) => void;
  prevMonth: () => void; //前の月に移動するための関数
  nextMonth: () => void; //次の月に移動するための関数
};

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear()); //現在の年
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); //現在の月
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); //選択された日付
  const [modalOpen, setModalOpen] = useState(false); //モーダルの開閉状態
  const [events, setEvents] = useState<Record<string, string[]>>({}); //イベントの状態

  //日付をキーにしてイベントを管理するための状態
  const addEvent = (dateKey: string, text: string) => {
    setEvents((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), text],
    }));
  };

  //イベントを削除するための関数
  const deleteEvent = (dateKey: string, index: number) => {
    setEvents((prev) => {
      const updated = { ...prev };
      updated[dateKey].splice(index, 1);
      return { ...updated };
    });
  };

  //次の月に移動するための関数
  const prevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  //前の月に移動するための関数
  const nextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  return (
    <CalendarContext.Provider
      value={{
        currentYear, //現在の年
        currentMonth, //現在の月
        prevMonth, //前の月に移動するための関数
        nextMonth, //次の月に移動するための関数
        selectedDate, //選択された日付
        setSelectedDate, //選択された日付を設定するための関数
        modalOpen, //モーダルの開閉状態
        openModal: () => setModalOpen(true), //モーダルを開くための関数
        closeModal: () => setModalOpen(false), //モーダルを閉じるための関数
        events, //イベントの状態
        addEvent, //イベントを追加するための関数
        deleteEvent, //イベントを削除するための関数
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
