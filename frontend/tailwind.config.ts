import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}", // featuresディレクトリを追加
  ],
  theme: {
    extend: {
      fontFamily: {
        // fontFamilyを追加
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        inter: ["var(--font-inter)", "sans-serif"], // Interフォントを追加
      },
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        navbar: "var(--color-navbar)",
        navbartext: "var(--color-navbar-text)",
        footer: "var(--color-footer)",
        link: "var(--color-link)",
        linkhover: "var(--color-link-hover)",
      },
      // textShadowユーティリティをtheme.extendに追加
      textShadow: {
        DEFAULT: "2px 2px 4px rgba(0, 0, 0, 0.6)",
        sm: "1px 1px 2px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [
    // textShadowプラグインを追加 (もしカスタムプラグインとして定義する場合)
    // function ({ addUtilities, theme, e }) {
    //   const newUtilities = {}
    //   Object.entries(theme('textShadow')).forEach(([key, value]) => {
    //     newUtilities[`.${e(`text-shadow${key === 'DEFAULT' ? '' : `-${key}`}`)}`] = {
    //       textShadow: value,
    //     }
    //   })
    //   addUtilities(newUtilities)
    // },
  ],
} satisfies Config;
