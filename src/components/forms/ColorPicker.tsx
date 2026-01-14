import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

// A mix of vibrant, dark, and light shades from Tailwind
const MASTER_PALETTE = [
    // Reds & Pinks
    { value: '#ef4444', label: 'Vermelho' },
    { value: '#b91c1c', label: 'Vermelho Escuro' },
    { value: '#f87171', label: 'Vermelho Claro' },
    { value: '#ec4899', label: 'Rosa' },
    { value: '#be185d', label: 'Rosa Escuro' },
    { value: '#f472b6', label: 'Rosa Claro' },
    { value: '#d946ef', label: 'Fúcsia' },
    { value: '#a21caf', label: 'Fúcsia Escuro' },

    // Oranges & Yellows
    { value: '#f97316', label: 'Laranja' },
    { value: '#c2410c', label: 'Laranja Escuro' },
    { value: '#fb923c', label: 'Laranja Claro' },
    { value: '#f59e0b', label: 'Âmbar' },
    { value: '#b45309', label: 'Âmbar Escuro' },
    { value: '#eab308', label: 'Amarelo' },
    { value: '#854d0e', label: 'Amarelo Escuro' },

    // Greens & Teals
    { value: '#22c55e', label: 'Verde' },
    { value: '#15803d', label: 'Verde Escuro' },
    { value: '#4ade80', label: 'Verde Claro' },
    { value: '#10b981', label: 'Esmeralda' },
    { value: '#047857', label: 'Esmeralda Escuro' },
    { value: '#14b8a6', label: 'Verde Mar' },
    { value: '#0f766e', label: 'Verde Mar Escuro' },
    { value: '#06b6d4', label: 'Ciano' },
    { value: '#0891b2', label: 'Ciano Escuro' },

    // Blues
    { value: '#3b82f6', label: 'Azul' },
    { value: '#1d4ed8', label: 'Azul Escuro' },
    { value: '#60a5fa', label: 'Azul Claro' },
    { value: '#0ea5e9', label: 'Azul Celeste' },
    { value: '#0284c7', label: 'Azul Celeste Escuro' },
    { value: '#6366f1', label: 'Índigo' },
    { value: '#4338ca', label: 'Índigo Escuro' },
    { value: '#8b5cf6', label: 'Violeta' },
    { value: '#6d28d9', label: 'Violeta Escuro' },
    { value: '#a78bfa', label: 'Violeta Claro' },

    // Others
    { value: '#84cc16', label: 'Lima' },
    { value: '#4d7c0f', label: 'Lima Escuro' },
    { value: '#64748b', label: 'Ardósia' },
    { value: '#334155', label: 'Ardósia Escura' },
];

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    label?: string;
    disabledColors?: string[];
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label = "Cor (Opcional)", disabledColors = [] }) => {

    const displayColors = useMemo(() => {
        // 1. Filter out colors that are actively disabled (used elsewhere)
        // But keep the current value if it happens to be in the disabled list (conceptually it shouldn't be passed as disabled if selected, 
        // but for safety we ensure strict availability).
        let available = MASTER_PALETTE.filter(c => !disabledColors.includes(c.value));

        // 2. We want to show a consistent grid, e.g., 12 colors.
        const LIMIT = 14;

        // 3. Ensure the current selected value is ALWAYS in the list, even if it would be filtered out or deeper in the list.
        const currentObj = MASTER_PALETTE.find(c => c.value === value);

        let result = [];

        if (currentObj) {
            // Remove current from available to avoid duplication
            available = available.filter(c => c.value !== value);
            // Add current to start
            result = [currentObj, ...available];
        } else if (value && !currentObj) {
            // If value is custom (not in palette), just prepend access ad-hoc
            result = [{ value, label: 'Atual' }, ...available];
        } else {
            result = available;
        }

        // 4. Slice to limit
        return result.slice(0, LIMIT);

    }, [disabledColors, value]);

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 block mb-2">
                {label}
            </label>
            <div className="flex flex-wrap gap-2">
                {displayColors.map((color) => (
                    <button
                        key={color.value}
                        type="button"
                        onClick={() => onChange(color.value)}
                        className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center relative group",
                            value === color.value
                                ? "border-white ring-2 ring-blue-500/50 scale-110 z-10"
                                : "border-transparent hover:border-slate-500 hover:scale-110 hover:z-10"
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                    >
                        {value === color.value && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                    </button>
                ))}
            </div>
        </div>
    );
};
