import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useThemes } from './useThemes';
import { SyncQueueService } from '../services/SyncQueueService';
import { XP_VALUES } from '../config/gamification.config';
import { format } from 'date-fns';

// Mock dependencies
vi.mock('../services/SyncQueueService', () => ({
    SyncQueueService: {
        enqueue: vi.fn(),
    },
}));

vi.mock('../context/ToastContext', () => ({
    useToast: vi.fn(() => ({
        showToast: vi.fn(),
    })),
}));

vi.mock('../utils/celebration', () => ({
    celebrate: vi.fn(),
}));

vi.mock('../utils/summaries', () => ({
    addReviewSummary: vi.fn(),
    addCompletionSummary: vi.fn(),
}));

vi.mock('../utils/deletedItemsBlacklist', () => ({
    addToBlacklist: vi.fn(),
    removeFromBlacklist: vi.fn(),
}));

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
    randomUUID: () => 'theme-uuid-' + Math.random().toString(36).substring(2)
});

describe('useThemes hook', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockGamification = { level: 1, xp: 0, nextLevelXp: 100 };
    const awardXP = vi.fn();
    const updateStats = vi.fn();
    const playSFX = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should initialize with themes from localStorage', () => {
        const initialThemes = [{ id: '1', title: 'Test Theme', subthemes: [] }];
        localStorage.setItem('study_themes_backup', JSON.stringify(initialThemes));

        const { result } = renderHook(() => useThemes({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats,
            playSFX
        }));

        expect(result.current.themes).toEqual(initialThemes);
    });

    it('should add a new theme with subthemes and calculated SRS dates', async () => {
        const { result } = renderHook(() => useThemes({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats,
            playSFX
        }));

        const subthemesInit = [
            { title: 'Subtheme 1', difficulty: 'beginner' as const },
            { title: 'Subtheme 2', difficulty: 'beginner' as const }
        ];

        await act(async () => {
            await result.current.addTheme('New Theme', subthemesInit);
        });

        expect(result.current.themes).toHaveLength(1);
        expect(result.current.themes[0].title).toBe('New Theme');
        expect(result.current.themes[0].subthemes).toHaveLength(2);
        expect(SyncQueueService.enqueue).toHaveBeenCalled();
    });

    it('should complete an "intro" review and award XP', async () => {
        const initialThemes = [{
            id: 'theme-1',
            title: 'Theme',
            subthemes: [{
                id: 'sub-1',
                title: 'Intro Sub',
                status: 'queue',
                reviews: []
            }]
        }];
        localStorage.setItem('study_themes_backup', JSON.stringify(initialThemes));

        const { result } = renderHook(() => useThemes({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats,
            playSFX
        }));

        await act(async () => {
            await result.current.completeReview('sub-1', 0, 'intro', 'medium');
        });

        const subtheme = result.current.themes[0].subthemes[0];
        expect(subtheme.status).toBe('active');
        expect(subtheme.introductionDate).toBe(format(new Date(), 'yyyy-MM-dd'));
        expect(awardXP).toHaveBeenCalledWith(XP_VALUES.INTRO);
    });

    it('should delete a theme and trigger sync', async () => {
        const initialThemes = [{ id: 'theme-del', title: 'Del', subthemes: [{ id: 'sub-del' }] }];
        localStorage.setItem('study_themes_backup', JSON.stringify(initialThemes));

        const { result } = renderHook(() => useThemes({
            user: mockUser as any,
            gamification: mockGamification as any,
            awardXP,
            updateStats,
            playSFX
        }));

        await act(async () => {
            await result.current.deleteTheme('theme-del');
        });

        expect(result.current.themes).toHaveLength(0);
        expect(SyncQueueService.enqueue).toHaveBeenCalledWith(expect.objectContaining({
            type: 'DELETE',
            table: 'themes'
        }));
    });
});
