/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

const ThrowError = () => {
    throw new Error('Test error');
};

const WorkingComponent = () => <div>Working</div>;

describe('ErrorBoundary', () => {
    it('renders children when no error', () => {
        render(
            <ErrorBoundary>
                <WorkingComponent />
            </ErrorBoundary>
        );

        expect(screen.getByText('Working')).toBeInTheDocument();
    });

    it('catches errors and shows fallback', () => {
        // Suppress console.error for this test
        const spy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText(/Ops! Algo deu errado/i)).toBeInTheDocument();

        spy.mockRestore();
    });

    it('shows action buttons in error state', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
        expect(screen.getByText('Ir para Início')).toBeInTheDocument();
        expect(screen.getByText('Recarregar Página')).toBeInTheDocument();

        spy.mockRestore();
    });

    it('renders custom fallback if provided', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const CustomFallback = <div>Custom Error</div>;

        render(
            <ErrorBoundary fallback={CustomFallback}>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom Error')).toBeInTheDocument();

        spy.mockRestore();
    });
});
