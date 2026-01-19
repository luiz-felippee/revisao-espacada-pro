import { format, addDays } from 'date-fns';
import { parseLocalDate } from '../utils/dateHelpers';
import { ptBR } from 'date-fns/locale';
import type { Theme } from '../types';

export const useSRSLogic = () => {
    // Helper to generate SRS dates (Legacy/Projected)
    const generateProjectedReviews = (startDate: string) => {
        const offsets = [1, 2, 7, 15, 30];
        return offsets.map((offset, idx) => ({
            number: idx + 1,
            date: format(addDays(parseLocalDate(startDate), offset), 'yyyy-MM-dd'),
            status: 'pending' as const,
            isProjected: true
        }));
    };

    // Helper for Completion Date
    const getThemeCompletionDate = (theme: Theme, queuedSubthemesMap: Map<string, string>) => {
        let maxDate = 0;
        theme.subthemes.forEach((st: any) => {
            let finishDateIdx = st.reviews.length > 0 ? parseLocalDate(st.reviews[st.reviews.length - 1].date).getTime() : 0;
            if (st.status === 'queue') {
                const projStartStr = queuedSubthemesMap.get(st.id);
                if (projStartStr) finishDateIdx = addDays(parseLocalDate(projStartStr), 30).getTime();
            }
            if (finishDateIdx > maxDate) maxDate = finishDateIdx;
        });
        return maxDate === 0 ? null : format(new Date(maxDate), "d 'de' MMMM", { locale: ptBR });
    };

    // Calculate dates for queued items based on "one new item per day" rule
    const calculateQueuedDates = (themes: Theme[]) => {
        const today = new Date();
        let queueCounter = 0;
        const queuedSubthemesMap = new Map<string, string>();
        themes.forEach(t => {
            t.subthemes.forEach((st: any) => {
                if (st.status === 'queue') {
                    queueCounter++;
                    const projDate = format(addDays(today, queueCounter), 'yyyy-MM-dd');
                    queuedSubthemesMap.set(st.id, projDate);
                }
            });
        });
        return queuedSubthemesMap;
    };

    return {
        generateProjectedReviews,
        getThemeCompletionDate,
        calculateQueuedDates
    };
};
