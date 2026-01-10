import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGlobalSearchController } from '../useGlobalSearchController';

// Mocks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

const mockResults = [
    { id: '1', type: 'task', title: 'Test Task' },
    { id: '2', type: 'goal', title: 'Test Goal' }
];

vi.mock('../useGlobalSearch', () => ({
    useGlobalSearch: vi.fn((query) => {
        if (!query) return [];
        return mockResults;
    })
}));

// Mock useDebounce to return value immediately for testing
vi.mock('../useOptimization', () => ({
    useDebounce: (val: any) => val
}));

describe('useGlobalSearchController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useGlobalSearchController(true, vi.fn()));

        expect(result.current.query).toBe('');
        expect(result.current.selectedIndex).toBe(0);
        expect(result.current.results).toEqual([]);
    });

    it('should update query and results', () => {
        const { result } = renderHook(() => useGlobalSearchController(true, vi.fn()));

        act(() => {
            result.current.setQuery('test');
        });

        expect(result.current.query).toBe('test');
        expect(result.current.results).toHaveLength(2);
    });

    it('should handle navigation via handleSelectResult', () => {
        const onClose = vi.fn();
        const { result } = renderHook(() => useGlobalSearchController(true, onClose));

        const taskResult = { id: '1', type: 'task', title: 'Test Task' } as any;

        act(() => {
            result.current.handleSelectResult(taskResult);
        });

        expect(onClose).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/tasks');
        expect(result.current.selectedTaskId).toBe('1');
    });

    it('should handle keyboard navigation (ArrowDown/ArrowUp)', async () => {
        const { result } = renderHook(() => useGlobalSearchController(true, vi.fn()));

        // Setup results
        act(() => {
            result.current.setQuery('test');
        });

        // Wait for results to be populated (mock returns immediately but hook update cycle)
        expect(result.current.results).toHaveLength(2);

        // Trigger ArrowDown
        await act(async () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        });
        expect(result.current.selectedIndex).toBe(1);

        // Limit at max index
        await act(async () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        });
        expect(result.current.selectedIndex).toBe(1); // Still 1 (max)

        // Trigger ArrowUp
        await act(async () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        });
        expect(result.current.selectedIndex).toBe(0);
    });

    it('should handle Enter key to select item', () => {
        const onClose = vi.fn();
        const { result } = renderHook(() => useGlobalSearchController(true, onClose));

        act(() => {
            result.current.setQuery('test');
        });

        // Select first item (index 0)
        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        });

        expect(onClose).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    });

    it('should handle Escape key to close', () => {
        const onClose = vi.fn();
        renderHook(() => useGlobalSearchController(true, onClose));

        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        });

        expect(onClose).toHaveBeenCalled();
    });
});
