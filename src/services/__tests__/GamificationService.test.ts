import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GamificationService } from '../GamificationService';
import type { GamificationState } from '../../types/gamification';

describe('GamificationService', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('getToday', () => {
        it('should return current date in yyyy-MM-dd format', () => {
            expect(GamificationService.getToday()).toBe('2024-01-15');
        });

        it('should update when system time changes', () => {
            vi.setSystemTime(new Date('2024-12-25T00:00:00Z'));
            expect(GamificationService.getToday()).toBe('2024-12-25');
        });
    });

    describe('getInitialState', () => {
        it('should return initial state with level 1', () => {
            const state = GamificationService.getInitialState();

            expect(state.level.level).toBe(1);
            expect(state.level.currentXp).toBe(0);
            expect(state.level.nextLevelXp).toBe(500);
            expect(state.level.totalXp).toBe(0);
        });

        it('should initialize streak with current day', () => {
            const state = GamificationService.getInitialState();

            expect(state.streak.current).toBe(1);
            expect(state.streak.max).toBe(1);
            expect(state.streak.lastLoginDate).toBe('2024-01-15');
        });

        it('should initialize empty achievements', () => {
            const state = GamificationService.getInitialState();
            expect(state.achievements).toEqual([]);
        });

        it('should initialize stats with zeros', () => {
            const state = GamificationService.getInitialState();

            expect(state.stats.reviewsCompleted).toBe(0);
            expect(state.stats.tasksCompleted).toBe(0);
            expect(state.stats.goalsCompleted).toBe(0);
            expect(state.stats.habitsCompleted).toBe(0);
            expect(state.stats.totalFocusMinutes).toBe(0);
            expect(state.stats.dailyXp).toBe(0);
        });

        it('should set lastXpDate to today', () => {
            const state = GamificationService.getInitialState();
            expect(state.stats.lastXpDate).toBe('2024-01-15');
        });
    });

    describe('checkStreak', () => {
        let state: GamificationState;

        beforeEach(() => {
            state = GamificationService.getInitialState();
            state.streak.lastLoginDate = '2024-01-14'; // Yesterday
        });

        describe('Streak Continuation', () => {
            it('should increment streak when logging in consecutive days', () => {
                const result = GamificationService.checkStreak(state);

                expect(result.newState.streak.current).toBe(2);
                expect(result.newState.streak.lastLoginDate).toBe('2024-01-15');
            });

            it('should update max streak when current exceeds it', () => {
                state.streak.current = 5;
                state.streak.max = 5;

                const result = GamificationService.checkStreak(state);

                expect(result.newState.streak.current).toBe(6);
                expect(result.newState.streak.max).toBe(6);
            });

            it('should not update max if current is lower', () => {
                state.streak.current = 3;
                state.streak.max = 10;

                const result = GamificationService.checkStreak(state);

                expect(result.newState.streak.current).toBe(4);
                expect(result.newState.streak.max).toBe(10); // Unchanged
            });
        });

        describe('Streak Reset', () => {
            it('should reset streak to 1 when missing a day', () => {
                state.streak.lastLoginDate = '2024-01-13'; // 2 days ago
                state.streak.current = 7;

                const result = GamificationService.checkStreak(state);

                expect(result.newState.streak.current).toBe(1);
                expect(result.newState.streak.lastLoginDate).toBe('2024-01-15');
            });

            it('should not reset max streak', () => {
                state.streak.lastLoginDate = '2024-01-10'; // 5 days ago
                state.streak.current = 5;
                state.streak.max = 10;

                const result = GamificationService.checkStreak(state);

                expect(result.newState.streak.current).toBe(1);
                expect(result.newState.streak.max).toBe(10); // Preserved
            });
        });

        describe('Already Checked Today', () => {
            it('should return null when already checked today', () => {
                state.streak.lastLoginDate = '2024-01-15'; // Today

                const result = GamificationService.checkStreak(state);

                expect(result.newState).toEqual(state);
                expect(result.newUnlock).toBeNull();
            });
        });

        describe('Daily Stats Reset', () => {
            it('should reset dailyXp when new day', () => {
                state.stats.dailyXp = 100;
                state.stats.lastXpDate = '2024-01-14';

                const result = GamificationService.checkStreak(state);

                expect(result.newState.stats.dailyXp).toBe(0);
                expect(result.newState.stats.lastXpDate).toBe('2024-01-15');
            });

            it('should not reset dailyXp if already today', () => {
                state.stats.dailyXp = 100;
                state.stats.lastXpDate = '2024-01-15';
                state.streak.lastLoginDate = '2024-01-14';

                const result = GamificationService.checkStreak(state);

                expect(result.newState.stats.dailyXp).toBe(0); // Reset because streak updated
            });
        });
    });

    describe('awardXP', () => {
        let state: GamificationState;

        beforeEach(() => {
            state = GamificationService.getInitialState();
        });

        describe('Basic XP Award', () => {
            it('should add XP to currentXp and totalXp', () => {
                const result = GamificationService.awardXP(state, 100);

                expect(result.newState.level.currentXp).toBe(100);
                expect(result.newState.level.totalXp).toBe(100);
            });

            it('should update dailyXp stats', () => {
                const result = GamificationService.awardXP(state, 50);

                expect(result.newState.stats.dailyXp).toBe(50);
            });

            it('should accumulate multiple XP awards', () => {
                let result = GamificationService.awardXP(state, 50);
                result = GamificationService.awardXP(result.newState, 30);
                result = GamificationService.awardXP(result.newState, 20);

                expect(result.newState.level.currentXp).toBe(100);
                expect(result.newState.level.totalXp).toBe(100);
            });
        });

        describe('Level Up Mechanics', () => {
            it('should level up when currentXp >= nextLevelXp', () => {
                const result = GamificationService.awardXP(state, 500);

                expect(result.newState.level.level).toBe(2);
                expect(result.newState.level.currentXp).toBe(0);
            });

            it('should carry over excess XP to next level', () => {
                const result = GamificationService.awardXP(state, 550);

                expect(result.newState.level.level).toBe(2);
                expect(result.newState.level.currentXp).toBe(50); // 550 - 500
            });

            it('should increase nextLevelXp by 1.2x on level up', () => {
                const result = GamificationService.awardXP(state, 500);

                // 500 * 1.2 = 600
                expect(result.newState.level.nextLevelXp).toBe(600);
            });

            it('should floor the nextLevelXp calculation', () => {
                state.level.nextLevelXp = 555; // 555 * 1.2 = 666
                const result = GamificationService.awardXP(state, 555);

                expect(result.newState.level.nextLevelXp).toBe(666);
            });

            it('should handle multiple level ups from large XP award', () => {
                // Level 1: 500 XP needed
                // Level 2: 600 XP needed (500 * 1.2)
                // Total: 1100 XP for level 3

                const result = GamificationService.awardXP(state, 1150);

                expect(result.newState.level.level).toBe(3);
                expect(result.newState.level.currentXp).toBe(50); // 1150 - 500 - 600
            });
        });

        describe('Negative XP Clamping', () => {
            it('should not allow currentXp to go below 0', () => {
                state.level.currentXp = 50;

                const result = GamificationService.awardXP(state, -100);

                expect(result.newState.level.currentXp).toBe(0);
            });

            it('should not allow total XP to go below 0', () => {
                state.level.totalXp = 50;

                const result = GamificationService.awardXP(state, -100);

                expect(result.newState.level.totalXp).toBe(0);
            });

            it('should clamp but still update dailyXp', () => {
                state.stats.dailyXp = 100;

                const result = GamificationService.awardXP(state, -50);

                expect(result.newState.stats.dailyXp).toBe(50); // 100 - 50
            });
        });

        describe('Streak Integration', () => {
            it('should check and update streak before awarding XP', () => {
                state.streak.lastLoginDate = '2024-01-14'; // Yesterday
                state.streak.current = 3;

                const result = GamificationService.awardXP(state, 100);

                expect(result.newState.streak.current).toBe(4);
                expect(result.newState.streak.lastLoginDate).toBe('2024-01-15');
            });

            it('should reset streak if needed', () => {
                state.streak.lastLoginDate = '2024-01-10'; // 5 days ago
                state.streak.current = 7;

                const result = GamificationService.awardXP(state, 50);

                expect(result.newState.streak.current).toBe(1);
            });
        });
    });

    describe('claimDailyReward', () => {
        let state: GamificationState;

        beforeEach(() => {
            state = GamificationService.getInitialState();
            state.streak.lastLoginDate = '2024-01-15'; // Already logged in today
        });

        describe('Successful Claim', () => {
            it('should award 50 XP on first claim of the day', () => {
                const result = GamificationService.claimDailyReward(state);

                expect(result.claimed).toBe(true);
                expect(result.xpAmount).toBe(50);
                expect(result.newState.level.totalXp).toBe(50);
            });

            it('should update lastDailyRewardDate', () => {
                const result = GamificationService.claimDailyReward(state);

                expect(result.newState.streak.lastDailyRewardDate).toBe('2024-01-15');
            });

            it('should work even with existing XP', () => {
                state.level.currentXp = 100;
                state.level.totalXp = 100;

                const result = GamificationService.claimDailyReward(state);

                expect(result.claimed).toBe(true);
                expect(result.newState.level.totalXp).toBe(150);
            });
        });

        describe('Already Claimed Today', () => {
            it('should refuse claim if already claimed today', () => {
                state.streak.lastDailyRewardDate = '2024-01-15'; // Already claimed

                const result = GamificationService.claimDailyReward(state);

                expect(result.claimed).toBe(false);
                expect(result.xpAmount).toBe(0);
                expect(result.newState).toEqual(state);
            });
        });

        describe('Not Logged In Today', () => {
            it('should refuse claim if not logged in today', () => {
                state.streak.lastLoginDate = '2024-01-14'; // Yesterday

                const result = GamificationService.claimDailyReward(state);

                expect(result.claimed).toBe(false);
                expect(result.xpAmount).toBe(0);
            });
        });

        describe('First Claim Ever', () => {
            it('should work when lastDailyRewardDate is undefined', () => {
                state.streak.lastDailyRewardDate = undefined;

                const result = GamificationService.claimDailyReward(state);

                expect(result.claimed).toBe(true);
                expect(result.xpAmount).toBe(50);
            });
        });

        describe('Multiple Days', () => {
            it('should allow claim on new day', () => {
                state.streak.lastDailyRewardDate = '2024-01-14';

                const result = GamificationService.claimDailyReward(state);

                expect(result.claimed).toBe(true);
                expect(result.newState.streak.lastDailyRewardDate).toBe('2024-01-15');
            });
        });
    });

    describe('updateStats', () => {
        let state: GamificationState;

        beforeEach(() => {
            state = GamificationService.getInitialState();
        });

        describe('Basic Stats Update', () => {
            it('should update reviewsCompleted', () => {
                const result = GamificationService.updateStats(state, { reviewsCompleted: 5 });

                expect(result.newState.stats.reviewsCompleted).toBe(5);
            });

            it('should update tasksCompleted', () => {
                const result = GamificationService.updateStats(state, { tasksCompleted: 10 });

                expect(result.newState.stats.tasksCompleted).toBe(10);
            });

            it('should update multiple stats at once', () => {
                const result = GamificationService.updateStats(state, {
                    reviewsCompleted: 5,
                    tasksCompleted: 10,
                    totalFocusMinutes: 120
                });

                expect(result.newState.stats.reviewsCompleted).toBe(5);
                expect(result.newState.stats.tasksCompleted).toBe(10);
                expect(result.newState.stats.totalFocusMinutes).toBe(120);
            });
        });

        describe('Daily XP Reset', () => {
            it('should reset dailyXp on new day', () => {
                state.stats.dailyXp = 200;
                state.stats.lastXpDate = '2024-01-14';

                const result = GamificationService.updateStats(state, { reviewsCompleted: 1 });

                expect(result.newState.stats.dailyXp).toBe(0);
                expect(result.newState.stats.lastXpDate).toBe('2024-01-15');
            });

            it('should not reset dailyXp on same day', () => {
                state.stats.dailyXp = 150;
                state.stats.lastXpDate = '2024-01-15';

                const result = GamificationService.updateStats(state, { reviewsCompleted: 1 });

                expect(result.newState.stats.dailyXp).toBe(150);
            });
        });

        describe('Daily History', () => {
            it('should initialize dailyHistory if not exists', () => {
                state.stats.dailyHistory = undefined as any;

                const result = GamificationService.updateStats(state, { reviewsCompleted: 1 });

                expect(result.newState.stats.dailyHistory).toBeDefined();
                expect(result.newState.stats.dailyHistory).toEqual({});
            });

            it('should preserve existing dailyHistory', () => {
                state.stats.dailyHistory = { '2024-01-14': 100 };

                const result = GamificationService.updateStats(state, { reviewsCompleted: 1 });

                expect(result.newState.stats.dailyHistory).toEqual({ '2024-01-14': 100 });
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle malformed state gracefully', () => {
            const malformedState = {
                level: { level: 1, currentXp: 0, nextLevelXp: 500, totalXp: 0 },
                streak: { current: 1, max: 1, lastLoginDate: '2024-01-15' },
                stats: {
                    reviewsCompleted: 0,
                    tasksCompleted: 0,
                    goalsCompleted: 0,
                    habitsCompleted: 0,
                    totalFocusMinutes: 0,
                    dailyXp: 0,
                    lastXpDate: '2024-01-15',
                    dailyHistory: {}
                }
                // Missing achievements
            } as any;

            const result = GamificationService.awardXP(malformedState, 50);

            expect(result.newState.level.totalXp).toBe(50);
            expect(result.newState.achievements).toBeDefined();
        });

        it('should handle zero XP award', () => {
            const state = GamificationService.getInitialState();
            const result = GamificationService.awardXP(state, 0);

            expect(result.newState.level.currentXp).toBe(0);
            expect(result.newState.level.totalXp).toBe(0);
        });

        it('should handle exact level up amount', () => {
            const state = GamificationService.getInitialState();
            const result = GamificationService.awardXP(state, 500);

            expect(result.newState.level.level).toBe(2);
            expect(result.newState.level.currentXp).toBe(0);
        });
    });

    describe('Date Edge Cases', () => {
        it('should handle year transitions', () => {
            vi.setSystemTime(new Date('2024-12-31T23:59:59Z'));
            const state = GamificationService.getInitialState();

            vi.setSystemTime(new Date('2025-01-01T00:00:01Z'));
            const result = GamificationService.checkStreak(state);

            expect(result.newState.streak.current).toBe(2);
            expect(result.newState.streak.lastLoginDate).toBe('2025-01-01');
        });

        it('should handle month transitions', () => {
            vi.setSystemTime(new Date('2024-01-31T12:00:00Z'));
            const state = GamificationService.getInitialState();

            vi.setSystemTime(new Date('2024-02-01T12:00:00Z'));
            const result = GamificationService.checkStreak(state);

            expect(result.newState.streak.current).toBe(2);
        });
    });
});
