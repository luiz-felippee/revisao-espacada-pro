import { useEffect } from 'react';

/**
 * Hook para gerenciar atalhos de teclado globais.
 * Atualmente suporta:
 * - Ctrl+K / Cmd+K: Abre a busca global.
 */
export const useKeyboardShortcuts = (onSearchOpen: () => void) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                onSearchOpen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onSearchOpen]);
};
