"use client";

import { I18nProvider } from "@/features/i18n/hooks/useI18n";
import { ThemeProvider } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  );
}
