/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          1: "#e53935", // Red
          2: "#fb8c00", // Orange
          3: "#fdd835", // Yellow
          4: "#43a047", // Green
          5: "#00acc1", // Cyan
          6: "#8e24aa", // Purple
        },
      },
    },
  },
  plugins: [],
};
