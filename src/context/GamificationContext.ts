import { createContext, useContext } from 'react';
import type { Achievement, GamificationState, GameStats } from '../types/gamification';

export interface GamificationContextType {
    gamification: GamificationState;
    newlyUnlocked: Achievement | null;
    awardXP: (amount: number, silent?: boolean) => void;
    updateStats: (updates: Partial<GameStats>) => void;
    dismissAchievement: () => void;
    resetGamification: () => Promise<void>;
    claimDailyReward: () => { claimed: boolean, xpAmount: number };
}

export const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};
