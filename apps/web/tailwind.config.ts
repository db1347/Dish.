import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        terracotta: { DEFAULT: '#C4684A', light: '#E8A87C', dark: '#A05038' },
        cream: { DEFAULT: '#FAF7F2', linen: '#F2EDE5' },
        sage: { DEFAULT: '#7B9E82', dark: '#5A7A5F' },
        espresso: '#2A1F1A',
        clay: '#7A6A62',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
