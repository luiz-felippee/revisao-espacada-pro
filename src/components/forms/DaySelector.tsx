import React from 'react';
import { cn } from '../../lib/utils';

interface DaySelectorProps {
    selectedDays: number[];
    onChange: (days: number[]) => void;
}

const DAYS = [
    { value: 0, label: 'D' }, // Domingo
    { value: 1, label: 'S' }, // Segunda
    { value: 2, label: 'T' }, // Terça
    { value: 3, label: 'Q' }, // Quarta
    { value: 4, label: 'Q' }, // Quinta
    { value: 5, label: 'S' }, // Sexta
    { value: 6, label: 'S' }, // Sábado
];

export const DaySelector: React.FC<DaySelectorProps> = ({ selectedDays, onChange }) => {
    const toggleDay = (day: number) => {
        if (selectedDays.includes(day)) {
            onChange(selectedDays.filter(d => d !== day));
        } else {
            onChange([...selectedDays, day].sort());
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Repetir nos dias</label>
            <div className="flex flex-wrap gap-1 sm:gap-2">
                {DAYS.map((day, idx) => {
                    const isSelected = selectedDays.includes(day.value);
                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => toggleDay(day.value)}
                            className={cn(
                                "w-8 h-8 rounded-full text-xs font-bold transition-all border shrink-0",
                                isSelected
                                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30"
                                    : "bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                            )}
                        >
                            {day.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
