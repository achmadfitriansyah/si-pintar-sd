/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-fredoka)", "system-ui", "sans-serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        data: ["var(--font-space)", "ui-monospace", "monospace"],
      },
      colors: {
        brand: { DEFAULT: "#EF4444", dark: "#B91C1C", yellow: "#FCD34D", cream: "#FFF8E7" },
        guru: { DEFAULT: "#0D9488", dark: "#115E59", navy: "#1E3A8A", bg: "#F4F7F9" },
        ortu: { DEFAULT: "#7C3AED", dark: "#5B21B6", bg: "#FAF5FF" },
      },
      boxShadow: {
        card: "0 4px 18px -6px rgba(15,23,42,.12), 0 2px 6px -3px rgba(15,23,42,.08)",
        pop: "0 10px 30px -8px rgba(239,68,68,.45)",
        soft: "0 1px 2px rgba(15,23,42,.06)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        wiggle: { "0%,100%": { transform: "rotate(-4deg)" }, "50%": { transform: "rotate(4deg)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        scan: { "0%,100%": { top: "8%" }, "50%": { top: "88%" } },
        shake: { "0%,100%": { transform: "translateX(0)" }, "20%,60%": { transform: "translateX(-6px)" }, "40%,80%": { transform: "translateX(6px)" } },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        wiggle: "wiggle 1.6s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        scan: "scan 2.2s ease-in-out infinite",
        shake: "shake .4s ease-in-out",
      },
    },
  },
  plugins: [],
};
