import type { Task, Goal, Theme, Subtheme } from '../types';

/**
 * Utilitário de mapeamento para converter entidades da aplicação (camelCase)
 * para o formato do banco de dados (snake_case) esperado pelo Supabase.
 */
export class SyncMappers {
    static mapTaskToDb(task: Task & { user_id?: string }) {
        return {
            id: task.id,
            title: task.title,
            type: task.type,
            status: task.status,
            priority: task.priority,
            date: task.date,
            start_date: task.startDate,
            end_date: task.endDate,
            recurrence: task.recurrence,
            image_url: task.imageUrl,
            duration_minutes: task.durationMinutes,
            time_spent: task.timeSpent,
            completion_history: task.completionHistory,
            sessions: task.sessions,
            summaries: task.summaries,
            user_id: task.user_id
        };
    }

    static mapGoalToDb(goal: Goal & { user_id?: string }) {
        return {
            id: goal.id,
            title: goal.title,
            type: goal.type,
            category: goal.category,
            progress: goal.progress,
            priority: goal.priority,
            deadline: goal.deadline,
            image_url: goal.imageUrl,
            duration_minutes: goal.durationMinutes,
            time_spent: goal.timeSpent,
            completion_history: goal.completionHistory,
            checklist: goal.checklist,
            summaries: goal.summaries,
            user_id: goal.user_id,
            related_theme_id: goal.relatedThemeId,
            is_habit: goal.isHabit,
            start_date: goal.startDate,
            recurrence: goal.recurrence
        };
    }

    static mapThemeToDb(theme: Theme & { user_id?: string }) {
        return {
            id: theme.id,
            title: theme.title,
            icon: theme.icon,
            color: theme.color,
            category: theme.category,
            start_date: theme.startDate,
            deadline: theme.deadline,
            notification_time: theme.notificationTime,
            image_url: theme.imageUrl,
            priority: theme.priority,
            summaries: theme.summaries,
            user_id: theme.user_id
        };
    }

    static mapSubthemeToDb(sub: Subtheme & { theme_id?: string; user_id?: string }) {
        return {
            id: sub.id,
            theme_id: sub.theme_id,
            title: sub.title,
            status: sub.status,
            introduction_date: sub.introductionDate,
            reviews: sub.reviews,
            duration_minutes: sub.durationMinutes,
            time_spent: sub.timeSpent,
            difficulty: sub.difficulty,
            text_content: sub.text_content,
            summaries: sub.summaries,
            user_id: sub.user_id,
            order_index: sub.order_index
        };
    }
}
