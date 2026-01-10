import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import { useDebounce } from '../hooks/useOptimization';
import type { SearchResult } from '../hooks/useGlobalSearch';

export const useGlobalSearchController = (isOpen: boolean, onClose: () => void) => {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const results = useGlobalSearch(debouncedQuery);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Modal states
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
    const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [results]);

    const handleSelectResult = useCallback((result: SearchResult) => {
        onClose();

        switch (result.type) {
            case 'task':
                navigate('/tasks');
                setSelectedTaskId(result.id);
                break;
            case 'goal':
                navigate('/goals');
                setSelectedGoalId(result.id);
                break;
            case 'theme':
            case 'subtheme':
                navigate('/themes');
                setSelectedThemeId(result.id);
                break;
        }
    }, [onClose, navigate]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (results[selectedIndex]) {
                    handleSelectResult(results[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
        }
    }, [isOpen, results, selectedIndex, handleSelectResult, onClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return {
        query,
        setQuery,
        results,
        selectedIndex,
        inputRef,
        selectedTaskId,
        setSelectedTaskId,
        selectedGoalId,
        setSelectedGoalId,
        selectedThemeId,
        setSelectedThemeId,
        handleSelectResult
    };
};
