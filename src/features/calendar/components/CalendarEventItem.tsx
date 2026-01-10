import React from 'react';
import { CheckSquare, Flag, PlayCircle, Loader2, Trash2, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { usePomodoroContext } from '../../../context/PomodoroContext';
import type { Priority } from '../../../types';

interface CalendarEventItemProps {
    id: string;
    title: string;
    subtitle?: React.ReactNode;
    type: 'task' | 'goal' | 'subtheme';
    isDone: boolean;
    isFuture: boolean;
    priority?: Priority;
    durationMinutes?: number;
    completionTime?: string | null;
    onFocus: () => void;
    onDelete?: () => void;
    onOpenDetails?: () => void;
    isActive?: boolean;
    isSomeoneElseFocused?: boolean;
    lockReason?: string;
    children?: React.ReactNode; // For extra content like progress bars
    colorTheme?: 'indigo' | 'blue' | 'purple' | 'pink';
}

export const CalendarEventItem: React.FC<CalendarEventItemProps> = ({
    id,
    title,
    subtitle,
    type,
    isDone,
    isFuture,
    priority,
    durationMinutes,
    completionTime,
    onFocus,
    onDelete,
    onOpenDetails,
    isActive = false,
    isSomeoneElseFocused = false,
    lockReason,
    children,
    colorTheme = 'blue'
}) => {
    const { isActive: isTimerRunning } = usePomodoroContext();

    const themeStyles = {
        indigo: "hover:border-indigo-500/30 bg-indigo-950/20",
        blue: "hover:border-blue-500/30 bg-blue-950/20",
        purple: "hover:border-purple-500/30 bg-purple-950/20",
        pink: "hover:border-pink-500/30 bg-pink-950/20"
    };

    const getPriorityBorderColor = (p?: string) => {
        switch (p) {
            case 'high': return 'border-l-red-500';
            case 'medium': return 'border-l-amber-500';
            case 'low': return 'border-l-emerald-500';
            default: return 'border-l-slate-700';
        }
    };

    return (
        <div
            role="article"
            aria-label={`${type === 'task' ? 'Tarefa' : type === 'goal' ? 'Meta' : 'Tópico'}: ${title}${isDone ? ', concluído' : ''}`}
            className={cn(
                "group relative p-4 rounded-xl border transition-all duration-300 border-l-4",
                getPriorityBorderColor(priority),
                isDone
                    ? "bg-slate-900/30 border-slate-800 opacity-50 grayscale-[0.5] border-l-slate-800"
                    : cn(
                        "bg-slate-900/60 backdrop-blur-md border-white/5 shadow-lg",
                        themeStyles[colorTheme]
                    )
            )}
        >
            <div className="flex items-start gap-4">
                {/* Visual Checkbox Indicator (Manual Blocked) */}
                <div
                    className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all mt-1",
                        isDone
                            ? "bg-emerald-500 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                            : "border-slate-600 bg-slate-950/50 opacity-40 cursor-not-allowed"
                    )}
                    aria-hidden="true"
                    title={isDone ? "Concluído" : "Utilize o Pomodoro para concluir"}
                >
                    <CheckSquare className={cn("w-3.5 h-3.5 text-white transition-all", isDone ? "scale-100" : "scale-0")} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start flex-wrap gap-y-2">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span
                                    onClick={onOpenDetails}
                                    onKeyDown={(e) => {
                                        if (onOpenDetails && (e.key === 'Enter' || e.key === ' ')) {
                                            e.preventDefault();
                                            onOpenDetails();
                                        }
                                    }}
                                    tabIndex={onOpenDetails && !isDone ? 0 : undefined}
                                    role={onOpenDetails && !isDone ? "button" : undefined}
                                    className={cn(
                                        "font-bold text-sm transition-colors outline-none focus-visible:text-blue-400",
                                        isDone ? "text-slate-500 line-through decoration-slate-700" : "text-white cursor-pointer hover:underline"
                                    )}
                                >
                                    {title}
                                </span>
                                {isDone && (
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider">
                                        ✓ Feito
                                    </span>
                                )}
                            </div>
                            {subtitle && (
                                <p className="text-[10px] text-slate-500 flex items-center gap-2 whitespace-nowrap overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                            {/* Actions Column */}
                            <div className="flex items-center justify-end gap-2 flex-wrap">
                                {durationMinutes !== undefined && (
                                    <span
                                        className="flex items-center gap-1 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap"
                                        title="Tempo Estimado"
                                        aria-label={`Duração estimada: ${durationMinutes} minutos`}
                                    >
                                        <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                                        {durationMinutes} min
                                    </span>
                                )}

                                {!isDone && (
                                    <>
                                        {isSomeoneElseFocused ? null : (
                                            lockReason ? (
                                                <span className="text-[10px] text-slate-500 italic px-2 flex items-center gap-1 whitespace-nowrap">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
                                                    {lockReason}
                                                </span>
                                            ) : isActive ? (
                                                <button
                                                    className="flex items-center gap-1 text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/50 animate-pulse cursor-default whitespace-nowrap"
                                                    aria-label="Foco ativo no momento"
                                                >
                                                    <Loader2
                                                        className="w-3 h-3 animate-spin"
                                                        style={{ animationPlayState: isTimerRunning ? 'running' : 'paused' }}
                                                        aria-hidden="true"
                                                    />
                                                    <span>Focando...</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onFocus(); }}
                                                    className={cn(
                                                        "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border transition-all whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-rose-500",
                                                        "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20 group hover:border-rose-500/40"
                                                    )}
                                                    aria-label={`Iniciar foco em ${title}`}
                                                    title="Iniciar Pomodoro"
                                                >
                                                    <PlayCircle className="w-3 h-3" aria-hidden="true" />
                                                    <span>Focar</span>
                                                </button>
                                            )
                                        )}

                                        {onDelete && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 duration-300 outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500"
                                                title="Excluir"
                                                aria-label={`Excluir ${type === 'task' ? 'tarefa' : type === 'goal' ? 'meta' : 'tópico'}: ${title}`}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                            </button>
                                        )}
                                    </>
                                )}

                                {isDone && completionTime && (
                                    <span
                                        className="text-[10px] font-mono text-emerald-500/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap"
                                        aria-label={`Concluído às ${completionTime}`}
                                    >
                                        {completionTime}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
            {/* Active Highlight Line */}
            {!isDone && <div className={cn(
                "absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity",
                colorTheme === 'indigo' ? "bg-indigo-500" : colorTheme === 'purple' ? "bg-purple-500" : colorTheme === 'pink' ? "bg-pink-500" : "bg-blue-500"
            )} aria-hidden="true" />}
        </div>
    );
};
