import React, { useState } from 'react';
import { BrainCircuit, CheckSquare, Flag, PlayCircle, Loader2, Trash2 } from 'lucide-react';
import { format, isToday, differenceInCalendarDays } from 'date-fns';
import { useStudy } from '../../../context/StudyContext';
import { usePomodoroContext } from '../../../context/PomodoroContext';
import { useAudio } from '../../../context/AudioContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { cn } from '../../../lib/utils';
import { parseLocalDate } from '../../../utils/dateHelpers';
import type { Review, Task, Goal, Priority, CalendarIntroItem, CalendarReviewItem, CalendarGoalItem, CalendarTaskItem, Subtheme } from '../../../types';
import { CalendarEventItem } from './CalendarEventItem';
import { TaskDetailsModal } from '../../tasks/components/TaskDetailsModal';
import { GoalDetailsModal } from '../../goals/components/GoalDetailsModal';
import { ProgressBar } from '../../../components/ui/ProgressBar';
// Lazy load


interface DayDetailsProps {
    date: Date | null;
    events: {
        reviews: CalendarReviewItem[];
        tasks: CalendarTaskItem[];
        goals: CalendarGoalItem[];
        intros?: CalendarIntroItem[];
        projected?: { subthemeTitle: string; themeTitle: string; priority: Priority; description: string }[];
    };
    onStartStudy?: (id: string) => void;
    onCompleteReview?: (subthemeId: string, reviewNumber?: number, type?: 'review' | 'intro', difficulty?: 'easy' | 'medium' | 'hard', summary?: string) => Promise<void>;
    onDeleteGoal: (id: string) => void;
    onDeleteTask?: (id: string) => void;
}


const StudyContentModal = React.lazy(() => import('../../themes/components/StudyContentModal').then(m => ({ default: m.StudyContentModal })));

export const DayDetails = ({ events, onStartStudy, onCompleteReview, onDeleteGoal, onDeleteTask, date }: DayDetailsProps) => {
    const { reviews, tasks, goals } = events;
    const { activeFocus, startFocus, endFocus, themes, goals: allGoals, tasks: allTasks, updateSubthemeContent } = useStudy();
    const { startFocusSession, resetTimer } = usePomodoroContext();
    const { stopAudio } = useAudio();
    const { confirm: confirmAction } = useConfirm();

    // --- DETAIL MODALS STATE ---
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [selectedSubtheme, setSelectedSubtheme] = useState<Subtheme | null>(null);

    const handleOpenDetails = (id: string, type: 'task' | 'goal' | 'subtheme') => {
        if (type === 'task') {
            const task = allTasks.find(t => t.id === id);
            if (task) setSelectedTask(task);
        } else if (type === 'goal') {
            const goal = allGoals.find(g => g.id === id);
            if (goal) setSelectedGoal(goal);
        } else if (type === 'subtheme') {
            const subtheme = themes.flatMap(t => t.subthemes).find(st => st.id === id);
            if (subtheme) setSelectedSubtheme(subtheme);
        }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = date ? new Date(date) : today;
    const isFuture = targetDate > today;
    const isPast = targetDate < today;
    const isDateToday = isToday(targetDate);
    const todayStr = format(today, 'yyyy-MM-dd');
    const dateStr = date ? format(targetDate, 'yyyy-MM-dd') : todayStr;

    const handleStartFocus = (id: string, type: 'task' | 'goal' | 'subtheme', title: string, duration?: number, parentId?: string) => {
        // Apenas bloquear se já houver OUTRO item em foco (não o mesmo)
        if (activeFocus && activeFocus.id !== id) {
            console.warn(`⚠️ Outro item já está em foco: ${activeFocus.id}`);
            return;
        }

        console.log(`▶️ Iniciando foco para: ${title} (${id})`);

        startFocus(id, type, title, duration || 25, undefined, undefined, parentId);
        startFocusSession(id, type, title, duration || 25); // Start Timer
    };

    const handleStopFocus = async () => {
        const confirmed = await confirmAction({ message: 'Deseja cancelar o foco atual?', isDangerous: true });
        if (confirmed) {
            endFocus(false); // End without completing
            resetTimer();
            stopAudio(); // Stop background audio
        }
    };

    if ((!reviews || reviews.length === 0) && (!tasks || tasks.length === 0) && (!goals || goals.length === 0)) {
        return (
            <div className="text-center py-8 text-slate-500">
                <p>Nada agendado para este dia.</p>
                <p className="text-sm">Aproveite para descansar ou adiantar estudos!</p>
            </div>
        );
    }

    const isSomethingFocused = !!activeFocus;

    // Sorting Logic
    const getPriorityScore = (p?: string) => {
        switch (p) {
            case 'high': return 3;
            case 'medium': return 2;
            case 'low': return 1;
            default: return 0;
        }
    };

    interface SortableItem {
        status?: string;
        isCompletedToday?: boolean;
        time?: string;
        scheduledTime?: string;
        priority?: Priority;
        durationMinutes?: number;
    }

    const sortItems = <T extends SortableItem>(items: T[]) => {
        if (!items) return [];
        return [...items].sort((a, b) => {
            // 1. Status: Pending first (Active > Done)
            const aDone = a.status === 'completed' || a.isCompletedToday;
            const bDone = b.status === 'completed' || b.isCompletedToday;
            if (aDone !== bDone) return aDone ? 1 : -1;

            // 2. Check if items have scheduled time
            const timeA = a.time || a.scheduledTime || '';
            const timeB = b.time || b.scheduledTime || '';
            const hasTimeA = !!timeA;
            const hasTimeB = !!timeB;

            // If BOTH have time defined: order by time
            if (hasTimeA && hasTimeB) {
                return timeA.localeCompare(timeB);
            }

            // If ONLY ONE has time: the one with time comes first
            if (hasTimeA && !hasTimeB) return -1;
            if (!hasTimeA && hasTimeB) return 1;

            // If NEITHER has time: order by priority (importance)
            const pA = getPriorityScore(a.priority);
            const pB = getPriorityScore(b.priority);
            if (pA !== pB) return pB - pA; // Higher priority first

            // Fallback: Duration (shorter first for "quick wins")
            const durA = a.durationMinutes || 0;
            const durB = b.durationMinutes || 0;
            return durA - durB;
        });
    };

    const sortedReviews = sortItems(reviews);
    const sortedTasks = sortItems(tasks);
    const sortedGoals = sortItems(goals);

    // Helper to get completion time
    const getCompletionTime = (item: { completionHistory?: string[] }) => {
        if (!item.completionHistory) return null;
        const entry = item.completionHistory.find((h: string) => h.startsWith(dateStr));
        if (!entry) return null;
        try {
            return format(new Date(entry), 'HH:mm');
        } catch {
            return null;
        }
    };

    return (
        <div className={cn("space-y-8 w-full overflow-x-hidden relative p-1", isSomethingFocused && "opacity-90")}>

            {/* SEÇÃO 1: INTRODUÇÕES (NOVOS TÓPICOS) - INDIGO */}
            {events.intros && events.intros.length > 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <BrainCircuit className="w-3 h-3" />
                        Novos Tópicos ({events.intros.length})
                    </h3>
                    <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-2 space-y-2 relative overflow-hidden group/section">
                        {events.intros.map((intro: CalendarIntroItem) => (
                            <CalendarEventItem
                                key={intro.id}
                                id={intro.id}
                                title={intro.subthemeTitle}
                                subtitle={intro.themeTitle}
                                type="subtheme"
                                isDone={false}
                                isFuture={isFuture}
                                priority={intro.priority}
                                durationMinutes={intro.durationMinutes}
                                colorTheme="indigo"
                                onFocus={() => handleStartFocus(intro.id, 'subtheme', intro.subthemeTitle, intro.durationMinutes)}
                                onOpenDetails={() => handleOpenDetails(intro.id, 'subtheme')}
                                isActive={activeFocus?.id === intro.id}
                                isSomeoneElseFocused={isSomethingFocused && activeFocus?.id !== intro.id}
                                lockReason={(!isDateToday && !isPast) ? (isFuture ? `Faltam ${differenceInCalendarDays(targetDate, today)} dias` : 'Passado') : undefined}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* SEÇÃO 2: REVISÕES SRS - BLUE */}
            {sortedReviews && sortedReviews.length > 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <BrainCircuit className="w-3 h-3" />
                        Revisões SRS ({sortedReviews.length})
                    </h3>
                    <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-2 space-y-2">
                        {sortedReviews.map((r: CalendarReviewItem) => (
                            <CalendarEventItem
                                key={r.id}
                                id={r.id}
                                title={r.subthemeTitle}
                                subtitle={`Revisão #${r.number} • ${r.themeTitle}`}
                                type="subtheme"
                                isDone={r.status === 'completed'}
                                isFuture={isFuture}
                                priority={r.priority}
                                durationMinutes={r.durationMinutes}
                                completionTime={getCompletionTime(r)}
                                colorTheme="blue"
                                onFocus={() => onStartStudy?.(r.id)}
                                onOpenDetails={() => handleOpenDetails(r.id, 'subtheme')}
                                isActive={activeFocus?.id === r.id}
                                isSomeoneElseFocused={isSomethingFocused && activeFocus?.id !== r.id}
                                lockReason={(!isDateToday && !isPast) ? (isFuture ? `Faltam ${differenceInCalendarDays(targetDate, today)} dias` : 'Passado') : undefined}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* SEÇÃO 3: TAREFAS - ROXO */}
            {sortedTasks && sortedTasks.length > 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-6 duration-500">
                    <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <CheckSquare className="w-3 h-3" />
                        Tarefas ({sortedTasks.length})
                    </h3>
                    <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-2 space-y-2">
                        {sortedTasks.map((t: CalendarTaskItem) => {
                            // Calculate task progress if checklist/subtasks exist, or fallback to status
                            let progress = 0;
                            if (t.progress && t.progress.total > 0) {
                                progress = (t.progress.current / t.progress.total) * 100;
                            } else if (t.status === 'completed') {
                                progress = 100;
                            }

                            return (
                                <CalendarEventItem
                                    key={t.id}
                                    id={t.id}
                                    title={t.title}
                                    subtitle={
                                        t.type === 'period' && t.startDate && t.endDate
                                            ? `Início: ${format(parseLocalDate(t.startDate), 'dd/MM/yyyy')} • Término: ${format(parseLocalDate(t.endDate), 'dd/MM/yyyy')}`
                                            : ((t.endDate || t.date) ? `Prazo: ${format(parseLocalDate(t.endDate || t.date || todayStr), 'dd/MM/yyyy')}` : undefined)
                                    }
                                    type="task"
                                    isDone={t.status === 'completed'}
                                    isFuture={isFuture}
                                    priority={t.priority}
                                    durationMinutes={t.durationMinutes}
                                    completionTime={getCompletionTime(t)}
                                    colorTheme="purple"
                                    onFocus={() => handleStartFocus(t.id, 'task', t.title, t.durationMinutes)}
                                    onOpenDetails={() => handleOpenDetails(t.id, 'task')}
                                    onDelete={async () => {
                                        const confirmed = await confirmAction({
                                            message: `Excluir a tarefa "${t.title}"?`,
                                            isDangerous: true,
                                            confirmText: "Excluir",
                                            cancelText: "Cancelar"
                                        });
                                        if (confirmed && onDeleteTask) onDeleteTask(t.id);
                                    }}
                                    isActive={activeFocus?.id === t.id}
                                    isSomeoneElseFocused={isSomethingFocused && activeFocus?.id !== t.id}
                                    lockReason={(!isDateToday && !isPast) ? (isFuture ? `Faltam ${differenceInCalendarDays(targetDate, today)} dias` : 'Passado') : undefined}
                                >
                                    {/* Task Progress Bar */}
                                    {!t.status || t.status !== 'completed' ? (
                                        <div className="mt-3">
                                            <ProgressBar progress={progress} color="bg-purple-500" showLabel height="h-1.5" />
                                        </div>
                                    ) : null}
                                </CalendarEventItem>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* SEÇÃO 4: METAS & PROJETOS - ROSA */}
            {sortedGoals && sortedGoals.length > 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-7 duration-500">
                    <h3 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <Flag className="w-3 h-3" />
                        Metas & Projetos ({sortedGoals.length})
                    </h3>
                    <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-2 space-y-2">
                        {sortedGoals.map((g: CalendarGoalItem) => {
                            const isStep = g.type === 'goal-step' || g.type === 'goal-phase';
                            const eventId = (g.checklist_item_id || g.id) as string;
                            const isProject = g.type.startsWith('project');

                            // Determine Progress
                            let progress = g.progress || 0;
                            if (g.phaseProgress !== undefined) progress = g.phaseProgress;

                            // Label logic
                            let label = g.label || (g.deadline ? `Prazo: ${format(parseLocalDate(g.deadline), 'dd/MM/yyyy')}` : g.type);
                            if (g.startDate && g.deadline) {
                                label = `Início: ${format(parseLocalDate(g.startDate), 'dd/MM/yyyy')} • Término: ${format(parseLocalDate(g.deadline), 'dd/MM/yyyy')}`;
                            }
                            if (isStep) label = `${g.parentGoalTitle} • Etapa`;

                            return (
                                <CalendarEventItem
                                    key={`${g.id}-${g.checklist_item_id || 'main'}`}
                                    id={eventId}
                                    title={g.title}
                                    subtitle={label}
                                    type="goal"
                                    isDone={g.isCompletedToday || false}
                                    isFuture={isFuture}
                                    priority={g.priority}
                                    durationMinutes={g.durationMinutes}
                                    completionTime={getCompletionTime(g)}
                                    colorTheme={isProject ? "indigo" : "pink"} // Differentiate projects visually if desired, or keep pink
                                    onFocus={() => handleStartFocus(eventId, 'goal', g.title, g.durationMinutes, g.parentGoalId)}
                                    onOpenDetails={() => handleOpenDetails(g.id, 'goal')}
                                    onDelete={async () => {
                                        const idToDelete = (g.parentGoalId || g.id) as string;
                                        const message = isStep ? 'Excluir este projeto COMPLETO (todas as etapas)?' : (isProject ? 'Excluir Projeto?' : 'Excluir Meta?');
                                        const confirmed = await confirmAction({
                                            message,
                                            isDangerous: true,
                                            confirmText: "Excluir",
                                            cancelText: "Cancelar"
                                        });
                                        if (confirmed && onDeleteGoal) onDeleteGoal(idToDelete);
                                    }}
                                    isActive={activeFocus?.id === eventId}
                                    isSomeoneElseFocused={isSomethingFocused && activeFocus?.id !== eventId}
                                    lockReason={(!isDateToday && !isPast) ? (isFuture ? `Faltam ${differenceInCalendarDays(targetDate, today)} dias` : 'Passado') : undefined}
                                >
                                    {/* Goal/Project Progress Bar */}
                                    {!g.isCompletedToday && (
                                        <div className="mt-3">
                                            <ProgressBar
                                                progress={progress}
                                                color={isProject ? "bg-indigo-500" : "bg-pink-500"}
                                                showLabel
                                                height="h-1.5"
                                            />
                                        </div>
                                    )}
                                </CalendarEventItem>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* SEÇÃO 5: PREVISTOS/SIMULAÇÃO */}
            {events.projected && events.projected.length > 0 && (
                <div className="pt-6 border-t border-white/5 mt-4 opacity-50">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-3">
                        Simulação Futura
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {events.projected.map((p, idx) => (
                            <div key={idx} className="p-3 border border-dashed border-slate-700/50 rounded-xl bg-slate-900/30 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-slate-400 text-sm">{p.subthemeTitle}</p>
                                        <Flag className={cn("w-3 h-3 fill-current", p.priority === 'high' ? 'text-red-500' : p.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500')} />
                                    </div>
                                    <p className="text-[10px] text-slate-600">{p.themeTitle} • {p.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modals for Details */}
            <TaskDetailsModal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
            />

            <GoalDetailsModal
                isOpen={!!selectedGoal}
                onClose={() => setSelectedGoal(null)}
                goal={selectedGoal}
            />

            <React.Suspense fallback={null}>
                <StudyContentModal
                    isOpen={!!selectedSubtheme}
                    onClose={() => setSelectedSubtheme(null)}
                    subtheme={selectedSubtheme}
                    onSave={(content: string) => {
                        if (selectedSubtheme) {
                            updateSubthemeContent(selectedSubtheme.id, content);
                        }
                    }}
                />
            </React.Suspense>
        </div>
    );
};
