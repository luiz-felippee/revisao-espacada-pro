import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';
import { Star } from 'lucide-react';

describe('Card Component', () => {
    describe('Basic Rendering', () => {
        it('should render card with children', () => {
            render(<Card>Card Content</Card>);
            expect(screen.getByText('Card Content')).toBeInTheDocument();
        });

        it('should render empty card', () => {
            const { container } = render(<Card />);
            const card = container.querySelector('div');
            expect(card).toBeInTheDocument();
        });
    });

    describe('Title', () => {
        it('should render title when provided', () => {
            render(<Card title="Card Title">Content</Card>);
            expect(screen.getByText('Card Title')).toBeInTheDocument();
        });

        it('should not render title section when title is not provided', () => {
            const { container } = render(<Card>Content</Card>);
            const titleElement = container.querySelector('h3');
            expect(titleElement).not.toBeInTheDocument();
        });

        it('should have correct title styling', () => {
            render(<Card title="Styled Title">Content</Card>);
            const title = screen.getByText('Styled Title');
            expect(title).toHaveClass('text-lg', 'font-semibold', 'text-slate-100', 'line-clamp-1');
        });
    });

    describe('Icon', () => {
        it('should render icon when provided', () => {
            const { container } = render(<Card icon={Star} title="With Icon">Content</Card>);
            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });

        it('should not render icon when emoji is provided', () => {
            const { container } = render(<Card icon={Star} emoji="⭐" title="Emoji Priority">Content</Card>);
            const iconContainer = container.querySelector('.bg-slate-800');
            const svg = iconContainer?.querySelector('svg');
            expect(svg).not.toBeInTheDocument();
        });

        it('should have correct icon styling', () => {
            const { container } = render(<Card icon={Star} title="Icon">Content</Card>);
            const icon = container.querySelector('svg');
            expect(icon).toHaveClass('w-4', 'h-4', 'text-blue-400');
        });

        it('should render icon in container with border', () => {
            const { container } = render(<Card icon={Star} title="Icon">Content</Card>);
            const iconContainer = container.querySelector('.bg-slate-800');
            expect(iconContainer).toHaveClass('w-8', 'h-8', 'rounded-lg', 'border', 'border-slate-700');
        });
    });

    describe('Emoji', () => {
        it('should render emoji when provided', () => {
            render(<Card emoji="🎉" title="With Emoji">Content</Card>);
            expect(screen.getByText('🎉')).toBeInTheDocument();
        });

        it('should render emoji in container', () => {
            const { container } = render(<Card emoji="🎨">Content</Card>);
            const emojiContainer = container.querySelector('.bg-slate-800');
            expect(emojiContainer).toHaveClass('w-8', 'h-8', 'rounded-lg', 'text-lg');
        });

        it('should prioritize emoji over icon', () => {
            const { container } = render(<Card icon={Star} emoji="⭐">Content</Card>);
            expect(screen.getByText('⭐')).toBeInTheDocument();
            const svg = container.querySelector('svg');
            expect(svg).not.toBeInTheDocument();
        });
    });

    describe('Image', () => {
        it('should render image when imageUrl is provided', () => {
            render(<Card imageUrl="/test-image.jpg" title="With Image">Content</Card>);
            const image = screen.getByAltText('With Image');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', '/test-image.jpg');
        });

        it('should have correct image section styling', () => {
            const { container } = render(<Card imageUrl="/image.jpg">Content</Card>);
            const imageSection = container.querySelector('.h-32');
            expect(imageSection).toHaveClass('w-full', 'relative', 'bg-slate-800');
        });

        it('should not render image section when imageUrl is not provided', () => {
            const { container } = render(<Card>Content</Card>);
            const image = container.querySelector('img');
            expect(image).not.toBeInTheDocument();
        });

        it('should have object-cover for image', () => {
            render(<Card imageUrl="/test.jpg" title="Test">Content</Card>);
            const image = screen.getByAltText('Test');
            expect(image).toHaveClass('w-full', 'h-full', 'object-cover');
        });
    });

    describe('Action', () => {
        it('should render action component when provided', () => {
            const ActionButton = () => <button>Action</button>;
            render(<Card title="With Action" action={<ActionButton />}>Content</Card>);
            expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
        });

        it('should render multiple actions', () => {
            const Actions = () => (
                <>
                    <button>Edit</button>
                    <button>Delete</button>
                </>
            );
            render(<Card title="Multiple Actions" action={<Actions />}>Content</Card>);
            expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        });

        it('should not render action section when action is not provided', () => {
            const { container } = render(<Card title="No Action">Content</Card>);
            const header = container.querySelector('.flex.items-center.justify-between');
            expect(header?.children.length).toBe(1); // Only left side with title
        });
    });

    describe('Styling', () => {
        it('should have base card styling', () => {
            const { container } = render(<Card>Content</Card>);
            const card = container.firstChild as HTMLElement;
            expect(card).toHaveClass('bg-slate-900', 'border', 'border-slate-800', 'rounded-xl', 'shadow-lg');
        });

        it('should have hover effects', () => {
            const { container } = render(<Card>Content</Card>);
            const card = container.firstChild as HTMLElement;
            expect(card).toHaveClass('transition-all', 'duration-300');
            expect(card.className).toContain('hover:border');
            expect(card.className).toContain('hover:shadow');
        });

        it('should apply custom className', () => {
            const { container } = render(<Card className="custom-card">Content</Card>);
            const card = container.firstChild as HTMLElement;
            expect(card).toHaveClass('custom-card');
        });

        it('should have flex column layout', () => {
            const { container } = render(<Card>Content</Card>);
            const card = container.firstChild as HTMLElement;
            expect(card).toHaveClass('flex', 'flex-col');
        });
    });

    describe('Hover Color', () => {
        it('should apply default hover color (blue)', () => {
            const { container } = render(<Card>Content</Card>);
            const card = container.firstChild as HTMLElement;
            const style = card.getAttribute('style');
            expect(style).toContain('--hover-color');
            expect(style).toContain('#3b82f6');
        });

        it('should apply custom hover color', () => {
            const { container } = render(<Card hoverColor="#10b981">Content</Card>);
            const card = container.firstChild as HTMLElement;
            const style = card.getAttribute('style');
            expect(style).toContain('--hover-color');
            expect(style).toContain('#10b981');
        });
    });

    describe('Header Section', () => {
        it('should not render header when no header props provided', () => {
            const { container } = render(<Card>Content only</Card>);
            const header = container.querySelector('.border-b.border-slate-800');
            expect(header).not.toBeInTheDocument();
        });

        it('should render header when title is provided', () => {
            const { container } = render(<Card title="Title">Content</Card>);
            const header = container.querySelector('.border-b.border-slate-800');
            expect(header).toBeInTheDocument();
        });

        it('should render header when icon is provided', () => {
            const { container } = render(<Card icon={Star}>Content</Card>);
            const header = container.querySelector('.border-b.border-slate-800');
            expect(header).toBeInTheDocument();
        });

        it('should have correct header styling', () => {
            const { container } = render(<Card title="Test">Content</Card>);
            const header = container.querySelector('.border-b.border-slate-800');
            expect(header).toHaveClass('flex', 'items-center', 'justify-between', 'px-6', 'py-4', 'shrink-0');
        });
    });

    describe('Content Section', () => {
        it('should render children in content section', () => {
            const { container } = render(<Card>Test Content</Card>);
            const content = container.querySelector('.p-6');
            expect(content).toHaveTextContent('Test Content');
        });

        it('should have correct content styling', () => {
            const { container } = render(<Card>Content</Card>);
            const content = container.querySelector('.p-6');
            expect(content).toHaveClass('flex-1', 'overflow-hidden', 'flex', 'flex-col');
        });

        it('should support complex children', () => {
            const ComplexContent = () => (
                <div>
                    <h4>Subtitle</h4>
                    <p>Description</p>
                    <button>Action</button>
                </div>
            );

            render(<Card><ComplexContent /></Card>);
            expect(screen.getByText('Subtitle')).toBeInTheDocument();
            expect(screen.getByText('Description')).toBeInTheDocument();
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('HTML Attributes', () => {
        it('should accept onClick handler', () => {
            const handleClick = vi.fn();
            render(<Card onClick={handleClick}>Clickable</Card>);

            const card = screen.getByText('Clickable').parentElement;
            if (card) {
                card.click();
                expect(handleClick).toHaveBeenCalledTimes(1);
            }
        });

        it('should accept data attributes', () => {
            const { container } = render(<Card data-testid="custom-card">Content</Card>);
            expect(screen.getByTestId('custom-card')).toBeInTheDocument();
        });

        it('should accept aria attributes', () => {
            render(<Card aria-label="Custom Card">Content</Card>);
            const card = screen.getByLabelText('Custom Card');
            expect(card).toBeInTheDocument();
        });

        it('should accept id attribute', () => {
            const { container } = render(<Card id="unique-card">Content</Card>);
            const card = container.querySelector('#unique-card');
            expect(card).toBeInTheDocument();
        });
    });

    describe('Combined Props', () => {
        it('should render card with all props', () => {
            const ActionButton = () => <button>Edit</button>;

            render(
                <Card
                    title="Full Card"
                    icon={Star}
                    action={<ActionButton />}
                    imageUrl="/image.jpg"
                    hoverColor="#ef4444"
                    className="custom-class"
                >
                    Card content here
                </Card>
            );

            expect(screen.getByText('Full Card')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
            expect(screen.getByAltText('Full Card')).toBeInTheDocument();
            expect(screen.getByText('Card content here')).toBeInTheDocument();
        });

        it('should handle emoji + title + action', () => {
            const Action = () => <span>📝</span>;
            render(<Card emoji="🎯" title="Goal Card" action={<Action />}>Goals</Card>);

            expect(screen.getByText('🎯')).toBeInTheDocument();
            expect(screen.getByText('Goal Card')).toBeInTheDocument();
            expect(screen.getByText('📝')).toBeInTheDocument();
            expect(screen.getByText('Goals')).toBeInTheDocument();
        });
    });

    describe('Overflow Handling', () => {
        it('should have overflow-hidden on card', () => {
            const { container } = render(<Card>Content</Card>);
            const card = container.firstChild as HTMLElement;
            expect(card).toHaveClass('overflow-hidden');
        });

        it('should truncate long titles', () => {
            render(<Card title="This is a very long title that should be truncated">Content</Card>);
            const title = screen.getByText(/This is a very long title/);
            expect(title).toHaveClass('line-clamp-1');
        });

        it('should have overflow handling on content section', () => {
            const { container } = render(<Card>Content</Card>);
            const content = container.querySelector('.p-6');
            expect(content).toHaveClass('overflow-hidden');
        });
    });
});
