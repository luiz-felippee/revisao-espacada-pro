import React from 'react';

interface GoalTypeSelectorProps {
    type: 'simple' | 'checklist' | 'habit';
    onChange: (type: 'simple' | 'checklist' | 'habit') => void;
}

export const GoalTypeSelector: React.FC<GoalTypeSelectorProps> = ({ type, onChange }) => {
    return (
        <div className="bg-slate-950/60 p-1 rounded-xl border border-white/5 flex gap-1 overflow-x-auto no-scrollbar">
            {[
                { value: 'simple', label: 'Simples', icon: '📝' },
                { value: 'checklist', label: 'Checklist', icon: '✅' },
                { value: 'habit', label: 'Hábito', icon: '🔄' },
            ].map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value as any)}
                    className={`
                        flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 whitespace-nowrap min-w-fit
                        ${type === opt.value
                            ? 'bg-blue-600/10 text-blue-400 shadow-sm border border-blue-500/20'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                        }
                    `}
                >
                    <span className="text-sm">{opt.icon}</span>
                    {opt.label}
                </button>
            ))}
        </div>
    );
};
