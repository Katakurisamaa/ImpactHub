import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        heading: ["var(--font-heading)", ...fontFamily.serif],
      },
      colors: {
        background: "#06061a",
        foreground: "#f0ece0",
        navy: {
          DEFAULT: "#06061a",
          mid: "#0e0e2e",
        },
        surface: {
          DEFAULT: "#0e0e2e",
          highlight: "#1e1e3e",
        },
        primary: {
          DEFAULT: "#d4a843", // Gold
          hover: "#f0c870",   // Gold light
          foreground: "#06061a", // Navy
        },
        secondary: {
          DEFAULT: "rgba(212, 168, 67, 0.15)", // Gold pale
          foreground: "#d4a843",
        },
        accent: {
          pink: "#F973FF",
          success: "#22C55E",
          error: "#EF4444",
        },
        gold: {
          DEFAULT: "#FFD700",
          50: "#FFFDF0",
          100: "#FFFBE0",
          200: "#FFF4B3",
          300: "#FFEC85",
          400: "#FFE457",
          500: "#FFD700",
          600: "#E6C200",
          700: "#B39700",
          800: "#806C00",
          900: "#4D4100",
        },
        muted: {
          DEFAULT: "#1E293B",
          foreground: "#94A3B8", // Slate 400
          text: "#CBD5E1", // Slate 300
        },
        border: "rgba(255, 255, 255, 0.06)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "14px",   // Button
        "2xl": "16px", // Card Small
        "3xl": "20px", // Card Large
      },
      boxShadow: {
        "glow": "0 8px 24px rgba(34, 197, 94, 0.25)",
        "card": "0 12px 40px rgba(0, 0, 0, 0.6)",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
