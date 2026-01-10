import { useState, useEffect, useMemo } from 'react';
import { useStudy } from '../../../context/StudyContext'; // Correct relative path
import { usePomodoroContext } from '../../../context/PomodoroContext';
import { format, addDays, isToday } from 'date-fns';
import { useToast } from '../../../context/ToastContext';

export const useMissionLogic = () => {
    const { themes, tasks, goals, startFocus, activeFocus, toggleTask, toggleGoal, toggleGoalItem, completeReview } = useStudy();
    const { startFocusSession } = usePomodoroContext();
    const { showToast } = useToast();

    // Date Navigation State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const isCurrentDay = isToday(selectedDate);
    const dayOfWeek = selectedDate.getDay();

    const handlePrevDay = () => setSelectedDate(prev => addDays(prev, -1));
    const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));

    // --- Daily Schedule Logic (Local Storage) ---
    const [dailySchedule, setDailySchedule] = useState<Record<string, string>>({});
    // --- Start Time Persistence (Local Storage) ---
    const [missionProgress, setMissionProgress] = useState<Record<string, { startedAt?: number }>>({});

    useEffect(() => {
        const savedSchedule = localStorage.getItem(`daily_schedule_${dateStr}`);
        if (savedSchedule) {
            try { setDailySchedule(JSON.parse(savedSchedule)); } catch (e) { console.error("Failed to parse daily schedule", e); }
        } else {
            setDailySchedule({});
        }

        const savedProgress = localStorage.getItem(`mission_progress_${dateStr}`);
        if (savedProgress) {
            try { setMissionProgress(JSON.parse(savedProgress)); } catch (e) { console.error("Failed to parse mission progress", e); }
        } else {
            setMissionProgress({});
        }
    }, [dateStr]);

    const handleSetTime = (id: string, time: string) => {
        const newSchedule = { ...dailySchedule, [id]: time };
        if (!time) delete newSchedule[id];
        setDailySchedule(newSchedule);
        localStorage.setItem(`daily_schedule_${dateStr}`, JSON.stringify(newSchedule));
    };

    // Track Start Time when Active Focus changes
    useEffect(() => {
        if (activeFocus && activeFocus.id) {
            const id = activeFocus.id;
            if (!missionProgress[id]?.startedAt) {
                const now = Date.now();
                const newProgress = { ...missionProgress, [id]: { ...missionProgress[id], startedAt: now } };
                setMissionProgress(newProgress);
                localStorage.setItem(`mission_progress_${dateStr}`, JSON.stringify(newProgress));
            }
        }
    }, [activeFocus, missionProgress, dateStr]);

    // --- DATA FILTERING ---

    const allData = useMemo(() => {
        // ... Logic from TodayMissionWidget ...

        // 1. REVIEWS & INTROS
        const reviewsOfInterest = themes.flatMap(t =>
            t.subthemes.flatMap(st => {
                return st.reviews
                    .filter(r => {
                        if (isCurrentDay) {
                            if (r.status === 'pending' && r.date <= dateStr) return true;
                            if (r.completedAt) {
                                const completedDate = format(new Date(r.completedAt), 'yyyy-MM-dd');
                                if (completedDate === dateStr) return true;
                            }
                            return false;
                        }
                        if (r.date === dateStr) return true;
                        if (r.completedAt) {
                            const completedDate = format(new Date(r.completedAt), 'yyyy-MM-dd');
                            if (completedDate === dateStr) return true;
                        }
                        return false;
                    })
                    .map(r => ({
                        ...r,
                        subthemeId: st.id,
                        themeTitle: t.title,
                        subthemeTitle: st.title,
                        reviewNumber: r.number,
                        type: 'review',
                        completedAt: r.completedAt,
                        color: t.color,
                        imageUrl: t.imageUrl,
                        currentReviewNum: r.number,
                        totalReviews: st.reviews.length,
                        completedReviewCount: st.reviews.filter(rev => rev.status === 'completed').length,
                        subthemeReviews: st.reviews
                    }));
            })
        );

        const introsOfInterest = themes.flatMap(t =>
            t.subthemes
                .filter(st => st.introductionDate === dateStr)
                .map(st => ({
                    number: 0,
                    date: st.introductionDate!,
                    status: st.status === 'active' ? 'completed' : 'pending',
                    subthemeId: st.id,
                    themeTitle: t.title,
                    subthemeTitle: st.title,
                    reviewNumber: 0,
                    type: 'intro',
                    subthemeReviews: st.reviews,
                    color: t.color
                }))
        );

        const activeSubthemes = themes.flatMap(t =>
            t.subthemes.filter(st => st.status === 'active').map(st => ({
                ...st, themeTitle: t.title, color: t.color, imageUrl: t.imageUrl
            }))
        );

        // "Active but not reviewed today" Logic
        const activeSubthemesWithoutReview = activeSubthemes.filter(st =>
            !reviewsOfInterest.some(r => r.subthemeId === st.id)
        ).map(st => {
            let isLocked = false;
            let lockReason = "";
            const nextReview = st.reviews.find((r: any) => r.status === 'pending');
            const todayStr = format(new Date(), 'yyyy-MM-dd');

            if (nextReview && nextReview.date > todayStr) {
                isLocked = true;
                lockReason = `Próxima revisão: ${format(new Date(nextReview.date), 'dd/MM')}`;
            }

            return {
                ...st,
                subthemeId: st.id,
                subthemeTitle: st.title,
                type: 'review',
                status: 'active',
                currentReviewNum: 0,
                reviewNumber: 0,
                isLocked,
                lockReason
            };
        });

        const allReviews = [...introsOfInterest, ...reviewsOfInterest.map(r => {
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            let isLocked = false;
            let lockReason = "";
            if (r.date > todayStr) {
                isLocked = true;
                lockReason = `Agendado para ${format(new Date(r.date), 'dd/MM')}`;
            }
            return { ...r, isLocked, lockReason };
        }), ...activeSubthemesWithoutReview].sort((a, b) => {
            if (a.status === 'completed' && b.status === 'pending') return 1;
            if (a.status === 'pending' && b.status === 'completed') return -1;
            return 0;
        });

        // 2. TASKS
        const todaysTasks = tasks.filter(t => {
            const taskCreationDay = new Date(t.createdAt).setHours(0, 0, 0, 0);
            const targetDateObj = new Date(dateStr + 'T00:00:00');
            if (targetDateObj.getTime() < taskCreationDay) return false;

            if (t.type === 'day') {
                const isOverdue = !!t.date && t.date < dateStr;
                const isPendingOverdue = isCurrentDay && isOverdue && !t.status.includes('completed');
                const isCompletedToday = isOverdue && t.completionHistory && t.completionHistory.some(h => h.startsWith(dateStr));
                return (t.date === dateStr) || isPendingOverdue || (t.completionHistory && t.completionHistory.some(h => h.startsWith(dateStr)));
            }
            if (t.type === 'recurring' && t.recurrence) {
                if (t.endDate && dateStr > t.endDate) return false;
                return t.recurrence.includes(dayOfWeek);
            }
            if (t.type === 'period' && t.startDate && t.endDate) {
                return dateStr >= t.startDate && dateStr <= t.endDate;
            }
            return false;
        }).map(t => {
            let isDone = t.status === 'completed';
            let completedAt: string | undefined = undefined;
            if (t.completionHistory) {
                const entry = t.completionHistory.find(h => h.startsWith(dateStr));
                if (entry) {
                    isDone = true;
                    completedAt = entry;
                }
            }
            return { ...t, isDone, completedAt };
        });

        // 3. HABITS & GOALS
        const todaysHabits = goals.filter(g => {
            if (g.createdAt) {
                const goalCreationDay = new Date(g.createdAt).setHours(0, 0, 0, 0);
                const targetDateObj = new Date(dateStr + 'T00:00:00');
                if (targetDateObj.getTime() < goalCreationDay) return false;
            }
            if (g.type === 'habit') {
                if (g.deadline && dateStr > g.deadline) return false;
                if (g.recurrence && g.recurrence.length > 0) return g.recurrence.includes(dayOfWeek);
                return true;
            }
            if (g.deadline === dateStr) return true;
            return false;
        }).map(g => {
            let isDone = false;
            let completedAt: string | undefined = undefined;
            if (g.completionHistory) {
                const entry = g.completionHistory.find(h => h.startsWith(dateStr));
                if (entry) {
                    isDone = true;
                    completedAt = entry;
                }
            } else if (g.type !== 'habit') {
                isDone = g.progress === 100;
            }
            return { ...g, isDone, completedAt };
        });

        const todaysSteps = goals.flatMap(g => {
            if (!g.checklist) return [];
            return g.checklist.filter(item => {
                if (!item.deadline) return false;
                const itemDeadline = item.deadline.split('T')[0];
                if (isCurrentDay) {
                    if (item.completed) return itemDeadline === dateStr;
                    return itemDeadline <= dateStr;
                }
                return itemDeadline === dateStr;
            }).map(item => ({
                ...item,
                id: item.id,
                title: `${item.title} (${g.title})`,
                goalId: g.id,
                isDone: item.completed,
                type: 'step',
                color: g.color,
                priority: g.priority || 'medium'
            }));
        });

        const allTasks = [...todaysTasks, ...todaysSteps].map(t => {
            const taskDateStr = (t as any).date || ((t as any).deadline ? (t as any).deadline.split('T')[0] : undefined);
            const isOverdue = !t.isDone && taskDateStr && taskDateStr < dateStr;
            return { ...t, isOverdue };
        }).sort((a, b) => {
            // 1. Overdue items first (not done)
            if (a.isOverdue && !b.isOverdue) return -1;
            if (!a.isOverdue && b.isOverdue) return 1;

            // 2. Then incomplete before complete
            if (a.isDone && !b.isDone) return 1;
            if (!a.isDone && b.isDone) return -1;

            // 3. Among overdue or among normal, sort by priority
            const pMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
            const pA = a.priority ? pMap[a.priority as string] : 1;
            const pB = b.priority ? pMap[b.priority as string] : 1;

            if (pA !== pB) return pB - pA;

            // 4. Finally, for overdue items, oldest first
            if (a.isOverdue && b.isOverdue) {
                const dateA = (a as any).date || ((a as any).deadline ? (a as any).deadline.split('T')[0] : '9999-99-99');
                const dateB = (b as any).date || ((b as any).deadline ? (b as any).deadline.split('T')[0] : '9999-99-99');
                return dateA.localeCompare(dateB);
            }

            return 0;
        });

        return { allHabits: todaysHabits, allReviews, allTasks, todaysTasks, todaysSteps }; // Return sub-lists if needed
    }, [themes, tasks, goals, dateStr, isCurrentDay, dayOfWeek]);

    // Stats
    const totalCount = allData.allReviews.length + allData.allTasks.length + allData.allHabits.length;
    const completedCount =
        allData.allReviews.filter(r => r.status === 'completed').length +
        allData.allTasks.filter(t => t.isDone).length +
        allData.allHabits.filter(g => g.isDone).length;

    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
    const isAllDone = totalCount > 0 && completedCount === totalCount;

    // Overdue Check
    const hasOverdueItems = useMemo(() => {
        const overdueTasks = tasks.filter(t => t.type === 'day' && t.date && t.date < dateStr && t.status !== 'completed'); // Simplified check
        // Ideally we re-use the exact filtered lists logic but simplified.
        // Actually, we can check 'allTasks' for items that are overdue.
        // 'allTasks' includes overdue tasks if in 'Today' mode.
        return allData.allTasks.some((t: any) => {
            const tDate = t.date || (t.deadline ? t.deadline.split('T')[0] : undefined);
            return !t.isDone && tDate && tDate < dateStr;
        });
    }, [allData.allTasks, dateStr, tasks]);


    // Handlers
    const handleFocusItem = (item: any, groupType: string) => {
        // PRIORIDADE MÁXIMA: Bloquear dias futuros
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        if (dateStr > todayStr) {
            showToast("Você não pode focar em atividades agendadas para o futuro!", "error");
            return;
        }

        // Shared Focus Logic
        const focusType = groupType === 'habit' ? 'goal' : groupType === 'review' ? 'subtheme' : 'task';
        const id = item.id || item.subthemeId;
        const duration = item.durationMinutes || 25;
        const parentId = item.goalId;

        startFocus(id, focusType, item.title || item.subthemeTitle || item.themeTitle, duration, item.reviewNumber, item.type, parentId);
        startFocusSession(id, focusType, item.title || item.subthemeTitle || item.themeTitle, duration);
    };

    const handleToggleItem = (item: any, groupType: string) => {
        const id = item.id || item.subthemeId;

        if (groupType === 'task') {
            if (item.type === 'step') {
                toggleGoalItem(item.goalId, id, dateStr);
            } else {
                toggleTask(id, dateStr);
            }
        } else if (groupType === 'habit') {
            toggleGoal(id, dateStr);
        } else if (groupType === 'review') {
            const difficulty = 'medium'; // Default difficulty for quick toggle
            completeReview(id, item.reviewNumber, item.type, difficulty);
        }
    };

    return {
        // Date
        selectedDate,
        setSelectedDate,
        handlePrevDay,
        handleNextDay,
        isCurrentDay,
        dateStr,

        // Data
        allHabits: allData.allHabits,
        allReviews: allData.allReviews,
        allTasks: allData.allTasks,

        // Stats
        totalCount,
        completedCount,
        progressPercent,
        isAllDone,
        hasOverdueItems,

        // State & Actions
        dailySchedule,
        handleSetTime,
        missionProgress,

        // Handlers
        handleFocusItem,
        handleToggleItem
    };
};
