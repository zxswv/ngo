// "use client";
import "./globals.css";
import type { Metadata } from "next";
import Navbar from "./components/common/Navbar";

export const metadata: Metadata = {
  title: "Next.js カレンダー",
  description: "カスタムスケジューラ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-800">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
