import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncQueueService } from './SyncQueueService';
import { supabase } from '../lib/supabase';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            select: vi.fn(),
            eq: vi.fn().mockReturnThis(),
        })),
    },
}));

// Mock SyncMappers to avoid side effects
vi.mock('./SyncMappers', () => ({
    SyncMappers: {
        mapTaskToDb: vi.fn(data => data),
        mapGoalToDb: vi.fn(data => data),
        mapThemeToDb: vi.fn(data => data),
        mapSubthemeToDb: vi.fn(data => data),
    },
}));

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
    randomUUID: () => 'uuid-' + Math.random().toString(36).substring(2)
});

describe('SyncQueueService', () => {
    const QUEUE_STORAGE_KEY = 'sync_queue_v1';

    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
        SyncQueueService.clearQueue();
        vi.clearAllMocks();

        // Mock navigator.onLine as true by default
        Object.defineProperty(navigator, 'onLine', {
            configurable: true,
            value: true,
            writable: true,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('loadQueue & saveQueue', () => {
        it('should load an empty queue if nothing is in localStorage', () => {
            SyncQueueService.loadQueue();
            expect(SyncQueueService.getStatus()).toBe('synced');
        });

        it('should save and load queue correctly', () => {
            Object.defineProperty(navigator, 'onLine', { value: false });
            const op = {
                type: 'ADD' as const,
                table: 'tasks' as const,
                data: { id: '1', title: 'Test Task' } as any,
                id: 'custom-id'
            };

            SyncQueueService.enqueue(op);

            const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
            expect(saved).not.toBeNull();
            expect(JSON.parse(saved!).length).toBe(1);
        });

        it('should clear queue when clearQueue is called', () => {
            Object.defineProperty(navigator, 'onLine', { value: false });
            SyncQueueService.enqueue({
                type: 'ADD' as const,
                table: 'tasks' as const,
                data: { id: '1' } as any,
            });

            SyncQueueService.clearQueue();
            expect(localStorage.getItem(QUEUE_STORAGE_KEY)).toBe('[]');
        });
    });

    describe('enqueue & limits', () => {
        it('should add operations and trigger processing', () => {
            const processSpy = vi.spyOn(SyncQueueService, 'processQueue');
            SyncQueueService.enqueue({
                type: 'ADD' as const,
                table: 'tasks' as const,
                data: { id: '1' } as any,
            });

            expect(processSpy).toHaveBeenCalled();
        });

        it('should enforce MAX_QUEUE_SIZE (100)', () => {
            Object.defineProperty(navigator, 'onLine', { value: false });

            for (let i = 0; i < 110; i++) {
                SyncQueueService.enqueue({
                    type: 'ADD' as const,
                    table: 'tasks' as const,
                    data: { id: `task-${i}` } as any,
                    id: `id-${i}`
                });
            }

            const saved = JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY)!);
            expect(saved.length).toBe(100);
            expect(saved[0].id).toBe('id-10');
        });
    });

    describe('Batch Processing', () => {
        it('should group multiple ADD operations into a single batch insert', async () => {
            const insertMock = vi.fn().mockResolvedValue({ error: null });
            (supabase.from as any).mockReturnValue({ insert: insertMock });

            Object.defineProperty(navigator, 'onLine', { value: false });
            SyncQueueService.enqueue({ type: 'ADD', table: 'tasks', data: { id: '1' } as any });
            SyncQueueService.enqueue({ type: 'ADD', table: 'tasks', data: { id: '2' } as any });

            Object.defineProperty(navigator, 'onLine', { value: true });
            await SyncQueueService.processQueue();

            expect(insertMock).toHaveBeenCalled();
            const payloads = insertMock.mock.calls[0][0];
            expect(payloads).toHaveLength(2);
        });

        it('should handle partial batch success/failure correctly', async () => {
            const insertMock = vi.fn().mockResolvedValue({ error: { message: 'err', code: '500' } });
            (supabase.from as any).mockReturnValue({ insert: insertMock });

            Object.defineProperty(navigator, 'onLine', { value: false });
            SyncQueueService.enqueue({ type: 'ADD', table: 'tasks', data: { id: 'fail-1' } as any });

            Object.defineProperty(navigator, 'onLine', { value: true });
            await SyncQueueService.processQueue();

            expect(SyncQueueService.getStatus()).toBe('syncing');
            const saved = JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY)!);
            expect(saved[0].retryCount).toBe(1);
        });
    });

    describe('Retry Logic & Backoff', () => {
        it('should increment retryCount and set nextRetryTime on failure', async () => {
            const updateMock = vi.fn().mockResolvedValue({ error: { message: 'err', code: '500' } });
            (supabase.from as any).mockReturnValue({ update: updateMock, eq: vi.fn().mockReturnThis() });

            Object.defineProperty(navigator, 'onLine', { value: false });
            SyncQueueService.enqueue({ type: 'UPDATE', table: 'tasks', data: { id: '1' } as any });

            Object.defineProperty(navigator, 'onLine', { value: true });
            await SyncQueueService.processQueue();

            const saved = JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY)!);
            expect(saved[0].retryCount).toBe(1);
            expect(saved[0].nextRetryTime).toBeGreaterThan(Date.now());
        });

        it('should drop operation after MAX_RETRIES (5)', async () => {
            const updateMock = vi.fn().mockResolvedValue({ error: { message: 'err', code: '500' } });
            (supabase.from as any).mockReturnValue({ update: updateMock, eq: vi.fn().mockReturnThis() });

            Object.defineProperty(navigator, 'onLine', { value: true });
            SyncQueueService.enqueue({ type: 'UPDATE', table: 'tasks', data: { id: 'retry' } as any });

            for (let i = 0; i < 6; i++) {
                await SyncQueueService.processQueue();
                vi.advanceTimersByTime(10000);
            }

            expect(JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY)!).length).toBe(0);
        });
    });

    describe('Fatal Errors', () => {
        it('should drop operation immediately for fatal errors', async () => {
            const insertMock = vi.fn().mockResolvedValue({ error: { message: 'pk', code: '23505' } });
            (supabase.from as any).mockReturnValue({ insert: insertMock });

            Object.defineProperty(navigator, 'onLine', { value: false });
            SyncQueueService.enqueue({ type: 'ADD', table: 'tasks', data: { id: 'fatal' } as any });

            Object.defineProperty(navigator, 'onLine', { value: true });
            await SyncQueueService.processQueue();

            expect(JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY)!).length).toBe(0);
        });
    });

    describe('Status & Subscriptions', () => {
        it('should notify listeners on status change', () => {
            const listener = vi.fn();
            SyncQueueService.subscribe(listener);
            expect(listener).toHaveBeenCalledWith('synced');

            Object.defineProperty(navigator, 'onLine', { value: false });
            SyncQueueService.enqueue({ type: 'ADD', table: 'tasks', data: { id: '1' } as any });
            expect(listener).toHaveBeenCalledWith('offline');
        });

        it('should show "error" status if persistent retries exist', async () => {
            const updateMock = vi.fn().mockResolvedValue({ error: { message: 'err', code: '500' } });
            (supabase.from as any).mockReturnValue({ update: updateMock, eq: vi.fn().mockReturnThis() });

            // Mock online status using spyOn
            const onlineSpy = vi.spyOn(navigator, 'onLine', 'get');

            onlineSpy.mockReturnValue(true);

            // Enqueue triggers initial processQueue
            SyncQueueService.enqueue({ type: 'UPDATE', table: 'tasks', data: { id: 'err-status' } as any });

            // Initial attempt (retryCount: 1)
            await Promise.resolve();

            // Wait for 3 more failures (total 4)
            for (let i = 0; i < 3; i++) {
                vi.advanceTimersByTime(10000); // 10s > backoff
                await Promise.resolve(); // Wait for async processing
            }

            // retryCount should be 4 now (> 3)
            expect(SyncQueueService.getStatus()).toBe('error');
            onlineSpy.mockRestore();
        });
    });
});
