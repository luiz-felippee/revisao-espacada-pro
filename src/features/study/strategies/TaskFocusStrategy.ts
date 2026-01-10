import { supabase } from '../../../lib/supabase';
import { addSessionSummary } from '../../../utils/summaries';
import type { FocusStrategy } from './FocusStrategy';
import type { Task } from '../../../types';

export class TaskFocusStrategy implements FocusStrategy {
    async execute(id: string, sessionLog: any, user: any, { taskCtx }: any) {
        const task = user
            ? (await supabase.from('tasks').select('*').eq('id', id).single()).data as Task | null
            : taskCtx.tasks.find((t: Task) => t.id === id);

        if (task) {
            const newSessions = [...(task.sessions || []), sessionLog];
            const newSummaries = addSessionSummary(
                task.summaries || [],
                sessionLog.durationMinutes,
                sessionLog.summary,
                'task',
                { id: task.id, type: 'task', title: task.title }
            );

            if (user) {
                await supabase.from('tasks').update({
                    sessions: newSessions,
                    summaries: newSummaries
                }).eq('id', id);
            }
            taskCtx.updateTask(id, { sessions: newSessions, summaries: newSummaries });
        }
    }
}
