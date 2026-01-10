import hash from 'object-hash';
import {
    format,
    eachDayOfInterval
} from 'date-fns';
import type { Theme, Task, Goal, Project } from '../../../types';
import { parseLocalDate } from '../../../utils/dateHelpers';

// Types from the original file
interface DayEvents {
    reviews: any[];
    intros: any[];
    projected: any[];
    tasks: any[];
    goals: any[];
}

interface BuildEventsMapParams {
    themes: Theme[];
    tasks: Task[];
    goals: Goal[];
    projects: Project[];
    allProjectedReviews: any[];
    calendarDays: Date[];
}

// In-memory cache
let eventsCache: {
    key: string;
    data: Map<string, DayEvents>;
} | null = null;

/**
 * Generates a cache key based on the input data content.
 * Using object-hash ensures that even if array references change,
 * the key remains the same if the content is identical.
 */
export const generateCacheKey = (params: BuildEventsMapParams): string => {
    // We only need to hash the data properties that affect the output
    // calendarDays can be hashed by start/end date
    const intervalHash = params.calendarDays.length > 0
        ? `${params.calendarDays[0].toISOString()}-${params.calendarDays[params.calendarDays.length - 1].toISOString()}`
        : 'empty';

    // CRITICAL: Include current date in cache key so completion status recalculates daily
    const currentDate = format(new Date(), 'yyyy-MM-dd');

    return hash({
        themes: params.themes,
        tasks: params.tasks,
        goals: params.goals,
        projects: params.projects,
        projected: params.allProjectedReviews,
        interval: intervalHash,
        currentDate: currentDate  // Add current date to invalidate cache daily
    }, { algorithm: 'md5' }); // MD5 is fast enough for this
};

/**
 * Pure function to build the events map.
 * Now uses caching internally.
 */
export const buildEventsMap = (params: BuildEventsMapParams): Map<string, DayEvents> => {
    const cacheKey = generateCacheKey(params);

    if (eventsCache && eventsCache.key === cacheKey) {
        // console.debug('[Performance] Serving events from cache');
        return eventsCache.data;
    }

    // console.debug('[Performance] Rebuilding events map');
    const { themes, tasks, goals, projects, allProjectedReviews, calendarDays } = params;
    const map = new Map<string, DayEvents>();

    const getDay = (dateStr: string): DayEvents => {
        if (!map.has(dateStr)) {
            map.set(dateStr, { reviews: [], intros: [], projected: [], tasks: [], goals: [] });
        }
        return map.get(dateStr)!;
    };

    themes.forEach(t => {
        // Handling for PROJECTS in Calendar
        if (t.category === 'project') {
            (t.subthemes || []).forEach(st => {
                if (st.status !== 'completed' && st.introductionDate) {
                    const d = getDay(st.introductionDate);
                    d.tasks.push({
                        id: st.id,
                        title: `${st.title} (${t.title})`,
                        type: 'project-step',
                        date: st.introductionDate,
                        status: 'pending',
                        priority: t.priority,
                        color: t.color || '#8b5cf6',
                        isCompletedToday: false
                    });
                } else if (st.status === 'completed' && st.introductionDate) {
                    const d = getDay(st.introductionDate);
                    d.tasks.push({
                        id: st.id,
                        title: `${st.title} (${t.title})`,
                        type: 'project-step',
                        date: st.introductionDate,
                        status: 'completed',
                        priority: t.priority,
                        color: t.color || '#8b5cf6',
                        isCompletedToday: true
                    });
                }
            });
        }

        // Standard SRS Logic for Study Themes
        if (t.category !== 'project') {
            (t.subthemes || []).forEach(st => {
                (st.reviews || []).forEach(r => {
                    const dateKey = r.date.includes('T') ? r.date.split('T')[0] : r.date;
                    const d = getDay(dateKey);
                    d.reviews.push({ ...r, themeTitle: t.title, subthemeTitle: st.title, type: 'review', id: st.id, subthemeId: st.id, durationMinutes: st.durationMinutes, priority: t.priority, timeSpent: st.timeSpent, color: t.color || '#3b82f6' });
                });
                if (st.introductionDate) {
                    const d = getDay(st.introductionDate);
                    d.intros.push({ themeTitle: t.title, subthemeTitle: st.title, type: 'intro', durationMinutes: st.durationMinutes, priority: t.priority, timeSpent: st.timeSpent, id: st.id, color: t.color || '#f59e0b' });
                }
            });
        }
    });

    allProjectedReviews.forEach((p: any) => {
        const d = getDay(p.date);
        d.projected.push(p);
    });


    tasks.forEach(t => {
        if (t.type === 'day' && t.date) {
            const d = getDay(t.date);
            d.tasks.push({ ...t, color: t.color, isCompletedToday: t.status === 'completed' });
        } else if (t.type === 'period' && t.startDate && t.endDate) {
            eachDayOfInterval({
                start: parseLocalDate(t.startDate),
                end: parseLocalDate(t.endDate)
            }).forEach(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const d = getDay(dateStr);
                const isCompleted = t.completionHistory?.some(h => h.startsWith(dateStr)) || false;

                let label: string | undefined;
                const start = t.startDate ? t.startDate.split('T')[0] : '';
                const end = t.endDate ? t.endDate.split('T')[0] : '';

                if (dateStr === start) label = 'Início';
                else if (dateStr === end) label = 'Prazo';
                else label = 'Em andamento';

                d.tasks.push({ ...t, color: t.color, isCompletedToday: isCompleted, label });
            });
        } else if (t.type === 'recurring' && t.recurrence) {
            calendarDays.forEach(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayOfWeek = day.getDay();
                const taskStart = new Date(t.createdAt).setHours(0, 0, 0, 0);
                if (day.getTime() < taskStart) return;
                if (t.endDate && dateStr > t.endDate) return;

                if (t.recurrence?.includes(dayOfWeek)) {
                    const d = getDay(dateStr);
                    const isCompleted = t.completionHistory?.some(h => h.startsWith(dateStr)) || false;
                    d.tasks.push({ ...t, color: t.color, isCompletedToday: isCompleted });
                }
            });
        }
    });

    goals.forEach(g => {
        if (!g || !g.id) return;

        if (g.type === 'checklist' && g.checklist) {
            const steps = [...g.checklist].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
            let currentPhaseStart = g.startDate ? parseLocalDate(g.startDate) : new Date(g.createdAt);

            steps.forEach((item: any) => {
                if (!item.deadline) return;
                const phaseStart = new Date(currentPhaseStart);
                phaseStart.setHours(0, 0, 0, 0);

                const itemDeadlineKey = item.deadline.includes('T') ? item.deadline.split('T')[0] : item.deadline;
                const inputs = itemDeadlineKey.split('-').map(Number);
                const phaseEnd = new Date(inputs[0], inputs[1] - 1, inputs[2]);
                phaseEnd.setHours(0, 0, 0, 0);

                const iterDate = new Date(phaseStart);
                while (iterDate <= phaseEnd) {
                    const dateKey = format(iterDate, 'yyyy-MM-dd');
                    const d = getDay(dateKey);
                    const history = item.completionHistory || [];
                    const isCompletedToday = history.some((h: string) => h.startsWith(dateKey));
                    const windowDays = Math.ceil((phaseEnd.getTime() - phaseStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    const uniqueChecks = new Set(history.map((h: string) => h.split('T')[0])).size;
                    const progress = Math.min(100, Math.round((uniqueChecks / windowDays) * 100));

                    d.goals.push({
                        id: item.id,
                        type: 'goal-phase',
                        title: item.title,
                        parentGoalId: g.id,
                        parentGoalTitle: g.title,
                        checklist_item_id: item.id,
                        isCompletedToday: isCompletedToday,
                        color: g.color || '#ec4899',
                        priority: g.priority,
                        deadline: item.deadline,
                        durationMinutes: parseInt(item.estimatedTime) || 0,
                        phaseProgress: progress,
                        currentDay: Math.ceil((iterDate.getTime() - phaseStart.getTime()) / (1000 * 60 * 60 * 24)) + 1,
                        totalDays: windowDays
                    });
                    iterDate.setDate(iterDate.getDate() + 1);
                }
                currentPhaseStart = new Date(phaseEnd);
                currentPhaseStart.setDate(currentPhaseStart.getDate() + 1);
            });
        }

        if (g.type === 'habit') {
            calendarDays.forEach(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayOfWeek = day.getDay();
                const goalStart = g.createdAt ? new Date(g.createdAt).setHours(0, 0, 0, 0) : 0;
                if (day.getTime() < goalStart) return;
                if (g.deadline && dateStr > g.deadline) return;

                if (!g.recurrence || g.recurrence.length === 0 || g.recurrence.includes(dayOfWeek)) {
                    const d = getDay(dateStr);
                    const isCompleted = g.completionHistory?.some(h => h.startsWith(dateStr)) || false;
                    d.goals.push({ ...g, color: g.color, isCompletedToday: isCompleted, isParent: true });
                }
            });
        } else if (g.deadline) {
            const start = g.startDate ? g.startDate.split('T')[0] : null;
            const end = g.deadline.split('T')[0];

            if (start && end) {
                eachDayOfInterval({
                    start: parseLocalDate(start),
                    end: parseLocalDate(end)
                }).forEach(date => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const d = getDay(dateStr);
                    const isEnd = dateStr === end;
                    const isStart = dateStr === start;
                    const isCompleted = g.progress === 100;

                    // Only mark as completed if it's actually completed AND the date has passed
                    const today = format(new Date(), 'yyyy-MM-dd');
                    const isCompletedToday = isEnd && isCompleted && dateStr <= today;

                    d.goals.push({
                        ...g,
                        color: g.color || '#3b82f6',
                        isCompletedToday: isCompletedToday,
                        isParent: true,
                        label: isEnd ? 'Prazo' : (isStart ? 'Início' : 'Em andamento')
                    });
                });
            } else {
                const dDeadline = getDay(end);
                const isCompleted = g.progress === 100;
                const today = format(new Date(), 'yyyy-MM-dd');
                const isCompletedToday = isCompleted && end <= today;
                dDeadline.goals.push({ ...g, color: g.color, isCompletedToday: isCompletedToday, isParent: true, label: 'Prazo' });
            }
        }
    });

    projects.forEach(p => {
        const start = p.startDate;
        const end = p.deadline;

        if (start && end) {
            eachDayOfInterval({
                start: parseLocalDate(start),
                end: parseLocalDate(end)
            }).forEach(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const d = getDay(dateStr);
                const isEnd = dateStr === end;
                const isStart = dateStr === start;

                // Only mark as completed if it's actually completed AND the date has passed
                const today = format(new Date(), 'yyyy-MM-dd');
                const isCompletedToday = isEnd && p.progress === 100 && dateStr <= today;

                d.goals.push({
                    id: p.id,
                    title: p.title,
                    type: isEnd ? 'project-deadline' : (isStart ? 'project-start' : 'project-step'),
                    date: dateStr,
                    color: p.color || '#8b5cf6',
                    priority: isEnd ? 'high' : 'medium',
                    isParent: true,
                    label: isEnd ? 'Prazo Projeto' : (isStart ? 'Início Projeto' : 'Projeto em Andamento'),
                    isCompletedToday: isCompletedToday
                });
            });
        } else if (end) {
            const d = getDay(end);
            const isCompleted = p.progress === 100;
            const today = format(new Date(), 'yyyy-MM-dd');
            const isCompletedToday = isCompleted && end <= today;
            d.goals.push({
                id: p.id,
                title: p.title,
                type: 'project-deadline',
                date: end,
                color: p.color || '#8b5cf6',
                priority: 'high',
                isParent: true,
                label: 'Prazo Final',
                isCompletedToday: isCompletedToday
            });
        }

        if (p.milestones && p.milestones.length > 0) {
            p.milestones.forEach(m => {
                if (m.dueDate) {
                    const d = getDay(m.dueDate);
                    d.goals.push({
                        id: m.id,
                        title: m.title,
                        parentGoalTitle: p.title,
                        type: 'project-milestone',
                        date: m.dueDate,
                        color: p.color || '#8b5cf6',
                        priority: 'medium',
                        isCompletedToday: m.completed,
                        label: 'Marco'
                    });
                }
            });
        }
    });

    // Update cache
    eventsCache = {
        key: cacheKey,
        data: map
    };

    return map;
};
