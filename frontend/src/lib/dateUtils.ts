/**
 * 共通の日付フォーマット関数
 */

/**
 * 日付文字列をYYYY-MM-DD形式にフォーマット（サーバーとクライアント間で一貫性を持たせるため）
 */
export function formatDateToString(dateString: string): string {
  // ISOのYYYY-MM-DD部分のみを抽出（ブラウザ非依存）
  return dateString.split("T")[0];
}

/**
 * 日付文字列を日本語形式にフォーマット
 */
export function formatDateToJapanese(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return formatDateToString(dateString);
  }
}

/**
 * 日付文字列をローカル形式にフォーマット
 */
export function formatDateToLocal(dateString: string, locale = 'ja-JP'): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale);
  } catch {
    return formatDateToString(dateString);
  }
}

/**
 * 日時文字列をローカル形式にフォーマット
 */
export function formatDateTimeToLocal(dateString: string, locale = 'ja-JP'): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString(locale);
  } catch {
    return formatDateToString(dateString);
  }
}