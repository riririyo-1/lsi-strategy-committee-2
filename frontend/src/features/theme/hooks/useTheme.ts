"use client";

import { THEME_CLASSES, type ThemeClasses } from '../constants/themeClasses';

/**
 * テーマクラスを提供するカスタムフック
 * 全コンポーネントで統一されたスタイリングを保証
 */
export const useTheme = () => {
  return {
    classes: THEME_CLASSES,
    
    // よく使われるクラスの組み合わせを提供
    compose: {
      pageTitle: THEME_CLASSES.heading.h1,
      sectionTitle: THEME_CLASSES.heading.h2,
      subsectionTitle: THEME_CLASSES.heading.h3,
      cardTitle: THEME_CLASSES.heading.h4,
      
      bodyText: THEME_CLASSES.text.primary,
      captionText: THEME_CLASSES.text.muted,
      
      primaryCard: `${THEME_CLASSES.card.base} p-6`,
      elevatedCard: `${THEME_CLASSES.card.elevated} p-6`,
      
      formGroup: 'mb-6',
      formRow: 'grid grid-cols-1 md:grid-cols-2 gap-4',
      
      buttonGroup: 'flex gap-2',
      actionBar: `${THEME_CLASSES.utility.flexBetween} mb-6`,
      
      statusActive: THEME_CLASSES.status.active,
      statusInactive: THEME_CLASSES.status.inactive,
    },
  };
};

export type UseThemeReturn = ReturnType<typeof useTheme>;