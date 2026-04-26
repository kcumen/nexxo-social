/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#13131a',
        border: '#1e1e2e',
        accent: '#6c63ff',
        accent2: '#ff6b6b',
        text: '#e0e0e0',
        muted: '#6b6b7b',
      }
    },
  },
  plugins: [],
}
