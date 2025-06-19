"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  placeholder?: string;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ 
  selected, 
  onSelect, 
  placeholder = '日付を選択',
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(selected || new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDayClick = (day: Date) => {
    onSelect(day);
    setIsOpen(false);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    setCurrentDate(new Date(currentDate.getFullYear(), newMonth, 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="text-gray-400 dark:text-gray-600"></div>);
    }

    for (let i = 1; i <= numDays; i++) {
      const day = new Date(year, month, i);
      const isSelected = selected && selected.toDateString() === day.toDateString();
      days.push(
        <button
          key={i}
          type="button"
          className={cn(
            'p-2 rounded-full text-sm font-medium w-9 h-9 flex items-center justify-center',
            'hover:bg-blue-100 dark:hover:bg-blue-800',
            isSelected
              ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
              : 'text-gray-800 dark:text-gray-200'
          )}
          onClick={() => handleDayClick(day)}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  return (
    <div className={cn("relative inline-block w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-gray-700 dark:text-gray-200 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
      >
        <span>{selected ? selected.toLocaleDateString() : placeholder}</span>
        <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg w-72"
          >
            <div className="flex justify-between items-center mb-4">
              <select
                value={currentDate.getFullYear()}
                onChange={handleYearChange}
                className="bg-transparent text-gray-900 dark:text-white text-base font-semibold focus:outline-none mr-2"
              >
                {Array.from({ length: 200 }).map((_, i) => {
                  const year = new Date().getFullYear() - 100 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
              <select
                value={currentDate.getMonth()}
                onChange={handleMonthChange}
                className="bg-transparent text-gray-900 dark:text-white text-base font-semibold focus:outline-none"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString('ja-JP', { month: 'long' })}
                  </option>
                ))}
              </select>
              <div className="flex ml-auto">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              <div>日</div><div>月</div><div>火</div><div>水</div><div>木</div><div>金</div><div>土</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {renderDays()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker;