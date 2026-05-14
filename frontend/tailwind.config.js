/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        ink: {
          DEFAULT: "#0f172a",
          muted: "#475569",
          soft: "#64748b",
          faint: "#94a3b8",
        },
        surface: {
          DEFAULT: "#f4f4f7",
          raised: "#ffffff",
          subtle: "#ececf2",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        ring: "0 0 0 1px rgba(15, 23, 42, 0.06)",
        elevate:
          "0 2px 4px rgba(15, 23, 42, 0.04), 0 12px 28px -10px rgba(15, 23, 42, 0.14)",
        "elevate-lg":
          "0 8px 16px rgba(15, 23, 42, 0.06), 0 28px 56px -16px rgba(15, 23, 42, 0.18)",
        "elevate-xl":
          "0 24px 48px -12px rgba(67, 56, 202, 0.22), 0 12px 24px -12px rgba(15, 23, 42, 0.12)",
        glow: "0 0 0 1px rgba(139, 92, 246, 0.22), 0 16px 48px -12px rgba(109, 40, 217, 0.42)",
        "glow-soft":
          "0 0 80px -20px rgba(124, 58, 237, 0.35), 0 0 40px -15px rgba(59, 130, 246, 0.2)",
      },
      backgroundImage: {
        "mesh-page":
          "radial-gradient(1000px 520px at 8% -5%, rgba(124, 58, 237, 0.16), transparent 52%), radial-gradient(820px 460px at 96% 2%, rgba(59, 130, 246, 0.14), transparent 48%), radial-gradient(720px 400px at 48% 102%, rgba(15, 23, 42, 0.06), transparent 52%), linear-gradient(180deg, #f4f4f7 0%, #fafafa 35%, #f4f4f7 100%)",
        "mesh-hero":
          "radial-gradient(ellipse 90% 70% at 12% 18%, rgba(167, 139, 250, 0.38), transparent 58%), radial-gradient(ellipse 75% 55% at 92% 6%, rgba(99, 102, 241, 0.28), transparent 52%), radial-gradient(ellipse 55% 45% at 70% 85%, rgba(34, 211, 238, 0.08), transparent 55%), linear-gradient(165deg, #ffffff 0%, #f8f7ff 38%, #ffffff 72%, #f4f5fb 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "blob-soft": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(12px, -8px) scale(1.03)" },
          "66%": { transform: "translate(-8px, 10px) scale(0.98)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.65s cubic-bezier(0.16, 1, 0.3, 1) both",
        "blob-soft": "blob-soft 14s ease-in-out infinite",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
