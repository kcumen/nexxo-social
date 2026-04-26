/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAF9',
        surface: '#FFFFFF',
        primary: '#FACC15',
        secondary: '#3B82F6',
        accent: '#EF4444',
        success: '#22C55E',
        text: '#0A0A0A',
        muted: '#525252',
        border: '#000000',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neu-sm': '3px 3px 0 #000',
        'neu-md': '4px 4px 0 #000',
        'neu-lg': '6px 6px 0 #000',
        'neu-xl': '8px 8px 0 #000',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
