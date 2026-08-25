/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-fredoka)", "system-ui", "sans-serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        data: ["var(--font-space)", "monospace"],
      },
      colors: {
        // Siswa palette (playful, warm)
        siswa: {
          red: "#EF4444",
          yellow: "#FCD34D",
          sky: "#38BDF8",
          bg: "#FFF8E7",
        },
        // Guru palette (professional, data-forward)
        guru: {
          teal: "#0D9488",
          navy: "#1E3A8A",
          slate: "#0F172A",
          bg: "#F8FAFC",
        },
        // Ortu palette (warm, trustworthy)
        ortu: {
          purple: "#7C3AED",
          cream: "#FEF3C7",
          brown: "#78350F",
          bg: "#FAF5FF",
        },
      },
      boxShadow: {
        card: "0 4px 20px -4px rgba(0,0,0,0.08), 0 2px 6px -2px rgba(0,0,0,0.06)",
        ribbon: "0 6px 0 -2px rgba(0,0,0,0.15)",
        pop: "0 8px 30px -6px rgba(239,68,68,0.35)",
      },
      animation: {
        "wiggle": "wiggle 0.5s ease-in-out",
        "pop-in": "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        "float": "float 3s ease-in-out infinite",
        "shine": "shine 2s linear infinite",
      },
      keyframes: {
        wiggle: {
          "0%,100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        popIn: {
          "0%": { opacity: 0, transform: "scale(0.8)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shine: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
