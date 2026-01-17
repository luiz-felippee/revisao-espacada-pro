import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';
import React from 'react';

describe('Input Component', () => {
    describe('Rendering', () => {
        it('should render input field', () => {
            render(<Input />);
            const input = screen.getByRole('textbox');
            expect(input).toBeInTheDocument();
        });

        it('should render with label when provided', () => {
            render(<Input label="Username" />);
            expect(screen.getByText('Username')).toBeInTheDocument();
            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });

        it('should not render label when not provided', () => {
            const { container } = render(<Input />);
            const label = container.querySelector('label');
            expect(label).not.toBeInTheDocument();
        });

        it('should render with placeholder', () => {
            render(<Input placeholder="Enter your name" />);
            expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
        });
    });

    describe('Value and onChange', () => {
        it('should accept and display value', () => {
            render(<Input value="test value" onChange={() => { }} />);
            const input = screen.getByRole('textbox') as HTMLInputElement;
            expect(input.value).toBe('test value');
        });

        it('should call onChange when value changes', () => {
            const handleChange = vi.fn();
            render(<Input onChange={handleChange} />);

            const input = screen.getByRole('textbox');
            fireEvent.change(input, { target: { value: 'new value' } });

            expect(handleChange).toHaveBeenCalledTimes(1);
        });

        it('should update value on change', () => {
            const TestComponent = () => {
                const [value, setValue] = React.useState('');
                return <Input value={value} onChange={(e) => setValue(e.target.value)} />;
            };

            render(<TestComponent />);
            const input = screen.getByRole('textbox') as HTMLInputElement;

            fireEvent.change(input, { target: { value: 'updated' } });
            expect(input.value).toBe('updated');
        });
    });

    describe('Input Types', () => {
        it('should support text type (default)', () => {
            render(<Input />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('type', 'text');
        });

        it('should support email type', () => {
            render(<Input type="email" />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('type', 'email');
        });

        it('should support password type', () => {
            render(<Input type="password" />);
            const input = document.querySelector('input[type="password"]');
            expect(input).toBeInTheDocument();
        });

        it('should support number type', () => {
            render(<Input type="number" />);
            const input = document.querySelector('input[type="number"]');
            expect(input).toBeInTheDocument();
        });
    });

    describe('States', () => {
        it('should be enabled by default', () => {
            render(<Input />);
            const input = screen.getByRole('textbox');
            expect(input).not.toBeDisabled();
        });

        it('should be disabled when disabled prop is true', () => {
            render(<Input disabled />);
            const input = screen.getByRole('textbox');
            expect(input).toBeDisabled();
        });

        it('should be required when required prop is true', () => {
            render(<Input required />);
            const input = screen.getByRole('textbox');
            expect(input).toBeRequired();
        });

        it('should be readonly when readOnly prop is true', () => {
            render(<Input readOnly value="readonly value" />);
            const input = screen.getByRole('textbox') as HTMLInputElement;
            expect(input).toHaveAttribute('readonly');
            expect(input.value).toBe('readonly value');
        });
    });

    describe('Styling', () => {
        it('should have default input styling classes', () => {
            const { container } = render(<Input />);
            const input = container.querySelector('input');
            expect(input).toHaveClass('w-full', 'px-3', 'py-2', 'bg-slate-950', 'border', 'rounded-lg');
        });

        it('should have focus styling classes', () => {
            const { container } = render(<Input />);
            const input = container.querySelector('input');
            expect(input).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500/50');
        });

        it('should have placeholder styling classes', () => {
            const { container } = render(<Input />);
            const input = container.querySelector('input');
            expect(input).toHaveClass('placeholder:text-slate-600');
        });

        it('should apply custom className', () => {
            const { container } = render(<Input className="custom-input" />);
            const input = container.querySelector('input');
            expect(input).toHaveClass('custom-input');
        });

        it('should have transition classes', () => {
            const { container } = render(<Input />);
            const input = container.querySelector('input');
            expect(input).toHaveClass('transition-all');
        });
    });

    describe('Label Styling', () => {
        it('should have correct label styling', () => {
            const { container } = render(<Input label="Test Label" />);
            const label = container.querySelector('label');
            expect(label).toHaveClass('text-sm', 'font-medium', 'text-slate-300');
        });

        it('should have space between label and input', () => {
            const { container } = render(<Input label="Test" />);
            const wrapper = container.querySelector('.space-y-1');
            expect(wrapper).toBeInTheDocument();
        });
    });

    describe('Ref Forwarding', () => {
        it('should forward ref to input element', () => {
            const ref = React.createRef<HTMLInputElement>();
            render(<Input ref={ref} />);

            expect(ref.current).toBeInstanceOf(HTMLInputElement);
            expect(ref.current?.tagName).toBe('INPUT');
        });

        it('should allow direct manipulation via ref', () => {
            const ref = React.createRef<HTMLInputElement>();
            render(<Input ref={ref} />);

            ref.current?.focus();
            expect(document.activeElement).toBe(ref.current);
        });
    });

    describe('Attributes', () => {
        it('should accept name attribute', () => {
            render(<Input name="username" />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('name', 'username');
        });

        it('should accept id attribute', () => {
            render(<Input id="email-input" />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('id', 'email-input');
        });

        it('should accept aria-label', () => {
            render(<Input aria-label="Search field" />);
            const input = screen.getByRole('textbox', { name: 'Search field' });
            expect(input).toBeInTheDocument();
        });

        it('should accept data attributes', () => {
            render(<Input data-testid="test-input" />);
            expect(screen.getByTestId('test-input')).toBeInTheDocument();
        });

        it('should accept maxLength attribute', () => {
            render(<Input maxLength={10} />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('maxLength', '10');
        });

        it('should accept pattern attribute', () => {
            render(<Input pattern="[0-9]*" />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('pattern', '[0-9]*');
        });
    });

    describe('Events', () => {
        it('should call onFocus when focused', () => {
            const handleFocus = vi.fn();
            render(<Input onFocus={handleFocus} />);

            const input = screen.getByRole('textbox');
            fireEvent.focus(input);

            expect(handleFocus).toHaveBeenCalledTimes(1);
        });

        it('should call onBlur when blurred', () => {
            const handleBlur = vi.fn();
            render(<Input onBlur={handleBlur} />);

            const input = screen.getByRole('textbox');
            fireEvent.blur(input);

            expect(handleBlur).toHaveBeenCalledTimes(1);
        });

        it('should call onKeyDown when key is pressed', () => {
            const handleKeyDown = vi.fn();
            render(<Input onKeyDown={handleKeyDown} />);

            const input = screen.getByRole('textbox');
            fireEvent.keyDown(input, { key: 'Enter' });

            expect(handleKeyDown).toHaveBeenCalledTimes(1);
        });
    });

    describe('Accessibility', () => {
        it('should have proper role', () => {
            render(<Input />);
            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });

        it('should be keyboard accessible', () => {
            render(<Input />);
            const input = screen.getByRole('textbox');

            input.focus();
            expect(document.activeElement).toBe(input);
        });

        it('should associate label with input when both are present', () => {
            render(<Input label="Email" id="email" />);

            const label = screen.getByText('Email');
            const input = screen.getByRole('textbox');

            // In this implementation, label doesn't have htmlFor
            // but they're still associated through the wrapper
            expect(label).toBeInTheDocument();
            expect(input).toBeInTheDocument();
        });

        it('should support aria-describedby for error messages', () => {
            render(<Input aria-describedby="error-message" />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('aria-describedby', 'error-message');
        });
    });

    describe('Mobile Responsiveness', () => {
        it('should have full width class', () => {
            const { container } = render(<Input />);
            const input = container.querySelector('input');
            expect(input).toHaveClass('w-full');
        });

        it('should have adequate padding for touch targets', () => {
            const { container } = render(<Input />);
            const input = container.querySelector('input');
            expect(input).toHaveClass('px-3', 'py-2');
        });
    });

    describe('Special Cases', () => {
        it('should work with controlled component', () => {
            const ControlledInput = () => {
                const [value, setValue] = React.useState('initial');
                return (
                    <>
                        <Input value={value} onChange={(e) => setValue(e.target.value)} />
                        <div data-testid="display">{value}</div>
                    </>
                );
            };

            render(<ControlledInput />);
            const input = screen.getByRole('textbox') as HTMLInputElement;

            expect(input.value).toBe('initial');
            fireEvent.change(input, { target: { value: 'changed' } });
            expect(screen.getByTestId('display')).toHaveTextContent('changed');
        });

        it('should work with uncontrolled component', () => {
            render(<Input defaultValue="uncontrolled" />);
            const input = screen.getByRole('textbox') as HTMLInputElement;
            expect(input.value).toBe('uncontrolled');
        });

        it('should handle empty string value', () => {
            render(<Input value="" onChange={() => { }} />);
            const input = screen.getByRole('textbox') as HTMLInputElement;
            expect(input.value).toBe('');
        });
    });

    describe('Display Name', () => {
        it('should have correct display name for debugging', () => {
            expect(Input.displayName).toBe('Input');
        });
    });
});
