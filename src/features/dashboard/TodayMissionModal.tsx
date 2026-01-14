import { Reorder, useDragControls } from 'framer-motion';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { useCalendarEvents } from '../../features/calendar/hooks/useCalendarEvents';
import { useProjectContext } from '../../context/ProjectProvider';
import { Modal } from '../../components/ui/Modal';
import { AlertTriangle } from 'lucide-react';
import { BrainCircuit, CheckSquare, Target, Flag, PlayCircle, Loader2, Lock, ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon, GripVertical, Save } from 'lucide-react';
import { format, parseISO, isToday as isDateToday, addDays, subDays, differenceInCalendarDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { usePomodoroState } from '../../context/PomodoroContext';
import { MissionCard } from './components/MissionCard';
import { parseLocalDate } from '../../utils/dateHelpers';
import type { Priority, Review, SessionLog, Subtheme, Task, Goal, Theme } from '../../types';
import type { MissionTask, MissionGoal, ReviewMissionItem, TodayEvents } from '../../types/mission';

// Lazy load heavy modals para otimizar bundle inicial
const TaskDetailsModal = React.lazy(() => import('../tasks/components/TaskDetailsModal').then(m => ({ default: m.TaskDetailsModal })));
const GoalDetailsModal = React.lazy(() => import('../goals/components/GoalDetailsModal').then(m => ({ default: m.GoalDetailsModal })));

// Draggable Item Wrapper
const DraggableMissionItem = ({ item, children, showDragHandle = true }: { item: { id: string }, children: React.ReactNode, showDragHandle?: boolean }) => {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={item}
            dragListener={false} // Disable default drag to use handle
            dragControls={dragControls}
            className="touch-none relative"
            style={{ listStyle: 'none' }} // Remove list dots
        >
            <div className="flex items-center gap-2">
                {/* Drag Handle - só aparece quando showDragHandle é true */}
                {showDragHandle && (
                    <div
                        onPointerDown={dragControls.start}
                        className="cursor-grab active:cursor-grabbing p-1.5 -ml-2 text-purple-500 hover:text-purple-400 transition-colors touch-none select-none flex items-center justify-center shrink-0 animate-pulse"
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>
                )}
                {/* Content */}
                <div className={cn("flex-1 min-w-0", !showDragHandle && "ml-0")}>
                    {children}
                </div>
            </div>
        </Reorder.Item>
    );
};



const PriorityIcon = ({ priority }: { priority?: Priority }) => {
    switch (priority) {
        case 'high': return <div className="text-rose-500 bg-rose-500/10 p-1 rounded"><Flag className="w-3 h-3" /></div>;
        case 'medium': return <div className="text-amber-500 bg-amber-500/10 p-1 rounded"><Target className="w-3 h-3" /></div>;
        case 'low': return <div className="text-blue-500 bg-blue-500/10 p-1 rounded"><CheckSquare className="w-3 h-3" /></div>;
        default: return null;
    }
};



interface ReviewItem extends Subtheme {
    dueReview: Review;
    themeTitle: string;
    themeIcon?: string; // Icon from parent theme
    priority?: Priority;
    notificationTime?: string;
    isProjectStep?: boolean;
    mastery?: number;
    deadline?: string;
    type?: string;
    icon?: string; // Add icon property
}

interface TodayMissionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// ... rest of helpers ...

// Helper to get session times
const getSessionTimes = (sessions: SessionLog[] | undefined, datePrefix: string) => {
    if (!sessions || sessions.length === 0) return { start: null, end: null };
    const todaysSessions = sessions.filter(s => s.start && s.start.startsWith(datePrefix));

    if (todaysSessions.length === 0) return { start: null, end: null };

    // Use the latest one
    const lastSession = todaysSessions[todaysSessions.length - 1];

    try {
        return {
            start: lastSession.start ? format(parseISO(lastSession.start), 'HH:mm') : null,
            end: lastSession.end ? format(parseISO(lastSession.end), 'HH:mm') : null
        };
    } catch {
        return { start: null, end: null };
    }
};

const calculateEndTime = (startTime: string | null | undefined, durationMinutes: number | undefined) => {
    if (!startTime) return null;
    if (!durationMinutes) return startTime;

    try {
        const [hours, minutes] = startTime.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        date.setMinutes(date.getMinutes() + durationMinutes);
        return format(date, 'HH:mm');
    } catch (e) {
        return startTime;
    }
};

// Helper to sort items based on ID list
const sortWithOrder = <T extends { id: string }>(items: T[], order: string[]): T[] => {
    if (!order || order.length === 0) return items;

    // Create a map for O(1) lookup of order index
    const orderMap = new Map(order.map((id, index) => [id, index]));

    return [...items].sort((a, b) => {
        const indexA = orderMap.get(a.id);
        const indexB = orderMap.get(b.id);

        // If both exist, sort by index
        if (indexA !== undefined && indexB !== undefined) return indexA - indexB;

        // If only one exists, the existing one comes first
        if (indexA !== undefined) return -1;
        if (indexB !== undefined) return 1;

        // If neither exists, maintain original relative order (stable sort fallback) or simple compare
        return 0;
    });
};

const priorityValue = (p?: Priority) => {
    switch (p) {
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 0;
    }
};




// Lazy Load Heavy Modal
const StudyContentModal = React.lazy(() => import('../themes/components/StudyContentModal').then(m => ({ default: m.StudyContentModal })));

export const TodayMissionModal: React.FC<TodayMissionModalProps> = ({ isOpen, onClose }) => {
    // ... existing code ...

    const { themes, tasks, goals, startFocus, activeFocus, endFocus, toggleTask, toggleGoal, completeReview, updateTask, updateGoal, updateSubtheme } = useStudy();
    const { startFocusSession, resetTimer } = usePomodoroState();

    // --- MANUAL COMPLETION HANDLER ---
    const handleComplete = async (
        id: string,
        type: 'task' | 'goal' | 'subtheme' | 'review' | 'habit',
        item: any,
        isChecked: boolean,
        summary?: string
    ) => {
        // 1. If active focus matches item, end focus normally (saves real time)
        if (activeFocus?.id === id) {
            console.log('⏱️ Ending active focus for:', id);
            await endFocus(true, summary);
            return;
        }

        // 2. If unchecking (marking pending), just toggle back
        if (isChecked) {
            if (type === 'task') toggleTask(id);
            else if (type === 'goal' || type === 'habit') toggleGoal(id, today);
            // Reviews generally don't toggle back in this flow
            return;
        }

        // 3. If checking (marking complete) MANUALLY
        const now = new Date();

        // Update Session History MANUALLY to persist "Done at X"
        const sessionLog = {
            start: now.toISOString(),
            end: now.toISOString(),
            durationMinutes: 1,
            status: 'completed' as const, // Fix literal type error
            summary: summary || 'Conclusão manual'
        };

        if (type === 'task') {
            const task = item as Task;
            const newSessions = [...(task.sessions || []), sessionLog];
            updateTask(id, { sessions: newSessions });
            toggleTask(id, today, summary);
        } else if (type === 'goal' || type === 'habit') {
            const goal = item as Goal;
            const newSessions = [...(goal.sessions || []), sessionLog];
            updateGoal(id, { sessions: newSessions });
            toggleGoal(id, today, summary);
        } else if (type === 'subtheme' || type === 'review') {
            const review = item as ReviewItem;
            const newSessions = [...(review.sessions || []), sessionLog];
            updateSubtheme(id, { sessions: newSessions });
            completeReview(id, review.dueReview.number, (review.type as 'review' | 'intro') || 'review', 'medium', summary);
        }
    };


    // --- DRAG AND DROP STATE ---
    const [habitOrder, setHabitOrder] = useLocalStorage<string[]>('mission_habit_order', []);
    const [reviewOrder, setReviewOrder] = useLocalStorage<string[]>('mission_review_order', []);
    const [taskOrder, setTaskOrder] = useLocalStorage<string[]>('mission_task_order', []);

    // Use state only for reordering (when user drags)
    const [manualOrderedHabits, setManualOrderedHabits] = React.useState<Goal[] | null>(null);
    const [manualOrderedReviews, setManualOrderedReviews] = React.useState<ReviewItem[] | null>(null);
    const [manualOrderedTasks, setManualOrderedTasks] = React.useState<Task[] | null>(null);

    // State for selected date
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const today = format(selectedDate, 'yyyy-MM-dd'); // This represents the VIEWED date
    const isToday = isDateToday(selectedDate);

    // Verificar se hoje é domingo (0 = domingo no JavaScript Date.getDay())
    const isSunday = new Date().getDay() === 0;

    // Estado para controlar se o modo de reorganização está ativo
    const [isReorganizeMode, setIsReorganizeMode] = React.useState(false);

    // Apenas permitir reorganização aos domingos
    const canReorganize = isSunday;

    // Strict Date Locking Logic
    const realTodayStr = format(new Date(), 'yyyy-MM-dd');
    const isFutureContext = today > realTodayStr;

    // --- USE CALENDAR EVENTS HOOK FOR LOGIC ---
    const { projects } = useProjectContext();
    const { getEventsForDay } = useCalendarEvents({ themes, tasks, goals, projects });

    const todayEvents = React.useMemo(() => {
        return getEventsForDay(selectedDate);
    }, [selectedDate, getEventsForDay]);

    // Navigation handlers
    const handlePreviousDay = () => {
        setSelectedDate(prev => subDays(prev, 1));
    };

    const handleNextDay = () => {
        setSelectedDate(prev => addDays(prev, 1));
    };

    const handleToday = () => {
        setSelectedDate(new Date());
    };

    const handleStartFocus = React.useCallback((id: string, type: 'task' | 'goal' | 'subtheme', title: string, duration?: number, reviewNumber?: number, reviewType?: 'review' | 'intro') => {
        console.log('👆 [MISSION] Focar button clicked:', { id, type, title, duration });

        // Prevent clicking strict future items
        if (isFutureContext) {
            console.warn('⚠️ [MISSION] Cannot start future mission');
            alert("Você não pode iniciar uma missão agendada para o futuro.");
            return;
        }

        console.log('🚀 [MISSION] Calling startFocusSession...');
        // Use unified startFocusSession which now handles both app context and timer state correctly
        startFocusSession(id, type, title, duration || 25, reviewNumber, reviewType);
        console.log('✅ [MISSION] startFocusSession called successfully');
    }, [isFutureContext, startFocusSession]);


    const handleStopFocus = () => {
        if (confirm('Deseja cancelar o foco atual?')) {
            endFocus(false);
            resetTimer();
        }
    };

    // 1. TASKS (mapped from calendar tasks)
    const dueTasks = React.useMemo(() => {
        return todayEvents.tasks.map((t): MissionTask => ({
            ...t,
            // Ensure compatibility with Modal's expected Task structure
            status: t.isCompletedToday ? 'completed' : t.status
        })).sort((a, b) => priorityValue(b.priority ?? undefined) - priorityValue(a.priority ?? undefined));
    }, [todayEvents]);

    // 2. HABITS & GOALS (mapped from calendar goals)
    const habits = React.useMemo(() => {
        return todayEvents.goals.map((g): MissionGoal => ({
            ...g,
            status: g.isCompletedToday ? 'completed' : 'pending'
        })).sort((a, b) => priorityValue(b.priority ?? undefined) - priorityValue(a.priority ?? undefined));
    }, [todayEvents]);

    // 3. REVIEWS & PROJECTS (mapped from calendar reviews/intros/intros/projected)
    // We need to Enrich these items with the full Subtheme data (especially 'reviews' array for progress bar)
    const dueReviews = React.useMemo(() => {
        // Create a lookup map for fast access
        const subthemeMap = new Map<string, Subtheme & { themeTitle: string }>();
        themes.forEach((t: Theme) => {
            t.subthemes.forEach((st: Subtheme) => {
                subthemeMap.set(st.id, { ...st, themeTitle: t.title });
            });
        });

        const reviews: ReviewItem[] = [
            ...todayEvents.reviews.map((r): ReviewItem => {
                const fullSubtheme = subthemeMap.get(r.id);
                return {
                    ...fullSubtheme!, // Spread full subtheme first (provides Default properties + reviews array)
                    ...r, // Override with specific event details
                    // Reconstruct the nested dueReview object expected by components
                    dueReview: { number: r.number || 0, date: r.date, status: r.status as Review['status'] || 'pending' },
                    id: r.id,
                    priority: r.priority
                };
            }),
            ...todayEvents.intros.map((i): ReviewItem => {
                const fullSubtheme = subthemeMap.get(i.id);
                return {
                    ...fullSubtheme!,
                    ...i,
                    dueReview: { number: 0, date: i.type || today, status: 'pending' },
                    isIntro: true,
                    id: i.id,
                    priority: i.priority
                };
            }),
        ];

        return reviews.sort((a, b) => priorityValue(b.priority ?? undefined) - priorityValue(a.priority ?? undefined));
    }, [todayEvents, today, themes]);

    // Deduplicate Reviews by ID to prevent multiple cards for same subtheme
    const uniqueDueReviews = React.useMemo(() =>
        Array.from(new Map(dueReviews.map(item => [item.id, item])).values())
        , [dueReviews]);

    // Deduplicate Tasks
    const uniqueDueTasks = React.useMemo(() =>
        Array.from(new Map(dueTasks.map(item => [item.id, item])).values())
        , [dueTasks]);

    const hasItems = uniqueDueTasks.length > 0 || habits.length > 0 || uniqueDueReviews.length > 0;

    // --- OVERDUE HELPERS ---
    const isTaskOverdue = React.useCallback((t: Task) => t.status === 'pending' && ((t.date && t.date < today) || (t.endDate && t.endDate < today)), [today]);
    const isGoalOverdue = React.useCallback((g: Goal) => g.deadline && g.deadline < today && g.progress < 100, [today]);
    const isReviewOverdue = React.useCallback((r: ReviewItem) => r.dueReview.status === 'pending' && r.dueReview.date < today, [today]);

    // Helper to calculate days overdue
    const getDaysOverdue = React.useCallback((endDate: string): number => {
        const end = new Date(endDate + 'T23:59:59');
        const now = new Date();
        return differenceInCalendarDays(now, end);
    }, []);

    // Helper to get deadline from item
    const getItemDeadline = (item: Task | Goal | ReviewItem, type: 'task' | 'goal' | 'review'): string | null => {
        if (type === 'task') {
            const task = item as Task;
            return task.endDate || task.date || null;
        } else if (type === 'goal') {
            const goal = item as Goal;
            return goal.deadline || null;
        } else {
            const review = item as ReviewItem;
            return review.dueReview.date || null;
        }
    };

    // --- COMPUTED ORDERED ARRAYS (using useMemo to prevent infinite loops) ---
    const orderedHabits = React.useMemo(() => {
        if (manualOrderedHabits) return manualOrderedHabits;
        const overdue = habits.filter(h => isGoalOverdue(h));
        const others = habits.filter(h => !isGoalOverdue(h));
        return [...overdue, ...sortWithOrder(others, habitOrder)];
    }, [habits, habitOrder, isGoalOverdue, manualOrderedHabits]);

    const orderedReviews = React.useMemo(() => {
        if (manualOrderedReviews) return manualOrderedReviews;
        const overdue = uniqueDueReviews.filter(r => isReviewOverdue(r));
        const others = uniqueDueReviews.filter(r => !isReviewOverdue(r));
        return [...overdue, ...sortWithOrder(others, reviewOrder)];
    }, [uniqueDueReviews, reviewOrder, isReviewOverdue, manualOrderedReviews]);

    const orderedTasks = React.useMemo(() => {
        if (manualOrderedTasks) return manualOrderedTasks;
        const overdue = uniqueDueTasks.filter(t => isTaskOverdue(t));
        const others = uniqueDueTasks.filter(t => !isTaskOverdue(t));
        return [...overdue, ...sortWithOrder(others, taskOrder)];
    }, [uniqueDueTasks, taskOrder, isTaskOverdue, manualOrderedTasks]);

    // Check if ALL daily tasks are completed
    const allTasksCompleted = React.useMemo(() => {
        const allHabitsComplete = orderedHabits.length > 0 && orderedHabits.every(h => h.completionHistory?.some(d => d.startsWith(today)) || h.progress >= 100);
        const allReviewsComplete = orderedReviews.length > 0 && orderedReviews.every(r => r.dueReview.status === 'completed');
        const allTasksComplete = orderedTasks.length > 0 && orderedTasks.every(t => t.status === 'completed');

        // Only consider locked if there are tasks AND all are complete
        const hasTasks = orderedHabits.length > 0 || orderedReviews.length > 0 || orderedTasks.length > 0;
        return hasTasks && allHabitsComplete && allReviewsComplete && allTasksComplete;
    }, [orderedHabits, orderedReviews, orderedTasks]);

    const handleReorderHabits = (newOrder: Goal[]) => {
        // Optimistic update
        setManualOrderedHabits(newOrder);
        // Save order to localStorage
        setHabitOrder(newOrder.map(h => h.id));
        // Clear manual order after a brief delay to let the useMemo recalculate
        setTimeout(() => setManualOrderedHabits(null), 100);
    };

    const handleReorderReviews = (newOrder: ReviewItem[]) => {
        setManualOrderedReviews(newOrder);
        setReviewOrder(newOrder.map(r => r.id));
        setTimeout(() => setManualOrderedReviews(null), 100);
    };

    const handleReorderTasks = (newOrder: Task[]) => {
        setManualOrderedTasks(newOrder);
        setTaskOrder(newOrder.map(t => t.id));
        setTimeout(() => setManualOrderedTasks(null), 100);
    };

    // --- COMBINED OVERDUE MISSIONS ---
    const overdueMissions = React.useMemo(() => {
        interface OverdueItem {
            id: string;
            item: Task | Goal | ReviewItem;
            type: 'task' | 'goal' | 'review';
            daysOverdue: number;
            deadline: string;
            priority: Priority | undefined;
        }

        const overdueItems: OverdueItem[] = [];

        // Add overdue tasks
        orderedTasks.forEach(task => {
            if (isTaskOverdue(task)) {
                const deadline = getItemDeadline(task, 'task');
                if (deadline) {
                    overdueItems.push({
                        id: task.id,
                        item: task,
                        type: 'task',
                        daysOverdue: getDaysOverdue(deadline),
                        deadline,
                        priority: task.priority
                    });
                }
            }
        });

        // Add overdue goals/habits
        orderedHabits.forEach(goal => {
            if (isGoalOverdue(goal)) {
                const deadline = getItemDeadline(goal, 'goal');
                if (deadline) {
                    overdueItems.push({
                        id: goal.id,
                        item: goal,
                        type: 'goal',
                        daysOverdue: getDaysOverdue(deadline),
                        deadline,
                        priority: goal.priority
                    });
                }
            }
        });

        // Add overdue reviews
        orderedReviews.forEach(review => {
            if (isReviewOverdue(review)) {
                const deadline = getItemDeadline(review, 'review');
                if (deadline) {
                    overdueItems.push({
                        id: review.id,
                        item: review,
                        type: 'review',
                        daysOverdue: getDaysOverdue(deadline),
                        deadline,
                        priority: review.priority
                    });
                }
            }
        });

        // Sort by days overdue (descending), then by priority
        return overdueItems.sort((a, b) => {
            if (a.daysOverdue !== b.daysOverdue) {
                return b.daysOverdue - a.daysOverdue; // More overdue first
            }
            return priorityValue(b.priority) - priorityValue(a.priority);
        });
    }, [orderedTasks, orderedHabits, orderedReviews, isTaskOverdue, isGoalOverdue, isReviewOverdue, getDaysOverdue, getItemDeadline]);


    const SectionBox = ({ title, icon: Icon, count, children }: { title: string; icon: React.ElementType; colorClass?: string; count: number; children: React.ReactNode }) => (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1 border-l-2 border-slate-700 pl-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {title}
                </h3>
                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-700">
                    {count}
                </div>
            </div>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );

    // Calculate Progress
    // Calculate Progress
    // Use uniqueDueReviews to reflect exactly what is on screen (including overdue if valid)
    // We filter for 'review' type or just count all reviews shown

    const totalReviewsCount = uniqueDueReviews.length;
    const completedReviewsCount = uniqueDueReviews.filter(r => r.dueReview.status === 'completed').length;

    const score = totalReviewsCount > 0
        ? Math.round((completedReviewsCount / totalReviewsCount) * 100)
        : hasItems ? 0 : 100;

    const getPeriodProgress = (item: Task | Goal, type: 'task' | 'goal') => {
        if (type === 'task') {
            if (item.type !== 'period' || !item.startDate || !item.endDate) return null;
            const start = new Date(item.startDate);
            const end = new Date(item.endDate);
            const now = new Date();
            const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
            const currentDay = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
            const day = Math.min(currentDay, totalDays);
            return `${day}/${totalDays}`;
        }
        if (type === 'goal') {
            const goal = item as Goal;
            if (!goal.deadline) return null;
            const start = new Date(goal.createdAt || Date.now());
            const end = new Date(goal.deadline);
            const now = new Date();
            const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
            const currentDay = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
            const day = Math.min(currentDay, totalDays);
            return totalDays > 1 ? `${day}/${totalDays}` : null;
        }
        return null;
    };

    // --- COMPLETION SUMMARY STATE ---
    const [completionItem, setCompletionItem] = React.useState<{
        id: string;
        title: string;
        onConfirm: (summary: string) => void;
    } | null>(null);
    const [summaryText, setSummaryText] = React.useState('');

    // --- DETAIL MODALS STATE ---
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
    const [selectedGoal, setSelectedGoal] = React.useState<Goal | null>(null);
    const [selectedSubtheme, setSelectedSubtheme] = React.useState<Subtheme | null>(null);

    const handleOpenDetails = (id: string, type: 'task' | 'goal' | 'subtheme') => {
        if (type === 'task') {
            const task = tasks.find(t => t.id === id);
            if (task) setSelectedTask(task);
        } else if (type === 'goal') {
            const goal = goals.find(g => g.id === id);
            if (goal) setSelectedGoal(goal);
        } else if (type === 'subtheme') {
            const subtheme = themes.flatMap(t => t.subthemes).find(st => st.id === id);
            if (subtheme) setSelectedSubtheme(subtheme);
        }
    };

    const requestCompletion = (id: string, title: string, onConfirm: (s: string) => void) => {
        setCompletionItem({ id, title, onConfirm });
        setSummaryText('');
    };

    const confirmCompletion = () => {
        if (completionItem) {
            completionItem.onConfirm(summaryText);
            setCompletionItem(null);
        }
    };

    const skipSummary = () => {
        if (completionItem) {
            completionItem.onConfirm(''); // Empty string = no summary (standard completion)
            setCompletionItem(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={null} maxWidth="lg">
            <div className="space-y-6 px-2 sm:px-4 mt-12 sm:mt-16 pb-6 relative">
                {/* Header Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Target className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Sua Missão</h2>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Progresso</span>
                            <span className="text-xl font-black text-blue-400">{score}%</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-2 border-t border-slate-800/50 border-b border-slate-800/50 mb-6">
                        <button onClick={handlePreviousDay} className="p-2 text-slate-500 hover:text-white transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>


                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                                {isToday ? 'HOJE' : format(selectedDate, 'EEEE', { locale: ptBR })}
                            </span>
                            <div className="flex items-center gap-2 text-slate-200">
                                <CalendarIcon className="w-4 h-4 text-slate-400" />
                                <span className="font-bold text-lg capitalize">{format(selectedDate, 'd \'de\' MMMM', { locale: ptBR })}</span>
                            </div>
                        </div>

                        <button onClick={handleNextDay} className="p-2 text-slate-500 hover:text-white transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden w-full mb-6">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 transition-all duration-1000"
                            style={{ width: `${score}%` }}
                        />
                    </div>

                    {/* Banner de Reorganização Dominical */}
                    {canReorganize && (
                        <div className="mb-4">
                            <div className={cn(
                                "p-4 rounded-2xl border transition-all duration-300",
                                isReorganizeMode
                                    ? "bg-purple-500/10 border-purple-500/30"
                                    : "bg-slate-800/40 border-slate-700/50"
                            )}>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                            isReorganizeMode
                                                ? "bg-purple-500/20"
                                                : "bg-purple-500/10"
                                        )}>
                                            <GripVertical className={cn(
                                                "w-5 h-5",
                                                isReorganizeMode ? "text-purple-400" : "text-purple-500/60"
                                            )} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={cn(
                                                "text-sm font-bold transition-colors",
                                                isReorganizeMode ? "text-purple-300" : "text-slate-300"
                                            )}>
                                                🗓️ Reorganização Dominical
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                {isReorganizeMode
                                                    ? "Arraste as atividades para reorganizar"
                                                    : "Ative para reorganizar suas atividades"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsReorganizeMode(!isReorganizeMode)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl font-bold text-sm transition-all",
                                            isReorganizeMode
                                                ? "bg-purple-500 text-white hover:bg-purple-600"
                                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        )}
                                    >
                                        {isReorganizeMode ? "Concluir" : "Reorganizar"}
                                    </button>
                                </div>

                                {isReorganizeMode && (
                                    <div className="mt-3 pt-3 border-t border-purple-500/20">
                                        <div className="flex items-center gap-2 text-xs text-purple-400">
                                            <GripVertical className="w-4 h-4" />
                                            <span>Use as alças de arraste para reordenar</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* OVERDUE MISSIONS SECTION */}
                {overdueMissions.length > 0 && (
                    <div className="border-t border-red-500/20 pt-4 mb-4">
                        <SectionBox title="MISSÕES ATRASADAS ⚠️" icon={AlertTriangle} colorClass="text-red-400" count={overdueMissions.length}>
                            <div className="space-y-3">
                                {overdueMissions.map(({ id, item, type, daysOverdue, deadline }) => {
                                    const isBlocked = false; // Overdue items should prioritize action
                                    const key = `overdue-${type}-${id}`;

                                    if (type === 'task') {
                                        const task = item as Task;
                                        const sessionTimes = getSessionTimes(task.sessions, today);
                                        // Specific logic for overdue tasks
                                        return (
                                            <MissionCard
                                                key={key}
                                                id={task.id}
                                                title={task.title}
                                                icon={task.icon || "AlertTriangle"}
                                                type="task"
                                                isCompleted={false}
                                                isBlocked={isBlocked}
                                                daysOverdue={daysOverdue}
                                                originalDeadline={deadline}
                                                colorClass="red" /* Force red theme */
                                                actualStartTime={activeFocus?.id === task.id ? format(new Date(activeFocus!.startTime), 'HH:mm') : null}
                                                onFocus={() => handleStartFocus(task.id, 'task', task.title, task.durationMinutes || 25)}
                                                isActive={activeFocus?.id === task.id}
                                                onToggle={() => handleComplete(task.id, 'task', task, false)}
                                                onOpenDetails={() => handleOpenDetails(task.id, 'task')}
                                                allDailyTasksCompleted={allTasksCompleted}
                                            >
                                                <PriorityIcon priority={task.priority} />
                                            </MissionCard>
                                        );
                                    }

                                    if (type === 'goal') {
                                        const goal = item as Goal;
                                        // Specific logic for overdue goals
                                        return (
                                            <MissionCard
                                                key={key}
                                                id={goal.id}
                                                title={goal.title}
                                                icon={goal.icon || "Target"}
                                                type="habit" /* Reusing habit styling which fits goals */
                                                isCompleted={false}
                                                isBlocked={isBlocked}
                                                daysOverdue={daysOverdue}
                                                originalDeadline={deadline}
                                                colorClass="red"
                                                progressCurrent={goal.completionHistory?.length || 0}
                                                onFocus={() => handleStartFocus(goal.id, 'goal', goal.title, goal.durationMinutes)}
                                                isActive={activeFocus?.id === goal.id}
                                                onToggle={() => handleComplete(goal.id, 'goal', goal, false)}
                                                onOpenDetails={() => handleOpenDetails(goal.id, 'goal')}
                                                allDailyTasksCompleted={allTasksCompleted}
                                            >
                                                <PriorityIcon priority={goal.priority} />
                                            </MissionCard>
                                        );
                                    }

                                    if (type === 'review') {
                                        const review = item as ReviewItem;
                                        // Specific logic for overdue reviews
                                        return (
                                            <MissionCard
                                                key={key}
                                                id={review.id}
                                                title={review.title}
                                                themeTitle={review.themeTitle}
                                                icon={review.icon || "BrainCircuit"}
                                                type="review"
                                                isCompleted={false}
                                                isBlocked={isBlocked}
                                                daysOverdue={daysOverdue}
                                                originalDeadline={deadline}
                                                colorClass="red"
                                                reviewNumber={review.dueReview.number}
                                                level={`${review.dueReview.number}/5`}
                                                progressCurrent={review.reviews.filter(r => r.status === 'completed').length}
                                                progressTotal={review.reviews.length}
                                                onFocus={() => handleStartFocus(review.id, 'subtheme', review.title, review.durationMinutes, review.dueReview.number, (review.type as 'review' | 'intro') || 'review')}
                                                isActive={activeFocus?.id === review.id}
                                                onToggle={() => handleComplete(review.id, 'review', review, false)}
                                                onOpenDetails={() => handleOpenDetails(review.id, 'subtheme')}
                                                allDailyTasksCompleted={allTasksCompleted}
                                            >
                                                <PriorityIcon priority={review.priority} />
                                            </MissionCard>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </SectionBox>
                    </div>
                )}

                {/* 1. Hábitos & Rotina */}
                {orderedHabits.length > 0 && (
                    <div className="border-t border-blue-500/10 pt-4">
                        <SectionBox title="HÁBITOS & ROTINA" icon={Target} colorClass="text-orange-400" count={orderedHabits.length}>
                            <Reorder.Group axis="y" values={orderedHabits} onReorder={handleReorderHabits} className="space-y-3">
                                {orderedHabits.map((habit) => {
                                    const isCompletedToday = habit.completionHistory?.some((d: string) => d.startsWith(today));
                                    const isItemOptimistic = completionItem?.id === habit.id;
                                    const isChecked = isCompletedToday || habit.progress === 100 || isItemOptimistic;
                                    const isBlocked = isFutureContext;
                                    const sessionTimes = getSessionTimes(habit.sessions, today);

                                    let daysElapsed: number | undefined;
                                    let daysRemaining: number | undefined;

                                    if (habit.completionHistory && habit.completionHistory.length > 0) {
                                        daysElapsed = habit.completionHistory.length;
                                    }

                                    if (habit.deadline) {
                                        const endObj = parseLocalDate(habit.deadline);
                                        const nowObj = new Date();
                                        nowObj.setHours(0, 0, 0, 0); // Reset to midnight
                                        endObj.setHours(0, 0, 0, 0); // Reset to midnight
                                        const totalDays = Math.max(0, Math.ceil((endObj.getTime() - nowObj.getTime()) / (1000 * 60 * 60 * 24)));
                                        daysRemaining = totalDays;
                                    }

                                    const start = habit.startDate ? new Date(habit.startDate) : new Date(habit.createdAt || Date.now());
                                    const todayDate = new Date();
                                    const diffTime = Math.abs(todayDate.getTime() - start.getTime());
                                    const expectedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                                    const progressTotal = habit.deadline ? expectedDays : (habit.completionHistory?.length || 0) + 1;

                                    let timeCurrent: number | undefined;
                                    let timeTotal: number | undefined;
                                    if (habit.deadline) {
                                        const endObj = parseLocalDate(habit.deadline);
                                        const startObj = habit.startDate ? parseLocalDate(habit.startDate) : new Date(habit.createdAt || Date.now());
                                        const nowObj = new Date();

                                        // Reset all to midnight for accurate day calculation
                                        endObj.setHours(0, 0, 0, 0);
                                        startObj.setHours(0, 0, 0, 0);
                                        nowObj.setHours(0, 0, 0, 0);

                                        timeTotal = Math.max(1, Math.ceil((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24)));
                                        timeCurrent = Math.max(0, Math.min(timeTotal, Math.ceil((nowObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24))));
                                    }

                                    return (
                                        <DraggableMissionItem key={habit.id} item={habit} showDragHandle={isReorganizeMode}>
                                            <MissionCard
                                                id={habit.id}
                                                title={habit.title}
                                                icon={habit.icon || "Flame"}
                                                colorClass="from-orange-500 to-rose-600 shadow-orange-500/20"
                                                type="habit"
                                                isCompleted={isChecked}
                                                isBlocked={isBlocked}
                                                actualStartTime={activeFocus?.id === habit.id ? format(new Date(activeFocus!.startTime), 'HH:mm') : (isChecked ? sessionTimes.start : null)}
                                                actualEndTime={isChecked ? sessionTimes.end : null}
                                                daysElapsed={daysElapsed}
                                                daysRemaining={daysRemaining}
                                                startDate={habit.startDate}
                                                endDate={habit.deadline}
                                                progressCurrent={habit.completionHistory?.length || 0}
                                                progressTotal={progressTotal}
                                                timeCurrent={timeCurrent}
                                                timeTotal={timeTotal}
                                                onFocus={() => handleStartFocus(habit.id, 'goal', habit.title, habit.durationMinutes)}
                                                isActive={activeFocus?.id === habit.id}
                                                onToggle={() => {
                                                    const action = (s?: string) => {
                                                        const type = habit.type === 'habit' ? 'habit' : 'goal';
                                                        handleComplete(habit.id, type, habit, isChecked, s);
                                                    };

                                                    if (isChecked && !isItemOptimistic) {
                                                        action();
                                                    } else {
                                                        requestCompletion(habit.id, habit.title, action);
                                                    }
                                                }}
                                                onOpenDetails={() => handleOpenDetails(habit.id, 'goal')}
                                                allDailyTasksCompleted={allTasksCompleted}
                                            >
                                                <PriorityIcon priority={habit.priority} />
                                            </MissionCard>
                                        </DraggableMissionItem>
                                    );
                                })}
                            </Reorder.Group>
                        </SectionBox>
                    </div>
                )}

                {/* 2. Revisões & Estudos */}
                {orderedReviews.length > 0 && (
                    <div className="border-t border-blue-500/10 pt-4">
                        <SectionBox title="REVISÕES & ESTUDOS" icon={BrainCircuit} colorClass="text-emerald-400" count={orderedReviews.length}>
                            <Reorder.Group axis="y" values={orderedReviews} onReorder={handleReorderReviews} className="space-y-3">
                                {orderedReviews.map((item: ReviewItem) => {
                                    const reviewNum = item.dueReview.number || 0;
                                    const level = reviewNum;
                                    const domain = item.mastery ? Math.round(item.mastery * 100) : 0;
                                    const sessionTimes = getSessionTimes(item.sessions, today);
                                    const isItemOptimistic = completionItem?.id === item.id;
                                    const isCompleted = item.dueReview.status === 'completed' || isItemOptimistic;

                                    return (
                                        <DraggableMissionItem key={item.id} item={item} showDragHandle={isReorganizeMode}>
                                            <MissionCard
                                                id={item.id}
                                                title={item.title}
                                                themeTitle={item.themeTitle}

                                                reviewNumber={item.dueReview.number}
                                                icon={item.icon || "BrainCircuit"}
                                                colorClass="from-emerald-500 to-teal-600 shadow-emerald-500/20"
                                                type="review"
                                                isCompleted={isCompleted}
                                                isBlocked={isFutureContext}
                                                actualStartTime={activeFocus?.id === item.id ? format(new Date(activeFocus!.startTime), 'HH:mm') : (isCompleted ? sessionTimes.start : null)}
                                                actualEndTime={isCompleted ? sessionTimes.end : null}
                                                level={`${level}/5`}
                                                domain={domain}
                                                startDate={item.introductionDate}
                                                endDate={item.deadline}
                                                progressCurrent={item.reviews.filter((r: Review) => r.status === 'completed').length}
                                                progressTotal={item.reviews.length}
                                                schedule={item.reviews}
                                                onFocus={() => handleStartFocus(item.id, 'subtheme', item.title, item.durationMinutes, item.dueReview.number, (item.type as 'review' | 'intro') || 'review')}
                                                isActive={activeFocus?.id === item.id}
                                                onToggle={() => {
                                                    const action = (s?: string) => handleComplete(item.id, 'review', item, isCompleted, s);
                                                    if (isCompleted && !isItemOptimistic) {
                                                        action();
                                                    } else {
                                                        // For simple tasks, also offer summary?
                                                        requestCompletion(item.id, item.title, action);
                                                    }
                                                }}
                                                onOpenDetails={() => handleOpenDetails(item.id, 'subtheme')}
                                                allDailyTasksCompleted={allTasksCompleted}
                                            >
                                                <PriorityIcon priority={item.priority} />
                                            </MissionCard>
                                        </DraggableMissionItem>
                                    );
                                })}
                            </Reorder.Group>
                        </SectionBox>
                    </div>
                )}

                {/* 3. Tarefas & Missões */}
                {orderedTasks.length > 0 && (
                    <div className="border-t border-blue-500/10 pt-4">
                        <SectionBox title="TAREFAS & MISSÕES" icon={CheckSquare} colorClass="text-blue-400" count={orderedTasks.length}>
                            <Reorder.Group axis="y" values={orderedTasks} onReorder={handleReorderTasks} className="space-y-3">
                                {orderedTasks.map((task) => {
                                    const isCompletedToday = task.type === 'day' ? task.status === 'completed' : (task.completionHistory?.some((d: string) => d.startsWith(today)) ?? false);
                                    const isItemOptimistic = completionItem?.id === task.id;
                                    const isChecked = isCompletedToday || isItemOptimistic;
                                    const isBlocked = isFutureContext;
                                    const sessionTimes = getSessionTimes(task.sessions, today);

                                    let timeCurrent: number | undefined;
                                    let timeTotal: number | undefined;
                                    if (task.type === 'period' && task.startDate && task.endDate) {
                                        const start = new Date(task.startDate);
                                        const end = new Date(task.endDate);
                                        const now = new Date();
                                        timeTotal = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                                        timeCurrent = Math.max(0, Math.min(timeTotal, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))));
                                    }

                                    return (
                                        <DraggableMissionItem key={task.id} item={task} showDragHandle={isReorganizeMode}>
                                            <MissionCard
                                                id={task.id}
                                                title={task.title}
                                                icon={task.icon || "ClipboardList"}
                                                type="task"
                                                isCompleted={isChecked}
                                                isBlocked={isBlocked}
                                                actualStartTime={activeFocus?.id === task.id ? format(new Date(activeFocus!.startTime), 'HH:mm') : (isChecked ? sessionTimes.start : null)}
                                                actualEndTime={isChecked ? sessionTimes.end : null}
                                                startDate={task.startDate || task.date}
                                                endDate={task.endDate || task.date}
                                                progressCurrent={'progress' in task && task.progress ? task.progress.current : (task.status === 'completed' ? 1 : 0)}
                                                progressTotal={'progress' in task && task.progress ? (task.progress.total || 1) : 1}
                                                timeCurrent={timeCurrent}
                                                timeTotal={timeTotal}
                                                onFocus={() => handleStartFocus(task.id, 'task', task.title, task.durationMinutes || 25)}
                                                isActive={activeFocus?.id === task.id}
                                                onToggle={() => {
                                                    const action = (s?: string) => toggleTask(task.id, today, s);
                                                    if (isChecked && !isItemOptimistic) action();
                                                    else requestCompletion(task.id, task.title, action);
                                                }}
                                                onOpenDetails={() => handleOpenDetails(task.id, 'task')}
                                                allDailyTasksCompleted={allTasksCompleted}
                                            >
                                                <PriorityIcon priority={task.priority} />
                                            </MissionCard>
                                        </DraggableMissionItem>
                                    );
                                })}
                            </Reorder.Group>
                        </SectionBox>
                    </div>
                )}

                {/* Empty State */}
                {!hasItems && (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-50 animate-in fade-in duration-500">
                        <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-2 shadow-inner border border-slate-700/50">
                            <CalendarIcon className="w-10 h-10 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-slate-400 font-bold text-sm">Nada agendado para este dia</p>
                            <p className="text-slate-600 text-xs mt-1 max-w-[200px] mx-auto leading-relaxed">Aproveite para descansar ou adiantar estudos de outros dias!</p>
                        </div>
                    </div>
                )}

                {/* Completion Modal Overlay */}
                {completionItem && (
                    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm rounded-[2rem] animate-in fade-in duration-200">
                        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <CheckSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Concluir Missão</h3>
                                    <p className="text-xs text-slate-400 line-clamp-1">{completionItem.title}</p>
                                </div>
                            </div>

                            <p className="text-slate-300 text-sm mb-3">O que você aprendeu ou realizou?</p>

                            <textarea
                                value={summaryText}
                                onChange={e => setSummaryText(e.target.value)}
                                className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none mb-4 placeholder:text-slate-600"
                                placeholder="Adicione um resumo (opcional)..."
                                autoFocus
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={skipSummary}
                                    className="flex-1 py-3 text-slate-400 font-bold hover:text-white hover:bg-white/5 rounded-xl transition-colors text-sm"
                                >
                                    Pular
                                </button>
                                <button
                                    onClick={confirmCompletion}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {/* Task Details Modal */}
            <React.Suspense fallback={<div className="p-4 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>}>
                <TaskDetailsModal
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    task={selectedTask}
                />
            </React.Suspense>

            {/* Goal Details Modal */}
            <React.Suspense fallback={<div className="p-4 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>}>
                <GoalDetailsModal
                    isOpen={!!selectedGoal}
                    onClose={() => setSelectedGoal(null)}
                    goal={selectedGoal}
                />
            </React.Suspense>

            {/* Subtheme Details Modal */}
            <React.Suspense fallback={<div className="p-4 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>}>
                <StudyContentModal
                    isOpen={!!selectedSubtheme}
                    onClose={() => setSelectedSubtheme(null)}
                    subtheme={selectedSubtheme}
                    onSave={() => { /* handle save if needed */ }}
                />
            </React.Suspense>

        </Modal >
    );
};

export default TodayMissionModal;
