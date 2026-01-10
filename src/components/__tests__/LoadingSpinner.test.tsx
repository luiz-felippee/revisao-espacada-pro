import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders loading spinner', () => {
        render(<LoadingSpinner />);

        // Check if spinner is in the document
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();
    });

    it('renders with custom size', () => {
        const { container } = render(<LoadingSpinner size="lg" />);

        expect(container.firstChild).toBeInTheDocument();
    });
});
