import React from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { cn } from '../../../lib/utils';

interface CalendarDayProps {
    day: Date;
    currentMonth: Date;
    events: {
        reviews: any[];
        intros: any[];
        projected: any[];
        tasks: any[];
        goals: any[];
    };
    onClick: () => void;
    onEventClick: (e: React.MouseEvent, item: any, isProjected: boolean) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
    day,
    currentMonth,
    events,
    onClick,
    onEventClick
}) => {
    const isOutside = !isSameMonth(day, currentMonth);
    const isDayToday = isToday(day);
    const { reviews, intros, projected, tasks, goals } = events;

    const projectedIntros = projected.filter((p: { type: string }) => p.type === 'projected-intro');
    const projectedReviews = projected.filter((p: { type: string }) => p.type === 'projected-review');

    return (
        <div
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
            tabIndex={0}
            role="gridcell"
            aria-current={isDayToday ? 'date' : undefined}
            aria-label={`${format(day, "d 'de' MMMM")}${isDayToday ? ', hoje' : ''}. ${reviews.length + intros.length + tasks.length + goals.length} eventos.`}
            className={cn(
                "min-h-[120px] p-2 transition-colors duration-300 relative group border-r border-b border-white/5 select-none overflow-hidden outline-none",
                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 z-20",
                isOutside ? "bg-slate-950/40 opacity-40 grayscale" : "bg-transparent hover:bg-slate-800/30",
                isDayToday && "bg-blue-600/5 shadow-[inset_0_0_40px_rgba(37,99,235,0.1)]"
            )}
        >
            {isDayToday && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            )}

            <div className="flex justify-between items-start mb-1">
                <span className={cn(
                    "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg transition-all",
                    isDayToday
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110"
                        : "text-slate-500 group-hover:text-slate-300 group-hover:bg-slate-800/50"
                )}>
                    {format(day, 'd')}
                </span>
            </div>

            <div className="space-y-1 relative z-10">
                {/* Intros */}
                {intros.map((intro: { id: string; subthemeTitle: string; themeTitle?: string }, idx: number) => (
                    <div
                        key={`intro-${idx}`}
                        onClick={(e) => onEventClick(e, intro, false)}
                        className="group/tag relative overflow-hidden px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/20 cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-amber-400" />
                            <span className="text-[9px] font-medium text-amber-200 truncate">{intro.subthemeTitle}</span>
                        </div>
                    </div>
                ))}

                {/* Projected Intros */}
                {projectedIntros.map((p: { subthemeTitle: string }, idx: number) => (
                    <div
                        key={`proj-intro-${idx}`}
                        onClick={(e) => onEventClick(e, p, true)}
                        className="px-1.5 py-0.5 rounded border border-dashed border-slate-700/50 hover:bg-slate-800/50 cursor-pointer transition-all opacity-60 hover:opacity-100"
                    >
                        <span className="text-[9px] text-slate-400 truncate block">{p.subthemeTitle}</span>
                    </div>
                ))}

                {/* Reviews */}
                {reviews.slice(0, 3).map((r: { status: string; subthemeTitle: string }, idx: number) => (
                    <div
                        key={`rev-${idx}`}
                        onClick={(e) => onEventClick(e, r, false)}
                        className={cn(
                            "relative px-1.5 py-0.5 rounded cursor-pointer transition-all border",
                            r.status === 'pending'
                                ? "bg-blue-600/10 border-blue-500/20 hover:border-blue-400/50 hover:bg-blue-600/20"
                                : "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10 opacity-60"
                        )}
                    >
                        <div className="flex items-center gap-1">
                            <div className={cn(
                                "w-1 h-1 rounded-full shadow-[0_0_5px_currentColor]",
                                r.status === 'pending' ? "bg-blue-400 text-blue-400" : "bg-emerald-400 text-emerald-400"
                            )} />
                            <span className={cn(
                                "text-[9px] font-medium truncate",
                                r.status === 'pending' ? "text-blue-200" : "text-emerald-300 line-through decoration-emerald-500/50"
                            )}>
                                {r.subthemeTitle}
                            </span>
                        </div>
                    </div>
                ))}

                {reviews.length > 3 && (
                    <div className="text-[9px] text-slate-500 font-medium px-1 flex items-center justify-between">
                        <span>+{reviews.length - 3}</span>
                    </div>
                )}

                {/* Projected Reviews */}
                {projectedReviews.slice(0, 2).map((p: { subthemeTitle: string }, idx: number) => (
                    <div
                        key={`proj-rev-${idx}`}
                        onClick={(e) => onEventClick(e, p, true)}
                        className="px-1.5 py-0.5 rounded border border-dashed border-slate-800 hover:border-slate-600 cursor-pointer transition-all opacity-40 hover:opacity-100"
                    >
                        <span className="text-[9px] text-slate-500 truncate block">{p.subthemeTitle}</span>
                    </div>
                ))}

                {/* Tasks/Goals */}
                {/* Start & Deadline Badges */}
                {[...tasks, ...goals].filter((i: any) => ['Prazo', 'Início'].includes(i.label) || ['project-deadline', 'project-start'].includes(i.type)).map((item: any, idx) => {
                    const isDeadline = item.label === 'Prazo' || item.type === 'project-deadline';
                    return (
                        <div
                            key={`badge-${item.id}-${idx}`}
                            className={cn(
                                "px-1.5 py-0.5 rounded border flex items-center gap-1 mb-1",
                                isDeadline
                                    ? "bg-red-500/10 border-red-500/20"
                                    : "bg-indigo-500/10 border-indigo-500/20"
                            )}
                            title={`${isDeadline ? 'Prazo' : 'Início'}: ${item.title}`}
                        >
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                isDeadline ? "bg-red-500" : "bg-indigo-500"
                            )} />
                            <span className={cn(
                                "text-[9px] font-bold truncate",
                                isDeadline ? "text-red-400" : "text-indigo-400"
                            )}>
                                {item.title}
                            </span>
                        </div>
                    );
                })}

                {/* Other Activity Dots */}
                {(() => {
                    const others = [...tasks, ...goals].filter((i: any) => !['Prazo', 'Início'].includes(i.label) && !['project-deadline', 'project-start'].includes(i.type));
                    if (others.length === 0) return null;
                    return (
                        <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-white/5 opacity-80">
                            {others.slice(0, 5).map((item: any, idx) => (
                                <div
                                    key={`dot-${item.id}-${idx}`}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        item.type === 'task' || item.type === 'day' ? "bg-amber-500" : "bg-emerald-500"
                                    )}
                                    title={item.title}
                                />
                            ))}
                            {others.length > 5 && <span className="text-[8px] text-slate-500">+{others.length - 5}</span>}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};
