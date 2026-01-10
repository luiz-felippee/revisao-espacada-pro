import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlobalSearch } from '../GlobalSearch';
import { MemoryRouter } from 'react-router-dom';
import { StudyContext } from '../../context/StudyContext';

// Mocks para Lazy Components
vi.mock('../../features/tasks/components/TaskDetailsModal', () => ({
    TaskDetailsModal: ({ isOpen }: any) => isOpen ? <div data-testid="task-modal">Task Modal</div> : null
}));
vi.mock('../../features/goals/components/GoalDetailsModal', () => ({
    GoalDetailsModal: ({ isOpen }: any) => isOpen ? <div data-testid="goal-modal">Goal Modal</div> : null
}));
vi.mock('../../features/themes/components/ThemeDetailsModal', () => ({
    ThemeDetailsModal: ({ isOpen }: any) => isOpen ? <div data-testid="theme-modal">Theme Modal</div> : null
}));

// Mock do Controller para testar a View isolada ou integrada parcial
// Aqui vamos mockar o hook controller para focar testar a renderização da View baseada no estado do controller
vi.mock('../../hooks/useGlobalSearchController', () => ({
    useGlobalSearchController: () => ({
        query: 'test',
        setQuery: vi.fn(),
        results: [
            { id: '1', type: 'task', title: 'Task Result', description: 'Desc' },
            { id: '2', type: 'goal', title: 'Goal Result' }
        ],
        selectedIndex: 0,
        inputRef: { current: { focus: vi.fn() } },
        selectedTaskId: null,
        selectedGoalId: null,
        selectedThemeId: null,
        setSelectedTaskId: vi.fn(),
        setSelectedGoalId: vi.fn(),
        setSelectedThemeId: vi.fn(),
        handleSelectResult: vi.fn()
    })
}));

// Mock do contexto
const mockStudyContext = {
    tasks: [],
    goals: [],
    themes: [],
    // Adicione outras propriedades necessárias do contexto aqui como mocks vazios
} as any;

describe('GlobalSearch Integration', () => {
    it('should render results correctly', () => {
        render(
            <MemoryRouter>
                <StudyContext.Provider value={mockStudyContext}>
                    <GlobalSearch isOpen={true} onClose={vi.fn()} />
                </StudyContext.Provider>
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText(/Buscar em tarefas/i)).toBeInTheDocument();
        expect(screen.getByText('Task Result')).toBeInTheDocument();
        expect(screen.getByText('Goal Result')).toBeInTheDocument();
    });

    it('should highlight selected item', () => {
        render(
            <MemoryRouter>
                <StudyContext.Provider value={mockStudyContext}>
                    <GlobalSearch isOpen={true} onClose={vi.fn()} />
                </StudyContext.Provider>
            </MemoryRouter>
        );

        const taskButton = screen.getByText('Task Result').closest('button');
        expect(taskButton).toHaveClass('bg-slate-700/50'); // Selected style class check
    });
});
