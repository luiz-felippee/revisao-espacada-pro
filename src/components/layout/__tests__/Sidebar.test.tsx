import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../Sidebar';

// Mock cn utility
vi.mock('../../lib/utils', () => ({
    cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

describe('Sidebar Component', () => {
    const defaultProps = {
        activeTab: 'dashboard',
        onTabChange: vi.fn(),
        zenMode: false,
        user: { email: 'test@example.com', id: '123', name: 'Test User' },
        logout: vi.fn(),
        showSidebar: true,
        isSidebarOpen: false,
        onCloseSidebar: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render sidebar with all menu items', () => {
            render(<Sidebar {...defaultProps} />);

            expect(screen.getByText('Painel')).toBeInTheDocument();
            expect(screen.getByText('Agenda')).toBeInTheDocument();
            expect(screen.getByText('Resumos')).toBeInTheDocument();
            expect(screen.getByText('Tarefas')).toBeInTheDocument();
            expect(screen.getByText('Metas')).toBeInTheDocument();
            expect(screen.getByText('Projetos')).toBeInTheDocument();
            expect(screen.getByText('Temas')).toBeInTheDocument();
            expect(screen.getByText('Estatísticas')).toBeInTheDocument();
            expect(screen.getByText('Configurações')).toBeInTheDocument();
        });

        it('should render app brand', () => {
            render(<Sidebar {...defaultProps} />);

            expect(screen.getByText('Revisão')).toBeInTheDocument();
            expect(screen.getByText('ESPAÇADA PRO')).toBeInTheDocument();
        });

        it('should render user profile when not in zen mode', () => {
            render(<Sidebar {...defaultProps} />);

            expect(screen.getByText('Test User')).toBeInTheDocument();
            expect(screen.getByText('Online')).toBeInTheDocument();
        });

        it('should not render user profile in zen mode', () => {
            render(<Sidebar {...defaultProps} zenMode={true} />);

            expect(screen.queryByText('Test User')).not.toBeInTheDocument();
        });

        it('should not render when showSidebar is false', () => {
            const { container } = render(<Sidebar {...defaultProps} showSidebar={false} />);

            const sidebar = container.querySelector('aside');
            expect(sidebar).toHaveStyle({ display: 'none !important' });
        });
    });

    describe('Active Tab Highlighting', () => {
        it('should highlight dashboard tab when active', () => {
            render(<Sidebar {...defaultProps} activeTab="dashboard" />);

            const dashboardButton = screen.getByRole('tab', { name: 'Painel', selected: true });
            expect(dashboardButton).toBeInTheDocument();
        });

        it('should highlight calendar tab when active', () => {
            render(<Sidebar {...defaultProps} activeTab="calendar" />);

            const calendarButton = screen.getByRole('tab', { name: 'Agenda', selected: true });
            expect(calendarButton).toBeInTheDocument();
        });

        it('should only have one active tab', () => {
            render(<Sidebar {...defaultProps} activeTab="goals" />);

            const selectedTabs = screen.getAllByRole('tab', { selected: true });
            expect(selectedTabs).toHaveLength(1);
            expect(selectedTabs[0]).toHaveAccessibleName('Metas');
        });
    });

    describe('Navigation', () => {
        it('should call onTabChange when menu item clicked', () => {
            const onTabChange = vi.fn();
            render(<Sidebar {...defaultProps} onTabChange={onTabChange} />);

            const agendaButton = screen.getByRole('tab', { name: 'Agenda' });
            fireEvent.click(agendaButton);

            expect(onTabChange).toHaveBeenCalledWith('calendar');
        });

        it('should close sidebar after navigation on mobile', () => {
            const onCloseSidebar = vi.fn();
            render(<Sidebar {...defaultProps} onCloseSidebar={onCloseSidebar} />);

            const agendaButton = screen.getByRole('tab', { name: 'Agenda' });
            fireEvent.click(agendaButton);

            expect(onCloseSidebar).toHaveBeenCalled();
        });

        it('should navigate to dashboard when brand is clicked', () => {
            const onTabChange = vi.fn();
            render(<Sidebar {...defaultProps} onTabChange={onTabChange} activeTab="calendar" />);

            // Click on the brand icon/text
            const brandElement = screen.getByText('Revisão');
            const brandContainer = brandElement.closest('[role="button"]') || brandElement.parentElement;

            if (brandContainer) {
                fireEvent.click(brandContainer);
                expect(onTabChange).toHaveBeenCalledWith('dashboard');
            }
        });
    });

    describe('Responsive Behavior', () => {
        it('should be collapsed when activeTab is not dashboard', () => {
            const { container } = render(<Sidebar {...defaultProps} activeTab="calendar" />);

            const sidebar = container.querySelector('aside');
            expect(sidebar).toHaveClass('w-20'); // Collapsed width
        });

        it('should be expanded when activeTab is dashboard', () => {
            const { container } = render(<Sidebar {...defaultProps} activeTab="dashboard" />);

            const sidebar = container.querySelector('aside');
            expect(sidebar).toHaveClass('w-72'); // Expanded width
        });

        it('should have max-width constraint on mobile', () => {
            const { container } = render(<Sidebar {...defaultProps} activeTab="dashboard" />);

            const sidebar = container.querySelector('aside');
            expect(sidebar).toHaveClass('max-w-[90vw]');
        });

        it('should show backdrop when sidebar is open on mobile', () => {
            const { container } = render(<Sidebar {...defaultProps} isSidebarOpen={true} />);

            const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/60');
            expect(backdrop).toBeInTheDocument();
        });

        it('should not show backdrop when sidebar is closed', () => {
            const { container } = render(<Sidebar {...defaultProps} isSidebarOpen={false} />);

            const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/60');
            expect(backdrop).not.toBeInTheDocument();
        });

        it('should close sidebar when backdrop is clicked', () => {
            const onCloseSidebar = vi.fn();
            const { container } = render(<Sidebar {...defaultProps} isSidebarOpen={true} onCloseSidebar={onCloseSidebar} />);

            const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/60');
            if (backdrop) {
                fireEvent.click(backdrop);
                expect(onCloseSidebar).toHaveBeenCalled();
            }
        });

        it('should have translate-x-0 when sidebar is open', () => {
            const { container } = render(<Sidebar {...defaultProps} isSidebarOpen={true} />);

            const sidebar = container.querySelector('aside');
            expect(sidebar).toHaveClass('translate-x-0');
        });

        it('should have -translate-x-full when sidebar is closed on mobile', () => {
            const { container } = render(<Sidebar {...defaultProps} isSidebarOpen={false} />);

            const sidebar = container.querySelector('aside');
            expect(sidebar).toHaveClass('-translate-x-full');
        });
    });

    describe('Zen Mode', () => {
        it('should apply zen mode styling', () => {
            const { container } = render(<Sidebar {...defaultProps} zenMode={true} />);

            const sidebar = container.querySelector('aside');
            expect(sidebar).toHaveClass('opacity-30');
            expect(sidebar).toHaveClass('grayscale');
        });

        it('should not have zen mode styling when disabled', () => {
            const { container } = render(<Sidebar {...defaultProps} zenMode={false} />);

            const sidebar = container.querySelector('aside');
            expect(sidebar).not.toHaveClass('opacity-30');
            expect(sidebar).not.toHaveClass('grayscale');
        });
    });

    describe('User Interactions', () => {
        it('should call logout when logout button clicked', () => {
            const logout = vi.fn();
            render(<Sidebar {...defaultProps} logout={logout} activeTab="dashboard" />);

            const logoutButton = screen.getByLabelText('Sair');
            fireEvent.click(logoutButton);

            expect(logout).toHaveBeenCalled();
        });

        it('should collapse sidebar when close button clicked', () => {
            const onTabChange = vi.fn();
            render(<Sidebar {...defaultProps} onTabChange={onTabChange} activeTab="dashboard" />);

            const closeButton = screen.getByLabelText('Colapsar menu');
            fireEvent.click(closeButton);

            expect(onTabChange).toHaveBeenCalledWith('calendar');
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels on all interactive elements', () => {
            render(<Sidebar {...defaultProps} />);

            expect(screen.getByLabelText('Menu Lateral')).toBeInTheDocument();
            expect(screen.getByLabelText('Sair')).toBeInTheDocument();
        });

        it('should have proper role attributes on menu items', () => {
            render(<Sidebar {...defaultProps} />);

            const tabs = screen.getAllByRole('tab');
            expect(tabs.length).toBeGreaterThan(0);

            tabs.forEach(tab => {
                expect(tab).toHaveAttribute('aria-selected');
                expect(tab).toHaveAttribute('aria-label');
            });
        });

        it('should have proper ARIA label on backdrop', () => {
            render(<Sidebar {...defaultProps} isSidebarOpen={true} />);

            const backdrop = screen.getByLabelText('Fechar menu');
            expect(backdrop).toBeInTheDocument();
        });
    });

    describe('User Profile Display', () => {
        it('should display user initial when name is provided', () => {
            render(<Sidebar {...defaultProps} user={{ name: 'John Doe', id: '1', email: 'john@example.com' }} activeTab="dashboard" />);

            expect(screen.getAllByText('J')).toHaveLength(2); // Collapsed and Expanded views
        });

        it('should display default initial when name is not provided', () => {
            render(<Sidebar {...defaultProps} user={{ id: '1', email: 'user@example.com' }} activeTab="dashboard" />);

            expect(screen.getAllByText('U')).toHaveLength(2);
        });

        it('should display full name in expanded mode', () => {
            render(<Sidebar {...defaultProps} user={{ name: 'Jane Smith', id: '1' }} activeTab="dashboard" />);

            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    describe('Menu Structure', () => {
        it('should render all 9 menu items in correct order', () => {
            render(<Sidebar {...defaultProps} />);

            const menuItems = screen.getAllByRole('tab');
            const expectedOrder = [
                'Painel',
                'Agenda',
                'Resumos',
                'Tarefas',
                'Metas',
                'Projetos',
                'Temas',
                'Estatísticas',
                'Configurações'
            ];

            menuItems.forEach((item, index) => {
                expect(item).toHaveAccessibleName(expectedOrder[index]);
            });
        });

        it('should show "Menu Principal" label in expanded mode', () => {
            render(<Sidebar {...defaultProps} activeTab="dashboard" />);

            expect(screen.getByText('Menu Principal')).toBeInTheDocument();
        });

        it('should not show "Menu Principal" label in collapsed mode', () => {
            render(<Sidebar {...defaultProps} activeTab="calendar" />);

            expect(screen.queryByText('Menu Principal')).not.toBeInTheDocument();
        });
    });
});
