import { ChevronUp, ChevronDown, Target } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface MissionHeaderProps {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    isAllDone: boolean;
    progressPercent: number;
    progressLabel: string;
    onMouseDown?: (e: React.MouseEvent) => void;
}

export const MissionHeader = ({ isOpen, setIsOpen, isAllDone, progressPercent, progressLabel, onMouseDown }: MissionHeaderProps) => {
    return (
        <div
            onMouseDown={isOpen ? onMouseDown : undefined}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
                "flex items-center justify-between shrink-0 transition-all duration-300 select-none",
                isOpen ? "w-full h-14 px-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border-b border-slate-700/50 cursor-move" : "gap-3 cursor-pointer"
            )}
        >
            <div className="flex items-center gap-3">
                {/* Status Icon/Ring */}
                <div className={cn("relative flex items-center justify-center transition-all", isOpen ? "w-8 h-8" : "w-9 h-9")}>
                    {isOpen ? (
                        <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <Target className="w-4 h-4 text-blue-400" />
                        </div>
                    ) : (
                        <>
                            <div className={cn("absolute inset-0 rounded-full border-2 transition-all", isAllDone ? "border-emerald-500" : "border-blue-500/30 border-t-blue-500 animate-spin-slow")} />
                            <div className={cn("w-2 h-2 rounded-full", isAllDone ? "bg-emerald-500" : "bg-blue-500 animate-pulse")} />
                        </>
                    )}
                </div>

                {/* Title & Stats */}
                <div className="flex flex-col">
                    <span className={cn("font-bold transition-colors text-sm", isOpen ? "text-slate-100 tracking-wide" : "text-slate-100")}>
                        {isOpen ? "Sua Missão" : "Missão de Hoje"}
                    </span>
                    {!isOpen && (
                        <span className={cn("text-[10px] font-mono font-bold", isAllDone ? "text-emerald-400" : "text-blue-400")}>
                            {progressLabel} ({Math.round(progressPercent)}%)
                        </span>
                    )}
                </div>
            </div>

            {/* Expand/Collapse Controls */}
            {isOpen && (
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Progresso</span>
                        <div className="flex items-baseline gap-1">
                            <span className={cn("text-sm font-bold", isAllDone ? "text-emerald-400" : "text-blue-400")}>{Math.round(progressPercent)}%</span>
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <ChevronDown className="w-5 h-5" />
                    </button>
                </div>
            )}

            {!isOpen && (
                <ChevronUp className="w-4 h-4 text-slate-400 ml-2" />
            )}
        </div>
    );
};
