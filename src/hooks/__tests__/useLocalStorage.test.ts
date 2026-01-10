import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('returns initial value when no stored value exists', () => {
        const { result } = renderHook(() =>
            useLocalStorage('test-key', 'default-value')
        );

        expect(result.current[0]).toBe('default-value');
    });

    it('saves value to localStorage', () => {
        const { result } = renderHook(() =>
            useLocalStorage('test-key', 'initial')
        );

        act(() => {
            result.current[1]('new-value');
        });

        expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
        expect(result.current[0]).toBe('new-value');
    });

    it('loads existing value from localStorage', () => {
        localStorage.setItem('test-key', JSON.stringify('stored-value'));

        const { result } = renderHook(() =>
            useLocalStorage('test-key', 'default')
        );

        expect(result.current[0]).toBe('stored-value');
    });

    it('handles objects', () => {
        const { result } = renderHook(() =>
            useLocalStorage('test-obj', { foo: 'bar' })
        );

        act(() => {
            result.current[1]({ foo: 'baz' });
        });

        expect(result.current[0]).toEqual({ foo: 'baz' });
    });

    it('handles invalid JSON in localStorage', () => {
        localStorage.setItem('test-key', 'invalid-json{');

        const { result } = renderHook(() =>
            useLocalStorage('test-key', 'default')
        );

        // Should fallback to default on parse error
        expect(result.current[0]).toBe('default');
    });
});
