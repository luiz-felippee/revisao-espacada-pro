import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeMode, ThemeConfig, ColorPreset } from '../types/theme';
import { COLOR_PRESETS, DEFAULT_THEME } from '../types/theme';

interface ThemeContextValue {
    theme: ThemeConfig;
    currentColors: ColorPreset;
    setThemeMode: (mode: ThemeMode) => void;
    setColorPreset: (presetId: string) => void;
    setCustomColors: (colors: Partial<ColorPreset>) => void;
    resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_config';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeConfig>(() => {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return DEFAULT_THEME;
            }
        }
        return DEFAULT_THEME;
    });

    const [currentColors, setCurrentColors] = useState<ColorPreset>(() => {
        const preset = COLOR_PRESETS.find(p => p.id === theme.colorPreset);
        return preset || COLOR_PRESETS[0];
    });

    // Aplicar tema ao documento
    useEffect(() => {
        const applyTheme = () => {
            const root = document.documentElement;

            // Determinar modo efetivo (considerando 'auto')
            let effectiveMode = theme.mode;
            if (theme.mode === 'auto') {
                effectiveMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            // Aplicar classe de tema
            root.classList.remove('light', 'dark');
            root.classList.add(effectiveMode);

            // Obter cores (preset ou custom)
            const preset = COLOR_PRESETS.find(p => p.id === theme.colorPreset) || COLOR_PRESETS[0];
            const colors = theme.customColors ? { ...preset, ...theme.customColors } : preset;

            setCurrentColors(colors);

            // Aplicar CSS variables
            root.style.setProperty('--color-primary', colors.primary);
            root.style.setProperty('--color-secondary', colors.secondary);
            root.style.setProperty('--color-accent', colors.accent);
            root.style.setProperty('--color-background', colors.background);
            root.style.setProperty('--color-surface', colors.surface);
            root.style.setProperty('--color-text', colors.text);
        };

        applyTheme();

        // Listener para mudanças de preferência do sistema (quando mode = 'auto')
        if (theme.mode === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => applyTheme();
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [theme]);

    // Salvar tema no localStorage
    useEffect(() => {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    }, [theme]);

    const setThemeMode = (mode: ThemeMode) => {
        setTheme(prev => ({ ...prev, mode }));
    };

    const setColorPreset = (presetId: string) => {
        setTheme(prev => ({ ...prev, colorPreset: presetId, customColors: undefined }));
    };

    const setCustomColors = (colors: Partial<ColorPreset>) => {
        setTheme(prev => ({
            ...prev,
            customColors: { ...prev.customColors, ...colors }
        }));
    };

    const resetTheme = () => {
        setTheme(DEFAULT_THEME);
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                currentColors,
                setThemeMode,
                setColorPreset,
                setCustomColors,
                resetTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
