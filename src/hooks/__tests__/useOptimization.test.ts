import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useThrottle, useIsMounted } from '../useOptimization';

describe('useOptimization Hooks', () => {

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('useDebounce', () => {
        it('should return initial value immediately', () => {
            const { result } = renderHook(() => useDebounce('initial', 500));
            expect(result.current).toBe('initial');
        });

        it('should update value after delay', () => {
            const { result, rerender } = renderHook(({ val, delay }) => useDebounce(val, delay), {
                initialProps: { val: 'initial', delay: 500 }
            });

            rerender({ val: 'updated', delay: 500 });

            // Should not update immediately
            expect(result.current).toBe('initial');

            // Advance time
            act(() => {
                vi.advanceTimersByTime(500);
            });

            expect(result.current).toBe('updated');
        });

        it('should reset timer if value changes within delay', () => {
            const { result, rerender } = renderHook(({ val, delay }) => useDebounce(val, delay), {
                initialProps: { val: 'initial', delay: 500 }
            });

            rerender({ val: 'update1', delay: 500 });

            act(() => {
                vi.advanceTimersByTime(250);
            });

            rerender({ val: 'update2', delay: 500 });

            act(() => {
                vi.advanceTimersByTime(250);
            });

            // Should still be initial because timer was reset
            expect(result.current).toBe('initial');

            act(() => {
                vi.advanceTimersByTime(250);
            });

            expect(result.current).toBe('update2');
        });
    });

    describe('useThrottle', () => {
        it('should execute function immediately on first call', () => {
            const callback = vi.fn();
            const { result } = renderHook(() => useThrottle(callback, 1000));

            act(() => {
                result.current('test');
            });

            expect(callback).toHaveBeenCalledWith('test');
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should ignore calls within delay period', () => {
            const callback = vi.fn();
            const { result } = renderHook(() => useThrottle(callback, 1000));

            act(() => {
                result.current('first');
            });

            act(() => {
                result.current('second'); // Should be ignored
                vi.advanceTimersByTime(500);
                result.current('third'); // Should be ignored
            });

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith('first');
        });

        it('should allow call after delay expires', () => {
            const callback = vi.fn();
            const { result } = renderHook(() => useThrottle(callback, 1000));

            act(() => {
                result.current('first');
            });

            act(() => {
                vi.advanceTimersByTime(1001);
                result.current('second');
            });

            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenCalledWith('second');
        });
    });

    describe('useIsMounted', () => {
        it('should return true when mounted and false when unmounted', () => {
            const { result, unmount } = renderHook(() => useIsMounted());

            expect(result.current()).toBe(true);

            unmount();

            expect(result.current()).toBe(false);
        });
    });
});
