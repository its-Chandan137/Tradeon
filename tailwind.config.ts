import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "[data-theme='dark']"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        gold: {
          DEFAULT: "#D4AF37",
          bright: "#F0B429",
          muted: "#B8942B",
        },
        loss: {
          DEFAULT: "#C86B62",
          muted: "#8F4B45",
        },
        profit: {
          DEFAULT: "#F0B429",
          green: "#72C879",
        },
        surface: {
          DEFAULT: "#13161C",
          raised: "#181C24",
          muted: "#0F1217",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "0.85rem",
        md: "0.65rem",
        sm: "0.45rem",
      },
      boxShadow: {
        terminal: "0 24px 80px rgba(0, 0, 0, 0.35)",
        glow: "0 0 0 1px rgba(212, 175, 55, 0.18), 0 0 32px rgba(212, 175, 55, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
