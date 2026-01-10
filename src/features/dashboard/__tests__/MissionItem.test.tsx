import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MissionItem } from '../components/MissionItem';

describe('MissionItem', () => {
    const mockItem = {
        id: '1',
        title: 'Test Mission',
        subthemeId: 'sub1',
        subthemeTitle: 'Subtheme 1'
    };

    const defaultProps = {
        item: mockItem,
        type: 'task' as const,
        isDone: false,
        onToggle: vi.fn(),
        onFocus: vi.fn(),
    };

    it('renders the mission title correctly', () => {
        render(<MissionItem {...defaultProps} />);
        expect(screen.getByText('Test Mission')).toBeInTheDocument();
    });

    it('shows completed status when isDone is true', () => {
        render(<MissionItem {...defaultProps} isDone={true} />);
        expect(screen.getByRole('button', { name: "Concluído" })).toBeInTheDocument();
    });

    it('calls onToggle when check button is clicked', () => {
        render(<MissionItem {...defaultProps} />);
        const button = screen.getByRole('button', { name: /concluir/i });
        fireEvent.click(button);
        expect(defaultProps.onToggle).toHaveBeenCalled();
    });

    it('shows locked state when isLocked is true', () => {
        render(<MissionItem {...defaultProps} isLocked={true} lockReason="Bloqueado por data" />);
        expect(screen.getByText('Bloqueado por data')).toBeInTheDocument();
        expect(screen.queryByText('Focar')).not.toBeInTheDocument();
    });
});
