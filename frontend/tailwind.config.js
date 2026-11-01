/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Define full color palette (replaces default colors)
    colors: {
      // Background palette
      primary: "#030611",
      secondary: "#080D1A",
      surface: "#101827",
      card: "#0B1220",
      // Accent palette
      accent: "#635BFF",
      accentHover: "#7568FF",
      lavender: "#A5B4FC",
      // Text palette
      textPrimary: "#F1F3FF",
      textSecondary: "#9AA7C8",
      textMuted: "#6F7D9D",
      // Border & status
      border: "#202B40",
      success: "#1ABC9C",
      warning: "#F1C40F",
      error: "#E74C3C",
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};