import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CalendarEventItem } from '../CalendarEventItem';

describe('CalendarEventItem - Pomodoro Button', () => {
    it('should call onFocus immediately on first click of "Iniciar Pomodoro" button', () => {
        const mockOnFocus = vi.fn();

        render(
            <CalendarEventItem
                id="test-123"
                title="Test Task"
                type="task"
                isDone={false}
                isFuture={false}
                onFocus={mockOnFocus}
            />
        );

        // Localizar o botão "Iniciar Pomodoro"
        const button = screen.getByTitle('Iniciar Pomodoro');

        // Verificar que o botão está habilitado
        expect(button).not.toBeDisabled();

        // Simular primeiro clique
        fireEvent.click(button);

        // Verificar que onFocus foi chamado imediatamente
        expect(mockOnFocus).toHaveBeenCalledTimes(1);
    });

    it('should not disable button even when isFuture is true', () => {
        const mockOnFocus = vi.fn();

        render(
            <CalendarEventItem
                id="future-task"
                title="Future Task"
                type="task"
                isDone={false}
                isFuture={true}  // ← Evento futuro
                onFocus={mockOnFocus}
            />
        );

        const button = screen.getByTitle('Iniciar Pomodoro');

        // Botão deve estar habilitado mesmo para evento futuro
        expect(button).not.toBeDisabled();

        // Deve permitir clique
        fireEvent.click(button);
        expect(mockOnFocus).toHaveBeenCalled();
    });

    it('should not show button when item is done', () => {
        const mockOnFocus = vi.fn();

        render(
            <CalendarEventItem
                id="done-task"
                title="Done Task"
                type="task"
                isDone={true}  // ← Tarefa concluída
                isFuture={false}
                onFocus={mockOnFocus}
            />
        );

        // Botão não deve aparecer para itens concluídos
        expect(screen.queryByTitle('Iniciar Pomodoro')).not.toBeInTheDocument();
    });

    it('should show "Focando..." state when isActive is true', () => {
        const mockOnFocus = vi.fn();

        render(
            <CalendarEventItem
                id="active-task"
                title="Active Task"
                type="task"
                isDone={false}
                isFuture={false}
                isActive={true}  // ← Timer ativo
                onFocus={mockOnFocus}
            />
        );

        // Deve mostrar estado "Focando..."
        expect(screen.getByText('Focando...')).toBeInTheDocument();

        // Não deve mostrar o botão "Focar"
        expect(screen.queryByTitle('Iniciar Pomodoro')).not.toBeInTheDocument();
    });
});
