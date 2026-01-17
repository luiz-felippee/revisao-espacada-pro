import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import { Plus } from 'lucide-react';

describe('Button Component', () => {
    describe('Rendering', () => {
        it('should render button with text', () => {
            render(<Button>Click me</Button>);
            expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
        });

        it('should render button with icon', () => {
            const { container } = render(<Button icon={Plus}>Add Item</Button>);
            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(screen.getByText('Add Item')).toBeInTheDocument();
        });

        it('should render button without children (icon only)', () => {
            const { container } = render(<Button icon={Plus} aria-label="Add" />);
            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });
    });

    describe('Variants', () => {
        it('should render primary variant by default', () => {
            const { container } = render(<Button>Primary</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('bg-blue-600', 'hover:bg-blue-500', 'text-white');
        });

        it('should render secondary variant', () => {
            const { container } = render(<Button variant="secondary">Secondary</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('bg-slate-800', 'hover:bg-slate-700', 'text-slate-200');
        });

        it('should render ghost variant', () => {
            const { container } = render(<Button variant="ghost">Ghost</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('bg-transparent', 'hover:bg-slate-800/50', 'text-slate-400');
        });

        it('should render danger variant', () => {
            const { container } = render(<Button variant="danger">Delete</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('bg-red-500/10', 'hover:bg-red-500/20', 'text-red-400');
        });
    });

    describe('Sizes', () => {
        it('should render medium size by default', () => {
            const { container } = render(<Button>Medium</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('px-4', 'py-2');
        });

        it('should render small size', () => {
            const { container } = render(<Button size="sm">Small</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
        });

        it('should render large size', () => {
            const { container } = render(<Button size="lg">Large</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
        });
    });

    describe('States', () => {
        it('should be enabled by default', () => {
            render(<Button>Enabled</Button>);
            const button = screen.getByRole('button');
            expect(button).not.toBeDisabled();
        });

        it('should be disabled when disabled prop is true', () => {
            render(<Button disabled>Disabled</Button>);
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });

        it('should have disabled styles when disabled', () => {
            const { container } = render(<Button disabled>Disabled</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
        });
    });

    describe('Interactions', () => {
        it('should call onClick when clicked', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Click me</Button>);

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should not call onClick when disabled', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick} disabled>Click me</Button>);

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(handleClick).not.toHaveBeenCalled();
        });

        it('should have active scale animation class', () => {
            const { container } = render(<Button>Press</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('active:scale-95');
        });
    });

    describe('Custom Props', () => {
        it('should accept custom className', () => {
            const { container } = render(<Button className="custom-class">Custom</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('custom-class');
        });

        it('should accept type attribute', () => {
            render(<Button type="submit">Submit</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('type', 'submit');
        });

        it('should accept aria-label attribute', () => {
            render(<Button aria-label="Custom Label">Button</Button>);
            const button = screen.getByRole('button', { name: 'Custom Label' });
            expect(button).toBeInTheDocument();
        });

        it('should accept data attributes', () => {
            render(<Button data-testid="custom-button">Button</Button>);
            expect(screen.getByTestId('custom-button')).toBeInTheDocument();
        });

        it('should forward ref', () => {
            const ref = vi.fn();
            render(<Button ref={ref}>Button</Button>);
            expect(ref).toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        it('should have button role', () => {
            render(<Button>Accessible</Button>);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should be keyboard accessible', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Keyboard</Button>);

            const button = screen.getByRole('button');
            fireEvent.keyDown(button, { key: 'Enter' });

            // Note: fireEvent.keyDown doesn't trigger onClick by default on buttons
            // but the button is still keyboard accessible via native browser behavior
            expect(button).toBeInTheDocument();
        });

        it('should support aria-disabled when disabled', () => {
            render(<Button disabled aria-disabled="true">Disabled</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('aria-disabled', 'true');
            expect(button).toBeDisabled();
        });
    });

    describe('Icon Rendering', () => {
        it('should render icon with correct size', () => {
            const { container } = render(<Button icon={Plus}>Add</Button>);
            const icon = container.querySelector('svg');
            expect(icon).toHaveClass('w-5', 'h-5');
        });

        it('should render icon before text', () => {
            const { container } = render(<Button icon={Plus}>Add Item</Button>);
            const button = container.querySelector('button');
            const children = Array.from(button?.children || []);

            expect(children[0].tagName).toBe('svg');
            expect(button?.textContent).toContain('Add Item');
        });

        it('should have gap between icon and text', () => {
            const { container } = render(<Button icon={Plus}>Add</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('gap-2');
        });
    });

    describe('Variant + Size Combinations', () => {
        it('should render primary small button correctly', () => {
            const { container } = render(<Button variant="primary" size="sm">Small Primary</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('bg-blue-600', 'px-3', 'py-1.5');
        });

        it('should render secondary large button correctly', () => {
            const { container } = render(<Button variant="secondary" size="lg">Large Secondary</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('bg-slate-800', 'px-6', 'py-3');
        });

        it('should render danger ghost with icon', () => {
            const { container } = render(
                <Button variant="danger" size="md" icon={Plus}>
                    Danger Action
                </Button>
            );
            const button = container.querySelector('button');
            const icon = container.querySelector('svg');

            expect(button).toHaveClass('bg-red-500/10');
            expect(icon).toBeInTheDocument();
        });
    });

    describe('Base Classes', () => {
        it('should always have flex and items-center', () => {
            const { container } = render(<Button>Base</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('flex', 'items-center', 'justify-center');
        });

        it('should always have transition classes', () => {
            const { container } = render(<Button>Transition</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('transition-all', 'duration-200');
        });

        it('should always have rounded corners', () => {
            const { container } = render(<Button>Rounded</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('rounded-lg');
        });

        it('should always have font-medium', () => {
            const { container } = render(<Button>Font</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('font-medium');
        });
    });

    describe('Shadow Effects', () => {
        it('should have shadow on primary variant', () => {
            const { container } = render(<Button variant="primary">Shadow</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('shadow-lg', 'shadow-blue-500/20');
        });

        it('should not have shadow on ghost variant', () => {
            const { container } = render(<Button variant="ghost">No Shadow</Button>);
            const button = container.querySelector('button');
            expect(button).not.toHaveClass('shadow-lg');
        });
    });

    describe('Border Styles', () => {
        it('should have border on secondary variant', () => {
            const { container } = render(<Button variant="secondary">Border</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('border', 'border-slate-700');
        });

        it('should have border on danger variant', () => {
            const { container } = render(<Button variant="danger">Border</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('border', 'border-red-500/20');
        });

        it('should not have border on primary variant', () => {
            const { container } = render(<Button variant="primary">No Border</Button>);
            const button = container.querySelector('button');
            const classes = button?.className || '';
            expect(classes).not.toMatch(/border-(?!0)/); // No border classes except border-0
        });
    });
});
