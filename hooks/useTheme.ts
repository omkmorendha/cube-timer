'use client';

import { useEffect } from 'react';

export function useTheme(theme: 'dark' | 'light' | 'auto') {
  useEffect(() => {
    const root = document.documentElement;

    // Remove any existing theme classes
    root.classList.remove('light-theme', 'dark-theme');

    if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (!prefersDark) {
        root.classList.add('light-theme');
      }

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light-theme', 'dark-theme');
        if (!e.matches) {
          root.classList.add('light-theme');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (theme === 'light') {
      root.classList.add('light-theme');
    }
    // Dark theme is the default, no class needed
  }, [theme]);
}
