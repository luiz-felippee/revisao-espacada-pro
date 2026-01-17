import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SRSService } from '../SRSService';
import type { Theme, Subtheme } from '../../types';
import { format, addDays } from 'date-fns';

describe('SRSService', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('getToday', () => {
        it('should return current date in yyyy-MM-dd format', () => {
            const today = SRSService.getToday();
            expect(today).toBe('2024-01-15');
        });

        it('should return correct date after time change', () => {
            vi.setSystemTime(new Date('2024-12-25T00:00:00Z'));
            const today = SRSService.getToday();
            expect(today).toBe('2024-12-25');
        });
    });

    describe('calculateNextInterval', () => {
        describe('Medium Difficulty (Standard)', () => {
            it('should return standard intervals for each step', () => {
                expect(SRSService.calculateNextInterval(0, 'medium')).toBe(1);  // Day 1
                expect(SRSService.calculateNextInterval(1, 'medium')).toBe(2);  // Day 3
                expect(SRSService.calculateNextInterval(2, 'medium')).toBe(4);  // Day 7
                expect(SRSService.calculateNextInterval(3, 'medium')).toBe(8);  // Day 15
                expect(SRSService.calculateNextInterval(4, 'medium')).toBe(15); // Day 30
            });

            it('should default to medium when no difficulty specified', () => {
                expect(SRSService.calculateNextInterval(0)).toBe(1);
                expect(SRSService.calculateNextInterval(2)).toBe(4);
            });
        });

        describe('Easy Difficulty', () => {
            it('should increase intervals by 80% (1.8x multiplier)', () => {
                expect(SRSService.calculateNextInterval(0, 'easy')).toBe(2);  // 1 * 1.8 = 1.8 → 2
                expect(SRSService.calculateNextInterval(1, 'easy')).toBe(4);  // 2 * 1.8 = 3.6 → 4
                expect(SRSService.calculateNextInterval(2, 'easy')).toBe(8);  // 4 * 1.8 = 7.2 → 8
                expect(SRSService.calculateNextInterval(3, 'easy')).toBe(15); // 8 * 1.8 = 14.4 → 15
                expect(SRSService.calculateNextInterval(4, 'easy')).toBe(27); // 15 * 1.8 = 27
            });

            it('should ceil fractional results', () => {
                const result = SRSService.calculateNextInterval(1, 'easy'); // 2 * 1.8 = 3.6
                expect(result).toBe(4); // Ceiled
            });
        });

        describe('Hard Difficulty', () => {
            it('should decrease intervals by 30% (0.7x multiplier)', () => {
                expect(SRSService.calculateNextInterval(0, 'hard')).toBe(1);  // 1 * 0.7 = 0.7 → max(1, 0) = 1
                expect(SRSService.calculateNextInterval(1, 'hard')).toBe(1);  // 2 * 0.7 = 1.4 → 1
                expect(SRSService.calculateNextInterval(2, 'hard')).toBe(2);  // 4 * 0.7 = 2.8 → 2
                expect(SRSService.calculateNextInterval(3, 'hard')).toBe(5);  // 8 * 0.7 = 5.6 → 5
                expect(SRSService.calculateNextInterval(4, 'hard')).toBe(10); // 15 * 0.7 = 10.5 → 10
            });

            it('should never return less than 1 day', () => {
                const result = SRSService.calculateNextInterval(0, 'hard');
                expect(result).toBeGreaterThanOrEqual(1);
            });

            it('should floor fractional results', () => {
                const result = SRSService.calculateNextInterval(2, 'hard'); // 4 * 0.7 = 2.8
                expect(result).toBe(2); // Floored
            });
        });

        describe('Out of Range Steps', () => {
            it('should default to 15 days for steps beyond array', () => {
                expect(SRSService.calculateNextInterval(5, 'medium')).toBe(15);
                expect(SRSService.calculateNextInterval(10, 'medium')).toBe(15);
                expect(SRSService.calculateNextInterval(100, 'medium')).toBe(15);
            });

            it('should apply difficulty multiplier to default value', () => {
                expect(SRSService.calculateNextInterval(10, 'easy')).toBe(27); // 15 * 1.8
                expect(SRSService.calculateNextInterval(10, 'hard')).toBe(10); // 15 * 0.7
            });
        });
    });

    describe('processDailyUpdates', () => {
        let themes: Theme[];

        beforeEach(() => {
            themes = [
                {
                    id: 'theme1',
                    title: 'Theme 1',
                    color: 'blue',
                    subthemes: [
                        {
                            id: 'st1',
                            title: 'Subtheme 1',
                            status: 'queue',
                            reviews: [],
                        },
                        {
                            id: 'st2',
                            title: 'Subtheme 2',
                            status: 'queue',
                            reviews: [],
                        },
                    ],
                } as Theme,
            ];
        });

        describe('Activation Logic', () => {
            it('should activate first queued subtheme when no intro today', () => {
                const result = SRSService.processDailyUpdates(themes, '2024-01-14');

                expect(result).not.toBeNull();
                expect(result!.updatedThemes[0].subthemes[0].status).toBe('active');
                expect(result!.updatedThemes[0].subthemes[0].introductionDate).toBe('2024-01-15');
            });

            it('should generate 5 review dates for activated subtheme', () => {
                const result = SRSService.processDailyUpdates(themes, '2024-01-14');

                const reviews = result!.updatedThemes[0].subthemes[0].reviews;
                expect(reviews).toHaveLength(5);
                expect(reviews[0].number).toBe(1);
                expect(reviews[4].number).toBe(5);
            });

            it('should generate reviews with correct dates based on intervals', () => {
                const result = SRSService.processDailyUpdates(themes, '2024-01-14');
                const reviews = result!.updatedThemes[0].subthemes[0].reviews;

                // Starting from 2024-01-15:
                // Review 1: +1d = 2024-01-16
                // Review 2: +2d = 2024-01-18
                // Review 3: +4d = 2024-01-22
                // Review 4: +8d = 2024-01-30
                // Review 5: +15d = 2024-02-14

                expect(reviews[0].date).toBe('2024-01-16');
                expect(reviews[1].date).toBe('2024-01-18');
                expect(reviews[2].date).toBe('2024-01-22');
                expect(reviews[3].date).toBe('2024-01-30');
                expect(reviews[4].date).toBe('2024-02-14');
            });

            it('should set all reviews to pending status', () => {
                const result = SRSService.processDailyUpdates(themes, '2024-01-14');
                const reviews = result!.updatedThemes[0].subthemes[0].reviews;

                reviews.forEach(review => {
                    expect(review.status).toBe('pending');
                });
            });

            it('should only activate one subtheme at a time', () => {
                const result = SRSService.processDailyUpdates(themes, '2024-01-14');

                const activeCount = result!.updatedThemes[0].subthemes.filter(
                    st => st.status === 'active'
                ).length;

                expect(activeCount).toBe(1);
                expect(result!.updatedThemes[0].subthemes[1].status).toBe('queue');
            });
        });

        describe('Already Processed Today', () => {
            it('should return null when already processed today and no intro today', () => {
                const result = SRSService.processDailyUpdates(themes, '2024-01-15');
                expect(result).toBeNull();
            });

            it('should NOT return null when intro happened today even if already processed', () => {
                themes[0].subthemes[0].introductionDate = '2024-01-15';
                const result = SRSService.processDailyUpdates(themes, '2024-01-15');

                expect(result).not.toBeNull();
                expect(result!.processedDate).toBe('2024-01-15');
            });
        });

        describe('No Queued Subthemes', () => {
            it('should update processedDate even if no activation happens', () => {
                themes[0].subthemes[0].status = 'active';
                themes[0].subthemes[1].status = 'completed';

                const result = SRSService.processDailyUpdates(themes, '2024-01-14');

                expect(result).not.toBeNull();
                expect(result!.processedDate).toBe('2024-01-15');
            });

            it('should not modify themes when all subthemes are active/completed', () => {
                themes[0].subthemes[0].status = 'active';
                themes[0].subthemes[1].status = 'active';

                const result = SRSService.processDailyUpdates(themes, '2024-01-14');

                expect(result!.updatedThemes[0].subthemes[0].status).toBe('active');
                expect(result!.updatedThemes[0].subthemes[1].status).toBe('active');
            });
        });

        describe('Multiple Themes', () => {
            it('should only activate from first theme with queued subthemes', () => {
                themes.push({
                    id: 'theme2',
                    title: 'Theme 2',
                    color: 'red',
                    subthemes: [
                        {
                            id: 'st3',
                            title: 'Subtheme 3',
                            status: 'queue',
                            reviews: [],
                        },
                    ],
                } as Theme);

                const result = SRSService.processDailyUpdates(themes, '2024-01-14');

                // Only theme1's first subtheme should activate
                expect(result!.updatedThemes[0].subthemes[0].status).toBe('active');
                expect(result!.updatedThemes[1].subthemes[0].status).toBe('queue');
            });
        });
    });

    describe('completeReview', () => {
        let themes: Theme[];

        beforeEach(() => {
            themes = [
                {
                    id: 'theme1',
                    title: 'Theme 1',
                    color: 'blue',
                    subthemes: [
                        {
                            id: 'st1',
                            title: 'Subtheme 1',
                            status: 'active',
                            introductionDate: '2024-01-10',
                            reviews: [
                                { number: 1, date: '2024-01-11', status: 'pending' },
                                { number: 2, date: '2024-01-13', status: 'pending' },
                                { number: 3, date: '2024-01-17', status: 'pending' },
                                { number: 4, date: '2024-01-25', status: 'pending' },
                                { number: 5, date: '2024-02-09', status: 'pending' },
                            ],
                        },
                    ],
                } as Theme,
            ];
        });

        describe('Basic Completion', () => {
            it('should mark review as completed', () => {
                const result = SRSService.completeReview(themes, 'st1', 1, 'medium');

                const review = result.updatedThemes[0].subthemes[0].reviews[0];
                expect(review.status).toBe('completed');
                expect(review.difficulty).toBe('medium');
                expect(review.completedAt).toBeDefined();
            });

            it('should set awarded flag to true on successful completion', () => {
                const result = SRSService.completeReview(themes, 'st1', 1, 'medium');
                expect(result.awarded).toBe(true);
            });

            it('should not modify other reviews when completing one', () => {
                const result = SRSService.completeReview(themes, 'st1', 1, 'medium');
                const reviews = result.updatedThemes[0].subthemes[0].reviews;

                expect(reviews[1].status).toBe('pending');
                expect(reviews[2].status).toBe('pending');
            });
        });

        describe('Date Validation', () => {
            it('should allow completing review on its due date', () => {
                vi.setSystemTime(new Date('2024-01-11T12:00:00Z')); // Review 1 due date

                const result = SRSService.completeReview(themes, 'st1', 1, 'medium');
                expect(result.updatedThemes[0].subthemes[0].reviews[0].status).toBe('completed');
            });

            it('should allow completing review after its due date', () => {
                vi.setSystemTime(new Date('2024-01-12T12:00:00Z')); // 1 day after

                const result = SRSService.completeReview(themes, 'st1', 1, 'medium');
                expect(result.updatedThemes[0].subthemes[0].reviews[0].status).toBe('completed');
            });

            it('should NOT allow completing review before its due date', () => {
                vi.setSystemTime(new Date('2024-01-10T12:00:00Z')); // 1 day before

                const result = SRSService.completeReview(themes, 'st1', 1, 'medium');
                expect(result.updatedThemes[0].subthemes[0].reviews[0].status).toBe('pending');
                expect(result.awarded).toBe(false);
            });
        });

        describe('Rescheduling Logic - Medium Difficulty', () => {
            it('should reschedule subsequent reviews from completion date', () => {
                vi.setSystemTime(new Date('2024-01-15T12:00:00Z')); // Complete on Jan 15

                const result = SRSService.completeReview(themes, 'st1', 1, 'medium');
                const reviews = result.updatedThemes[0].subthemes[0].reviews;

                // From Jan 15:
                // Review 2: +2d = Jan 17
                // Review 3: +4d = Jan 21
                // Review 4: +8d = Jan 29
                // Review 5: +15d = Feb 13

                expect(reviews[1].date).toBe('2024-01-17');
                expect(reviews[2].date).toBe('2024-01-21');
                expect(reviews[3].date).toBe('2024-01-29');
                expect(reviews[4].date).toBe('2024-02-13');
            });
        });

        describe('Rescheduling Logic - Easy Difficulty', () => {
            it('should apply easy multiplier (1.8x) to immediate next review only', () => {
                vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));

                const result = SRSService.completeReview(themes, 'st1', 1, 'easy');
                const reviews = result.updatedThemes[0].subthemes[0].reviews;

                // From Jan 15:
                // Review 2: +4d (2*1.8=3.6→4) = Jan 19
                // Review 3: +4d (standard) = Jan 23
                // Review 4: +8d (standard) = Jan 31
                // Review 5: +15d (standard) = Feb 15

                expect(reviews[1].date).toBe('2024-01-19');
                expect(reviews[2].date).toBe('2024-01-23');
            });
        });

        describe('Rescheduling Logic - Hard Difficulty', () => {
            it('should apply hard multiplier (0.7x) to immediate next review only', () => {
                vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));

                const result = SRSService.completeReview(themes, 'st1', 1, 'hard');
                const reviews = result.updatedThemes[0].subthemes[0].reviews;

                // From Jan 15:
                // Review 2: +1d (2*0.7=1.4→1) = Jan 16
                // Review 3: +4d (standard) = Jan 20
                // Review 4: +8d (standard) = Jan 28
                // Review 5: +15d (standard) = Feb 12

                expect(reviews[1].date).toBe('2024-01-16');
                expect(reviews[2].date).toBe('2024-01-20');
            });
        });

        describe('Status Transitions', () => {
            it('should mark subtheme as completed when all reviews are done', () => {
                // Mark first 4 reviews as completed
                themes[0].subthemes[0].reviews = themes[0].subthemes[0].reviews.map((r, idx) =>
                    idx < 4 ? { ...r, status: 'completed' as const } : r
                );

                const result = SRSService.completeReview(themes, 'st1', 5, 'medium');

                expect(result.updatedThemes[0].subthemes[0].status).toBe('completed');
            });

            it('should keep status as active if not all reviews are done', () => {
                const result = SRSService.completeReview(themes, 'st1', 1, 'medium');
                expect(result.updatedThemes[0].subthemes[0].status).toBe('active');
            });
        });

        describe('Edge Cases', () => {
            it('should handle non-existent subtheme ID gracefully', () => {
                const result = SRSService.completeReview(themes, 'non-existent', 1, 'medium');
                expect(result.awarded).toBe(false);
                expect(result.updatedThemes).toEqual(themes);
            });

            it('should handle non-existent review number gracefully', () => {
                const result = SRSService.completeReview(themes, 'st1', 99, 'medium');
                expect(result.awarded).toBe(false);
            });

            it('should handle completing last review without rescheduling', () => {
                themes[0].subthemes[0].reviews = themes[0].subthemes[0].reviews.map((r, idx) =>
                    idx < 4 ? { ...r, status: 'completed' as const } : r
                );

                vi.setSystemTime(new Date('2024-02-09T12:00:00Z'));

                const result = SRSService.completeReview(themes, 'st1', 5, 'medium');
                const review5 = result.updatedThemes[0].subthemes[0].reviews[4];

                expect(review5.status).toBe('completed');
                expect(result.updatedThemes[0].subthemes[0].status).toBe('completed');
            });
        });
    });
});
