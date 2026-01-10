import React from 'react';
import { Target, ChevronRight, Clock, CheckCircle2, ListTodo } from 'lucide-react';
import { EmptyStateWidget } from '../../../components/ui/EmptyStateWidget';

interface MissionPreviewWidgetProps {
    progressPercent: number;
    isAllDone: boolean;
    completedCount: number;
    totalCount: number;
    setIsMissionModalOpen: (isOpen: boolean) => void;
}

export const MissionPreviewWidget = ({ progressPercent, isAllDone, completedCount, totalCount, setIsMissionModalOpen }: MissionPreviewWidgetProps) => {
    const pendingCount = totalCount - completedCount;

    if (totalCount === 0) {
        return (
            <EmptyStateWidget
                icon={ListTodo}
                title="Tudo tranquilo!"
                description="Você não tem missões planejadas para hoje. Aproveite o descanso ou adiante tarefas."
                actionLabel="PLANEJAR AGORA"
                onAction={() => setIsMissionModalOpen(true)}
                gradient="from-blue-500 to-indigo-500"
                className="h-full min-h-[300px]"
            />
        );
    }

    return (
        <div className="bg-gradient-to-br from-slate-900/50 via-slate-900/40 to-slate-950/50 backdrop-blur-md border border-white/10 rounded-3xl p-4 shadow-2xl relative overflow-hidden group/mission">
            {/* Gradient top bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-blue-500 to-emerald-500 opacity-60" />

            {/* Ambient glow effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

            <div className="relative z-10">
                {/* Header - Centered */}
                <div className="flex items-center justify-center gap-3 mb-5">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 ring-1 ring-blue-500/30">
                        <Target className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-white text-base tracking-wide">Sua Missão</h3>
                </div>

                {/* Progress Overview */}
                <div className="mb-3 px-3 py-2 bg-slate-800/40 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-300">Progresso</span>
                        <span className="text-xl font-bold text-white tabular-nums">{progressPercent}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-slate-900/60 rounded-full overflow-hidden ring-1 ring-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000 shadow-lg relative overflow-hidden"
                            style={{ width: `${progressPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                    </div>
                </div>

                {/* Mission Stats - Two Circles */}
                <div
                    onClick={() => setIsMissionModalOpen(true)}
                    className="grid grid-cols-2 gap-3 cursor-pointer"
                >
                    {/* Pending Activities Circle */}
                    <div className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-3 border border-white/5 hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
                        <div className="flex flex-col items-center">
                            {/* Icon */}
                            <div className="mb-2 p-1.5 rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20 group-hover:ring-amber-500/40 transition-all">
                                <Clock className="w-4 h-4 text-amber-400" />
                            </div>

                            {/* Circle */}
                            <div className="relative w-16 h-16 mb-2">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="currentColor"
                                        strokeWidth="5"
                                        fill="transparent"
                                        className="text-slate-800"
                                    />
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="currentColor"
                                        strokeWidth="5"
                                        fill="transparent"
                                        strokeDasharray={175.9}
                                        strokeDashoffset={175.9 * (1 - (pendingCount / Math.max(totalCount, 1)))}
                                        className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] transition-all duration-1000"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xl font-bold text-amber-400 font-mono">{pendingCount}</span>
                                </div>
                            </div>

                            {/* Label */}
                            <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">Pendentes</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">Para fazer</p>
                        </div>
                    </div>

                    {/* Completed Activities Circle */}
                    <div className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-3 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
                        <div className="flex flex-col items-center">
                            {/* Icon */}
                            <div className="mb-2 p-1.5 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>

                            {/* Circle */}
                            <div className="relative w-16 h-16 mb-2">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="currentColor"
                                        strokeWidth="5"
                                        fill="transparent"
                                        className="text-slate-800"
                                    />
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="currentColor"
                                        strokeWidth="5"
                                        fill="transparent"
                                        strokeDasharray={175.9}
                                        strokeDashoffset={175.9 * (1 - (completedCount / Math.max(totalCount, 1)))}
                                        className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)] transition-all duration-1000"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xl font-bold text-emerald-400 font-mono">{completedCount}</span>
                                </div>
                            </div>

                            {/* Label */}
                            <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">Concluídas</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">Finalizadas</p>
                        </div>
                    </div>
                </div>

                {/* View Details Button */}
                <button
                    onClick={() => setIsMissionModalOpen(true)}
                    className="mt-3 w-full py-2 text-xs text-blue-400 font-bold hover:text-blue-300 transition-all flex items-center justify-center gap-2 hover:bg-blue-500/5 rounded-xl group/btn"
                >
                    VER DETALHES
                    <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};
