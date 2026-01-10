import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GamificationService } from './GamificationService';
import { format, subDays } from 'date-fns';

describe('GamificationService', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should provide initial state with level 1', () => {
        const state = GamificationService.getInitialState();
        expect(state.level.level).toBe(1);
        expect(state.level.totalXp).toBe(0);
        expect(state.streak.current).toBe(1);
    });

    describe('awardXP', () => {
        it('should increment current and total XP', () => {
            const state = GamificationService.getInitialState();
            const { newState } = GamificationService.awardXP(state, 100);

            expect(newState.level.currentXp).toBe(100);
            expect(newState.level.totalXp).toBe(100);
        });

        it('should level up when reaching nextLevelXp', () => {
            const state = GamificationService.getInitialState();
            // Initial nextLevelXp is 500
            const { newState } = GamificationService.awardXP(state, 550);

            expect(newState.level.level).toBe(2);
            expect(newState.level.currentXp).toBe(50);
            expect(newState.level.nextLevelXp).toBeGreaterThan(500);
        });

        it('should clamp negative XP', () => {
            const state = GamificationService.getInitialState();
            const { newState } = GamificationService.awardXP(state, -100);

            expect(newState.level.currentXp).toBe(0);
            expect(newState.level.totalXp).toBe(0);
        });

        it('should increment streak if awarding XP on a new day (yesterday was last login)', () => {
            const today = new Date(2025, 0, 2);
            const yesterday = new Date(2025, 0, 1);

            vi.setSystemTime(today);
            const state = GamificationService.getInitialState();
            state.streak.lastLoginDate = format(yesterday, 'yyyy-MM-dd');
            state.stats.lastXpDate = format(yesterday, 'yyyy-MM-dd');

            const { newState } = GamificationService.awardXP(state, 100);

            expect(newState.streak.current).toBe(2);
            expect(newState.streak.lastLoginDate).toBe(format(today, 'yyyy-MM-dd'));
        });

        it('should reset streak if awarding XP after more than 1 day of gap', () => {
            const today = new Date(2025, 0, 5);
            const longAgo = new Date(2025, 0, 1);

            vi.setSystemTime(today);
            const state = GamificationService.getInitialState();
            state.streak.current = 5;
            state.streak.lastLoginDate = format(longAgo, 'yyyy-MM-dd');
            state.stats.lastXpDate = format(longAgo, 'yyyy-MM-dd');

            const { newState } = GamificationService.awardXP(state, 100);

            expect(newState.streak.current).toBe(1);
        });
    });

    describe('achievements', () => {
        it('should unlock "Primeiros Passos" when total XP reaches 100', () => {
            const state = GamificationService.getInitialState();
            const { newState, newUnlock } = GamificationService.awardXP(state, 120);

            expect(newUnlock?.id).toBe('first_steps');
            expect(newState.achievements.some(a => a.id === 'first_steps')).toBe(true);
        });

        it('should not unlock same achievement twice', () => {
            const state = GamificationService.getInitialState();
            const { newState: state1 } = GamificationService.awardXP(state, 120);
            const { newState: state2, newUnlock } = GamificationService.awardXP(state1, 20);

            expect(newUnlock).toBeNull();
            expect(state2.achievements.length).toBe(1);
        });

        it('should unlock streak achievements', () => {
            const today = new Date(2025, 0, 3);
            const yesterday = new Date(2025, 0, 2);
            vi.setSystemTime(today);

            const state = GamificationService.getInitialState();
            state.streak.current = 2; // Almost there
            state.streak.lastLoginDate = format(yesterday, 'yyyy-MM-dd');
            state.stats.lastXpDate = format(yesterday, 'yyyy-MM-dd');

            const { newState } = GamificationService.awardXP(state, 10);

            expect(newState.streak.current).toBe(3);
            expect(newState.achievements.some(a => a.id === 'streak_3')).toBe(true);
        });
    });
});
