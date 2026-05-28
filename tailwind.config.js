/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Arial", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Orbitron", "Segoe UI", "Arial", "sans-serif"],
      },
      colors: {
        surface: {
          900: "#060d1a",
          800: "#090f1e",
          750: "#0b1220",
          700: "#0d1526",
          600: "#101a2e",
          500: "#142035",
        },
        brand: {
          DEFAULT: "#06b6d4",
          50:  "rgba(6,182,212,0.05)",
          100: "rgba(6,182,212,0.10)",
          200: "rgba(6,182,212,0.20)",
          300: "rgba(6,182,212,0.30)",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        critical: {
          DEFAULT: "#ef4444",
          bg: "rgba(239,68,68,0.10)",
          ring: "rgba(239,68,68,0.25)",
          glow: "rgba(239,68,68,0.35)",
        },
        high: {
          DEFAULT: "#f97316",
          bg: "rgba(249,115,22,0.10)",
          ring: "rgba(249,115,22,0.25)",
        },
        medium: {
          DEFAULT: "#eab308",
          bg: "rgba(234,179,8,0.10)",
          ring: "rgba(234,179,8,0.25)",
        },
        safe: {
          DEFAULT: "#22c55e",
          bg: "rgba(34,197,94,0.10)",
          ring: "rgba(34,197,94,0.25)",
        },
      },
      boxShadow: {
        panel:  "0 4px 24px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.03) inset",
        card:   "0 2px 16px rgba(0,0,0,0.40)",
        glow:   "0 0 28px rgba(6,182,212,0.20)",
        "glow-red":   "0 0 28px rgba(239,68,68,0.25)",
        "glow-green": "0 0 28px rgba(34,197,94,0.20)",
        "glow-amber": "0 0 28px rgba(234,179,8,0.20)",
        metric: "0 8px 32px rgba(0,0,0,0.45)",
      },
      backgroundImage: {
        "grid-dark":
          "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        "gradient-surface":
          "linear-gradient(135deg, rgba(14,165,233,0.06) 0%, transparent 50%, rgba(99,102,241,0.05) 100%)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
      animation: {
        "pulse-slow":   "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow":    "spin 8s linear infinite",
        "fade-up":      "fadeUp 0.5s ease both",
        "slide-in":     "slideIn 0.4s ease both",
        "count-up":     "fadeUp 0.6s ease both",
        "border-glow":  "borderGlow 2.5s ease-in-out infinite",
        "scan-line":    "scanLine 3s linear infinite",
        shimmer:        "shimmer 2s linear infinite",
        ticker:         "ticker 0.4s ease both",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: "translateY(14px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: 0, transform: "translateX(-16px)" },
          to:   { opacity: 1, transform: "translateX(0)" },
        },
        borderGlow: {
          "0%,100%": { borderColor: "rgba(6,182,212,0.20)" },
          "50%":     { borderColor: "rgba(6,182,212,0.55)" },
        },
        scanLine: {
          "0%":   { transform: "translateY(-100%)", opacity: 0 },
          "10%":  { opacity: 1 },
          "90%":  { opacity: 1 },
          "100%": { transform: "translateY(500%)", opacity: 0 },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        ticker: {
          from: { opacity: 0, transform: "translateY(-8px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
