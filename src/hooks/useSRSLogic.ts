import { addDays, format, parseISO } from 'date-fns';
import type { Theme, Subtheme } from '../types';

/**
 * Hook com lógica SRS para projeção de revisões e datas de conclusão
 */
export const useSRSLogic = () => {
    // SRS Intervals: +1, +1, +5, +8, +15 (Cumulative: 1, 2, 7, 15, 30)
    const offsets = [1, 2, 7, 15, 30];

    const generateProjectedReviews = (startDateStr: string) => {
        const startDate = parseISO(startDateStr);
        return offsets.map((offset, idx) => ({
            number: idx + 1,
            date: format(addDays(startDate, offset), 'yyyy-MM-dd'),
            status: 'pending' as const
        }));
    };

    const getThemeCompletionDate = (theme: Theme, queuedSubthemesMap: Map<string, string>): Date | null => {
        let finishDateIdx = 0;
        theme.subthemes.forEach(st => {
            if (st.status === 'queue') {
                const projStartStr = queuedSubthemesMap.get(st.id);
                if (projStartStr) finishDateIdx = addDays(parseISO(projStartStr), 30).getTime();
            } else if (st.status === 'active' || st.status === 'completed') {
                const lastReview = st.reviews?.slice(-1)[0];
                if (lastReview) {
                    const d = parseISO(lastReview.date);
                    if (d.getTime() > finishDateIdx) finishDateIdx = d.getTime();
                }
            }
        });
        return finishDateIdx > 0 ? new Date(finishDateIdx) : null;
    };

    const calculateQueuedDates = (themes: Theme[]): Map<string, string> => {
        const queuedMap = new Map<string, string>();
        let currentDate = new Date();

        themes.forEach(theme => {
            theme.subthemes.forEach(st => {
                if (st.status === 'queue') {
                    queuedMap.set(st.id, format(currentDate, 'yyyy-MM-dd'));
                    currentDate = addDays(currentDate, 1); // Each queued subtheme starts 1 day apart
                }
            });
        });

        return queuedMap;
    };

    return {
        generateProjectedReviews,
        getThemeCompletionDate,
        calculateQueuedDates,
        offsets
    };
};
