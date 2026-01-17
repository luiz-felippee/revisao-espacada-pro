import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBreakpoint } from '../useBreakpoint';

describe('useBreakpoint', () => {
    // Mock window.innerWidth
    const setWindowWidth = (width: number) => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width,
        });
    };

    beforeEach(() => {
        // Reset window size before each test
        setWindowWidth(1024);
        vi.clearAllMocks();
    });

    describe('Breakpoint Detection', () => {
        it('should detect xs breakpoint (< 480px)', () => {
            setWindowWidth(400);
            const { result } = renderHook(() => useBreakpoint());

            expect(result.current.current).toBe('xs');
            expect(result.current.isMobile).toBe(true);
            expect(result.current.isTablet).toBe(false);
            expect(result.current.isDesktop).toBe(false);
            expect(result.current.width).toBe(400);
        });

        it('should detect sm breakpoint (480-639px)', () => {
            setWindowWidth(600);
            const { result } = renderHook(() => useBreakpoint());

            expect(result.current.current).toBe('sm');
            expect(result.current.isMobile).toBe(true);
            expect(result.current.isTablet).toBe(false);
            expect(result.current.isDesktop).toBe(false);
        });

        it('should detect md breakpoint (768-1023px - Tablet)', () => {
            setWindowWidth(800);
            const { result } = renderHook(() => useBreakpoint());

            expect(result.current.current).toBe('md');
            expect(result.current.isMobile).toBe(false);
            expect(result.current.isTablet).toBe(true);
            expect(result.current.isDesktop).toBe(false);
        });

        it('should detect lg breakpoint (1024-1279px - Desktop)', () => {
            setWindowWidth(1100);
            const { result } = renderHook(() => useBreakpoint());

            expect(result.current.current).toBe('lg');
            expect(result.current.isMobile).toBe(false);
            expect(result.current.isTablet).toBe(false);
            expect(result.current.isDesktop).toBe(true);
        });

        it('should detect xl breakpoint (>= 1280px)', () => {
            setWindowWidth(1920);
            const { result } = renderHook(() => useBreakpoint());

            expect(result.current.current).toBe('xl');
            expect(result.current.isDesktop).toBe(true);
        });
    });

    describe('Critical Breakpoints', () => {
        it('should correctly identify iPhone SE (375px) as mobile', () => {
            setWindowWidth(375);
            const { result } = renderHook(() => useBreakpoint());

            expect(result.current.current).toBe('xs');
            expect(result.current.isMobile).toBe(true);
            expect(result.current.width).toBe(375);
        });

        it('should correctly identify iPad Mini (768px) as tablet', () => {
            setWindowWidth(768);
            const { result } = renderHook(() => useBreakpoint());

            expect(result.current.current).toBe('md');
            expect(result.current.isTablet).toBe(true);
        });

        it('should correctly identify desktop (1024px)', () => {
            setWindowWidth(1024);
            const { result } = renderHook(() => useBreakpoint());

            expect(result.current.current).toBe('lg');
            expect(result.current.isDesktop).toBe(true);
        });
    });

    describe('Resize Behavior', () => {
        it('should update breakpoint on window resize', async () => {
            setWindowWidth(1920);
            const { result } = renderHook(() => useBreakpoint());

            expect(result.current.current).toBe('xl');
            expect(result.current.isDesktop).toBe(true);

            // Simulate resize to mobile
            act(() => {
                setWindowWidth(375);
                window.dispatchEvent(new Event('resize'));
            });

            // Wait for debounce (100ms)
            await new Promise(resolve => setTimeout(resolve, 150));

            expect(result.current.current).toBe('xs');
            expect(result.current.isMobile).toBe(true);
        });

        it('should debounce resize events', async () => {
            const { result } = renderHook(() => useBreakpoint());

            const initialWidth = result.current.width;

            // Trigger multiple resizes rapidly
            act(() => {
                setWindowWidth(500);
                window.dispatchEvent(new Event('resize'));
                setWindowWidth(600);
                window.dispatchEvent(new Event('resize'));
                setWindowWidth(700);
                window.dispatchEvent(new Event('resize'));
            });

            // Should not update immediately
            expect(result.current.width).toBe(initialWidth);

            // Wait for debounce
            await new Promise(resolve => setTimeout(resolve, 150));

            // Should update to last value
            expect(result.current.width).toBe(700);
        });
    });

    describe('SSR Safety', () => {
        it('should handle SSR environment (window undefined)', () => {
            // Save original window
            const originalWindow = global.window;

            // @ts-ignore - Simulate SSR
            delete global.window;

            const { result } = renderHook(() => useBreakpoint());

            // Should return default desktop values
            expect(result.current.current).toBe('lg');
            expect(result.current.isDesktop).toBe(true);
            expect(result.current.width).toBe(1024);

            // Restore window
            global.window = originalWindow;
        });
    });

    describe('Boolean Helpers', () => {
        it('isMobile should be true only for < 768px', () => {
            // Mobile
            setWindowWidth(375);
            const mobile = renderHook(() => useBreakpoint());
            expect(mobile.result.current.isMobile).toBe(true);

            // Tablet
            setWindowWidth(768);
            const tablet = renderHook(() => useBreakpoint());
            expect(tablet.result.current.isMobile).toBe(false);

            // Desktop
            setWindowWidth(1024);
            const desktop = renderHook(() => useBreakpoint());
            expect(desktop.result.current.isMobile).toBe(false);
        });

        it('isTablet should be true only for 768-1023px', () => {
            // Mobile
            setWindowWidth(767);
            const mobile = renderHook(() => useBreakpoint());
            expect(mobile.result.current.isTablet).toBe(false);

            // Tablet start
            setWindowWidth(768);
            const tablet1 = renderHook(() => useBreakpoint());
            expect(tablet1.result.current.isTablet).toBe(true);

            // Tablet end
            setWindowWidth(1023);
            const tablet2 = renderHook(() => useBreakpoint());
            expect(tablet2.result.current.isTablet).toBe(true);

            // Desktop
            setWindowWidth(1024);
            const desktop = renderHook(() => useBreakpoint());
            expect(desktop.result.current.isTablet).toBe(false);
        });

        it('isDesktop should be true only for >= 1024px', () => {
            // Mobile
            setWindowWidth(375);
            const mobile = renderHook(() => useBreakpoint());
            expect(mobile.result.current.isDesktop).toBe(false);

            // Tablet
            setWindowWidth(768);
            const tablet = renderHook(() => useBreakpoint());
            expect(tablet.result.current.isDesktop).toBe(false);

            // Desktop start
            setWindowWidth(1024);
            const desktop1 = renderHook(() => useBreakpoint());
            expect(desktop1.result.current.isDesktop).toBe(true);

            // Large desktop
            setWindowWidth(1920);
            const desktop2 = renderHook(() => useBreakpoint());
            expect(desktop2.result.current.isDesktop).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle extremely small widths', () => {
            setWindowWidth(100);
            const { result } = renderHook(() => useBreakpoint());

            expect(result.current.current).toBe('xs');
            expect(result.current.isMobile).toBe(true);
        });

        it('should handle extremely large widths', () => {
            setWindowWidth(3840); // 4K
            const { result } = renderHook(() => useBreakpoint());

            expect(result.current.current).toBe('xl');
            expect(result.current.isDesktop).toBe(true);
        });

        it('should handle exact breakpoint boundaries', () => {
            // Test each boundary
            const boundaries = [
                { width: 479, expected: 'xs' },
                { width: 480, expected: 'xs' },
                { width: 639, expected: 'sm' },
                { width: 640, expected: 'sm' },
                { width: 767, expected: 'sm' },
                { width: 768, expected: 'md' },
                { width: 1023, expected: 'md' },
                { width: 1024, expected: 'lg' },
                { width: 1279, expected: 'lg' },
                { width: 1280, expected: 'xl' },
            ];

            boundaries.forEach(({ width, expected }) => {
                setWindowWidth(width);
                const { result } = renderHook(() => useBreakpoint());
                expect(result.current.current).toBe(expected);
            });
        });
    });

    describe('Cleanup', () => {
        it('should cleanup resize listener on unmount', () => {
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
            const { unmount } = renderHook(() => useBreakpoint());

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        });
    });
});
