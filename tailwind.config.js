/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Arial", "sans-serif"],
      },
      boxShadow: {
        panel: "0 16px 50px rgba(2, 8, 23, 0.25)",
      },
    },
  },
  plugins: [],
};
