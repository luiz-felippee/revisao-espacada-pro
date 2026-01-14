export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ColorPreset {
    id: string;
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
    {
        id: 'midnight',
        name: 'Midnight Blue',
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        background: '#020617',
        surface: '#0f172a',
        text: '#f8fafc'
    },
    {
        id: 'forest',
        name: 'Forest Green',
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399',
        background: '#022c22',
        surface: '#064e3b',
        text: '#f0fdf4'
    },
    {
        id: 'sunset',
        name: 'Sunset Orange',
        primary: '#f59e0b',
        secondary: '#ef4444',
        accent: '#fb923c',
        background: '#1c1917',
        surface: '#292524',
        text: '#fafaf9'
    },
    {
        id: 'lavender',
        name: 'Lavender Dream',
        primary: '#a855f7',
        secondary: '#ec4899',
        accent: '#d946ef',
        background: '#1e1b4b',
        surface: '#312e81',
        text: '#faf5ff'
    },
    {
        id: 'ocean',
        name: 'Ocean Breeze',
        primary: '#0ea5e9',
        secondary: '#06b6d4',
        accent: '#67e8f9',
        background: '#082f49',
        surface: '#0c4a6e',
        text: '#f0f9ff'
    },
    {
        id: 'rose',
        name: 'Rose Gold',
        primary: '#f43f5e',
        secondary: '#fb7185',
        accent: '#fda4af',
        background: '#1f1315',
        surface: '#3f1d27',
        text: '#fff1f2'
    },
    {
        id: 'monochrome',
        name: 'Monochrome',
        primary: '#71717a',
        secondary: '#52525b',
        accent: '#a1a1aa',
        background: '#09090b',
        surface: '#18181b',
        text: '#fafafa'
    },
    {
        id: 'light-default',
        name: 'Light Mode',
        primary: '#2563eb',
        secondary: '#7c3aed',
        accent: '#0891b2',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a'
    }
];

export interface ThemeConfig {
    mode: ThemeMode;
    colorPreset: string;
    customColors?: Partial<ColorPreset>;
}

export const DEFAULT_THEME: ThemeConfig = {
    mode: 'dark',
    colorPreset: 'midnight',
};
