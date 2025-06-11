"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export interface CardAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "danger";
}

export interface CardMetadata {
  label: string;
  value: string;
}

interface CardProps {
  title: string;
  summary?: string;
  metadata?: CardMetadata[];
  labels?: string[];
  actions?: CardAction[];
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "report" | "admin" | "article";
  colorTheme?: "default" | "research" | "article" | "topics" | "analysis";
  imageUrl?: string;
  imageAlt?: string;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  linkHref?: string;
  onDelete?: () => void;
}

const getVariantClasses = (variant: CardProps["variant"], colorTheme: CardProps["colorTheme"]): string => {
  const baseClasses = "transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl";
  
  // 色テーマに基づく縁の光る効果
  const glowEffects = {
    default: "hover:shadow-gray-400/50 hover:border-gray-300 dark:hover:border-gray-600",
    research: "hover:shadow-emerald-400/50 hover:border-emerald-300 dark:hover:border-emerald-600",
    article: "hover:shadow-blue-400/50 hover:border-blue-300 dark:hover:border-blue-600", 
    topics: "hover:shadow-yellow-400/50 hover:border-yellow-300 dark:hover:border-yellow-600",
    analysis: "hover:shadow-purple-400/50 hover:border-purple-300 dark:hover:border-purple-600"
  };

  const variants = {
    default:
      `bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-white/95 dark:hover:bg-gray-700/90 ${glowEffects[colorTheme || "default"]}`,
    report:
      `bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-white/95 dark:hover:bg-gray-700/90 ${glowEffects[colorTheme || "research"]}`,
    admin:
      `bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-white/95 dark:hover:bg-gray-700/90 ${glowEffects[colorTheme || "default"]}`,
    article:
      `bg-white dark:bg-[#2d3646] border border-gray-200 dark:border-gray-700/30 hover:bg-white/95 dark:hover:bg-gray-700/90 ${glowEffects[colorTheme || "article"]}`,
  };
  
  return `${baseClasses} ${variants[variant || "default"]}`;
};

const getActionButtonClasses = (variant: CardAction["variant"]): string => {
  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white",
    secondary:
      "bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white",
    danger:
      "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white",
  };
  return variants[variant || "primary"];
};

export const Card: React.FC<CardProps> = ({
  title,
  summary,
  metadata = [],
  labels = [],
  actions = [],
  className = "",
  children,
  variant = "default",
  colorTheme = "default",
  imageUrl,
  imageAlt,
  showCheckbox = false,
  isSelected = false,
  onSelect,
  linkHref,
  onDelete,
}) => {
  const variantClasses = getVariantClasses(variant, colorTheme);

  if (variant === "article") {
    return (
      <div
        className={`w-full ${variantClasses} rounded-xl shadow-lg overflow-hidden transition-all duration-300 group ${className}`}
      >
        <div className="relative h-full flex flex-col">
          {/* 画像エリア */}
          {imageUrl !== undefined && (
            <div className="relative h-52 w-full">
              {/* チェックボックスまたは削除ボタン */}
              {showCheckbox && (
                <div className="absolute top-3 right-3 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onSelect}
                    className="w-5 h-5 rounded border-2 border-white bg-white/80 backdrop-blur-sm"
                  />
                </div>
              )}
              {onDelete && (
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={onDelete}
                    className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-sm transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={imageAlt || title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      No Image
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          )}

          {/* コンテンツエリア */}
          {linkHref ? (
            <Link href={linkHref} className="block flex-grow p-5">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {title}
              </h3>

              {metadata.length > 0 && (
                <div className="flex flex-col space-y-1 mb-3">
                  {metadata.map((item, index) => (
                    <p
                      key={index}
                      className="text-xs text-gray-500 dark:text-gray-400"
                    >
                      {item.label ? `${item.label}: ${item.value}` : item.value}
                    </p>
                  ))}
                </div>
              )}

              {summary && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                  {summary}
                </p>
              )}

              {labels.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {labels.map((label, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-700/30"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}

              {children}
            </Link>
          ) : (
            <div className="flex-grow p-5">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {title}
              </h3>

              {metadata.length > 0 && (
                <div className="flex flex-col space-y-1 mb-3">
                  {metadata.map((item, index) => (
                    <p
                      key={index}
                      className="text-xs text-gray-500 dark:text-gray-400"
                    >
                      {item.label ? `${item.label}: ${item.value}` : item.value}
                    </p>
                  ))}
                </div>
              )}

              {summary && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                  {summary}
                </p>
              )}

              {labels.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {labels.map((label, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-700/30"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}

              {children}
            </div>
          )}

          {/* アクションエリア */}
          {actions.length > 0 && (
            <div className="p-3 pt-0 mt-auto border-t border-gray-200 dark:border-gray-700/50">
              <div className="flex justify-end gap-2">
                {actions.map((action, index) => {
                  const buttonClasses = `flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors`;

                  if (action.href) {
                    return (
                      <a
                        key={index}
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonClasses}
                      >
                        <span className="mr-1">{action.label}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    );
                  }

                  return (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className={buttonClasses}
                    >
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 通常のカードレイアウト
  return (
    <div
      className={`w-full p-6 flex flex-col gap-3 ${variantClasses} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-gray-900 dark:text-gray-100 ${className}`}
    >
      <h2 className="text-2xl font-bold mb-3 text-blue-700 dark:text-blue-300">
        {title}
      </h2>

      {summary && (
        <p className="text-gray-700 dark:text-gray-300 mb-4 flex-grow">
          {summary}
        </p>
      )}

      {metadata.length > 0 && (
        <div className="space-y-1 mb-2">
          {metadata.map((item, index) => (
            <p key={index} className="text-xs text-gray-500 dark:text-gray-400">
              {item.label ? `${item.label}: ${item.value}` : item.value}
            </p>
          ))}
        </div>
      )}

      {labels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {labels.map((label, index) => (
            <span
              key={index}
              className="bg-blue-700 dark:bg-blue-600 text-xs text-white px-2 py-0.5 rounded"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {children}

      {actions.length > 0 && (
        <div className="flex gap-2 mt-auto">
          {actions.map((action, index) => {
            const buttonClasses = `${getActionButtonClasses(
              action.variant
            )} px-4 py-2 rounded transition text-sm font-semibold`;

            if (action.href) {
              return (
                <Link key={index} href={action.href} className={buttonClasses}>
                  {action.label}
                </Link>
              );
            }

            return (
              <button
                key={index}
                onClick={action.onClick}
                className={buttonClasses}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
