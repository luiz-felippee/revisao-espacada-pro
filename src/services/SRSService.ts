import { addDays, format, parseISO } from 'date-fns';
import type { Theme, Subtheme, Review } from '../types';

export class SRSService {
    // Default intervals (in days) from the previous review
    // Review 1: +1d (Day 1)
    // Review 2: +2d (Day 3)
    // Review 3: +4d (Day 7)
    // Review 4: +8d (Day 15)
    // Review 5: +15d (Day 30)
    private static DEFAULT_STEP_INTERVALS = [1, 2, 4, 8, 15];

    static getToday(): string {
        return format(new Date(), 'yyyy-MM-dd');
    }

    /**
     * Calculates the next interval based on difficulty and current step
     * Logic:
     * - Hard: Step interval * 0.8 (min 1 day increase)
     * - Medium: Step interval * 1.0 (standard)
     * - Easy: Step interval * 1.5
     */
    static calculateNextInterval(stepIndex: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): number {
        const base = this.DEFAULT_STEP_INTERVALS[stepIndex] || 15;

        switch (difficulty) {
            case 'easy': return Math.ceil(base * 1.8);
            case 'hard': return Math.max(1, Math.floor(base * 0.7));
            default: return base;
        }
    }

    /**
     * Updates subtheme activation logic
     */
    static processDailyUpdates(themes: Theme[], lastProcessedDate: string): { updatedThemes: Theme[], processedDate: string } | null {
        const today = this.getToday();
        const hasIntroToday = themes.some(t =>
            t.subthemes.some(st => st.introductionDate === today)
        );

        if (hasIntroToday && lastProcessedDate === today) return null;

        let activated = false;
        const updatedThemes = themes.map(theme => {
            if (activated || hasIntroToday) return theme;

            const queueIndex = theme.subthemes.findIndex(st => st.status === 'queue');
            if (queueIndex !== -1) {
                const subtheme = theme.subthemes[queueIndex];

                // Initial reviews generation (standard medium)
                let lastDate = new Date();
                const reviews: Review[] = this.DEFAULT_STEP_INTERVALS.map((interval, idx) => {
                    lastDate = addDays(lastDate, interval);
                    return {
                        number: idx + 1,
                        date: format(lastDate, 'yyyy-MM-dd'),
                        status: 'pending'
                    };
                });

                const updatedSubtheme: Subtheme = {
                    ...subtheme,
                    status: 'active',
                    introductionDate: today,
                    reviews: reviews
                };

                const newSubthemes = [...theme.subthemes];
                newSubthemes[queueIndex] = updatedSubtheme;

                activated = true;
                return { ...theme, subthemes: newSubthemes };
            }
            return theme;
        });

        if (activated || lastProcessedDate !== today) {
            return { updatedThemes: updatedThemes, processedDate: today };
        }

        return null;
    }

    /**
     * Completes a review and intelligently reschedules subsequent ones
     */
    static completeReview(
        themes: Theme[],
        subthemeId: string,
        reviewNumber: number,
        difficulty: 'easy' | 'medium' | 'hard' = 'medium'
    ): { updatedThemes: Theme[], awarded: boolean } {
        const today = new Date();
        let awarded = false;

        const updatedThemes = themes.map(t => ({
            ...t,
            subthemes: t.subthemes.map(st => {
                if (st.id !== subthemeId) return st;

                const reviewIdx = st.reviews.findIndex(r => r.number === reviewNumber);
                if (reviewIdx === -1) return st;

                // 0. Date check: Only allow completing if date is today or earlier
                const review = st.reviews[reviewIdx];
                if (review.date > format(today, 'yyyy-MM-dd')) return st;

                const newReviews = [...st.reviews];

                // 1. Mark current as completed
                newReviews[reviewIdx] = {
                    ...newReviews[reviewIdx],
                    status: 'completed',
                    completedAt: today.toISOString(),
                    difficulty: difficulty
                };
                awarded = true;

                // 2. Reschedule SUBSEQUENT reviews if any
                // We take the current completion date as the new anchor
                let anchorDate = today;

                for (let i = reviewIdx + 1; i < newReviews.length; i++) {
                    // Calculate next interval based on the difficulty of the JUST completed review
                    // But wait, it's more expressive if we only apply difficulty to the IMMEDIATE next one
                    // and subsequent ones keep their standard relative distance?
                    // Actually, let's apply a "shifted" schedule.

                    const nextInterval = this.calculateNextInterval(i, i === reviewIdx + 1 ? difficulty : 'medium');
                    anchorDate = addDays(anchorDate, nextInterval);

                    newReviews[i] = {
                        ...newReviews[i],
                        date: format(anchorDate, 'yyyy-MM-dd')
                    };
                }

                const allDone = newReviews.every(r => r.status === 'completed');
                return {
                    ...st,
                    reviews: newReviews,
                    status: allDone ? 'completed' : st.status
                };
            })
        }));

        return { updatedThemes, awarded };
    }
}
