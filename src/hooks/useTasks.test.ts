import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from './useTasks';
import { SyncQueueService } from '../services/SyncQueueService';
import { useToast } from '../context/ToastContext';
import { XP_VALUES } from '../config/gamification.config';
import { format } from 'date-fns';

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
    addCompletionSummary: vi.fn(),
    addSessionSummary: vi.fn(),
}));

vi.mock('../utils/deletedItemsBlacklist', () => ({
    addToBlacklist: vi.fn(),
    removeFromBlacklist: vi.fn(),
}));

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
    randomUUID: () => 'task-uuid-' + Math.random().toString(36).substring(2)
});

describe('useTasks hook', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockGamification = { level: 1, xp: 0, nextLevelXp: 100 };
    const awardXP = vi.fn();
    const updateStats = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should initialize with tasks from localStorage', () => {
        const initialTasks = [{ id: '1', title: 'Test Task', status: 'pending', priority: 'medium', type: 'day' }];
        localStorage.setItem('study_tasks_backup', JSON.stringify(initialTasks));

        const { result } = renderHook(() => useTasks({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        expect(result.current.tasks).toEqual(initialTasks);
    });

    it('should add a new task and trigger sync', async () => {
        const { result } = renderHook(() => useTasks({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        const newTaskData = {
            title: 'New Task',
            type: 'day',
            priority: 'high' as const,
            date: format(new Date(), 'yyyy-MM-dd')
        };

        await act(async () => {
            await result.current.addTask(newTaskData as any);
        });

        expect(result.current.tasks).toHaveLength(1);
        expect(result.current.tasks[0].title).toBe('New Task');
        expect(awardXP).toHaveBeenCalledWith(XP_VALUES.TASK * 0.1);
        expect(SyncQueueService.enqueue).toHaveBeenCalledWith(expect.objectContaining({
            type: 'ADD',
            table: 'tasks'
        }));
    });

    it('should fail to add a task with future date for type \"day\"', async () => {
        const { result } = renderHook(() => useTasks({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        const futureTask = {
            title: 'Future Task',
            type: 'day',
            priority: 'low' as const,
            date: '2099-12-31'
        };

        await act(async () => {
            await result.current.addTask(futureTask as any);
        });

        expect(result.current.tasks).toHaveLength(0);
    });

    it('should delete a task and trigger sync', async () => {
        const initialTasks = [{ id: 'task-1', title: 'Delete Me', type: 'day', priority: 'medium' }];
        localStorage.setItem('study_tasks_backup', JSON.stringify(initialTasks));

        const { result } = renderHook(() => useTasks({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        await act(async () => {
            await result.current.deleteTask('task-1');
        });

        expect(result.current.tasks).toHaveLength(0);
        expect(SyncQueueService.enqueue).toHaveBeenCalledWith(expect.objectContaining({
            type: 'DELETE',
            table: 'tasks'
        }));
    });

    it('should update a task', async () => {
        const initialTasks = [{ id: '1', title: 'Old', type: 'day', priority: 'low' }];
        localStorage.setItem('study_tasks_backup', JSON.stringify(initialTasks));

        const { result } = renderHook(() => useTasks({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        await act(async () => {
            await result.current.updateTask('1', { title: 'New' });
        });

        expect(result.current.tasks[0].title).toBe('New');
    });

    it('should toggle task status and award XP', async () => {
        const initialTasks = [{
            id: '1',
            title: 'Task',
            status: 'pending',
            type: 'day',
            priority: 'medium',
            completionHistory: []
        }];
        localStorage.setItem('study_tasks_backup', JSON.stringify(initialTasks));

        const { result } = renderHook(() => useTasks({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        await act(async () => {
            await result.current.toggleTask('1');
        });

        expect(result.current.tasks[0].status).toBe('completed');
        expect(awardXP).toHaveBeenCalledWith(XP_VALUES.TASK);
    });

    it('should fail to add a task if validation fails', async () => {
        const { result } = renderHook(() => useTasks({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        const invalidTask = { title: '' }; // Title required

        await act(async () => {
            await result.current.addTask(invalidTask as any);
        });

        expect(result.current.tasks).toHaveLength(0);
    });

    it('should add completion summary when toggling task to complete', async () => {
        const initialTasks = [{
            id: '1',
            title: 'Task',
            status: 'pending',
            type: 'day',
            priority: 'medium',
            completionHistory: []
        }];
        localStorage.setItem('study_tasks_backup', JSON.stringify(initialTasks));

        const { result } = renderHook(() => useTasks({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        await act(async () => {
            await result.current.toggleTask('1');
        });

        const { addCompletionSummary } = await import('../utils/summaries');
        expect(addCompletionSummary).toHaveBeenCalled();
    });

    it('should handle JSON parse error during initialization', () => {
        localStorage.setItem('study_tasks_backup', 'invalid[');
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const { result } = renderHook(() => useTasks({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats
        }));

        expect(result.current.tasks).toEqual([]);
        consoleSpy.mockRestore();
    });
});
