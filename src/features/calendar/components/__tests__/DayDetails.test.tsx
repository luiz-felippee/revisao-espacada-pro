import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DayDetails } from '../DayDetails';

// Mock contexts
const mockUseStudy = vi.fn();
const mockUsePomodoroContext = vi.fn();
const mockUseAudio = vi.fn();
const mockUseConfirm = vi.fn();

vi.mock('../../../../context/StudyContext', () => ({
    useStudy: () => mockUseStudy()
}));

vi.mock('../../../../context/PomodoroContext', () => ({
    usePomodoroContext: () => mockUsePomodoroContext()
}));

vi.mock('../../../../context/AudioContext', () => ({
    useAudio: () => mockUseAudio()
}));

vi.mock('../../../../context/ConfirmContext', () => ({
    useConfirm: () => mockUseConfirm()
}));

describe('DayDetails', () => {
    beforeEach(() => {
        mockUseStudy.mockReturnValue({
            activeFocus: null,
            startFocus: vi.fn(),
            endFocus: vi.fn()
        });
        mockUsePomodoroContext.mockReturnValue({
            startFocusSession: vi.fn(),
            resetTimer: vi.fn()
        });
        mockUseAudio.mockReturnValue({
            startAudio: vi.fn(),
            stopAudio: vi.fn()
        });
        mockUseConfirm.mockReturnValue({
            confirm: vi.fn()
        });
    });

    const defaultProps = {
        date: new Date(),
        events: {
            reviews: [],
            tasks: [],
            goals: [],
            intros: [],
            projected: []
        },
        onCompleteReview: vi.fn(),
        onStartStudy: vi.fn(),
        onToggleTask: vi.fn(),
        onToggleGoal: vi.fn(),
        onToggleGoalItem: vi.fn(),
        onDeleteGoal: vi.fn(),
        onDeleteTask: vi.fn()
    };

    it('renders empty state message when no events', () => {
        render(<DayDetails {...defaultProps} />);
        expect(screen.getByText(/Nada agendado para este dia/i)).toBeInTheDocument();
    });

    it('renders tasks correctly', () => {
        const propsWithTasks = {
            ...defaultProps,
            events: {
                ...defaultProps.events,
                tasks: [{
                    id: 't1',
                    title: 'Test Task',
                    status: 'pending',
                    priority: 'high',
                    durationMinutes: 30
                } as any]
            }
        };
        render(<DayDetails {...propsWithTasks} />);
        expect(screen.getByText('Test Task')).toBeInTheDocument();
        expect(screen.getByText('Tarefas (1)')).toBeInTheDocument();
    });

    it('calls onDeleteTask when delete button is clicked', async () => {
        const mockDeleteTask = vi.fn();
        mockUseConfirm.mockReturnValue({
            confirm: vi.fn().mockResolvedValue(true)
        });

        const propsWithTasks = {
            ...defaultProps,
            onDeleteTask: mockDeleteTask,
            events: {
                ...defaultProps.events,
                tasks: [{
                    id: 't1',
                    title: 'Test Task',
                    status: 'pending'
                } as any]
            }
        };
        render(<DayDetails {...propsWithTasks} />);

        const deleteBtn = screen.getByRole('button', { name: /Excluir tarefa/i });
        fireEvent.click(deleteBtn);

        // Wait for async confirm to resolve
        await vi.waitUntil(() => mockDeleteTask.mock.calls.length > 0);

        expect(mockDeleteTask).toHaveBeenCalledWith('t1');
    });
});
