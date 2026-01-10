import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DurationStepperProps {
    value: string;
    onChange: (value: string) => void;
    min?: number;
    step?: number;
    className?: string;
}

export const DurationStepper: React.FC<DurationStepperProps> = ({
    value,
    onChange,
    min = 0,
    step = 1,
    className
}) => {
    const numericValue = parseInt(value) || 0;

    const handleIncrement = () => {
        onChange((numericValue + step).toString());
    };

    const handleDecrement = () => {
        if (numericValue - step < min) {
            onChange(min.toString());
        } else {
            onChange((numericValue - step).toString());
        }
    };

    return (
        <div className={cn("flex items-center justify-between w-full h-full bg-slate-950/50 rounded-xl border border-white/5 overflow-hidden", className)}>
            <button
                type="button"
                onClick={handleDecrement}
                className="w-10 h-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors"
                title="Diminuir"
            >
                <Minus className="w-4 h-4" />
            </button>

            <div className="flex-1 h-full flex items-center justify-center border-x border-white/5 bg-slate-950/30">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="bg-transparent border-none text-center text-slate-200 text-sm font-bold w-full focus:ring-0 p-0 appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={min}
                />
            </div>

            <button
                type="button"
                onClick={handleIncrement}
                className="w-10 h-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors"
                title="Aumentar"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
};
