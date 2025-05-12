"use client";

import { createContext, useContext, useState, useEffect } from "react";

// イベントの型定義
type Event = {
  id: number;
  user_id: string;
  date: string;
  text: string;
  created_at: string;
};

type CalendarContextType = {
  modalOpen: boolean;
  currentYear: number; //現在の年
  currentMonth: number; //現在の月
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  openModal: () => void;
  closeModal: () => void;
  events: Record<string, string[]>;
  eventObjects: Event[];
  isLoading: boolean;
  addEvent: (dateKey: string, text: string) => Promise<void>;
  deleteEvent: (dateKey: string, index: number) => Promise<void>;
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
  const [eventObjects, setEventObjects] = useState<Event[]>([]); //APIから取得したイベントオブジェクト
  const [isLoading, setIsLoading] = useState(false); //ローディング状態

  // APIからイベントを取得する
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/events");

      if (!response.ok) {
        throw new Error("イベントの取得に失敗しました");
      }

      const data = await response.json();
      setEventObjects(data.events || []);

      // イベントオブジェクトを日付ごとのテキスト配列に変換
      const eventsByDate: Record<string, string[]> = {};
      data.events.forEach((event: Event) => {
        if (!eventsByDate[event.date]) {
          eventsByDate[event.date] = [];
        }
        eventsByDate[event.date].push(event.text);
      });

      setEvents(eventsByDate);
    } catch (error) {
      console.error("イベント取得エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // コンポーネントマウント時にイベントを取得
  useEffect(() => {
    fetchEvents();
  }, []);

  // 日付をキーにしてイベントを追加し、APIに保存
  const addEvent = async (dateKey: string, text: string) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: dateKey, text }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("追加失敗:", error);
        throw new Error("イベントの追加に失敗しました");
      }

      const data = await response.json();
      console.log("追加成功:", data);

      // 新しいイベントをステートに追加
      setEventObjects((prev) => [...prev, data.event]);

      // 日付ごとのイベント配列も更新
      setEvents((prev) => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), text],
      }));
    } catch (error) {
      console.error("イベント追加エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // イベントを削除し、APIから削除
  const deleteEvent = async (dateKey: string, index: number) => {
    try {
      setIsLoading(true);

      // 削除対象のイベントを特定
      const eventsForDate = eventObjects.filter(
        (event) => event.date === dateKey
      );
      if (!eventsForDate[index]) {
        throw new Error("削除対象のイベントが見つかりません");
      }

      const eventId = eventsForDate[index].id;

      const response = await fetch("/api/events", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: eventId }),
      });

      if (!response.ok) {
        throw new Error("イベントの削除に失敗しました");
      }

      // ステートからイベントを削除
      setEventObjects((prev) => prev.filter((event) => event.id !== eventId));

      // 日付ごとのイベント配列も更新
      setEvents((prev) => {
        const updated = { ...prev };
        updated[dateKey].splice(index, 1);
        return { ...updated };
      });
    } catch (error) {
      console.error("イベント削除エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 前の月に移動
  const prevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  // 次の月に移動
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
        currentYear,
        currentMonth,
        prevMonth,
        nextMonth,
        selectedDate,
        setSelectedDate,
        modalOpen,
        openModal: () => setModalOpen(true),
        closeModal: () => setModalOpen(false),
        events,
        eventObjects,
        isLoading,
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
