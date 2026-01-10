import { ChevronRight } from 'lucide-react';

interface MissionSummaryProps {
    progressPercent: number;
    completedCount: number;
    totalCount: number;
    onExpand: () => void;
}

export const MissionSummary = ({ progressPercent, completedCount, totalCount, onExpand }: MissionSummaryProps) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 h-[300px] relative">
            <div className="absolute top-4 right-4">
                <button onClick={onExpand} className="text-[10px] uppercase font-bold text-blue-400 hover:text-blue-300 tracking-wider">
                    Abrir Tudo
                </button>
            </div>

            {/* Progress Circle */}
            <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                {/* Background Circle */}
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                    {/* Progress Arc */}
                    <circle
                        cx="64"
                        cy="64"
                        r="58"
                        fill="transparent"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={364}
                        strokeDashoffset={364 - (364 * progressPercent) / 100}
                        className="filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                    />
                </svg>
                <span className="text-3xl font-black text-white">{Math.round(progressPercent)}%</span>
            </div>

            <div className="text-center space-y-4">
                <p className="text-slate-400 text-sm font-medium">
                    <span className="text-slate-200 font-bold">{completedCount}/{totalCount}</span> atividades concluídas
                </p>

                <button
                    onClick={onExpand}
                    className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wide mx-auto"
                >
                    Ver Detalhes <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};
