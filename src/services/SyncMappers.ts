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
        // Campos suportados pelo schema atual (initial_schema.sql)
        return {
            id: goal.id,
            title: goal.title,
            // type: goal.type, // Não existe no schema
            category: goal.category,
            // progress: goal.progress, // Não existe no schema
            // priority: goal.priority, // Não existe no schema
            deadline: goal.deadline,
            // image_url: goal.imageUrl, // Não existe
            // duration_minutes: goal.durationMinutes, // Não existe
            // time_spent: goal.timeSpent, // Não existe
            // completion_history: goal.completionHistory, // Não existe
            // checklist: goal.checklist, // Não existe (!!!)
            // summaries: goal.summaries, // Não existe
            user_id: goal.user_id,
            theme_id: goal.relatedThemeId, // CORREÇÃO DE NOME
            // is_habit: goal.isHabit, // Não existe
            start_date: goal.startDate,
            // recurrence: goal.recurrence // Não existe

            // Campos calculados/básicos suportados
            completed: goal.progress >= 100
        };
    }

    static mapThemeToDb(theme: Theme & { user_id?: string }) {
        // Campos suportados pelo schema atual
        return {
            id: theme.id,
            title: theme.title,
            icon: theme.icon,
            color: theme.color,
            // category: theme.category, // Não existe
            // start_date: theme.startDate, // Não existe
            // deadline: theme.deadline, // Não existe
            // notification_time: theme.notificationTime, // Não existe
            // image_url: theme.imageUrl, // Não existe
            // priority: theme.priority, // Não existe
            // summaries: theme.summaries, // Não existe
            user_id: theme.user_id,
            order_index: (theme as any).order_index || 0
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
