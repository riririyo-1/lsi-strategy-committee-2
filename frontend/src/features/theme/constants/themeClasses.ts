/**
 * 統一されたテーマクラス定義
 * 全コンポーネントで一貫したスタイリングを保証
 */

export const THEME_CLASSES = {
  // テキスト色
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-700 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    accent: 'text-blue-600 dark:text-blue-400',
    destructive: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
  },

  // 見出し
  heading: {
    h1: 'text-4xl md:text-5xl font-bold text-gray-900 dark:text-white',
    h2: 'text-2xl md:text-3xl font-bold text-gray-900 dark:text-white',
    h3: 'text-xl font-semibold text-gray-900 dark:text-white',
    h4: 'text-lg font-semibold text-gray-900 dark:text-white',
    h5: 'text-md font-semibold text-gray-900 dark:text-white',
    h6: 'text-sm font-semibold text-gray-900 dark:text-white',
  },

  // フォーム関連
  form: {
    label: 'block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300',
    input: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    select: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    textarea: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    checkbox: 'w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500',
    checkboxLabel: 'flex items-center text-sm text-gray-700 dark:text-gray-300',
  },

  // ボタン
  button: {
    primary: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors focus:ring-2 focus:ring-blue-500',
    secondary: 'px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors focus:ring-2 focus:ring-gray-500',
    outline: 'px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors',
    ghost: 'px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors',
  },

  // カード・コンテナ
  card: {
    base: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm',
    elevated: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg',
    popup: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg',
  },

  // 状態表示
  status: {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium',
    inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-medium',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium',
  },

  // 通知・アラート
  alert: {
    success: 'p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 rounded-md',
    error: 'p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-md',
    warning: 'p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 rounded-md',
    info: 'p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 rounded-md',
  },

  // ユーティリティ
  utility: {
    flexBetween: 'flex justify-between items-center',
    flexCenter: 'flex justify-center items-center',
    loading: 'animate-spin rounded-full border-t-2 border-b-2 border-blue-600 dark:border-blue-400',
  },
} as const;

export type ThemeClasses = typeof THEME_CLASSES;