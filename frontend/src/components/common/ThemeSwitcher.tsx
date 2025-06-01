"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // マウント後のみ描画（SSR対策）
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      aria-label={isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={isDark ? "ライトモード" : "ダークモード"}
    >
      {isDark ? (
        // Sun icon (Heroicons) - 白黒
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m0 13.5V21m8.25-9H21M3 12h2.25m12.02 6.02l1.59 1.59m-13.44-13.44l1.59 1.59m0 10.26l-1.59 1.59m13.44-13.44l-1.59 1.59M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
          />
        </svg>
      ) : (
        // Moon icon (Heroicons) - 白黒
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0112 21.75c-5.385 0-9.75-4.365-9.75-9.75 0-4.136 2.664-7.64 6.442-9.049a.75.75 0 01.908.911A7.501 7.501 0 0019.5 15.75a.75.75 0 01.911.908z"
          />
        </svg>
      )}
    </button>
  );
}
