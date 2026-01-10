import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useUITheme } from '../context/UIThemeProvider';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useUITheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 bg-slate-700 dark:bg-slate-800 rounded-full transition-colors hover:bg-slate-600 dark:hover:bg-slate-700 group"
            title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
            {/* Slider */}
            <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${theme === 'dark' ? 'left-0.5' : 'left-7'
                    }`}
            >
                {theme === 'dark' ? (
                    <Moon className="w-3.5 h-3.5 text-slate-700" />
                ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
            </div>

            {/* Background Icons */}
            <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
                <Sun className="w-3 h-3 text-amber-300 opacity-50" />
                <Moon className="w-3 h-3 text-blue-300 opacity-50" />
            </div>
        </button>
    );
};
