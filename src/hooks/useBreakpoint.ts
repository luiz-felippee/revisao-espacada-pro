import { useState, useEffect } from 'react';

/**
 * Breakpoints da aplicação
 * xs: 480px  - Mobile pequeno (iPhone SE)
 * sm: 640px  - Mobile grande
 * md: 768px  - Tablet
 * lg: 1024px - Desktop
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface BreakpointInfo {
    /** Breakpoint atual */
    current: Breakpoint;
    /** É mobile (< 768px) */
    isMobile: boolean;
    /** É tablet (768px - 1023px) */
    isTablet: boolean;
    /** É desktop (>= 1024px) */
    isDesktop: boolean;
    /** Largura atual da tela */
    width: number;
}

/**
 * Hook para detectar o breakpoint responsivo atual
 * 
 * @example
 * ```tsx
 * const { current, isMobile, isTablet, isDesktop } = useBreakpoint();
 * 
 * if (isMobile) {
 *   return <MobileView />;
 * }
 * return <DesktopView />;
 * ```
 */
export const useBreakpoint = (): BreakpointInfo => {
    const getBreakpoint = (width: number): Breakpoint => {
        if (width >= 1280) return 'xl';
        if (width >= 1024) return 'lg';
        if (width >= 768) return 'md';
        if (width >= 640) return 'sm';
        if (width >= 480) return 'xs';
        return 'xs';
    };

    const [breakpointInfo, setBreakpointInfo] = useState<BreakpointInfo>(() => {
        if (typeof window === 'undefined') {
            return {
                current: 'lg',
                isMobile: false,
                isTablet: false,
                isDesktop: true,
                width: 1024,
            };
        }

        const width = window.innerWidth;
        const current = getBreakpoint(width);

        return {
            current,
            isMobile: width < 768,
            isTablet: width >= 768 && width < 1024,
            isDesktop: width >= 1024,
            width,
        };
    });

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleResize = () => {
            // Debounce para evitar updates excessivos
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const width = window.innerWidth;
                const current = getBreakpoint(width);

                setBreakpointInfo({
                    current,
                    isMobile: width < 768,
                    isTablet: width >= 768 && width < 1024,
                    isDesktop: width >= 1024,
                    width,
                });
            }, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return breakpointInfo;
};
