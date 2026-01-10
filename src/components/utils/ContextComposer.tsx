import React from 'react';

interface ContextComposerProps {
    providers: React.ReactElement[];
    children: React.ReactNode;
}

/**
 * Utilitário para compor múltiplos Context Providers de forma plana.
 * Evita o "Provider Hell" (aninhamento excessivo).
 * 
 * @example
 * <ContextComposer providers={[<AuthProvider />, <ThemeProvider />]}>
 *   <App />
 * </ContextComposer>
 */
export const ContextComposer: React.FC<ContextComposerProps> = ({ providers, children }) => {
    return (
        <>
            {providers.reduceRight((acc, provider) => {
                return React.cloneElement(provider, { children: acc } as any);
            }, children)}
        </>
    );
};
