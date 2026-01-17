import { useState, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    PlayCircle,
    Clock,
    Loader2
} from 'lucide-react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    addDays,
    isSameDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePomodoroState } from '../../context/PomodoroContext';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarGrid } from './components/CalendarGrid';
import { CalendarDay } from './components/CalendarDay';
import { DayDetails } from './components/DayDetails';
import { Modal } from '../../components/ui/Modal';
import { UpcomingReviewsSidebar } from './components/UpcomingReviewsSidebar';
import { cn } from '../../lib/utils';
import { parseLocalDate } from '../../utils/dateHelpers';
import type { Review } from '../../types';

import { useProjectContext } from '../../context/ProjectProvider';
import { useThemeContext } from '../../context/ThemeContext';
import { useTaskContext } from '../../context/TaskContext';
import { useGoalContext } from '../../context/GoalContext';
import { useAppContext } from '../../context/AppContext';
import SEO from '../../components/SEO';

export const Calendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const { projects } = useProjectContext();

    // Hooks granulares para dados (Performance)
    const { themes, completeReview } = useThemeContext();
    const { tasks, toggleTask, deleteTask } = useTaskContext();
    const { goals, toggleGoal, toggleGoalItem, deleteGoal } = useGoalContext();
    const { activeFocus, endFocus, startFocus, startStudySession } = useAppContext();

    const { isActive: isTimerRunning, startFocusSession, resetTimer } = usePomodoroState();
    const { getEventsForDay, upcomingList, now } = useCalendarEvents({ themes, tasks, goals, projects }); // Pass projects

    const calendarDays = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));


    const [selectedSubthemeSchedule, setSelectedSubthemeSchedule] = useState<{
        subthemeTitle: string;
        themeTitle: string;
        schedule: (Review | { number: number; date: string; status: 'simulated' })[];
        introDate: string;
        type: string;
        id: string;
        color?: string;
    } | null>(null);

    const handleSubthemeClick = (e: React.MouseEvent, item: any, isProjected: boolean, date: Date) => {
        e.stopPropagation();

        let schedule: (Review | { number: number; date: string; status: 'simulated' })[] = [];
        let introDate = '';

        if (isProjected) {
            const baseDate = item.introDate ? parseLocalDate(item.introDate) : new Date(date);
            introDate = format(baseDate, "d/MM");
            const offsets = [1, 3, 10, 18, 33];
            schedule = offsets.map((off, i) => ({
                number: i + 1,
                date: format(addDays(baseDate, off), 'yyyy-MM-dd'),
                status: 'simulated'
            }));
        } else {
            const theme = themes.find(t => t.title === item.themeTitle);
            const subtheme = theme?.subthemes.find(st => st.title === item.subthemeTitle);
            if (subtheme && subtheme.reviews) {
                schedule = subtheme.reviews;
                introDate = subtheme.introductionDate || '';
            }
        }

        setSelectedSubthemeSchedule({
            ...item,
            schedule,
            introDate,
            type: isProjected ? 'projected' : 'active'
        });
    };

    const handleStartFocus = (item: any) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        if (item.date > todayStr) return;

        startFocus(item.id, 'subtheme', item.subthemeTitle, 25);
        startFocusSession(item.id, 'subtheme', item.subthemeTitle, 25);
    };

    return (
        <>
            <SEO
                title="Calendário"
                description="Visualize seu cronograma de estudos e revisões com repetição espaçada. Acompanhe tasks, goals e upcoming reviews em um calendário interativo."
                keywords={['calendário', 'cronograma', 'revisões', 'SRS', 'repetição espaçada', 'planejamento']}
                url="https://study-panel.vercel.app/calendar"
            />

            <div className="space-y-8 relative pb-20 fade-in">
                <div className="fixed top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none -z-10" />
                <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none -z-10" />

                <CalendarHeader
                    currentMonth={currentMonth}
                    onPrevMonth={prevMonth}
                    onNextMonth={nextMonth}
                    onToday={() => setCurrentMonth(new Date())}
                />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <CalendarGrid>
                            {calendarDays.map((day) => (
                                <CalendarDay
                                    key={day.toString()}
                                    day={day}
                                    currentMonth={currentMonth}
                                    events={getEventsForDay(day)}
                                    onClick={() => {
                                        const d = new Date(day);
                                        d.setHours(12, 0, 0, 0);
                                        setSelectedDate(d);
                                    }}
                                    onEventClick={(e, item, isProjected) => handleSubthemeClick(e, item, isProjected, day)}
                                />
                            ))}
                        </CalendarGrid>
                    </div>

                    <UpcomingReviewsSidebar
                        upcomingList={upcomingList}
                        now={now}
                        activeFocus={activeFocus}
                        onStartFocus={handleStartFocus}
                    />
                </div>

                <Modal
                    isOpen={!!selectedDate}
                    onClose={() => setSelectedDate(null)}
                    title={selectedDate ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR }) : ''}
                >
                    {selectedDate && (
                        <DayDetails
                            key={selectedDate.toISOString()}
                            date={selectedDate}
                            events={getEventsForDay(selectedDate)}
                            onCompleteReview={completeReview}
                            onStartStudy={(id: string) => {
                                const dayEvents = getEventsForDay(selectedDate);
                                const review = dayEvents.reviews.find((r: any) => r.id === id);
                                if (review) startStudySession(review.id);
                            }}
                            onDeleteGoal={deleteGoal}
                            onDeleteTask={deleteTask}
                        />
                    )}
                </Modal>

                <Modal
                    isOpen={!!selectedSubthemeSchedule}
                    onClose={() => setSelectedSubthemeSchedule(null)}
                    title={selectedSubthemeSchedule?.subthemeTitle || 'Cronograma'}
                >
                    {selectedSubthemeSchedule && (
                        <div className="space-y-6">
                            <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <div className={cn(
                                        "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg",
                                        selectedSubthemeSchedule.type.includes('projected')
                                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    )}>
                                        {selectedSubthemeSchedule.type.includes('projected') ? 'Simulação' : 'Ativo'}
                                    </div>
                                    <span className="text-slate-400 text-sm font-medium">{selectedSubthemeSchedule.themeTitle}</span>
                                </div>

                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <PlayCircle className="w-4 h-4 text-blue-400" />
                                    Próximas Revisões (SRS)
                                </h3>

                                <div className="space-y-2 relative z-10">
                                    {selectedSubthemeSchedule.schedule.map((rev: Review | { number: number; date: string; status: 'simulated' | 'pending' | 'completed' }, idx: number) => (
                                        <div key={idx} className="group flex justify-between items-center p-3 bg-black/20 hover:bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-white/5 group-hover:border-white/10 group-hover:text-white transition-colors">
                                                    <span>#{rev.number}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={cn(
                                                        "text-sm font-medium",
                                                        rev.status === 'completed' ? "text-slate-500 line-through decoration-slate-700" : "text-slate-200"
                                                    )}>
                                                        {format(parseLocalDate(rev.date), "d 'de' MMMM", { locale: ptBR })}
                                                    </span>
                                                    {rev.status === 'pending' && !selectedSubthemeSchedule.type.includes('projected') && (() => {
                                                        const today = new Date();
                                                        today.setHours(0, 0, 0, 0);
                                                        const revDate = parseLocalDate(rev.date);

                                                        const isTodayDate = revDate.getTime() === today.getTime();
                                                        const isOverdue = revDate < today;

                                                        if (isTodayDate) {
                                                            return (
                                                                <span className="text-[10px] text-rose-400 flex items-center gap-1 animate-pulse">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                                    Em andamento
                                                                </span>
                                                            );
                                                        }

                                                        if (isOverdue) {
                                                            return (
                                                                <span className="text-[10px] text-red-500 flex items-center gap-1 font-bold">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                                    Atrasado
                                                                </span>
                                                            );
                                                        }

                                                        return null;
                                                    })()}
                                                    {rev.status === 'completed' && (
                                                        <span className="text-[10px] text-emerald-400 font-medium">Concluído</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {rev.status === 'pending' && !selectedSubthemeSchedule.type.includes('projected') && (
                                                    activeFocus?.id === selectedSubthemeSchedule.id && isToday(parseLocalDate(rev.date)) ? (
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Cancelar o foco?')) {
                                                                    endFocus(false);
                                                                    resetTimer();
                                                                }
                                                            }}
                                                            className="flex items-center gap-2 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20 transition-all"
                                                        >
                                                            <Loader2
                                                                className="w-3 h-3 animate-spin"
                                                                style={{ animationPlayState: isTimerRunning ? 'running' : 'paused' }}
                                                            />
                                                            <span className="font-bold">Focando</span>
                                                        </button>
                                                    ) : (
                                                        isToday(parseLocalDate(rev.date)) ? (
                                                            <button
                                                                onClick={() => {
                                                                    if (activeFocus) return;
                                                                    startFocus(selectedSubthemeSchedule.id, 'subtheme', selectedSubthemeSchedule.subthemeTitle, 25);
                                                                    startFocusSession(selectedSubthemeSchedule.id, 'subtheme', selectedSubthemeSchedule.subthemeTitle, 25);
                                                                }}
                                                                disabled={!!activeFocus}
                                                                className={cn(
                                                                    "flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all shadow-lg active:scale-95",
                                                                    activeFocus
                                                                        ? "opacity-50 cursor-not-allowed border-slate-700 text-slate-600 bg-transparent"
                                                                        : "bg-blue-600 hover:bg-blue-500 text-white border-blue-500 hover:border-blue-400 shadow-blue-500/20"
                                                                )}
                                                            >
                                                                <PlayCircle className="w-3.5 h-3.5" />
                                                                <span className="font-bold">Iniciar</span>
                                                            </button>
                                                        ) : (
                                                            (() => {
                                                                const today = new Date();
                                                                today.setHours(0, 0, 0, 0);
                                                                const revDate = parseLocalDate(rev.date);
                                                                const isOverdue = rev.status === 'pending' && revDate < today;

                                                                return (
                                                                    <span className={cn(
                                                                        "text-[10px] font-medium px-2 py-1 rounded border opacity-80",
                                                                        isOverdue
                                                                            ? "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse"
                                                                            : "text-slate-500 bg-slate-800/50 border-white/5"
                                                                    )}>
                                                                        {isOverdue ? 'Atrasado' : 'Agendado'}
                                                                    </span>
                                                                );
                                                            })()
                                                        )
                                                    )
                                                )}
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full ml-2",
                                                    rev.status === 'completed' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-700"
                                                )} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedSubthemeSchedule.type.includes('projected') && (
                                <p className="text-xs text-slate-500 text-center bg-slate-900/50 py-2 rounded-lg border border-white/5">
                                    <span className="text-amber-500/80 mr-1">*</span>
                                    Datas simuladas com início em <span className="text-slate-300 font-medium">{selectedSubthemeSchedule.introDate}</span>
                                </p>
                            )}
                        </div>
                    )}
                </Modal>
            </div>
        </>
    );
};
