import { useState, useMemo, useEffect } from 'react';
import {
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format
} from 'date-fns';
import { getAllProjectedReviews } from '../../../lib/srs';
import { parseLocalDate } from '../../../utils/dateHelpers';
import type { Theme, Task, Goal, Project } from '../../../types';
import { buildEventsMap } from '../utils/eventCache';

interface UseCalendarEventsProps {
    themes: Theme[];
    tasks: Task[];
    goals: Goal[];
    projects: Project[];
}

export const useCalendarEvents = ({ themes, tasks, goals, projects }: UseCalendarEventsProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const { calendarDays } = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
        return { calendarDays };
    }, [currentMonth]);

    const allProjectedReviews = useMemo(() => getAllProjectedReviews(themes), [themes]);

    // Otimização de Performance: Use cached builder
    // O buildEventsMap usa object-hash internamente para evitar reprocessamento
    // se os dados forem estruturalmente idênticos, mesmo com novas referências de array.
    const eventsMap = useMemo(() => {
        return buildEventsMap({
            themes,
            tasks,
            goals,
            projects,
            allProjectedReviews,
            calendarDays
        });
    }, [themes, tasks, goals, projects, allProjectedReviews, calendarDays]);

    // Create Sets of valid IDs for filtering (outside useMemo so they always reflect current props)
    // This part is fast enough to run on every render (O(n) where n is simple count)
    const currentGoalIds = new Set(goals.map(g => g.id));
    const currentTaskIds = new Set(tasks.map(t => t.id));
    const currentProjectIds = new Set(projects.map(p => p.id));
    const currentSubthemeIds = new Set(
        themes.flatMap(t => t.subthemes.map(st => st.id))
    );

    const getEventsForDay = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayEvents = eventsMap.get(dateStr) || { reviews: [], intros: [], projected: [], tasks: [], goals: [] };

        // Filter out goals that reference deleted parent goals/items AND deleted projects
        const filteredGoals = (dayEvents.goals || []).filter((g: any) => {
            // Check if it's a project-related event
            if (g.type === 'project-start' || g.type === 'project-deadline' || g.type === 'project-step' || g.type === 'project-milestone') {
                return currentProjectIds.has(g.id);
            }
            // Check regular goals
            if (g.parentGoalId) return currentGoalIds.has(g.parentGoalId);
            if (g.id) return currentGoalIds.has(g.id);
            return true;
        });

        const filteredTasks = (dayEvents.tasks || []).filter((t: any) => {
            if (t.id) return currentTaskIds.has(t.id);
            return true;
        });

        const filteredReviews = (dayEvents.reviews || []).filter((r: any) => {
            if (r.subthemeId) return currentSubthemeIds.has(r.subthemeId);
            if (r.id) return currentSubthemeIds.has(r.id);
            return true;
        });

        const filteredIntros = (dayEvents.intros || []).filter((i: any) => {
            if (i.subthemeId) return currentSubthemeIds.has(i.subthemeId);
            if (i.id) return currentSubthemeIds.has(i.id);
            return true;
        });

        const filteredProjected = (dayEvents.projected || []).filter((p: any) => {
            if (p.subthemeId) return currentSubthemeIds.has(p.subthemeId);
            if (p.id) return currentSubthemeIds.has(p.id);
            return true;
        });

        return {
            reviews: filteredReviews,
            intros: filteredIntros,
            projected: filteredProjected,
            tasks: filteredTasks,
            goals: filteredGoals
        };
    };

    const upcomingList = useMemo(() => {
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const activeReviews: any[] = [];
        themes.forEach(t => {
            t.subthemes.forEach(st => {
                st.reviews.forEach(r => {
                    if (r.status === 'pending') {
                        activeReviews.push({
                            ...r,
                            themeTitle: t.title,
                            subthemeTitle: st.title,
                            id: st.id,
                            type: 'active',
                            originalDate: new Date(r.date),
                            color: t.color || '#3b82f6'
                        });
                    }
                });
            });
        });

        const projected = allProjectedReviews
            .filter((p: any) => {
                // Handle various date formats safely
                try {
                    const d = parseLocalDate(p.date);
                    return d >= today;
                } catch {
                    return false;
                }
            })
            .map((p: any) => ({
                ...p,
                type: 'projected',
                status: 'pending',
                originalDate: parseLocalDate(p.date),
                number: parseInt(p.description.match(/#(\d+)/)?.[1] || '0')
            }));

        const combined = [...activeReviews, ...projected].sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());
        return combined.slice(0, 15);
    }, [themes, allProjectedReviews, now]);

    return {
        currentMonth,
        now,
        calendarDays,
        nextMonth,
        prevMonth,
        setCurrentMonth,
        getEventsForDay,
        upcomingList
    };
};
