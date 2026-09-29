import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

export type Theme = 'dark' | 'light';

export interface ChartThemeConfig {
  gridStroke: string;
  axisStroke: string;
  tickColor: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  cardBg: string;
  cardBorder: string;
}

interface ThemeContextType {
  theme: Theme;
  darkMode: boolean;
  isDarkMode: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  chartTheme: ChartThemeConfig;
}

const THEME_STORAGE_KEY = 'hrvl_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode; defaultTheme?: Theme }> = ({ 
  children, 
  defaultTheme = 'dark' 
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // Ignore localStorage read errors
    }
    return defaultTheme;
  });

  // Apply or remove .dark class on <html> root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore localStorage write errors
    }
  }, [theme]);

  // Synchronize across multiple browser tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const isDarkMode = theme === 'dark';

  const chartTheme = useMemo<ChartThemeConfig>(() => {
    if (isDarkMode) {
      return {
        gridStroke: '#334155',
        axisStroke: '#94a3b8',
        tickColor: '#94a3b8',
        tooltipBg: '#0f172a',
        tooltipBorder: '#334155',
        tooltipText: '#ffffff',
        cardBg: '#0f172a',
        cardBorder: '#1e293b'
      };
    }
    return {
      gridStroke: '#e2e8f0',
      axisStroke: '#64748b',
      tickColor: '#64748b',
      tooltipBg: '#ffffff',
      tooltipBorder: '#cbd5e1',
      tooltipText: '#0f172a',
      cardBg: '#ffffff',
      cardBorder: '#e2e8f0'
    };
  }, [isDarkMode]);

  const contextValue = useMemo<ThemeContextType>(() => ({
    theme,
    darkMode: isDarkMode,
    isDarkMode,
    setTheme,
    toggleTheme,
    chartTheme
  }), [theme, isDarkMode, setTheme, toggleTheme, chartTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
