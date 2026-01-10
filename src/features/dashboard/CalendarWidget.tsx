import { useState, useMemo } from 'react';
import { useStudy } from '../../context/StudyContext';
import { useCalendarEvents } from '../calendar/hooks/useCalendarEvents';
import { useProjectContext } from '../../context/ProjectProvider';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths,
    isSameMonth,
    isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { DayDetails } from '../calendar/components/DayDetails';
import { getAllProjectedReviews } from '../../lib/srs';
import type { Task, CalendarReviewItem, CalendarGoalItem, CalendarTaskItem, Goal } from '../../types';
import type { CalendarDayEvents, ProjectedReviewItem } from '../../types/mission';

export const CalendarWidget = () => {
    const { themes, tasks, goals, completeReview, startStudySession, toggleTask, toggleGoal, toggleGoalItem, deleteTask, deleteGoal } = useStudy();
    const { projects } = useProjectContext();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Navigation (Legacy removed)

    // Calendar Generation
    // We can get currentMonth state directly from the hook if needed, but since we manage local state here for the widget,
    // we will pass our state to the hook or just let the hook handle the data processing.
    // Actually, useCalendarEvents manages its own currentMonth state.
    // Let's see... useCalendarEvents exports { currentMonth, setCurrentMonth, ... getEventsForDay }
    // So we can just use that!

    const {
        currentMonth: hookCurrentMonth,
        setCurrentMonth: setHookCurrentMonth,
        calendarDays,
        getEventsForDay
    } = useCalendarEvents({ themes, tasks, goals, projects });

    // Sync local state if needed, or just use hook's state
    // The widget previously had [currentMonth, setCurrentMonth].
    // We can replace the local state with the hook's state.

    // Ensure we update the hook's month when user clicks prev/next
    // functionality is already exposed by the hook (nextMonth, prevMonth helper not exposed directly but setCurrentMonth is)

    const handleNextMonth = () => setHookCurrentMonth(addMonths(hookCurrentMonth, 1));
    const handlePrevMonth = () => setHookCurrentMonth(subMonths(hookCurrentMonth, 1));

    return (
        <>
            <div className="relative overflow-hidden p-3 sm:p-4 md:p-6 rounded-3xl bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-md group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all group-hover:bg-indigo-500/20" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-3 gap-x-2 mb-6 relative z-10">
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 shrink-0">
                        Calendário
                    </h2>

                    <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end w-full sm:w-auto">
                        <span className="text-xs md:text-xs font-medium text-slate-400 capitalize whitespace-nowrap">
                            {format(hookCurrentMonth, 'MMMM yyyy', { locale: ptBR })}
                        </span>
                        <div className="flex bg-white/5 rounded-xl border border-white/10 p-1 backdrop-blur-sm">
                            <button
                                onClick={handlePrevMonth}
                                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all duration-200 active:scale-95"
                                title="Mês anterior"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-white/10 mx-0.5 self-center" />
                            <button
                                onClick={handleNextMonth}
                                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all duration-200 active:scale-95"
                                title="Próximo mês"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-7 text-center mb-2">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                        <div key={i} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 relative z-10">
                    {calendarDays.map((day, idx) => {
                        const { reviews, tasks, goals } = getEventsForDay(day);
                        const isCurrentMonth = isSameMonth(day, hookCurrentMonth);
                        const isDayToday = isToday(day);

                        // Dots calculation
                        const pendingReviews = reviews.filter((r: { status: string }) => r.status === 'pending').length;
                        const completedReviews = reviews.filter((r: { status: string }) => r.status === 'completed').length;
                        const hasGoals = goals.some((g: { isCompletedToday?: boolean }) => !g.isCompletedToday);
                        const hasTasks = tasks.some((t: { isCompletedToday?: boolean }) => !t.isCompletedToday);

                        return (
                            <div
                                key={idx}
                                onClick={() => setSelectedDate(day)}
                                className={cn(
                                    "aspect-square rounded-xl flex flex-col items-center justify-center relative cursor-pointer transition-all duration-300 border border-transparent",
                                    isCurrentMonth
                                        ? "bg-slate-800/20 hover:bg-slate-800/50 hover:border-white/10 hover:scale-105 hover:shadow-lg"
                                        : "opacity-20 text-slate-600 grayscale",
                                    isDayToday && "bg-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.4)] text-white scale-110 z-10 border-blue-500/50"
                                )}
                            >
                                <span className={cn(
                                    "text-[10px] sm:text-xs font-bold",
                                    !isDayToday && "text-slate-400 group-hover:text-white"
                                )}>
                                    {format(day, 'd')}
                                </span>

                                {/* Micro Indicators */}
                                <div className="flex gap-[1px] sm:gap-0.5 mt-0.5 sm:mt-1 flex-wrap justify-center px-0.5">
                                    {pendingReviews > 0 && <div className={cn("w-1 h-1 rounded-full", isDayToday ? "bg-white" : "bg-blue-500")} />}
                                    {pendingReviews === 0 && completedReviews > 0 && <div className={cn("w-1 h-1 rounded-full", isDayToday ? "bg-white/60" : "bg-emerald-500")} />}

                                    {/* Start Date Dot */}
                                    {[...tasks, ...goals].some((i: any) => i.label === 'Início') && (
                                        <div className={cn("w-1 h-1 rounded-full", isDayToday ? "bg-indigo-400" : "bg-indigo-500")} title="Início Hoje!" />
                                    )}

                                    {/* Deadline Dot */}
                                    {[...tasks, ...goals].some((i) => i.label === 'Prazo') && (
                                        <div className={cn("w-1 h-1 rounded-full animate-pulse", isDayToday ? "bg-red-400" : "bg-red-500")} title="Prazo Hoje!" />
                                    )}

                                    {hasGoals && <div className={cn("w-1 h-1 rounded-full", isDayToday ? "bg-white/60" : "bg-emerald-500")} />}
                                    {hasTasks && <div className={cn("w-1 h-1 rounded-full", isDayToday ? "bg-white/60" : "bg-amber-500")} />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Modal
                isOpen={!!selectedDate}
                onClose={() => setSelectedDate(null)}
                title={selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: ptBR }) : ''}
                padding={false}
                scrollContent={false}
                className="h-[80vh]"
            >
                {selectedDate && (
                    <DayDetails
                        events={getEventsForDay(selectedDate)}
                        date={selectedDate}
                        onCompleteReview={completeReview}
                        onStartStudy={startStudySession}
                        onDeleteTask={deleteTask}
                        onDeleteGoal={deleteGoal}
                    />
                )}
            </Modal>
        </>
    );
};
