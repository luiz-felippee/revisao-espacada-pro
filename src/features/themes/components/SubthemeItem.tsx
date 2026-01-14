import { useState, useRef } from 'react';
import { useStudy } from '../../../context/StudyContext';
import { usePomodoroState } from '../../../context/PomodoroContext';
import { useAudio } from '../../../context/AudioContext';
import { Play, FileText, ChevronDown, BookOpen, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';
import type { Subtheme, Review } from '../../../types';
import { useSRSLogic } from '../../../hooks/useSRSLogic';
import { SummaryHistoryModal } from './SummaryHistoryModal';

interface SubthemeItemProps {
    sub: Subtheme;
    themeColor: string;
    projectedStart?: string;
    onOpenNotes: (sub: Subtheme) => void;
    unlockedSubthemes: string[];
}

export const SubthemeItem = ({ sub, themeColor, projectedStart, onOpenNotes, unlockedSubthemes }: SubthemeItemProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { startFocus } = useStudy();
    const { startFocusSession, isActive } = usePomodoroState();
    const { startAudio } = useAudio();
    const { generateProjectedReviews } = useSRSLogic();

    // Strict Summary Unlock Logic
    const isUnlocked = unlockedSubthemes && unlockedSubthemes.includes(sub.id);

    // Determines items to show
    let displayReviews = [...sub.reviews];
    const isProjectedView = sub.status === 'queue' && projectedStart && displayReviews.length === 0;

    if (isProjectedView && projectedStart) {
        displayReviews = generateProjectedReviews(projectedStart);
    }
    const sortedReviews = displayReviews.sort((a: Review, b: Review) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Status Config
    const statusConfig: Record<string, { color: string; bg: string; border: string; icon: string; label: string }> = {
        active: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '⚡', label: 'Ativo' },
        completed: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: '✓', label: 'Concluído' },
        queue: { color: 'text-slate-400', bg: 'bg-slate-800/50', border: 'border-slate-700/50', icon: '⏳', label: 'Fila' },
    };
    const status = statusConfig[sub.status as string] || statusConfig.queue;

    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    // ... existing statusConfig ...

    const isModule = sub.difficulty === 'module';

    if (isModule) {
        // ... module render ...
        return (
            <div className="relative py-2 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800/50"></div>
                </div>
                <span className="relative bg-slate-950 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                    {sub.title}
                </span>
            </div>
        );
    }

    return (
        <>
            <div className={cn(
                "rounded-xl transition-all duration-300 border group/item overflow-hidden",
                isExpanded ? "bg-slate-900 border-slate-700 shadow-xl" : "bg-slate-900/40 border-slate-800/50 hover:bg-slate-900/60 hover:border-slate-700/50"
            )}>
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-3 flex items-center gap-3 cursor-pointer select-none"
                >
                    {/* Status Dot */}
                    <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px]", status.bg.replace('bg-', 'bg-').replace('/10', ''))}
                        style={{ backgroundColor: status.color.replace('text-', ''), boxShadow: `0 0 8px currentColor` }}
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                        <span className={cn(
                            "text-sm font-medium transition-colors truncate",
                            isExpanded ? "text-white" : "text-slate-400 group-hover:item:text-slate-200",
                            sub.status === 'completed' && "line-through opacity-50 text-slate-600"
                        )}>
                            {sub.title}
                        </span>
                        {sub.durationMinutes && (
                            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                {sub.durationMinutes} min estimados
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Summary History Button (New) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSummaryOpen(true);
                            }}
                            className={cn(
                                "w-7 h-7 flex items-center justify-center rounded-lg border transition-all",
                                "bg-slate-800 border-slate-700 text-slate-500 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30"
                            )}
                            title="Diário de Aprendizado / Resumos"
                        >
                            <BookOpen className="w-3.5 h-3.5 fill-current" />
                        </button>

                        {/* Edit Content / Notes Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isUnlocked) onOpenNotes(sub);
                            }}
                            disabled={!isUnlocked}
                            className={cn(
                                "w-7 h-7 flex items-center justify-center rounded-lg border transition-all",
                                !isUnlocked
                                    ? "bg-slate-800/50 border-slate-700/50 text-slate-600 cursor-not-allowed opacity-50"
                                    : sub.text_content
                                        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 hover:text-white"
                                        : "bg-slate-800 border-slate-700 text-slate-500 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30"
                            )}
                            title={isUnlocked ? "Anotações do Conteúdo" : "Complete um Pomodoro hoje para liberar o conteúdo"}
                        >
                            <FileText className="w-3.5 h-3.5 fill-current" />
                        </button>

                        {/* Play Button for Subtheme */}
                        {(() => {
                            // Determine availability
                            let isLocked = false;
                            let lockReason = "";
                            const todayStr = format(new Date(), 'yyyy-MM-dd');

                            if (sub.status === 'completed') {
                                isLocked = true;
                                lockReason = "Tema concluído! Parabéns!";
                            } else if (sub.status === 'queue') {
                                isLocked = true;
                                lockReason = "Este módulo ainda não foi iniciado.";
                                if (projectedStart) lockReason += ` Previsão: ${format(new Date(projectedStart), 'dd/MM')}`;
                            } else if (sub.status === 'active') {
                                const nextReview = sub.reviews.find((r: any) => r.status === 'pending');
                                if (!nextReview) {
                                    isLocked = true;
                                    lockReason = "Sem revisões pendentes.";
                                } else if (nextReview.date > todayStr) {
                                    isLocked = true;
                                    lockReason = `Próxima revisão agendada para ${format(new Date(nextReview.date), 'dd/MM')}`;
                                }
                            }

                            return (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Critical: Check Ref (sync) AND State (async) AND Context (global)
                                        if (isLocked || isActive) return;

                                        startFocus(sub.id, 'subtheme', sub.title, 25);
                                        startFocusSession(sub.id, 'subtheme', sub.title, 25);
                                    }}
                                    disabled={isLocked || isActive}
                                    className={cn(
                                        "w-7 h-7 flex items-center justify-center rounded-lg border transition-all relative group/playbtn",
                                        isLocked || isActive
                                            ? "bg-slate-800/50 border-slate-700/50 text-slate-600 cursor-not-allowed"
                                            : "bg-slate-800 hover:bg-emerald-600 border-slate-700 hover:border-emerald-500 text-slate-400 hover:text-white"
                                    )}
                                    title={isActive ? "Foco em andamento" : (isLocked ? lockReason : "Focar neste Tema")}
                                >
                                    {isLocked ? (
                                        <Lock className="w-3 h-3 text-slate-600" />
                                    ) : (
                                        <Play className="w-3 h-3 fill-current" />
                                    )}
                                </button>
                            );
                        })()}

                        <ChevronDown className={cn("w-4 h-4 text-slate-600 transition-transform duration-300", isExpanded && "rotate-180 text-white")} />
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="px-3 pb-3 border-t border-slate-800/50 animate-in slide-in-from-top-2 duration-200">
                        <div className="mt-2 grid gap-1">
                            {sortedReviews.length === 0 ? (
                                <p className="text-[10px] text-slate-600 italic text-center py-2">Sem revisões agendadas.</p>
                            ) : (
                                <div className="relative">
                                    {/* Timeline Line (Visual Only) */}
                                    <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-800/50" />

                                    {sortedReviews.map((rev: any, idx: number) => {
                                        const isDone = rev.status === 'completed';
                                        const isNext = !isDone && !rev.isProjected && rev.number === (sortedReviews.find((r: any) => r.status === 'pending')?.number || 0);

                                        return (
                                            <div key={idx} className="relative flex items-center gap-3 py-1.5 pl-1 group/rev">
                                                {/* Dot on Timeline */}
                                                <div className={cn(
                                                    "relative z-10 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-bold transition-all",
                                                    isDone
                                                        ? "bg-slate-900 border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                                        : isNext
                                                            ? "bg-blue-500 border-blue-400 text-white animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                            : "bg-slate-900 border-slate-700 text-slate-600"
                                                )}>
                                                    {isDone ? '✓' : rev.number}
                                                </div>

                                                <div className="flex-1 flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors">
                                                    <span className={cn("font-mono", isDone ? "text-emerald-400" : isNext ? "text-blue-300" : "text-slate-500")}>
                                                        {format(new Date(rev.date), 'dd/MM/yyyy')}
                                                    </span>
                                                    <span className={cn("text-[10px] font-bold uppercase",
                                                        isDone ? "text-emerald-500" :
                                                            rev.isProjected ? "text-slate-700 italic" :
                                                                isNext ? "text-blue-400" : "text-amber-500/50"
                                                    )}>
                                                        {rev.isProjected ? 'Estimado' : isDone ? 'Feito' : isNext ? 'Próximo' : 'Pendente'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <SummaryHistoryModal
                isOpen={isSummaryOpen}
                onClose={() => setIsSummaryOpen(false)}
                subtheme={sub}
            />
        </>
    );
}
