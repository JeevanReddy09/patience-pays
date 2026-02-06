'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className='h-9 w-28 rounded-full bg-white/60' />;
  }

  return (
    <button
      type='button'
      onClick={toggleTheme}
      className='rounded-full border border-mist bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink shadow-soft transition'
      aria-label='Toggle dark mode'
    >
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
