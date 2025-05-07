// src/app/components/common/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaHome, FaUserCircle, FaBars } from "react-icons/fa";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "ホーム", icon: <FaHome /> },
    { href: "/calendar", label: "カレンダー", icon: <FaCalendarAlt /> },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-bold">📅 Calendar App</div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-4 items-center">
          {links.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-200 ${
                isActive(href) ? "bg-blue-600 text-white" : "text-gray-700"
              }`}
            >
              {icon}
              {label}
            </Link>
          ))}
          <UserMenu />
        </nav>

        {/* Hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <button className="text-2xl" onClick={() => setIsOpen(!isOpen)}>
            <FaBars />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden px-4 pb-3">
          {links.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-200 ${
                isActive(href) ? "bg-blue-600 text-white" : "text-gray-700"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {icon}
              {label}
            </Link>
          ))}
          <div className="mt-2">
            <UserMenu />
          </div>
        </div>
      )}
    </header>
  );
}

function UserMenu() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setEmail(payload.email);
      } catch (e) {
        console.error("無効なトークンです", e);
      }
    }
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "GET" });
    location.reload();
  };

  return (
    <div className="flex items-center gap-3 text-gray-600">
      <FaUserCircle size={20} />
      {email ? (
        <>
          <span>{email}</span>
          <button
            onClick={handleLogout}
            className="text-blue-600 text-sm hover:underline"
          >
            ログアウト
          </button>
        </>
      ) : (
        <Link href="/login" className="text-sm hover:underline">
          ゲスト（ログイン）
        </Link>
      )}
    </div>
  );
}
