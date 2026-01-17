import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal Component', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        title: 'Test Modal',
        children: <div>Modal Content</div>,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Clear any existing portals
        document.body.innerHTML = '';
    });

    describe('Render Behavior', () => {
        it('should render modal when isOpen is true', () => {
            render(<Modal {...defaultProps} />);

            expect(screen.getByText('Test Modal')).toBeInTheDocument();
            expect(screen.getByText('Modal Content')).toBeInTheDocument();
        });

        it('should not render modal when isOpen is false', () => {
            render(<Modal {...defaultProps} isOpen={false} />);

            expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
            expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
        });

        it('should render children correctly', () => {
            const CustomContent = () => (
                <div>
                    <h2>Custom Title</h2>
                    <p>Custom paragraph</p>
                </div>
            );

            render(<Modal {...defaultProps} children={<CustomContent />} />);

            expect(screen.getByText('Custom Title')).toBeInTheDocument();
            expect(screen.getByText('Custom paragraph')).toBeInTheDocument();
        });
    });

    describe('Close Functionality', () => {
        it('should call onClose when close button is clicked', () => {
            const onClose = vi.fn();
            render(<Modal {...defaultProps} onClose={onClose} />);

            const closeButton = screen.getByLabelText('Fechar modal');
            fireEvent.click(closeButton);

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('should call onClose when backdrop is clicked', () => {
            const onClose = vi.fn();
            const { container } = render(<Modal {...defaultProps} onClose={onClose} />);

            const backdrop = container.querySelector('[role="presentation"]');
            if (backdrop) {
                fireEvent.click(backdrop);
                expect(onClose).toHaveBeenCalledTimes(1);
            }
        });

        it('should NOT call onClose when modal content is clicked', () => {
            const onClose = vi.fn();
            render(<Modal {...defaultProps} onClose={onClose} />);

            const modalContent = screen.getByText('Modal Content');
            fireEvent.click(modalContent);

            expect(onClose).not.toHaveBeenCalled();
        });

        it('should call onClose when Escape key is pressed', () => {
            const onClose = vi.fn();
            render(<Modal {...defaultProps} onClose={onClose} />);

            fireEvent.keyDown(window, { key: 'Escape' });

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('should not call onClose for other keys', () => {
            const onClose = vi.fn();
            render(<Modal {...defaultProps} onClose={onClose} />);

            fireEvent.keyDown(window, { key: 'Enter' });
            fireEvent.keyDown(window, { key: 'Space' });
            fireEvent.keyDown(window, { key: 'Tab' });

            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe('Max Width Options', () => {
        const maxWidthTests = [
            { maxWidth: 'sm', expectedClass: 'max-w-sm' },
            { maxWidth: 'md', expectedClass: 'max-w-md' },
            { maxWidth: 'lg', expectedClass: 'max-w-lg' },
            { maxWidth: 'xl', expectedClass: 'max-w-xl' },
            { maxWidth: '2xl', expectedClass: 'max-w-2xl' },
            { maxWidth: '3xl', expectedClass: 'max-w-3xl' },
            { maxWidth: '4xl', expectedClass: 'max-w-4xl' },
            { maxWidth: '5xl', expectedClass: 'max-w-5xl' },
            { maxWidth: 'full', expectedClass: 'max-w-full' },
        ] as const;

        maxWidthTests.forEach(({ maxWidth, expectedClass }) => {
            it(`should apply ${expectedClass} when maxWidth is ${maxWidth}`, () => {
                const { container } = render(<Modal {...defaultProps} maxWidth={maxWidth} />);

                const modalContent = container.querySelector('[role="dialog"]');
                expect(modalContent).toHaveClass(expectedClass);
            });
        });

        it('should default to max-w-lg when maxWidth is not provided', () => {
            const { container } = render(<Modal {...defaultProps} />);

            const modalContent = container.querySelector('[role="dialog"]');
            expect(modalContent).toHaveClass('max-w-lg');
        });
    });

    describe('Title Variations', () => {
        it('should render title when provided', () => {
            render(<Modal {...defaultProps} title="Custom Title" />);

            expect(screen.getByText('Custom Title')).toBeInTheDocument();
        });

        it('should not render title section when title is null', () => {
            render(<Modal {...defaultProps} title={null} />);

            const { container } = render(<Modal {...defaultProps} title={null} />);
            const titleSection = container.querySelector('h2');

            expect(titleSection).not.toBeInTheDocument();
        });

        it('should render close button in different position when title is null', () => {
            render(<Modal {...defaultProps} title={null} />);

            const closeButton = screen.getByLabelText('Fechar modal');
            expect(closeButton).toBeInTheDocument();
            expect(closeButton).toHaveClass('absolute', 'top-6', 'right-4');
        });
    });

    describe('Padding Options', () => {
        it('should apply padding when padding prop is true (default)', () => {
            const { container } = render(<Modal {...defaultProps} />);

            const contentWrapper = container.querySelector('.p-4');
            expect(contentWrapper).toBeInTheDocument();
        });

        it('should not apply padding when padding prop is false', () => {
            const { container } = render(<Modal {...defaultProps} padding={false} />);

            const contentWrapper = container.querySelector('.p-0');
            expect(contentWrapper).toBeInTheDocument();
        });
    });

    describe('Scroll Content Options', () => {
        it('should apply scroll classes when scrollContent is true (default)', () => {
            const { container } = render(<Modal {...defaultProps} />);

            const contentWrapper = container.querySelector('.overflow-y-auto');
            expect(contentWrapper).toBeInTheDocument();
            expect(contentWrapper).toHaveClass('custom-scrollbar');
        });

        it('should apply overflow-hidden when scrollContent is false', () => {
            const { container } = render(<Modal {...defaultProps} scrollContent={false} />);

            const contentWrapper = container.querySelector('.overflow-hidden');
            expect(contentWrapper).toBeInTheDocument();
        });
    });

    describe('Custom Classes', () => {
        it('should apply custom className to modal content', () => {
            const { container } = render(<Modal {...defaultProps} className="custom-modal-class" />);

            const modalContent = container.querySelector('[role="dialog"]');
            expect(modalContent).toHaveClass('custom-modal-class');
        });

        it('should apply custom wrapperClassName to backdrop', () => {
            const { container } = render(<Modal {...defaultProps} wrapperClassName="custom-wrapper-class" />);

            const backdrop = container.querySelector('[role="presentation"]');
            expect(backdrop).toHaveClass('custom-wrapper-class');
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes', () => {
            const { container } = render(<Modal {...defaultProps} />);

            const modal = container.querySelector('[role="dialog"]');
            expect(modal).toHaveAttribute('aria-modal', 'true');
            expect(modal).toHaveAttribute('aria-labelledby');
        });

        it('should link title with aria-labelledby when title exists', () => {
            const { container } = render(<Modal {...defaultProps} title="Accessible Title" />);

            const modal = container.querySelector('[role="dialog"]');
            const titleId = modal?.getAttribute('aria-labelledby');

            if (titleId) {
                const title = document.getElementById(titleId);
                expect(title).toHaveTextContent('Accessible Title');
            }
        });

        it('should not have aria-labelledby when title is null', () => {
            const { container } = render(<Modal {...defaultProps} title={null} />);

            const modal = container.querySelector('[role="dialog"]');
            expect(modal).not.toHaveAttribute('aria-labelledby');
        });

        it('should have proper ARIA labels on buttons', () => {
            render(<Modal {...defaultProps} />);

            const closeButton = screen.getByLabelText('Fechar modal');
            expect(closeButton).toBeInTheDocument();
        });
    });

    describe('Safe Areas (iOS/PWA)', () => {
        it('should apply safe area insets to wrapper', () => {
            const { container } = render(<Modal {...defaultProps} />);

            const wrapper = container.querySelector('[role="presentation"]');
            const styles = wrapper?.getAttribute('style');

            expect(styles).toContain('padding-top');
            expect(styles).toContain('env(safe-area-inset-top)');
            expect(styles).toContain('padding-bottom');
            expect(styles).toContain('env(safe-area-inset-bottom)');
        });

        it('should apply max-height with safe area consideration', () => {
            const { container } = render(<Modal {...defaultProps} />);

            const modal = container.querySelector('[role="dialog"]');
            const styles = modal?.getAttribute('style');

            expect(styles).toContain('maxHeight');
            expect(styles).toContain('env(safe-area-inset-top');
            expect(styles).toContain('env(safe-area-inset-bottom');
        });

        it('should set touch-action to none on wrapper', () => {
            const { container } = render(<Modal {...defaultProps} />);

            const wrapper = container.querySelector('[role="presentation"]');
            const styles = wrapper?.getAttribute('style');

            expect(styles).toContain('touch-action');
            expect(styles).toContain('none');
        });

        it('should allow vertical panning on modal content', () => {
            const { container } = render(<Modal {...defaultProps} />);

            const modal = container.querySelector('[role="dialog"]');
            const styles = modal?.getAttribute('style');

            expect(styles).toContain('touch-action');
            expect(styles).toContain('pan-y');
        });
    });

    describe('Responsive Behavior', () => {
        it('should apply responsive padding classes', () => {
            const { container } = render(<Modal {...defaultProps} />);

            const contentWrapper = container.querySelector('.p-4.sm\\:p-6');
            expect(contentWrapper).toBeInTheDocument();
        });

        it('should apply responsive border radius', () => {
            const { container } = render(<Modal {...defaultProps} />);

            const modal = container.querySelector('[role="dialog"]');
            expect(modal).toHaveClass('rounded-2xl', 'sm:rounded-3xl');
        });

        it('should apply responsive title size', () => {
            render(<Modal {...defaultProps} title="Responsive Title" />);

            const title = screen.getByText('Responsive Title');
            expect(title).toHaveClass('text-lg', 'sm:text-xl');
        });

        it('should apply responsive close button size', () => {
            render(<Modal {...defaultProps} />);

            const closeButton = screen.getByLabelText('Fechar modal');
            expect(closeButton).toHaveClass('w-6', 'h-6', 'sm:w-6', 'sm:h-6');
        });
    });

    describe('Portal Rendering', () => {
        it('should render modal into document.body', () => {
            render(<Modal {...defaultProps} />);

            // Modal should be in document.body, not in the container
            const modalInBody = document.body.querySelector('[role="dialog"]');
            expect(modalInBody).toBeInTheDocument();
        });

        it('should clean up portal when unmounted', () => {
            const { unmount } = render(<Modal {...defaultProps} />);

            expect(document.body.querySelector('[role="dialog"]')).toBeInTheDocument();

            unmount();

            expect(document.body.querySelector('[role="dialog"]')).not.toBeInTheDocument();
        });
    });

    describe('Event Handler Cleanup', () => {
        it('should remove keydown listener when modal closes', () => {
            const { rerender } = render(<Modal {...defaultProps} isOpen={true} />);

            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

            rerender(<Modal {...defaultProps} isOpen={false} />);

            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        });

        it('should remove keydown listener on unmount', () => {
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
            const { unmount } = render(<Modal {...defaultProps} />);

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        });
    });

    describe('Animation Classes', () => {
        it('should have fade-in animation on wrapper', () => {
            const { container } = render(<Modal {...defaultProps} />);

            const wrapper = container.querySelector('[role="presentation"]');
            expect(wrapper).toHaveClass('animate-in', 'fade-in');
        });

        it('should have zoom-in animation on modal', () => {
            const { container } = render(<Modal {...defaultProps} />);

            const modal = container.querySelector('[role="dialog"]');
            expect(modal).toHaveClass('animate-in', 'zoom-in-95');
        });
    });
});
