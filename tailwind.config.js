/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        govBlue: {
          DEFAULT: "#123B66",
          dark: "#0C2746",
          light: "#1C548D",
          50: "#F0F5FA",
        },
        saffron: {
          DEFAULT: "#E97721",
          dark: "#C65F12",
          light: "#F99648",
          50: "#FFF6ED",
        },
        govSuccess: {
          DEFAULT: "#138A5B",
          dark: "#0C6340",
          light: "#21B87D",
          50: "#EBF9F3",
        },
        govWarning: {
          DEFAULT: "#D97706",
          dark: "#92400E",
          light: "#F59E0B",
          50: "#FFFBEB",
        },
        govError: {
          DEFAULT: "#C73535",
          dark: "#991B1B",
          light: "#EF4444",
          50: "#FEF2F2",
        },
        govBg: "#F7F9FC",
        govCard: "#FFFFFF",
        govText: "#172033",
        govMuted: "#5A6573",
        govBorder: "#DCE3EB",
      },
      fontFamily: {
        sans: [
          'Poppins',
          'Noto Sans Devanagari',
          'Noto Sans Telugu',
          'Noto Sans Tamil',
          'Noto Sans Kannada',
          'Noto Sans Malayalam',
          'Noto Sans Bengali',
          'Noto Sans Gujarati',
          'Noto Sans Gurmukhi',
          'Noto Nastaliq Urdu',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
