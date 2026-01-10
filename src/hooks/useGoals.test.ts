import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGoals } from './useGoals';
import { SyncQueueService } from '../services/SyncQueueService';
import { useToast } from '../context/ToastContext';
import { XP_VALUES } from '../config/gamification.config';

// Mock dependencies
vi.mock('../services/SyncQueueService', () => ({
    SyncQueueService: {
        enqueue: vi.fn(),
    },
}));

vi.mock('../context/ToastContext', () => ({
    useToast: vi.fn(() => ({
        showToast: vi.fn(),
    })),
}));

vi.mock('../utils/celebration', () => ({
    celebrate: vi.fn(),
}));

vi.mock('../utils/summaries', () => ({
    addGoalProgressSummary: vi.fn(),
    addCompletionSummary: vi.fn(),
}));

vi.mock('../utils/deletedItemsBlacklist', () => ({
    addToBlacklist: vi.fn(),
    removeFromBlacklist: vi.fn(),
}));

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2)
});

describe('useGoals hook', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockGamification = { level: 1, xp: 0, nextLevelXp: 100 };
    const awardXP = vi.fn();
    const updateStats = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should initialize with goals from localStorage', () => {
        const initialGoals = [{ id: '1', title: 'Test Goal', category: 'Study', progress: 0 }];
        localStorage.setItem('study_goals_backup', JSON.stringify(initialGoals));

        const { result } = renderHook(() => useGoals({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        expect(result.current.goals).toEqual(initialGoals);
    });

    it('should add a new goal and trigger sync', async () => {
        const { result } = renderHook(() => useGoals({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        const newGoalData = {
            title: 'New Goal',
            type: 'simple',
            category: 'Study',
            deadline: '2026-12-31',
            description: 'Description',
            icon: '🎯'
        };

        await act(async () => {
            await result.current.addGoal(newGoalData as any);
        });

        expect(result.current.goals).toHaveLength(1);
        expect(result.current.goals[0].title).toBe('New Goal');
        expect(awardXP).toHaveBeenCalledWith(XP_VALUES.GOAL * 0.1);
        expect(SyncQueueService.enqueue).toHaveBeenCalledWith(expect.objectContaining({
            type: 'ADD',
            table: 'goals'
        }));
    });

    it('should fail to add a goal if validation fails', async () => {
        const { result } = renderHook(() => useGoals({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        const invalidGoal = { title: '' }; // Title is required and must be min 1

        await act(async () => {
            await result.current.addGoal(invalidGoal as any);
        });

        expect(result.current.goals).toHaveLength(0);
    });

    it('should delete a goal and add to blacklist', async () => {
        const initialGoals = [{ id: 'goal-to-delete', title: 'Delete Me', category: 'Study' }];
        localStorage.setItem('study_goals_backup', JSON.stringify(initialGoals));

        const { result } = renderHook(() => useGoals({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        await act(async () => {
            await result.current.deleteGoal('goal-to-delete');
        });

        expect(result.current.goals).toHaveLength(0);
        expect(SyncQueueService.enqueue).toHaveBeenCalledWith(expect.objectContaining({
            type: 'DELETE',
            table: 'goals'
        }));
    });

    it('should update a goal', async () => {
        const initialGoals = [{ id: '1', title: 'Old Title', category: 'Study' }];
        localStorage.setItem('study_goals_backup', JSON.stringify(initialGoals));

        const { result } = renderHook(() => useGoals({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        await act(async () => {
            await result.current.updateGoal('1', { title: 'New Title' });
        });

        expect(result.current.goals[0].title).toBe('New Title');
    });

    it('should toggle goal status and award XP', async () => {
        const initialGoals = [{
            id: '1',
            title: 'Test Goal',
            category: 'Study',
            progress: 0,
            completionHistory: []
        }];
        localStorage.setItem('study_goals_backup', JSON.stringify(initialGoals));

        const { result } = renderHook(() => useGoals({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        await act(async () => {
            await result.current.toggleGoal('1');
        });

        expect(result.current.goals[0].progress).toBe(100);
        expect(awardXP).toHaveBeenCalledWith(XP_VALUES.GOAL);
    });

    it('should calculate progress correctly when toggling checklist items', async () => {
        const initialGoals = [{
            id: 'checklist-goal',
            title: 'Checklist',
            type: 'checklist',
            category: 'Study',
            progress: 0,
            checklist: [
                { id: 'item-1', title: 'Item 1', completed: false, order: 0 },
                { id: 'item-2', title: 'Item 2', completed: false, order: 1 }
            ]
        }];
        localStorage.setItem('study_goals_backup', JSON.stringify(initialGoals));

        const { result } = renderHook(() => useGoals({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        await act(async () => {
            await result.current.toggleGoalItem('checklist-goal', 'item-1');
        });

        expect(result.current.goals[0].progress).toBe(50);
        expect(result.current.goals[0].checklist![0].completed).toBe(true);

        await act(async () => {
            await result.current.toggleGoalItem('checklist-goal', 'item-2');
        });

        expect(result.current.goals[0].progress).toBe(100);
    });

    it('should handle habit toggling and history', async () => {
        const initialGoals = [{
            id: 'habit-goal',
            title: 'Habit',
            type: 'habit',
            category: 'Study',
            completionHistory: []
        }];
        localStorage.setItem('study_goals_backup', JSON.stringify(initialGoals));

        const { result } = renderHook(() => useGoals({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        await act(async () => {
            await result.current.toggleGoal('habit-goal');
        });

        // Habit should add to history
        expect(result.current.goals[0].completionHistory).toHaveLength(1);
        expect(awardXP).toHaveBeenCalledWith(XP_VALUES.GOAL / 5);
    });

    it('should fail to update a goal if validation fails', async () => {
        const initialGoals = [{ id: '1', title: 'Goal', category: 'Study', type: 'simple' }];
        localStorage.setItem('study_goals_backup', JSON.stringify(initialGoals));

        const { result } = renderHook(() => useGoals({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        await act(async () => {
            await result.current.updateGoal('1', { title: '' }); // Invalid title
        });

        expect(result.current.goals[0].title).toBe('Goal'); // Title should not change
    });

    it('should add progress summary when updating goal progress', async () => {
        const initialGoals = [{ id: '1', title: 'Goal', category: 'Study', type: 'simple', progress: 0 }];
        localStorage.setItem('study_goals_backup', JSON.stringify(initialGoals));

        const { result } = renderHook(() => useGoals({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        await act(async () => {
            await result.current.updateGoal('1', { progress: 50 });
        });

        const { addGoalProgressSummary } = await import('../utils/summaries');
        expect(addGoalProgressSummary).toHaveBeenCalled();
    });

    it('should block future dates in toggleGoalItem', async () => {
        const initialGoals = [{
            id: '1',
            type: 'checklist',
            category: 'Study',
            checklist: [{ id: 'i1', title: 'Item', completed: false, order: 0 }]
        }];
        localStorage.setItem('study_goals_backup', JSON.stringify(initialGoals));

        const { result } = renderHook(() => useGoals({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        const futureDate = '2099-12-31';

        await act(async () => {
            await result.current.toggleGoalItem('1', 'i1', futureDate);
        });

        expect(result.current.goals[0].checklist![0].completed).toBe(false);
    });

    it('should generate summary when completing a checklist item', async () => {
        const initialGoals = [{
            id: '1',
            type: 'checklist',
            category: 'Study',
            checklist: [{ id: 'i1', title: 'Item', completed: false, order: 0 }]
        }];
        localStorage.setItem('study_goals_backup', JSON.stringify(initialGoals));

        const { result } = renderHook(() => useGoals({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        await act(async () => {
            await result.current.toggleGoalItem('1', 'i1');
        });

        const { addGoalProgressSummary } = await import('../utils/summaries');
        expect(addGoalProgressSummary).toHaveBeenCalled();
    });

    it('should return empty goals if localStorage contains invalid JSON', () => {
        localStorage.setItem('study_goals_backup', 'invalid-json{');

        // Suppress console.error for this test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const { result } = renderHook(() => useGoals({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        expect(result.current.goals).toEqual([]);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
