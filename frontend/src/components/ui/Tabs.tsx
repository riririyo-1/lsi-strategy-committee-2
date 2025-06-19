"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onTabChange,
  className = ""
}) => {
  return (
    <div className={className}>
      {/* タブナビゲーション */}
      <div className="mb-8">
        <div className="border-b border-white/20">
          <nav className="-mb-px flex space-x-8">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === item.id
                    ? "border-blue-400 text-blue-300"
                    : "border-transparent text-white/70 hover:text-white hover:border-white/30"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* タブコンテンツ */}
      <div>
        {items.find(item => item.id === activeTab)?.content}
      </div>
    </div>
  );
};