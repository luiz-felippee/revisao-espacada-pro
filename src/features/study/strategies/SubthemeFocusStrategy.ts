import { supabase } from '../../../lib/supabase';
import { addSessionSummary } from '../../../utils/summaries';
import type { FocusStrategy } from './FocusStrategy';

export class SubthemeFocusStrategy implements FocusStrategy {
    async execute(id: string, sessionLog: any, user: any, { themeCtx }: any) {
        const theme = themeCtx.themes.find((t: any) => t.subthemes.some((st: any) => st.id === id));
        if (theme) {
            const subtheme = theme.subthemes.find((st: any) => st.id === id);
            if (subtheme) {
                const newSessions = [...(subtheme.sessions || []), sessionLog];
                const newSummaries = addSessionSummary(
                    subtheme.summaries || [],
                    sessionLog.durationMinutes,
                    sessionLog.summary,
                    'study',
                    { id: subtheme.id, type: 'theme', title: subtheme.title }
                );

                const updatedSubthemes = theme.subthemes.map((st: any) =>
                    st.id === id ? { ...st, sessions: newSessions, summaries: newSummaries } : st
                );

                themeCtx.updateTheme(theme.id, { subthemes: updatedSubthemes });

                if (user) {
                    await supabase.from('subthemes').update({
                        sessions: newSessions,
                        summaries: newSummaries
                    }).eq('id', id);
                }
            }
        }
    }
}
