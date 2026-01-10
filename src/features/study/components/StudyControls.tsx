import React from 'react';

interface StudyControlsProps {
    onGrade: (grade: 'bad' | 'hard' | 'good' | 'easy') => void;
    isVisible: boolean;
}

export const StudyControls: React.FC<StudyControlsProps> = ({ onGrade, isVisible }) => {
    if (!isVisible) return <div className="h-24" />; // Spacer

    return (
        <div className="flex items-center justify-center gap-3 md:gap-4 animate-in slide-in-from-bottom-4 duration-300">
            <button
                onClick={(e) => { e.stopPropagation(); onGrade('bad'); }}
                className="flex flex-col items-center gap-1 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all hover:-translate-y-1 active:scale-95 min-w-[80px]"
            >
                <span className="font-bold text-lg">Errei</span>
                <span className="text-[10px] uppercase tracking-wider opacity-60">Reset</span>
            </button>

            <button
                onClick={(e) => { e.stopPropagation(); onGrade('hard'); }}
                className="flex flex-col items-center gap-1 px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl transition-all hover:-translate-y-1 active:scale-95 min-w-[80px]"
            >
                <span className="font-bold text-lg">Difícil</span>
                <span className="text-[10px] uppercase tracking-wider opacity-60">Curto</span>
            </button>

            <button
                onClick={(e) => { e.stopPropagation(); onGrade('good'); }}
                className="flex flex-col items-center gap-1 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all hover:-translate-y-1 active:scale-95 min-w-[80px]"
            >
                <span className="font-bold text-lg">Bom</span>
                <span className="text-[10px] uppercase tracking-wider opacity-60">Médio</span>
            </button>

            <button
                onClick={(e) => { e.stopPropagation(); onGrade('easy'); }}
                className="flex flex-col items-center gap-1 px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl transition-all hover:-translate-y-1 active:scale-95 min-w-[80px]"
            >
                <span className="font-bold text-lg">Fácil</span>
                <span className="text-[10px] uppercase tracking-wider opacity-60">Longo</span>
            </button>
        </div>
    );
};
