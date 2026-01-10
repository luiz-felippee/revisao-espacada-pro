import React from 'react';
import { PlayCircle, CheckSquare, Flame, BrainCircuit, Target, Clock as ClockIcon, Loader2, Lock } from 'lucide-react';
import { usePomodoroState } from '../../../context/PomodoroContext';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import { parseLocalDate } from '../../../utils/dateHelpers';

interface MissionItemProps {
    item: any;
    type: 'habit' | 'review' | 'task';
    isDone: boolean;
    onToggle: () => void;
    onFocus: () => void;
    activeFocusId?: string | null;
    activeStartTime?: number;
    isLocked?: boolean;
    lockReason?: string;
    scheduledTime?: string;
    onSetTime?: (time: string) => void;
    startedAt?: number;
}

const MissionItemComponent = ({ item, type, isDone, onToggle, onFocus, activeFocusId, activeStartTime, isLocked, lockReason, scheduledTime, onSetTime, startedAt }: MissionItemProps) => {
    const { isActive: isTimerRunning } = usePomodoroState();
    const [isEditingTime, setIsEditingTime] = React.useState(false);

    // Check if item is overdue
    const now = new Date();
    const itemDateStr = item.date || (item.deadline ? item.deadline.split('T')[0] : undefined);
    const isOverdue = !isDone && itemDateStr && (() => {
        const d = parseLocalDate(itemDateStr);
        d.setHours(23, 59, 59, 999);
        return d < now;
    })();

    // FIXED COLORS - with overdue highlight
    const baseColor = isOverdue ? 'red' : (type === 'habit' ? 'emerald' : type === 'review' ? 'violet' : 'blue');
    const borderColor = isDone ? `border-${baseColor}-500/50` : (isOverdue ? 'border-red-500/70' : 'border-slate-700/50');

    const getIcon = () => {
        if (type === 'habit') return <Flame className={cn("w-6 h-6 transition-all", isDone ? "text-white fill-emerald-200 animate-[bounce_1s_infinite]" : (isOverdue ? "text-red-400" : "text-white/80"))} />;
        if (type === 'review') return <BrainCircuit className={cn("w-6 h-6 transition-all", isDone ? "text-violet-100" : (isOverdue ? "text-red-400" : "text-white/80"))} />;
        return <Target className={cn("w-6 h-6 transition-all", isDone ? "text-blue-100" : (isOverdue ? "text-red-400" : "text-white/80"))} />;
    };

    const getSubtitle = () => {
        if (isDone) {
            const startTimeStr = startedAt ? format(new Date(startedAt), 'HH:mm') : (activeStartTime ? format(new Date(activeStartTime), 'HH:mm') : null);
            const endTimeStr = item.completedAt ? format(new Date(item.completedAt), 'HH:mm') : 'Concluído';
            if (startTimeStr && item.completedAt) return `Início: ${startTimeStr} • Fim: ${endTimeStr}`;
            return endTimeStr;
        }

        // Active Focus Logic
        if (activeFocusId === (item.subthemeId || item.id)) {
            return activeStartTime ? `Iniciado às ${format(new Date(activeStartTime), 'HH:mm')}` : 'Em Foco...';
        }

        // Previously Started Logic
        if (startedAt) return `Iniciado às ${format(new Date(startedAt), 'HH:mm')}`;

        if (type === 'habit') return item.recurrence && item.recurrence.length > 0 ? 'Hábito Diário' : 'Meta Recorrente';
        if (type === 'review') return `Nível ${item.reviewNumber || 0}/5`; // Simple subtitle for review

        if (item.deadline) {
            const now = new Date();
            const deadline = parseLocalDate(item.deadline);
            if (deadline < now && !isDone) return 'Atrasado';
            return `Prazo: ${format(deadline, 'HH:mm')}`;
        }
        return 'Aguardando';
    };

    const mainTitle = type === 'review' ? item.themeTitle : (item.title || item.subthemeTitle);

    return (
        <div
            onClick={() => {
                if (isLocked || isDone) return;
                onToggle();
            }}
            className={cn(
                "group relative overflow-hidden rounded-2xl border transition-colors duration-200 cursor-pointer select-none flex flex-col",
                isDone
                    ? `bg-gradient-to-br from-${baseColor}-900/40 to-slate-900/80 ${borderColor}`
                    : isOverdue
                        ? "bg-gradient-to-br from-red-900/30 to-orange-900/20 border-red-500/70 hover:bg-red-900/40 hover:border-red-500/90 shadow-lg shadow-red-500/20"
                        : "bg-slate-900/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700"
            )}
        >
            {/* Glow Effect */}
            {isDone && (
                <div className={`absolute top-0 right-0 p-16 bg-${baseColor}-500/10 blur-[50px] rounded-full pointer-events-none`} />
            )}
            {isOverdue && !isDone && (
                <div className="absolute top-0 right-0 p-16 bg-red-500/15 blur-[50px] rounded-full pointer-events-none animate-pulse" />
            )}

            <div className="relative p-4 z-10 flex flex-col gap-4">
                {/* TOP ROW: Icon + Content */}
                <div className="flex items-start gap-4">
                    {/* Left: Icon / Image Box */}
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg shrink-0 overflow-hidden relative",
                        isDone
                            ? `bg-gradient-to-br from-${baseColor}-500 to-${baseColor}-600 shadow-${baseColor}-900/50 scale-105`
                            : isOverdue
                                ? "bg-gradient-to-br from-red-500 to-orange-600 shadow-red-900/60 border border-red-400/30 pulse"
                                : `bg-${baseColor}-500/20 border border-white/5 group-hover:bg-${baseColor}-500/30`
                    )}>
                        {type === 'review' && item.imageUrl ? (
                            <img src={item.imageUrl} alt={mainTitle} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        ) : (
                            getIcon()
                        )}
                    </div>

                    {/* Right: Text Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[3.5rem]">
                        <div className="flex flex-col gap-1">
                            {/* Overdue Badge + Title */}
                            <div className="flex items-center gap-2">
                                {isOverdue && (
                                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/40 whitespace-nowrap animate-pulse">
                                        ⚠ Atrasado
                                    </span>
                                )}
                                <h4 className={cn(
                                    "text-base font-bold truncate transition-colors leading-tight flex-1",
                                    isDone
                                        ? `text-${baseColor}-100`
                                        : isOverdue
                                            ? "text-red-400 font-extrabold"
                                            : "text-white"
                                )}>
                                    {mainTitle}
                                </h4>
                            </div>

                            {/* Subtitle / Status Tags */}
                            <div className="flex flex-wrap items-center gap-2">
                                {activeFocusId === (item.subthemeId || item.id) && activeStartTime && (
                                    <span className="text-[9px] font-mono text-blue-400 bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-500/30 whitespace-nowrap animate-pulse">
                                        {format(new Date(activeStartTime), 'HH:mm')}
                                    </span>
                                )}

                                {/* Category Tag for Reviews */}
                                {type === 'review' && (
                                    <span className="text-[10px] text-violet-400 font-bold bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/10 truncate max-w-[150px]">
                                        {item.subthemeTitle}
                                    </span>
                                )}

                                {/* Main Subtitle */}
                                {isDone ? (
                                    <span className={cn(
                                        "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm",
                                        `text-${baseColor}-300 bg-${baseColor}-950/40 border-${baseColor}-500/30`
                                    )}>
                                        <CheckSquare className="w-3 h-3" />
                                        {item.completedAt ? `Concluído às ${format(new Date(item.completedAt), 'HH:mm')}` : 'Concluído'}
                                    </span>
                                ) : (
                                    <span className={cn(
                                        "text-[10px] uppercase tracking-wider font-bold truncate",
                                        getSubtitle().includes('Atrasado') ? "text-red-400 font-bold animate-pulse" : "text-slate-500"
                                    )}>
                                        {activeFocusId !== (item.subthemeId || item.id) && getSubtitle()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MIDDLE ROW: Progress (Conditional) */}
                {(() => {
                    if (type === 'habit' && item.deadline) {
                        const start = parseLocalDate(item.createdAt || new Date());
                        const end = parseLocalDate(item.deadline);
                        const now = new Date();
                        const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                        const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        const completedCount = item.completionHistory?.length || 0;
                        const percent = Math.min(100, Math.round((completedCount / totalDays) * 100));
                        const isLate = daysLeft < 0;

                        return (
                            <div className="w-full pl-0 md:pl-[4.5rem]">
                                <div className="flex items-center justify-between text-[9px] font-bold mb-1 opacity-80">
                                    <span className={cn("text-slate-500", isDone && "text-slate-400")}>{completedCount}/{totalDays} dias</span>
                                    <span className={cn("text-slate-500", isLate ? "text-red-400" : "text-blue-400")}>{isLate ? 'Expirado' : `${daysLeft} dias restantes`}</span>
                                </div>
                                <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                    <div className={cn("h-full rounded-full transition-all duration-500", isDone ? "bg-white" : `bg-${baseColor}-500`)} style={{ width: `${percent}%` }} />
                                </div>
                            </div>
                        );
                    }
                    if (type === 'review') {
                        const current = item.reviewNumber || 0;
                        const percent = Math.min(100, Math.round(((current - 1) / 5) * 100));
                        return (
                            <div className="w-full pl-0 md:pl-[4.5rem]">
                                <div className="flex items-center justify-between text-[9px] font-bold mb-1">
                                    <span className="text-slate-500">Nível {current}/5</span>
                                    <span className="text-violet-400">{Math.min(100, percent + 20)}% Domínio</span>
                                </div>
                                <div className="flex gap-1 h-1.5">
                                    {[1, 2, 3, 4, 5].map(step => (
                                        <div key={step} className={cn("flex-1 rounded-sm transition-all", step < current ? "bg-violet-500" : step === current ? (isDone ? "bg-violet-400" : "bg-violet-900/40 border border-violet-500/30") : "bg-slate-800")} />
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    if (type === 'task' && item.type === 'period' && item.startDate && item.endDate) {
                        // ... Repetitive logic for period task progress ...
                        const start = parseLocalDate(item.startDate);
                        const end = parseLocalDate(item.endDate);
                        const now = new Date();
                        const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
                        const elapsedDays = Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
                        const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                        const percent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));
                        const isLate = daysLeft < 0;
                        return (
                            <div className="w-full pl-0 md:pl-[4.5rem]">
                                <div className="flex items-center justify-between text-[9px] font-bold mb-0.5 opacity-80">
                                    <span className={cn("text-slate-400", isDone && "text-slate-200")}>Dia {Math.min(elapsedDays, totalDays)}/{totalDays}</span>
                                    <span className={cn("text-slate-500", isLate ? "text-red-400" : "text-blue-400")}>{daysLeft === 0 ? 'Último dia' : isLate ? 'Atrasado' : `${daysLeft} dias`}</span>
                                </div>
                                <div className="h-1 bg-slate-950/50 rounded-full overflow-hidden border border-white/5">
                                    <div className={cn("h-full rounded-full transition-all duration-500", isDone ? "bg-white" : `bg-${baseColor}-500`)} style={{ width: `${percent}%` }} />
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* BOTTOM ROW: Actions (Clock, Play, Check) */}
                <div className="flex flex-wrap items-center justify-between gap-y-3 border-t border-white/5 pt-3 mt-1 pl-0 md:pl-[4.5rem]">
                    {/* Time Setting */}
                    {onSetTime ? (
                        <div className="flex-1 min-w-[80px]">
                            {isEditingTime ? (
                                <input
                                    type="time"
                                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 w-full md:w-24"
                                    value={scheduledTime || ''}
                                    onChange={(e) => onSetTime(e.target.value)}
                                    onBlur={() => setIsEditingTime(false)}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsEditingTime(true); }}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-slate-800 touch-manipulation",
                                        scheduledTime ? "text-indigo-300" : "text-slate-500"
                                    )}
                                >
                                    <ClockIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{scheduledTime || "Definir Horário"}</span>
                                    <span className="sm:hidden">{scheduledTime || "Horário"}</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1" />
                    )}

                    {/* Right Actions */}
                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {isLocked ? (
                            <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-2 justify-center flex-1 md:flex-none">
                                <Lock className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                    {lockReason && lockReason.includes("atual") ? "Agendado" : (lockReason || "Bloqueado")}
                                </span>
                            </div>
                        ) : (
                            <>
                                {activeFocusId === (item.id || item.subthemeId) ? (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 animate-pulse flex-1 md:flex-none justify-center">
                                        <Loader2
                                            className="w-3.5 h-3.5 animate-spin"
                                            style={{ animationPlayState: isTimerRunning ? 'running' : 'paused' }}
                                        />
                                        <span>Focando...</span>
                                    </div>
                                ) : (() => {
                                    // Robust completion check
                                    let isTrulyDone = isDone || !!item.completedAt;

                                    if (!isTrulyDone && type === 'habit' && item.deadline) {
                                        try {
                                            const start = parseLocalDate(item.createdAt || new Date());
                                            const end = parseLocalDate(item.deadline);
                                            start.setHours(0, 0, 0, 0);
                                            end.setHours(0, 0, 0, 0);
                                            const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                                            const completedCount = item.completionHistory?.length || 0;
                                            if (completedCount >= totalDays) isTrulyDone = true;
                                        } catch (e) {
                                            console.warn('Error calculating habit progress in MissionItem', e);
                                        }
                                    }

                                    if (isTrulyDone) return null;

                                    return (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onFocus(); }}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex-1 md:flex-none justify-center touch-manipulation",
                                                `border-slate-700 bg-slate-800 hover:bg-${baseColor}-500 hover:border-${baseColor}-400 hover:text-white text-slate-300`
                                            )}
                                            title="Iniciar"
                                        >
                                            <PlayCircle className="w-4 h-4" />
                                            <span>Focar</span>
                                        </button>
                                    );
                                })()}


                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isDone) onToggle();
                                    }}
                                    disabled={(!!activeFocusId && activeFocusId !== (item.id || item.subthemeId)) || isDone}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex-1 md:flex-none justify-center touch-manipulation",
                                        isDone
                                            ? `bg-${baseColor}-500 border-${baseColor}-400 text-white shadow cursor-default`
                                            : !!activeFocusId && activeFocusId !== (item.id || item.subthemeId)
                                                ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-50"
                                                : "bg-slate-800 border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-500"
                                    )}
                                >
                                    <CheckSquare className="w-4 h-4" />
                                    <span>
                                        {isDone && item.completedAt
                                            ? format(new Date(item.completedAt), 'HH:mm')
                                            : (isDone ? 'Concluído' : 'Concluir')
                                        }
                                    </span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export const MissionItem = React.memo(MissionItemComponent, (prev, next) => {
    return (
        prev.item === next.item &&
        prev.type === next.type &&
        prev.isDone === next.isDone &&
        prev.activeFocusId === next.activeFocusId &&
        prev.activeStartTime === next.activeStartTime &&
        prev.isLocked === next.isLocked &&
        prev.lockReason === next.lockReason &&
        prev.scheduledTime === next.scheduledTime &&
        prev.startedAt === next.startedAt
    );
});
