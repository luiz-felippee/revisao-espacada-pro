import { useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import type { Task, Goal, Theme, Subtheme } from '../types';

export interface SearchResult {
    id: string;
    type: 'task' | 'goal' | 'theme' | 'subtheme';
    title: string;
    description?: string;
    category?: string;
    status?: string;
    date?: string;
    parentTheme?: string; // For subthemes
    original: Task | Goal | Theme | Subtheme;
}

export const useGlobalSearch = (query: string) => {
    const { tasks, goals, themes } = useStudy();

    const results = useMemo(() => {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const searchTerm = query.toLowerCase().trim();
        const allResults: SearchResult[] = [];

        // Search in Tasks
        tasks.forEach(task => {
            const matchTitle = task.title.toLowerCase().includes(searchTerm);
            const matchSummary = task.summary?.toLowerCase().includes(searchTerm);

            if (matchTitle || matchSummary) {
                allResults.push({
                    id: task.id,
                    type: 'task',
                    title: task.title,
                    description: task.summary, // Use summary instead of description
                    status: task.status,
                    date: task.date || task.startDate,
                    original: task
                });
            }
        });

        // Search in Goals
        goals.forEach(goal => {
            const matchTitle = goal.title.toLowerCase().includes(searchTerm);
            const matchSummary = goal.summary?.toLowerCase().includes(searchTerm);

            if (matchTitle || matchSummary) {
                allResults.push({
                    id: goal.id,
                    type: 'goal',
                    title: goal.title,
                    description: goal.summary,
                    category: goal.category,
                    status: goal.progress >= 100 ? 'completed' : 'active',
                    date: goal.startDate || goal.deadline,
                    original: goal
                });
            }
        });

        // Search in Themes and Subthemes
        themes.forEach(theme => {
            const matchThemeTitle = theme.title.toLowerCase().includes(searchTerm);

            if (matchThemeTitle) {
                allResults.push({
                    id: theme.id,
                    type: 'theme',
                    title: theme.title,
                    category: theme.category,
                    date: theme.startDate,
                    original: theme
                });
            }

            // Search in subthemes
            theme.subthemes.forEach(subtheme => {
                const matchSubthemeTitle = subtheme.title.toLowerCase().includes(searchTerm);

                if (matchSubthemeTitle) {
                    allResults.push({
                        id: subtheme.id,
                        type: 'subtheme',
                        title: subtheme.title,
                        parentTheme: theme.title,
                        status: subtheme.status,
                        date: subtheme.introductionDate,
                        original: subtheme
                    });
                }
            });
        });

        // Sort by relevance (exact matches first, then by type priority)
        return allResults.sort((a, b) => {
            const aExact = a.title.toLowerCase() === searchTerm;
            const bExact = b.title.toLowerCase() === searchTerm;

            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;

            // Priority: tasks > goals > themes > subthemes
            const typePriority = { task: 0, goal: 1, theme: 2, subtheme: 3 };
            return typePriority[a.type] - typePriority[b.type];
        });
    }, [query, tasks, goals, themes]);

    return results;
};
