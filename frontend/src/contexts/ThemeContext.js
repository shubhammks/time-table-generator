import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('blue');

  // Load theme preferences from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedPrimaryColor = localStorage.getItem('primaryColor');

    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    if (savedPrimaryColor) {
      setPrimaryColor(savedPrimaryColor);
    }
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update CSS custom properties for primary color
    const colorMap = {
      blue: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a'
      },
      green: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d'
      },
      purple: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7c3aed',
        800: '#6b21a8',
        900: '#581c87'
      }
    };

    const colors = colorMap[primaryColor] || colorMap.blue;
    Object.entries(colors).forEach(([shade, color]) => {
      root.style.setProperty(`--color-primary-${shade}`, color);
    });
  }, [darkMode, primaryColor]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  const changePrimaryColor = (color) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
  };

  const resetTheme = () => {
    setDarkMode(false);
    setPrimaryColor('blue');
    localStorage.removeItem('darkMode');
    localStorage.removeItem('primaryColor');
  };

  const value = {
    darkMode,
    primaryColor,
    toggleDarkMode,
    changePrimaryColor,
    resetTheme,
    availableColors: ['blue', 'green', 'purple']
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
