import React, { createContext, useContext, useState, useEffect } from 'react';

type UITheme = 'light' | 'dark';

interface UIThemeContextType {
    theme: UITheme;
    toggleTheme: () => void;
    setTheme: (theme: UITheme) => void;
}

const UIThemeContext = createContext<UIThemeContextType | undefined>(undefined);

export const useUITheme = () => {
    const context = useContext(UIThemeContext);
    if (!context) {
        throw new Error('useUITheme must be used within UIThemeProvider');
    }
    return context;
};

export const UIThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<UITheme>(() => {
        // Check localStorage first
        const saved = localStorage.getItem('ui_theme');
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }

        return 'dark'; // Default
    });

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);

        // Apply Tailwind dark class
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Save to localStorage
        localStorage.setItem('ui_theme', theme);
    }, [theme]);

    const setTheme = (newTheme: UITheme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <UIThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </UIThemeContext.Provider>
    );
};
