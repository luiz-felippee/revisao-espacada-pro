import type { Task, Goal, Theme } from '../types';

/**
 * Export tasks to CSV format
 */
export const exportTasksToCSV = (tasks: Task[]): string => {
    const headers = ['Title', 'Type', 'Status', 'Priority', 'Date', 'Duration (min)', 'Time Spent (min)'];
    const rows = tasks.map(task => [
        `"${task.title.replace(/"/g, '""')}"`,
        task.type,
        task.status,
        task.priority || '',
        task.date || task.startDate || '',
        task.durationMinutes || '',
        task.timeSpent || 0,
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csv;
};

/**
 * Export goals to CSV format
 */
export const exportGoalsToCSV = (goals: Goal[]): string => {
    const headers = ['Title', 'Type', 'Category', 'Progress', 'Start Date', 'Deadline'];
    const rows = goals.map(goal => [
        `"${goal.title.replace(/"/g, '""')}"`,
        goal.type,
        goal.category,
        `${goal.progress}%`,
        goal.startDate || '',
        goal.deadline || '',
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csv;
};

/**
 * Export themes to CSV format
 */
export const exportThemesToCSV = (themes: Theme[]): string => {
    const headers = ['Theme', 'Subtheme Count', 'Start Date', 'Deadline', 'Priority'];
    const rows = themes.map(theme => [
        `"${theme.title.replace(/"/g, '""')}"`,
        theme.subthemes.length,
        theme.startDate || '',
        theme.deadline || '',
        theme.priority || '',
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csv;
};

/**
 * Download CSV file
 */
export const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
