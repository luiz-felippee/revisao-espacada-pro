import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SRSService } from './SRSService';
import type { Theme, Subtheme, Review } from '../types';
import { addDays, format } from 'date-fns';

describe('SRSService', () => {
    // Helper to create mock themes
    const createMockTheme = (subthemes: Subtheme[] = []): Theme => ({
        id: 'theme-1',
        title: 'Test Theme',
        icon: 'test',
        imageUrl: 'test',
        color: 'blue',
        priority: 'medium',
        createdAt: Date.now(),
        subthemes
    });

    const createMockSubtheme = (id: string, status: 'queue' | 'active' | 'completed' = 'queue', reviews: Review[] = []): Subtheme => ({
        id,
        // theme_id removed as it is not part of Subtheme interface based on lint error
        title: `Subtheme ${id}`,
        status,
        reviews,
        introductionDate: status === 'active' ? '2025-01-01' : undefined
    });

    beforeEach(() => {
        // Reset time before each test
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('processDailyUpdates', () => {
        it('should activate the first queued subtheme if nothing was introduced today', () => {
            // Mock Today: 2025-01-01
            const today = new Date(2025, 0, 1);
            vi.setSystemTime(today);
            const todayStr = '2025-01-01';

            const sub1 = createMockSubtheme('sub-1', 'queue');
            const sub2 = createMockSubtheme('sub-2', 'queue');
            const themes = [createMockTheme([sub1, sub2])];

            const result = SRSService.processDailyUpdates(themes, '2024-12-31');

            expect(result).not.toBeNull();
            expect(result?.processedDate).toBe(todayStr);

            const updatedSub1 = result?.updatedThemes[0].subthemes[0];
            expect(updatedSub1?.status).toBe('active');
            expect(updatedSub1?.introductionDate).toBe(todayStr);
            expect(updatedSub1?.reviews.length).toBe(5); // 5 Standard intervals

            // Check first review date (Offset 1 day)
            // If today is 2025-01-01, review 1 should be 2025-01-02
            expect(updatedSub1?.reviews[0].date).toBe('2025-01-02');

            // Sub 2 should remain queued
            expect(result?.updatedThemes[0].subthemes[1].status).toBe('queue');
        });

        it('should NOT activate anything if a subtheme was already introduced today', () => {
            const today = new Date(2025, 0, 1);
            vi.setSystemTime(today);
            const todayStr = '2025-01-01';

            // Subtheme already active introduced today
            const sub1 = createMockSubtheme('sub-1', 'active');
            sub1.introductionDate = todayStr;
            const sub2 = createMockSubtheme('sub-2', 'queue');

            const themes = [createMockTheme([sub1, sub2])];

            const result = SRSService.processDailyUpdates(themes, '2024-12-31');

            // Should return null (no updates needed) or just date update if date was old?
            // The service returns null if today matches OR hasIntroToday.
            // If hasIntroToday but lastProcessed is old, it returns themes unchanged but new date.

            expect(result).not.toBeNull();
            expect(result?.updatedThemes).toEqual(themes); // Content check, not reference
            expect(result?.processedDate).toBe(todayStr);
        });

        it('should calculate correct intervals [1, 2, 4, 8, 15]', () => {
            const today = new Date(2025, 0, 1);
            vi.setSystemTime(today);

            const sub1 = createMockSubtheme('sub-1', 'queue');
            const themes = [createMockTheme([sub1])];

            const result = SRSService.processDailyUpdates(themes, '2024-12-31');
            const reviews = result?.updatedThemes[0].subthemes[0].reviews;

            if (!reviews) throw new Error('Reviews not created');

            // Expected Dates based on 2025-01-01 (acumulative)
            // +1  -> 2025-01-02
            // +2  -> 2025-01-04
            // +4  -> 2025-01-08
            // +8  -> 2025-01-16
            // +15 -> 2025-01-31

            expect(reviews[0].date).toBe('2025-01-02');
            expect(reviews[1].date).toBe('2025-01-04');
            expect(reviews[2].date).toBe('2025-01-08');
            expect(reviews[3].date).toBe('2025-01-16');
            expect(reviews[4].date).toBe('2025-01-31');
        });

        it('should handle leap years correctly (Feb 2024)', () => {
            // Feb 28, 2024 (Leap year)
            const date = new Date(2024, 1, 28);
            vi.setSystemTime(date);

            const sub1 = createMockSubtheme('sub-leap', 'queue');
            const themes = [createMockTheme([sub1])];

            const result = SRSService.processDailyUpdates(themes, '2024-02-27');
            const reviews = result?.updatedThemes[0].subthemes[0].reviews;

            if (!reviews) throw new Error('Reviews not created');

            // Today is 2024-02-28
            // +1 day -> 2024-02-29 (Leap day)
            // +3 days -> 2024-03-02
            expect(reviews[0].date).toBe('2024-02-29');
            expect(reviews[1].date).toBe('2024-03-02');
        });

        it('should only activate one subtheme per day even across multiple themes', () => {
            const today = new Date(2025, 0, 1);
            vi.setSystemTime(today);

            const theme1 = createMockTheme([createMockSubtheme('t1-s1', 'queue')]);
            const theme2 = createMockTheme([createMockSubtheme('t2-s1', 'queue')]);
            theme2.id = 'theme-2';

            const result = SRSService.processDailyUpdates([theme1, theme2], '2024-12-31');

            const updatedTheme1 = result?.updatedThemes.find(t => t.id === 'theme-1');
            const updatedTheme2 = result?.updatedThemes.find(t => t.id === 'theme-2');

            // Only one should be active
            const activeCount =
                (updatedTheme1?.subthemes.filter(s => s.status === 'active').length || 0) +
                (updatedTheme2?.subthemes.filter(s => s.status === 'active').length || 0);

            expect(activeCount).toBe(1);
        });
    });

    describe('completeReview', () => {
        it('should mark review as completed', () => {
            const today = new Date(2025, 0, 2); // Review day
            vi.setSystemTime(today);
            const todayStr = '2025-01-02';

            const review1: Review = { number: 1, date: todayStr, status: 'pending' };
            const sub1 = createMockSubtheme('sub-1', 'active', [review1]);
            const themes = [createMockTheme([sub1])];

            const { updatedThemes, awarded } = SRSService.completeReview(themes, 'sub-1', 1);

            expect(awarded).toBe(true);
            const updatedSub = updatedThemes[0].subthemes[0];
            expect(updatedSub.reviews[0].status).toBe('completed');
        });

        it('should NOT complete future reviews', () => {
            const today = new Date(2025, 0, 1); // Before review day
            vi.setSystemTime(today);

            const review1: Review = { number: 1, date: '2025-01-02', status: 'pending' };
            const sub1 = createMockSubtheme('sub-1', 'active', [review1]);
            const themes = [createMockTheme([sub1])];

            const { updatedThemes, awarded } = SRSService.completeReview(themes, 'sub-1', 1);

            expect(awarded).toBe(false);
            expect(updatedThemes[0].subthemes[0].reviews[0].status).toBe('pending');
        });
    });
});
