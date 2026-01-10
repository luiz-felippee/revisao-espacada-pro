import React from 'react';
import { format } from 'date-fns';
import { useThemeContext } from '../context/ThemeContext';
import { useGoalContext } from '../context/GoalContext';
import { useTaskContext } from '../context/TaskContext';
import { useGamification } from '../context/GamificationContext';
import { useAppContext } from '../context/AppContext';
import { useProjectContext } from '../context/ProjectProvider';

export const useDashboardData = () => {
    const { themes } = useThemeContext();
    const { goals } = useGoalContext();
    const { tasks } = useTaskContext();
    const { gamification } = useGamification();
    const { zenMode } = useAppContext();
    const { projects } = useProjectContext();
    const settings = { username: 'Estudante' }; // Mock settings if needed or get from specific context if exists

    // Memoize static date values
    const today = React.useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
    const dayOfWeek = React.useMemo(() => new Date().getDay(), []);

    // Calculate KPIs with memoization
    const totalReviews = React.useMemo(() => {
        return themes.reduce((acc, theme) =>
            acc + (theme.subthemes || []).reduce((sAcc, st) => sAcc + (st.reviews || []).filter(r => r.status === 'completed').length, 0)
            , 0);
    }, [themes]);


    const activeGoals = React.useMemo(() => {
        const themeProjectIds = themes.filter(t => t.category === 'project').map(t => t.id);
        return goals.filter(g => {
            // Exclude goals linked to project themes (those are counted as projects)
            if (g.relatedThemeId && themeProjectIds.includes(g.relatedThemeId)) return false;

            // Don't count completed standard goals
            if (g.type !== 'habit' && g.progress >= 100) return false;

            // For habits, only count if they have recurrence (active habits)
            if (g.type === 'habit' && !g.recurrence) return false;

            return true;
        }).length;
    }, [goals, themes]);

    const projectCount = React.useMemo(() => {
        const themeProjectIds = themes.filter(t => t.category === 'project').map(t => t.id);
        const linkedGoalsCount = goals.filter(g => g.relatedThemeId && themeProjectIds.includes(g.relatedThemeId)).length;
        const standaloneProjectsCount = projects.length;
        return linkedGoalsCount + standaloneProjectsCount;
    }, [themes, goals, projects]);


    // Reviews pending today
    const dueReviews = React.useMemo(() => {
        return themes.reduce((acc, theme) =>
            acc + (theme.subthemes || []).reduce((sAcc, st) =>
                sAcc + (st.reviews || []).filter(r => r.status === 'pending' && r.date <= today).length
                , 0)
            , 0);
    }, [themes, today]);

    // Filter Tasks for Dashboard (Today's Tasks only, matching Calendar/Mission)
    const todaysTasks = React.useMemo(() => {
        return tasks.filter(t => {
            const taskCreationDay = new Date(t.createdAt).setHours(0, 0, 0, 0);
            const todayDateObj = new Date(today + 'T00:00:00');
            if (todayDateObj.getTime() < taskCreationDay) return false;

            if (t.status === 'completed') return false;

            if (t.type === 'day') return t.date === today;
            if (t.type === 'recurring' && t.recurrence) {
                if (t.endDate && today > t.endDate) return false;
                return t.recurrence.includes(dayOfWeek);
            }
            if (t.type === 'period' && t.startDate && t.endDate) {
                return today >= t.startDate && today <= t.endDate;
            }
            return false;
        });
    }, [tasks, today, dayOfWeek]);

    const totalCount = React.useMemo(() => {
        return dueReviews + todaysTasks.length + goals.filter(g => g.type === 'habit' && (!g.recurrence || g.recurrence.includes(dayOfWeek))).length;
    }, [dueReviews, todaysTasks.length, goals, dayOfWeek]);

    const completedCount = React.useMemo(() => {
        const completedReviews = themes.reduce((acc, theme) =>
            acc + (theme.subthemes || []).reduce((sAcc, st) =>
                sAcc + (st.reviews || []).filter(r => r.status === 'completed' && r.date === today).length
                , 0)
            , 0);
        const completedTasks = tasks.filter(t => t.status === 'completed' && t.date === today).length;
        const completedHabits = goals.filter(g => g.type === 'habit' && g.completionHistory?.some(h => h.startsWith(today))).length;
        return completedReviews + completedTasks + completedHabits;
    }, [themes, tasks, goals, today]);

    const progressPercent = React.useMemo(() => totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100), [completedCount, totalCount]);
    const isAllDone = totalCount > 0 && completedCount === totalCount;

    return {
        today,
        dayOfWeek,
        totalReviews,
        activeGoals,
        projectCount,
        dueReviews,
        todaysTasks,
        totalCount,
        completedCount,
        progressPercent,
        isAllDone,
        zenMode,
        gamification,
        settings,
        themes,
        goals,
        tasks
    };
};
