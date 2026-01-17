import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RealisticKPICard } from '../RealisticKPICard';
import { Target } from 'lucide-react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, onClick, onKeyDown, ...props }: any) => (
            <div onClick={onClick} onKeyDown={onKeyDown} {...props}>
                {children}
            </div>
        ),
    },
}));

describe('RealisticKPICard', () => {
    const defaultProps = {
        title: 'Active Goals',
        value: '5',
        icon: Target,
        gradient: 'from-blue-500 to-cyan-500',
        shadowColor: 'blue' as const,
    };

    describe('Rendering', () => {
        it('should render KPI card with title and value', () => {
            render(<RealisticKPICard {...defaultProps} />);

            expect(screen.getByText('Active Goals')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
        });

        it('should render icon', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} />);
            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });

        it('should have proper ARIA label', () => {
            render(<RealisticKPICard {...defaultProps} />);
            const card = screen.getByLabelText('Active Goals: 5');
            expect(card).toBeInTheDocument();
        });
    });

    describe('Mobile/Desktop Title', () => {
        it('should show short title on mobile', () => {
            render(<RealisticKPICard {...defaultProps} title="Active Goals" />);

            // Mobile title (first word)
            const mobileTitle = screen.getByText('Active');
            expect(mobileTitle).toHaveClass('md:hidden');
        });

        it('should show full title on desktop', () => {
            render(<RealisticKPICard {...defaultProps} />);

            // Desktop title
            const desktopTitle = screen.getByText('Active Goals');
            expect(desktopTitle).toHaveClass('hidden', 'md:inline');
        });

        it('should use custom shortTitle when provided', () => {
            render(<RealisticKPICard {...defaultProps} shortTitle="Goals" />);

            expect(screen.getByText('Goals')).toBeInTheDocument();
        });

        it('should use first word when shortTitle not provided', () => {
            render(<RealisticKPICard {...defaultProps} title="Total Active Goals" />);

            const mobileTitle = screen.getByText('Total');
            expect(mobileTitle).toBeInTheDocument();
        });
    });

    describe('Value Display', () => {
        it('should render value with default styling (non-action)', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} value="42" />);

            const value = screen.getByText('42');
            expect(value).toHaveClass('text-4xl', 'font-mono', 'font-black', 'text-white');
        });

        it('should render value with gradient styling when isAction', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} value="Start" isAction />);

            const value = screen.getByText('Start');
            expect(value).toHaveClass('text-3xl', 'font-black', 'bg-gradient-to-r', 'bg-clip-text');
        });

        it('should show "pts" suffix for non-action cards', () => {
            render(<RealisticKPICard {...defaultProps} />);
            expect(screen.getByText('pts')).toBeInTheDocument();
        });

        it('should not show "pts" suffix for action cards', () => {
            render(<RealisticKPICard {...defaultProps} isAction />);
            expect(screen.queryByText('pts')).not.toBeInTheDocument();
        });

        it('should have responsive value sizes for small screens', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} value="100" />);
            const value = screen.getByText('100');
            expect(value).toHaveClass('max-[380px]:text-3xl');
        });
    });

    describe('Alert Indicator', () => {
        it('should not show alert indicator by default', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} />);
            const alertDot = container.querySelector('.animate-ping');
            expect(alertDot).not.toBeInTheDocument();
        });

        it('should show alert indicator when alert is true', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} alert />);
            const alertDot = container.querySelector('.animate-ping');
            expect(alertDot).toBeInTheDocument();
            expect(alertDot).toHaveClass('bg-red-500', 'rounded-full');
        });

        it('should include alert in ARIA label', () => {
            render(<RealisticKPICard {...defaultProps} alert />);
            const card = screen.getByLabelText(/Active Goals: 5 \(Atenção\)/);
            expect(card).toBeInTheDocument();
        });
    });

    describe('Click Interaction', () => {
        it('should have button role when onClick is provided', () => {
            const handleClick = vi.fn();
            render(<RealisticKPICard {...defaultProps} onClick={handleClick} />);

            const card = screen.getByRole('button');
            expect(card).toBeInTheDocument();
        });

        it('should not have button role when onClick is not provided', () => {
            render(<RealisticKPICard {...defaultProps} />);

            const card = screen.queryByRole('button');
            expect(card).not.toBeInTheDocument();
        });

        it('should call onClick when clicked', () => {
            const handleClick = vi.fn();
            render(<RealisticKPICard {...defaultProps} onClick={handleClick} />);

            const card = screen.getByRole('button');
            fireEvent.click(card);

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should be keyboard accessible (Enter key)', () => {
            const handleClick = vi.fn();
            render(<RealisticKPICard {...defaultProps} onClick={handleClick} />);

            const card = screen.getByRole('button');
            fireEvent.keyDown(card, { key: 'Enter' });

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should be keyboard accessible (Space key)', () => {
            const handleClick = vi.fn();
            render(<RealisticKPICard {...defaultProps} onClick={handleClick} />);

            const card = screen.getByRole('button');
            fireEvent.keyDown(card, { key: ' ' });

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should not trigger onClick for other keys', () => {
            const handleClick = vi.fn();
            render(<RealisticKPICard {...defaultProps} onClick={handleClick} />);

            const card = screen.getByRole('button');
            fireEvent.keyDown(card, { key: 'a' });
            fireEvent.keyDown(card, { key: 'Escape' });

            expect(handleClick).not.toHaveBeenCalled();
        });

        it('should have cursor-pointer when onClick provided', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} onClick={() => { }} />);
            const card = container.firstChild as HTMLElement;
            expect(card).toHaveClass('cursor-pointer');
        });

        it('should have cursor-default when onClick not provided', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} />);
            const card = container.firstChild as HTMLElement;
            expect(card).toHaveClass('cursor-default');
        });

        it('should be focusable when onClick provided', () => {
            render(<RealisticKPICard {...defaultProps} onClick={() => { }} />);
            const card = screen.getByRole('button');
            expect(card).toHaveAttribute('tabIndex', '0');
        });
    });

    describe('Shadow Colors', () => {
        const shadowColors = ['purple', 'emerald', 'blue', 'amber'];

        shadowColors.forEach(color => {
            it(`should apply ${color} shadow classes`, () => {
                const { container } = render(<RealisticKPICard {...defaultProps} shadowColor={color as any} />);
                const card = container.firstChild as HTMLElement;
                expect(card.className).toContain(`shadow-${color}-500/20`);
            });
        });

        it('should fallback to blue shadow for unknown color', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} shadowColor={'unknown' as any} />);
            const card = container.firstChild as HTMLElement;
            expect(card.className).toContain('shadow-blue-500/20');
        });
    });

    describe('Responsive Styling', () => {
        it('should have responsive padding', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} />);
            const card = container.firstChild as HTMLElement;
            expect(card).toHaveClass('p-6', 'max-[380px]:p-4');
        });

        it('should have responsive gap', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} />);
            const content = container.querySelector('.gap-4');
            expect(content).toHaveClass('max-[380px]:gap-2');
        });

        it('should have responsive icon size', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} />);
            const icon = container.querySelector('svg');
            expect(icon).toHaveClass('w-7', 'h-7', 'max-[380px]:w-5', 'max-[380px]:h-5');
        });

        it('should have responsive icon container size', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} />);
            const iconContainer = container.querySelector('.rounded-3xl');
            expect(iconContainer).toHaveClass('w-14', 'h-14', 'max-[380px]:w-12', 'max-[380px]:h-12');
        });
    });

    describe('Visual Effects', () => {
        it('should have glossy reflection overlay', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} />);
            const reflection = container.querySelector('.bg-gradient-to-br.from-white\\/5');
            expect(reflection).toBeInTheDocument();
        });

        it('should have top inner glow', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} />);
            const glow = container.querySelector('.top-0.left-0.right-0.h-px');
            expect(glow).toBeInTheDocument();
        });

        it('should have bottom accent line with gradient', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} />);
            const accent = container.querySelector('.bottom-0.left-0.w-full.h-1');
            expect(accent).toBeInTheDocument();
            expect(accent).toHaveClass('from-blue-500', 'to-cyan-500');
        });

        it('should have backdrop blur', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} />);
            const card = container.firstChild as HTMLElement;
            expect(card).toHaveClass('backdrop-blur-xl');
        });

        it('should have border styling', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} />);
            const card = container.firstChild as HTMLElement;
            expect(card).toHaveClass('border', 'border-white/5');
        });
    });

    describe('Gradient Application', () => {
        it('should apply gradient to icon container background', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} gradient="from-red-500 to-pink-500" />);
            const iconContainer = container.querySelector('.rounded-3xl');
            expect(iconContainer).toHaveClass('bg-gradient-to-br', 'from-red-500', 'to-pink-500');
        });

        it('should apply gradient to bottom accent', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} gradient="from-emerald-500 to-teal-500" />);
            const accent = container.querySelector('.bottom-0.left-0.w-full.h-1');
            expect(accent).toHaveClass('from-emerald-500', 'to-teal-500');
        });

        it('should apply gradient to action value text', () => {
            render(<RealisticKPICard {...defaultProps} isAction gradient="from-purple-500 to-indigo-500" />);
            const value = screen.getByText('5');
            expect(value).toHaveClass('bg-gradient-to-r', 'from-purple-500', 'to-indigo-500');
        });
    });

    describe('Accessibility', () => {
        it('should have focus-visible styles', () => {
            const { container } = render(<RealisticKPICard {...defaultProps} onClick={() => { }} />);
            const card = container.firstChild as HTMLElement;
            expect(card).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-blue-500');
        });

        it('should have descriptive ARIA label with all information', () => {
            render(<RealisticKPICard {...defaultProps} title="Total Projects" value="12" alert />);
            const card = screen.getByLabelText('Total Projects: 12 (Atenção)');
            expect(card).toBeInTheDocument();
        });

        it('should be keyboard navigable when interactive', () => {
            render(<RealisticKPICard {...defaultProps} onClick={() => { }} />);
            const card = screen.getByRole('button');

            card.focus();
            expect(document.activeElement).toBe(card);
        });
    });

    describe('Memoization', () => {
        it('should be a memoized component', () => {
            expect(RealisticKPICard.$$typeof).toBeDefined(); // React.memo wraps the component
        });
    });

    describe('Title Case Handling', () => {
        it('should handle single word title', () => {
            render(<RealisticKPICard {...defaultProps} title="Goals" />);
            expect(screen.getByText('Goals')).toBeInTheDocument();
        });

        it('should handle multi-word title', () => {
            render(<RealisticKPICard {...defaultProps} title="Active Study Goals" />);
            expect(screen.getByText('Active')).toBeInTheDocument(); // Mobile
            expect(screen.getByText('Active Study Goals')).toBeInTheDocument(); // Desktop
        });

        it('should handle title with special characters', () => {
            render(<RealisticKPICard {...defaultProps} title="Goals (Active)" />);
            expect(screen.getByText('Goals')).toBeInTheDocument();
        });
    });
});
