import React from 'react';
import { Flag } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Priority } from '../../types';

interface PrioritySelectorProps {
    value: Priority;
    onChange: (value: Priority) => void;
    label?: string;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ value, onChange, label = "Prioridade" }) => {
    const priorities: { value: Priority; label: string; color: string; hover: string; active: string }[] = [
        {
            value: 'high',
            label: 'Alta',
            color: 'text-red-500',
            hover: 'hover:bg-red-500/10 hover:border-red-500/50',
            active: 'bg-red-500/20 border-red-500'
        },
        {
            value: 'medium',
            label: 'Média',
            color: 'text-amber-500',
            hover: 'hover:bg-amber-500/10 hover:border-amber-500/50',
            active: 'bg-amber-500/20 border-amber-500'
        },
        {
            value: 'low',
            label: 'Baixa',
            color: 'text-emerald-500',
            hover: 'hover:bg-emerald-500/10 hover:border-emerald-500/50',
            active: 'bg-emerald-500/20 border-emerald-500'
        },
    ];

    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
            <div className="flex gap-1 bg-slate-950/50 p-1 rounded-xl border border-white/5">
                {priorities.map((p) => {
                    const isSelected = value === p.value;
                    return (
                        <button
                            key={p.value}
                            type="button"
                            onClick={() => onChange(p.value)}
                            className={cn(
                                "flex-1 min-w-0 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200",
                                isSelected ? p.active : "text-slate-500 hover:text-slate-300 hover:bg-white/5",
                                !isSelected && p.color.replace('text-', 'text-opacity-60')
                            )}
                            title={`Prioridade ${p.label}`}
                        >
                            <Flag className={cn("w-3.5 h-3.5 shrink-0", isSelected && "fill-current")} />
                            <span className="truncate">{p.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
