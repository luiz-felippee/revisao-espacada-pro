import { addDays, format } from 'date-fns';
import type { Theme } from '../types';

/**
 * Item de revis\u00e3o projetada gerada pelo sistema SRS
 */
export interface ProjectedReview {
    subthemeId: string;
    subthemeTitle: string;
    themeTitle: string;
    date: string;
    description: string;
    isProjected: true;
    color?: string;
}

/**
 * Gera todas as revis\u00f5es projetadas para subthemes na fila.
 * 
 * ## Algoritmo de Repeti\u00e7\u00e3o Espa\u00e7ada (SRS)
 * 
 * Baseado no m\u00e9todo SuperMemo SM-2, utiliza intervalos fixos otimizados
 * para reten\u00e7\u00e3o de longo prazo:
 * 
 * ### Intervalos de Revis\u00e3o
 * 
 * | Revis\u00e3o | Dias desde In\u00edcio | Intervalo | Prop\u00f3sito |
 * |----------|-------------------|-----------|-----------|
 * | #1 | +1 dia | 1 dia | Reconsolidar aprendizado inicial |
 * | #2 | +2 dias | 1 dia | Reforçar mem\u00f3ria curto prazo |
 * | #3 | +7 dias | 5 dias | Consolidar mem\u00f3ria m\u00e9dio prazo |
 * | #4 | +15 dias | 8 dias | Estabilizar conhecimento |
 * | #5 | +30 dias | 15 dias | Reten\u00e7\u00e3o de longo prazo |
 * 
 * ### Escalonamento de Fila
 * 
 * Subthemes em `status: 'queue'` s\u00e3o distribu\u00eddos ao longo do tempo
 * para evitar sobrecarga cognitiva:
 * - **Subtheme 1:** Inicia amanh\u00e3 (hoje + 1)
 * - **Subtheme 2:** Inicia depois de amanh\u00e3 (hoje + 2)
 * - **Subtheme N:** Inicia em (hoje + N)
 * 
 * @param themes - Lista de temas com subthemes
 * @returns Array de revis\u00f5es projetadas ordenadas por data
 * 
 * @example
 * ```typescript
 * const themes = [
 *   {
 *     title: 'React Hooks',
 *     subthemes: [
 *       { id: '1', title: 'useState', status: 'queue' },
 *       { id: '2', title: 'useEffect', status: 'queue' }
 *     ]
 *   }
 * ];
 * 
 * const projected = getAllProjectedReviews(themes);
 * // Retorna 10 revis\u00f5es: 5 para useState, 5 para useEffect
 * // useState inicia em D+1, useEffect em D+2
 * ```
 * 
 * @see https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
 */
export const getAllProjectedReviews = (themes: Theme[]): ProjectedReview[] => {
    const today = new Date();
    let queueCounter = 0;
    const projectedReviews: ProjectedReview[] = [];

    // SRS Intervals: +1, +1, +5, +8, +15 (Cumulative: 1, 2, 7, 15, 30)
    const offsets = [1, 2, 7, 15, 30];

    themes?.forEach(theme => {
        (theme.subthemes || []).forEach(st => {
            if (st.status === 'queue') {
                queueCounter++;
                // When this subtheme will start
                const startObj = addDays(today, queueCounter);

                // Generate the 6 reviews for this subtheme
                offsets.forEach((offset, idx) => {
                    const reviewDate = addDays(startObj, offset);
                    projectedReviews.push({
                        subthemeId: st.id,
                        subthemeTitle: st.title,
                        themeTitle: theme.title,
                        date: format(reviewDate, 'yyyy-MM-dd'),
                        description: `Revisão #${idx + 1} (Prevista)`,
                        isProjected: true,
                        color: theme.color
                    });
                });
            }
        });
    });

    return projectedReviews;
};
