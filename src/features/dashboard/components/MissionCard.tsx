import React, { useState, useEffect } from 'react';
import { Lock, Play, CheckCircle2, Clock, CheckSquare, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { IconRenderer } from '../../../components/ui/IconRenderer';
import { usePomodoroState } from '../../../context/PomodoroContext';

interface MissionCardProps {
    id: string;
    title: string;
    icon: string;
    type: 'habit' | 'review' | 'task';
    isCompleted: boolean;
    isBlocked: boolean;
    actualStartTime?: string | null;
    actualEndTime?: string | null;
    themeTitle?: string;
    progressInfo?: string;
    domainInfo?: string;
    level?: string;
    domain?: number;
    daysElapsed?: number;
    daysRemaining?: number;
    duration?: number; // Pomodoro duration in minutes
    startDate?: string; // Format: YYYY-MM-DD
    endDate?: string; // Format: YYYY-MM-DD
    progressCurrent?: number; // How many completed
    progressTotal?: number; // Total expected
    timeCurrent?: number; // Days elapsed
    timeTotal?: number; // Total days duration
    schedule?: { number: number; date: string; status: 'completed' | 'pending' | 'projected' }[];
    onFocus?: () => void;
    onToggle?: () => void;
    onOpenDetails?: () => void;
    isActive?: boolean;
    children?: React.ReactNode;
    reviewNumber?: number;
    isLoading?: boolean;
    colorClass?: string;
    allDailyTasksCompleted?: boolean;
    daysOverdue?: number; // Days this mission is overdue
    originalDeadline?: string; // Original deadline date (YYYY-MM-DD)
}

const colorSchemes = {
    habit: {
        gradient: 'from-slate-700 to-slate-600',
        glow: 'shadow-orange-500/20',
        text: 'text-orange-400',
        border: 'border-slate-700/40',
        bgHover: 'hover:bg-slate-800/50',
        accent: 'bg-orange-500/20 border-orange-500/30',
        bg: 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
    },
    review: {
        gradient: 'from-slate-700 to-slate-600',
        glow: 'shadow-emerald-500/20',
        text: 'text-emerald-400',
        border: 'border-slate-700/40',
        bgHover: 'hover:bg-slate-800/50',
        accent: 'bg-emerald-500/20 border-emerald-500/30',
        bg: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
    },
    task: {
        gradient: 'from-slate-700 to-slate-600',
        glow: 'shadow-blue-500/20',
        text: 'text-blue-400',
        border: 'border-slate-700/40',
        bgHover: 'hover:bg-slate-800/50',
        accent: 'bg-blue-500/20 border-blue-500/30',
        bg: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
    }
};

export const MissionCard: React.FC<MissionCardProps> = ({
    id,
    title,
    themeTitle,
    icon,
    type,
    isCompleted,
    isBlocked: propIsBlocked,
    actualStartTime,
    actualEndTime,
    progressInfo,
    domainInfo,
    level,
    domain,
    daysElapsed,
    daysRemaining,
    duration = 25,
    startDate,
    endDate,
    progressCurrent,
    progressTotal,
    timeCurrent,
    timeTotal,
    schedule,
    reviewNumber,
    onFocus,
    onToggle,
    onOpenDetails,
    children,
    isActive = false,
    isLoading = false,
    colorClass,
    allDailyTasksCompleted = false,
    daysOverdue,
    originalDeadline
}) => {
    const [localStarting, setLocalStarting] = useState(false);

    useEffect(() => {
        if (isActive) setLocalStarting(false);
    }, [isActive]);

    const isProcessing = isLoading || localStarting;
    const { isActive: isTimerRunning, openWidget } = usePomodoroState();
    const scheme = colorSchemes[type];
    const isBlocked = propIsBlocked;

    // Comprehensive completion check - don't allow Pomodoro on truly completed items
    const isTrulyComplete = isCompleted ||
        (progressCurrent !== undefined && progressTotal !== undefined && progressCurrent >= progressTotal) ||
        actualEndTime !== null;

    // Check if item is overdue
    const now = new Date();
    const isOverdue = !isCompleted && endDate && new Date(endDate + 'T23:59:59') < now;

    const getIconBackground = () => {
        if (isCompleted) return "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30";
        if (isOverdue && !isCompleted) return "bg-red-500/20 text-red-500 ring-1 ring-red-500/30 shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)]"; // New Red Style
        if (isBlocked) return "bg-slate-800/40 text-slate-500 ring-1 ring-white/5 grayscale";

        // Use custom color class if provided, else use scheme default
        if (colorClass) {
            // Check if it's already a full gradient string or just classes
            if (colorClass.includes('from-')) return `bg-gradient-to-br ${colorClass} text-white shadow-lg ring-1 ring-white/10`;
            return `bg-${colorClass}-500 text-white shadow-lg shadow-${colorClass}-500/20 ring-1 ring-white/10`;
        }

        return `bg-gradient-to-br ${scheme?.bg || 'from-blue-600 to-indigo-700'} text-white shadow-lg shadow-blue-900/40 ring-1 ring-white/20`;
    };

    return (
        <div
            className={cn(
                "relative group rounded-2xl p-4 transition-all duration-300",
                "bg-[#0F172A] border",
                isActive
                    ? "border-rose-500/50 shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]"
                    : isOverdue && !isCompleted
                        ? "border-red-500/50 bg-red-950/10 shadow-[0_0_15px_-5px_rgba(239,68,68,0.2)]" // Red border & bg for overdue
                        : "border-blue-900/30",
                isBlocked ? "opacity-50 grayscale pointer-events-none select-none" : isCompleted ? "opacity-75 cursor-default border-emerald-500/20 bg-emerald-500/5 transition-none" : "hover:bg-slate-800/40 cursor-pointer"
            )}
            onClick={onOpenDetails}
        >
            {/* Overdue glow effect */}
            {isOverdue && !isCompleted && (
                <div className="absolute top-0 right-0 p-12 bg-red-500/10 blur-[40px] rounded-full pointer-events-none animate-pulse" />
            )}
            {/* Main Content Grid */}
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                {/* Icon Container */}
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative group-hover:scale-110 group-hover:rotate-3 flex-shrink-0",
                    getIconBackground()
                )}>
                    {/* Inner Glow/Reflection */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-[1px] rounded-[15px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                    <IconRenderer icon={icon} size={24} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] z-10" />
                </div>

                {/* Text Content */}
                <div className="flex-1 w-full sm:w-auto min-w-0 pt-0.5">
                    {themeTitle && (
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 line-clamp-1 flex items-center gap-1">
                            {themeTitle}
                            {reviewNumber !== undefined && (
                                <span className={cn(
                                    "px-1 rounded text-[9px]",
                                    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                )}>
                                    #{reviewNumber}
                                </span>
                            )}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mb-0.5">
                        {isOverdue && !isCompleted && (
                            <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 whitespace-nowrap animate-pulse">
                                ⚠ Atrasado
                            </span>
                        )}
                        {/* Enhanced Overdue Badge with Days Counter */}
                        {daysOverdue && daysOverdue > 0 && !isCompleted && (
                            <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white border border-red-400/50 whitespace-nowrap animate-pulse shadow-lg shadow-red-500/30">
                                ⏰ {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'} de atraso
                            </span>
                        )}
                        <h3 className={cn(
                            "text-base font-bold text-white truncate transition-colors flex-1",
                            isCompleted && "line-through text-slate-500",
                            !isCompleted && isOverdue && "text-red-400 font-extrabold"
                        )}>
                            {title}
                        </h3>
                        {/* Duration Badge */}
                        {duration && duration > 0 && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-all",
                                isCompleted
                                    ? "bg-slate-700/50 text-slate-400 border border-slate-600/30"
                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-sm"
                            )}>
                                <Clock className="w-3.5 h-3.5" />
                                <span>{duration} min</span>
                            </div>
                        )}
                    </div>

                    {/* Subtitle / Status */}
                    {(actualStartTime || actualEndTime) && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold">
                            <Clock className="w-3 h-3" />
                            <span>
                                {actualStartTime || '--:--'} - {actualEndTime || '--:--'}
                            </span>
                        </div>
                    )}
                    {!actualStartTime && (
                        <p className={cn(
                            "text-xs font-bold uppercase tracking-wider",
                            isCompleted ? "text-emerald-500" :
                                isOverdue && !isCompleted ? "text-red-500 animate-pulse" :
                                    "text-slate-500"
                        )}>
                            {isCompleted
                                ? "CONCLUÍDO"
                                : isOverdue && !isCompleted
                                    ? "ATRASADO"
                                    : (type === 'review' ? 'REVISAR AGORA' : 'PENDENTE')}
                        </p>
                    )}
                    {/* Original Deadline Display */}
                    {originalDeadline && !isCompleted && (
                        <p className="text-[10px] font-medium text-red-400 mt-0.5">
                            Prazo original: {format(new Date(originalDeadline + 'T00:00:00'), 'dd/MM/yyyy')}
                        </p>
                    )}

                    {/* Start/End Dates - Always visible */}
                    {(startDate || endDate) && (
                        <div className={cn(
                            "flex items-center gap-x-2 text-xs mt-1",
                            isCompleted ? "text-emerald-400" : "text-slate-400"
                        )}>
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                                {startDate ? format(new Date(startDate + 'T00:00:00'), 'dd/MM', { locale: ptBR }) : '--/--'}
                                {startDate && endDate && ' • '}
                                {endDate ? format(new Date(endDate + 'T00:00:00'), 'dd/MM', { locale: ptBR }) : ''}
                            </span>
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex sm:flex-row items-center gap-2 mt-3 sm:mt-0 sm:ml-auto w-full sm:w-auto justify-end" onClick={e => e.stopPropagation()}>
                    {/* Play Button */}
                    {!isTrulyComplete && (
                        isActive ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 whitespace-nowrap">
                                <Loader2
                                    className="w-3 h-3 text-rose-400 animate-spin"
                                    style={{ animationPlayState: isTimerRunning ? 'running' : 'paused' }}
                                />
                                <span className="text-[10px] font-bold text-rose-400 uppercase">Focando</span>
                                <span className="text-[10px] font-mono text-rose-300">{actualStartTime || '--:--'}</span>
                            </div>
                        ) : (
                            <button
                                className={cn(
                                    "relative z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg group",
                                    isProcessing
                                        ? "cursor-wait opacity-50 bg-slate-800"
                                        : allDailyTasksCompleted
                                            ? "bg-slate-800 border border-slate-700 cursor-not-allowed"
                                            : "bg-slate-800 hover:bg-green-500 border border-slate-700 hover:border-green-500 text-slate-400 hover:text-white hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-95 cursor-pointer"
                                )}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    console.log('👆 [MISSION CARD] Play button clicked for:', { id, title, type });
                                    e.stopPropagation();
                                    if (allDailyTasksCompleted) {
                                        console.warn('🎉 [MISSION CARD] All daily tasks completed - Pomodoro locked');
                                        return;
                                    }
                                    if (isBlocked) {
                                        console.warn('⛔ [MISSION CARD] Mission is blocked');
                                        alert("Esta missão está bloqueada.");
                                        return;
                                    }
                                    console.log('⏳ [MISSION CARD] Setting localStarting=true');
                                    setLocalStarting(true);
                                    setTimeout(() => setLocalStarting(false), 3000);
                                    console.log('🎯 [MISSION CARD] Calling onFocus...');
                                    onFocus?.();
                                    console.log('📱 [MISSION CARD] Opening widget...');
                                    openWidget(); // Force open widget
                                    console.log('✅ [MISSION CARD] Play click handler complete');
                                }}
                                disabled={isBlocked || isProcessing || allDailyTasksCompleted}
                                title={allDailyTasksCompleted ? "Todas as tarefas concluídas! 🎉" : "Iniciar Foco Imediatamente"}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-5 h-5 animate-spin pointer-events-none text-green-500" />
                                ) : allDailyTasksCompleted ? (
                                    <Lock className="w-4 h-4 text-slate-500 pointer-events-none" />
                                ) : isBlocked ? (
                                    <Lock className="w-4 h-4 text-slate-600 pointer-events-none" />
                                ) : (
                                    <Play className="w-4 h-4 fill-current ml-0.5 pointer-events-none" />
                                )}
                            </button>
                        )
                    )}
                    {isTrulyComplete && (
                        <div className="w-8 h-8 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                    )}

                    {/* Secondary Action (Stop or Details) */}
                    {type === 'task' ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isCompleted) onToggle?.();
                            }}
                            disabled={isCompleted}
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all border group/btn",
                                isCompleted ? "bg-blue-600 border-blue-400 cursor-default" : "bg-blue-600 hover:bg-blue-500 border-blue-400"
                            )}
                        >
                            <CheckSquare className="w-4 h-4 text-white" />
                        </button>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isCompleted) onToggle?.();
                            }}
                            disabled={isCompleted}
                            className={cn(
                                "w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center transition-all",
                                isCompleted ? "cursor-default border-slate-600" : "hover:bg-slate-700 hover:border-slate-500"
                            )}
                        >
                            {/* Checkbox style for non-tasks (Habits/Goals visual cue) */}
                            <div className={cn("w-3 h-3 rounded-sm transition-colors", isCompleted ? "bg-emerald-500" : "bg-slate-400")} />
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Progress Section */}
            <div className="mt-4 space-y-2">
                {/* Labels Row */}
                <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-1 text-xs font-bold text-slate-400">
                    {level && (
                        <span className="text-slate-300 whitespace-nowrap">{type === 'review' ? `Nível ${level}` : `${daysElapsed}/${timeTotal}`}</span>
                    ) || (
                            <span className="whitespace-nowrap">{timeCurrent !== undefined && timeTotal ? `${timeCurrent}/${timeTotal}` : ''}</span>
                        )}

                    {type === 'review' && domain && (
                        <span className="text-emerald-500 whitespace-nowrap">{domain}% Domínio</span>
                    ) || (daysRemaining !== undefined && (
                        <span className="text-blue-400 whitespace-nowrap">
                            {daysRemaining} <span className="hidden sm:inline">dias restantes</span><span className="sm:hidden">dias</span>
                        </span>
                    ))}
                </div>

                {/* Progress Bar */}
                {type === 'review' ? (
                    // Segmented Bar for Reviews
                    <div className="flex gap-1 h-1.5">
                        {[1, 2, 3, 4, 5].map((seg) => {
                            const currentLevel = parseInt(level?.split('/')[0] || '0');
                            const reviewInfo = schedule?.find(s => s.number === seg);

                            return (
                                <div key={seg} className="relative group/tooltip flex-1 h-full">
                                    <div
                                        className={cn(
                                            "w-full h-full rounded-full transition-all cursor-help",
                                            seg <= currentLevel ? "bg-emerald-500" : "bg-slate-800",
                                            reviewInfo?.status === 'pending' && new Date(reviewInfo.date + 'T00:00:00') <= new Date() ? "bg-emerald-500/50" : ""
                                        )}
                                    />
                                    {/* Custom Premium Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover/tooltip:block z-[60] pointer-events-none min-w-[120px]">
                                        <div className="bg-slate-900/90 backdrop-blur-md text-white rounded-lg border border-slate-700/50 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            {/* Header */}
                                            <div className={cn(
                                                "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b border-slate-700/50",
                                                seg <= currentLevel ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800/50 text-slate-400"
                                            )}>
                                                Nível {seg}
                                            </div>

                                            {/* Content */}
                                            <div className="px-3 py-2 space-y-1">
                                                {reviewInfo ? (
                                                    <>
                                                        <div className="text-xs font-medium text-slate-200">
                                                            {(() => {
                                                                try {
                                                                    const d = new Date(reviewInfo.date + 'T00:00:00');
                                                                    if (isToday(d)) return "Hoje";
                                                                    if (isTomorrow(d)) return "Amanhã";
                                                                    if (isYesterday(d)) return "Ontem";
                                                                    return format(d, "d 'de' MMM", { locale: ptBR });
                                                                } catch {
                                                                    return reviewInfo.date;
                                                                }
                                                            })()}
                                                        </div>
                                                        <div className={cn(
                                                            "text-[10px] uppercase font-bold",
                                                            reviewInfo.status === 'completed' ? "text-emerald-400" :
                                                                (reviewInfo.status === 'pending' ? "text-amber-400" : "text-slate-500")
                                                        )}>
                                                            {reviewInfo.status === 'completed' ? 'Concluído' :
                                                                (reviewInfo.status === 'pending' ? 'Pendente' : 'Futuro')}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-slate-500 italic">Não agendado</span>
                                                )}
                                            </div>

                                            {/* Arrow */}
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 border-r border-b border-slate-700/50 rotate-45 backdrop-blur-md"></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Linear Bar for others
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden w-full relative">
                        <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: timeCurrent && timeTotal ? `${(timeCurrent / timeTotal) * 100}%` : '0%' }}
                        />
                        {/* Optional marker if needed */}
                        {timeCurrent && timeTotal && (
                            <div
                                className="absolute top-0 h-full w-2 bg-white rounded-full shadow-lg transform -translate-x-1/2"
                                style={{ left: `${(timeCurrent / timeTotal) * 100}%` }}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Dates below progress */}
            {(startDate || endDate) && !isBlocked && (
                <div className="flex items-center gap-x-2 text-[10px] text-slate-500 mt-3 font-medium border-t border-slate-800/50 pt-2">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">
                        {startDate && new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        {startDate && endDate && ' • '}
                        {endDate && new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                </div>
            )}

            {children}
        </div>
    );
};


