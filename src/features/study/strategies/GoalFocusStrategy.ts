import { supabase } from '../../../lib/supabase';
import { addSessionSummary } from '../../../utils/summaries';
import type { FocusStrategy } from './FocusStrategy';
import type { Goal } from '../../../types';

export class GoalFocusStrategy implements FocusStrategy {
    async execute(id: string, sessionLog: any, user: any, { goalCtx }: any) {
        const goal = user
            ? (await supabase.from('goals').select('*').eq('id', id).single()).data as Goal | null
            : goalCtx.goals.find((g: Goal) => g.id === id);

        if (goal) {
            const newSessions = [...(goal.sessions || []), sessionLog];
            const newSummaries = addSessionSummary(
                goal.summaries || [],
                sessionLog.durationMinutes,
                sessionLog.summary,
                'goal',
                { id: goal.id, type: 'goal', title: goal.title }
            );

            if (user) {
                await supabase.from('goals').update({
                    sessions: newSessions,
                    summaries: newSummaries
                }).eq('id', id);
            }
            goalCtx.updateGoal(id, { sessions: newSessions, summaries: newSummaries });
        }
    }
}
