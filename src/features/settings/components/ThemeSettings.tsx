import React from 'react';
import { Sun, Moon, Monitor, Palette, RotateCcw, Check } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { COLOR_PRESETS } from '../../../types/theme';
import type { ThemeMode } from '../../../types/theme';
import { cn } from '../../../lib/utils';

export const ThemeSettings = () => {
    const { theme, currentColors, setThemeMode, setColorPreset, resetTheme } = useTheme();

    const themeModes: Array<{ id: ThemeMode; label: string; icon: React.ReactNode; description: string }> = [
        {
            id: 'light',
            label: 'Claro',
            icon: <Sun className="w-5 h-5" />,
            description: 'Sempre modo claro'
        },
        {
            id: 'dark',
            label: 'Escuro',
            icon: <Moon className="w-5 h-5" />,
            description: 'Sempre modo escuro'
        },
        {
            id: 'auto',
            label: 'Automático',
            icon: <Monitor className="w-5 h-5" />,
            description: 'Segue preferência do sistema'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-400" />
                    Aparência e Temas
                </h3>
                <p className="text-sm text-slate-400">
                    Personalize as cores e o modo de exibição do aplicativo.
                </p>
            </div>

            {/* Mode Selection */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Modo de Visualização
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {themeModes.map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setThemeMode(mode.id)}
                            className={cn(
                                "p-4 rounded-xl border-2 transition-all text-left",
                                theme.mode === mode.id
                                    ? "bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20"
                                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    theme.mode === mode.id ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400"
                                )}>
                                    {mode.icon}
                                </div>
                                {theme.mode === mode.id && (
                                    <Check className="w-5 h-5 text-purple-400" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm mb-0.5">{mode.label}</p>
                                <p className="text-xs text-slate-400">{mode.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Presets */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tema de Cores
                    </label>
                    <button
                        onClick={resetTheme}
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                        title="Resetar para padrão"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Resetar
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {COLOR_PRESETS.map(preset => (
                        <button
                            key={preset.id}
                            onClick={() => setColorPreset(preset.id)}
                            className={cn(
                                "group relative p-4 rounded-xl border-2 transition-all overflow-hidden",
                                theme.colorPreset === preset.id
                                    ? "border-white shadow-xl scale-105"
                                    : "border-slate-800 hover:border-slate-700 hover:scale-102"
                            )}
                            style={{
                                background: `linear-gradient(135deg, ${preset.background} 0%, ${preset.surface} 100%)`
                            }}
                        >
                            {/* Color Preview */}
                            <div className="flex gap-1 mb-3">
                                <div
                                    className="w-full h-8 rounded-lg shadow-inner"
                                    style={{ backgroundColor: preset.primary }}
                                />
                                <div
                                    className="w-full h-8 rounded-lg shadow-inner"
                                    style={{ backgroundColor: preset.secondary }}
                                />
                                <div
                                    className="w-full h-8 rounded-lg shadow-inner"
                                    style={{ backgroundColor: preset.accent }}
                                />
                            </div>

                            {/* Name */}
                            <p className="text-xs font-bold text-white truncate mb-1">
                                {preset.name}
                            </p>

                            {/* Selected Indicator */}
                            {theme.colorPreset === preset.id && (
                                <div className="absolute top-2 right-2 bg-white text-slate-900 p-1 rounded-full shadow-lg">
                                    <Check className="w-3 h-3" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Current Theme Preview */}
            <div className="p-4 rounded-xl border-2 border-slate-800 bg-slate-900/30">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                    Pré-visualização
                </label>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 space-y-2">
                            <div className="h-3 rounded" style={{ backgroundColor: currentColors.primary, width: '70%' }} />
                            <div className="h-2 rounded" style={{ backgroundColor: currentColors.secondary, width: '50%' }} />
                            <div className="h-2 rounded" style={{ backgroundColor: currentColors.accent, width: '60%' }} />
                        </div>
                        <div className="space-y-1">
                            <div className="w-16 h-16 rounded-xl shadow-lg" style={{ backgroundColor: currentColors.surface }} />
                        </div>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                        <div className="h-8 rounded-lg" style={{ backgroundColor: currentColors.primary }} title="Primary" />
                        <div className="h-8 rounded-lg" style={{ backgroundColor: currentColors.secondary }} title="Secondary" />
                        <div className="h-8 rounded-lg" style={{ backgroundColor: currentColors.accent }} title="Accent" />
                        <div className="h-8 rounded-lg" style={{ backgroundColor: currentColors.background }} title="Background" />
                        <div className="h-8 rounded-lg" style={{ backgroundColor: currentColors.surface }} title="Surface" />
                        <div className="h-8 rounded-lg" style={{ backgroundColor: currentColors.text }} title="Text" />
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-300">💡 Dica:</strong> O modo automático detecta a preferência do seu sistema operacional e ajusta automaticamente entre claro e escuro.
                </p>
            </div>
        </div>
    );
};
