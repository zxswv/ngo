// グローバルナビゲーション
// 2024/04/13

"use client";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded ${
        isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </Link>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-sans bg-gray-50 text-gray-800">
        <header className="bg-white shadow mb-4">
          <div className="max-w-5xl mx-auto px-4 py-3 flex gap-4 items-center">
            <h1 className="text-xl font-bold">My Calendar App</h1>
            <nav className="flex gap-2 ml-auto">
              <NavLink href="/" label="ホーム" />
              <NavLink href="/calendar" label="カレンダー" />
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4">{children}</main>
      </body>
    </html>
  );
}
