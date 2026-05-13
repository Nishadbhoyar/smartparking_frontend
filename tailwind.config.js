/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "sp-dark":    "#0f1117",
        "sp-blue":    "#2563eb",
        "sp-blue-dark": "#1d4ed8",
        "sp-muted":   "#6b7280",
        "sp-surface": "#1a1d27",
      },
      fontFamily: {
        display: ["Syne", "system-ui", "sans-serif"],
        body:    ["DM Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl:  "1rem",
        "2xl": "1.5rem",
      },
      zIndex: {
        map:    "400",
        modal:  "600",
        navbar: "700",
      },
    },
  },
  plugins: [],
};
