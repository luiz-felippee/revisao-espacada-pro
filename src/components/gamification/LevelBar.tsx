import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStudy } from '../../context/StudyContext';
import { Trophy, X, ChevronRight } from 'lucide-react';
import { XP_TABLE_DISPLAY, getTitleForLevel } from '../../config/gamification.config';
import { cn } from '../../lib/utils';

export const LevelBar = () => {
    const { gamification } = useStudy();
    const { level } = gamification || { level: { level: 1, currentXp: 0, nextLevelXp: 500, totalXp: 0 } };
    const [showDetails, setShowDetails] = useState(false);

    const percentage = Math.min(100, Math.max(0, (level.currentXp / level.nextLevelXp) * 100));
    const currentTitle = getTitleForLevel(level.level);

    return (
        <div className="relative font-sans w-full cursor-default select-none group/level">
            {/* Main Widget Card */}
            <div
                onClick={() => setShowDetails(true)}
                className="relative w-full bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-3 overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:bg-slate-900/80 cursor-pointer active:scale-[0.98]"
            >
                {/* Subtle Active Glow */}
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover/level:opacity-100 transition-opacity" />

                <div className="flex items-center gap-3 relative z-10">
                    {/* Rank Icon */}
                    <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover/level:shadow-blue-500/40 transition-shadow">
                            <Trophy className="w-5 h-5 text-white drop-shadow-sm" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-slate-950 border border-slate-800 text-[9px] font-bold text-white px-1.5 rounded-md shadow-sm z-20">
                            v{level.level}
                        </div>
                    </div>

                    {/* Info & Progress */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs font-bold text-slate-100 truncate group-hover/level:text-blue-200 transition-colors">
                                    {currentTitle}
                                </span>
                                <ChevronRight className="w-3 h-3 text-slate-600 group-hover/level:translate-x-0.5 transition-transform" />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-blue-400">
                                {Math.round(percentage)}%
                            </span>
                        </div>

                        {/* Liquid Progress Bar */}
                        <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden relative">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                style={{ width: `${percentage}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SAFE PORTAL DETAILS MODAL */}
            {showDetails && (
                createPortal(
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDetails(false)}>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-xs bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-0 shadow-2xl relative overflow-hidden ring-1 ring-white/10 animate-in zoom-in-95 duration-200"
                        >
                            {/* Header Gradient */}
                            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none" />

                            {/* Modal Header */}
                            <div className="relative p-5 text-center pb-0">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/20 mb-4 ring-1 ring-white/10">
                                    <Trophy className="w-8 h-8 text-white drop-shadow-md" />
                                </div>
                                <h2 className="text-xl font-black text-white tracking-tight mb-1">Nível {level.level}</h2>
                                <p className="text-sm text-blue-200 font-medium">{currentTitle}</p>

                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-full hover:bg-white/5 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 px-5 py-6">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center">
                                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Total XP</span>
                                    <span className="text-lg font-mono font-bold text-blue-400">{level.totalXp}</span>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center">
                                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Próximo</span>
                                    <span className="text-lg font-mono font-bold text-slate-300">{level.nextLevelXp}</span>
                                </div>
                            </div>

                            {/* XP Table List */}
                            <div className="px-5 pb-6 space-y-2">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 pl-1">
                                    Como ganhar XP
                                </div>
                                {XP_TABLE_DISPLAY.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.02] hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-1.5 rounded-lg", (item.color || "").replace('text-', 'bg-').replace('400', '500/10'))}>
                                                <item.icon className={cn("w-3.5 h-3.5", item.color)} />
                                            </div>
                                            <span className="text-xs font-medium text-slate-300">{item.label}</span>
                                        </div>
                                        <span className={cn("text-xs font-bold font-mono", item.color)}>+{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    , document.body as HTMLElement)
            )}
        </div>
    );
};
