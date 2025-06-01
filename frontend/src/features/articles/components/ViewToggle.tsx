"use client";

import { useI18n } from "@/features/i18n/hooks/useI18n";

interface ViewToggleProps {
  viewMode: "table" | "card";
  onChange: (mode: "table" | "card") => void;
}

export default function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center space-x-2 bg-[#1d2433] rounded-lg p-1">
      <button
        onClick={() => onChange("table")}
        title={t("articles.tableView")}
        className={`p-2 rounded-md flex items-center justify-center transition-all ${
          viewMode === "table"
            ? "bg-blue-600/80 text-white shadow-md"
            : "text-gray-400 hover:text-gray-200 hover:bg-[#343e50]/50"
        }`}
        aria-label={t("articles.tableView")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M3 14h18M3 18h18M3 6h18"
          />
        </svg>
      </button>

      <button
        onClick={() => onChange("card")}
        title={t("articles.cardView")}
        className={`p-2 rounded-md flex items-center justify-center transition-all ${
          viewMode === "card"
            ? "bg-blue-600/80 text-white shadow-md"
            : "text-gray-400 hover:text-gray-200 hover:bg-[#343e50]/50"
        }`}
        aria-label={t("articles.cardView")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      </button>
    </div>
  );
}
