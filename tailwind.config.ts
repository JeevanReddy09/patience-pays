import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        sea: '#0f766e',
        mist: '#e6f1ee',
        sand: '#f4efe7',
        sun: '#f7c873',
        clay: '#e8b4a2',
        navy: '#1e293b'
      },
      boxShadow: {
        soft: '0 12px 40px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
};

export default config;
