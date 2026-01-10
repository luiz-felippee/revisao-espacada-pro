import { useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useGoalContext } from '../context/GoalContext';
import { useThemeContext } from '../context/ThemeContext';
import { differenceInMinutes, parseISO, startOfDay, subDays, isWithinInterval, getHours } from 'date-fns';

export interface Insight {
    type: 'burnout' | 'productivity' | 'schedule' | 'positive';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    action?: string;
}

export const useInsights = () => {
    const { tasks } = useTaskContext();
    const { goals } = useGoalContext();
    const { themes } = useThemeContext();

    // 1. Gather all session logs from all entities
    const allSessions = useMemo(() => {
        const sessions: { start: string; end: string; duration: number; status: string }[] = [];

        tasks.forEach(task => task.sessions?.forEach(s => sessions.push({ ...s, duration: s.durationMinutes })));
        goals.forEach(goal => goal.sessions?.forEach(s => sessions.push({ ...s, duration: s.durationMinutes })));
        themes.forEach(theme => theme.subthemes?.forEach(st => st.sessions?.forEach(s => sessions.push({ ...s, duration: s.durationMinutes }))));

        return sessions.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
    }, [tasks, goals, themes]);

    // 2. Productivity Analysis (Golden Hour)
    const goldenHourInsight = useMemo((): Insight | null => {
        if (allSessions.length < 5) return null;

        const hourStats: Record<number, number> = {};
        allSessions.forEach(session => {
            if (session.status === 'completed') {
                const hour = getHours(parseISO(session.start));
                hourStats[hour] = (hourStats[hour] || 0) + 1;
            }
        });

        const bestHour = Object.entries(hourStats).sort((a, b) => b[1] - a[1])[0];
        if (!bestHour) return null;

        const hour = parseInt(bestHour[0]);
        return {
            type: 'productivity',
            title: 'Sua Golden Hour',
            description: `Você completa mais missões por volta das ${hour}h. Tente agendar suas tarefas mais difíceis neste horário.`,
            impact: 'medium'
        };
    }, [allSessions]);

    // 3. Burnout Risk Analysis
    const burnoutInsight = useMemo((): Insight | null => {
        const last7Days = allSessions.filter(s => {
            const date = parseISO(s.start);
            return isWithinInterval(date, {
                start: startOfDay(subDays(new Date(), 7)),
                end: new Date()
            });
        });

        const totalMinutes = last7Days.reduce((acc, s) => acc + s.duration, 0);
        const lateSessions = last7Days.filter(s => getHours(parseISO(s.start)) >= 23 || getHours(parseISO(s.start)) <= 4).length;
        const cancelledSessions = last7Days.filter(s => s.status === 'cancelled').length;
        const totalSessions = last7Days.length;

        if (totalMinutes > 2400 || (lateSessions > 5 && totalSessions > 10)) { // ~40h/week or excessive nights
            return {
                type: 'burnout',
                title: 'Risco de Burnout Detectado',
                description: 'Você tem estudado intensamente ou em horários irregulares ultimamente. Considere tirar um dia de descanso para manter a performance.',
                impact: 'high',
                action: 'Ativar Zen Mode'
            };
        }

        if (cancelledSessions / totalSessions > 0.4 && totalSessions > 5) {
            return {
                type: 'burnout',
                title: 'Queda de Engajamento',
                description: 'Muitas sessões foram canceladas recentemente. Talvez o volume de tarefas esteja muito alto?',
                impact: 'medium',
                action: 'Reorganizar metas'
            };
        }

        return null;
    }, [allSessions]);

    // 4. Energy Level Calculation (0-100)
    const energyLevel = useMemo(() => {
        let level = 100;

        const last24h = allSessions.filter(s => {
            return (Date.now() - new Date(s.start).getTime()) < (24 * 60 * 60 * 1000);
        });

        const minutesToday = last24h.reduce((acc, s) => acc + s.duration, 0);
        level -= (minutesToday / 480) * 50; // Max 8h study = -50 energy

        const lateNightToday = last24h.some(s => getHours(parseISO(s.start)) >= 23 || getHours(parseISO(s.start)) <= 4);
        if (lateNightToday) level -= 15;

        return Math.max(10, Math.round(level));
    }, [allSessions]);

    const insights: Insight[] = useMemo(() => {
        const list: Insight[] = [];
        if (burnoutInsight) list.push(burnoutInsight);
        if (goldenHourInsight) list.push(goldenHourInsight);

        // Add default positive insight if everything is fine
        if (list.length === 0 && allSessions.length > 0) {
            list.push({
                type: 'positive',
                title: 'Ritmo Consistente',
                description: 'Você está mantendo um bom equilíbrio entre estudo e descanso. Continue assim!',
                impact: 'low'
            });
        }

        return list;
    }, [burnoutInsight, goldenHourInsight, allSessions.length]);

    return {
        insights,
        energyLevel,
        allSessions
    };
};
