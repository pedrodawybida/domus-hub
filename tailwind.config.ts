import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legado (mantido para não quebrar classes existentes)
        brand: {
          darkest: "#060b1e",
          dark: "#0b1536",
          surface: "#132252",
          card: "#283970",
          border: "#3b5299",
          gold: "#10b981", // ATENÇÃO: legado — na prática é verde. Prefira `accent` ou `success`.
          goldLight: "#34d399",
          goldDark: "#059669",
          emerald: "#10b981",
          navy: "#283970",
        },
        // Domus Design System v2 (tokens semânticos)
        domus: {
          50: "#eef1f8",
          100: "#dce2f0",
          600: "#283970", // cor oficial da logo
          700: "#1f2d5c",
          900: "#0b1536",
          950: "#060b1e",
        },
        accent: {
          300: "#d9bf86", // dourado sobre fundo escuro
          700: "#8a6a2f", // dourado sobre fundo claro (AA)
        },
        success: { 500: "#10b981", 600: "#047857" },
        danger: { 600: "#b42318" },
        warning: { 600: "#b54708" },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Source Serif 4", "Georgia", "Times New Roman", "serif"],
      },
      fontSize: {
        // Escala 1.25 (major third) — mínimo 12px. Prefixo ds- para não alterar classes padrão já usadas.
        "ds-xs": ["12px", { lineHeight: "16px" }],
        "ds-sm": ["14px", { lineHeight: "20px" }],
        "ds-base": ["16px", { lineHeight: "24px" }],
        "ds-lg": ["20px", { lineHeight: "28px" }],
        "ds-xl": ["24px", { lineHeight: "32px" }],
        "ds-2xl": ["32px", { lineHeight: "40px" }],
        "ds-3xl": ["40px", { lineHeight: "48px" }],
        "ds-4xl": ["56px", { lineHeight: "60px" }],
      },
      borderRadius: {
        "ds-sm": "6px",
        "ds-md": "10px",
        "ds-lg": "16px",
        "ds-xl": "24px",
      },
      boxShadow: {
        "ds-1": "0 1px 2px rgba(15, 23, 42, 0.06)",
        "ds-2": "0 6px 20px rgba(15, 23, 42, 0.06)",
        "ds-3": "0 18px 44px rgba(11, 21, 54, 0.16)",
      },
    },
  },
  plugins: [],
};
export default config;
