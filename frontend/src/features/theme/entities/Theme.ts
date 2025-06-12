export interface ThemeVariant {
  primary: string;
  secondary: string;
  muted: string;
  accent: string;
  destructive: string;
  success: string;
  warning: string;
}

export interface Theme {
  colors: {
    text: ThemeVariant;
    background: ThemeVariant;
    border: ThemeVariant;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    headingPrimary: string;
    headingSecondary: string;
    headingTertiary: string;
    body: string;
    caption: string;
    label: string;
  };
}

export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  theme: Theme;
}