
export interface UserLevel {
    level: number;
    currentXp: number;
    nextLevelXp: number;
    totalXp: number;
}

export interface XPHistoryItem {
    id: string;
    source: string; // e.g., 'Review', 'Task', 'Streak'
    amount: number;
    date: string; // ISO
}

export interface GameStreak {
    current: number;
    max: number;
    lastLoginDate: string | null; // YYYY-MM-DD
    lastDailyRewardDate?: string | null; // YYYY-MM-DD - última vez que reivindicou a recompensa diária
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    iconName: string; // We'll map string to Lucide icon in UI
    unlockedAt: string | null; // ISO if unlocked, null if locked
    condition: {
        type: 'xp' | 'reviews' | 'tasks' | 'streak';
        target: number;
    };
    xpReward: number;
}

export interface GameStats {
    reviewsCompleted: number;
    tasksCompleted: number;
    goalsCompleted: number; // Added for tracking goal completions
    habitsCompleted: number;
    totalFocusMinutes: number;
    dailyXp: number;
    lastXpDate: string; // YYYY-MM-DD
    dailyHistory: Record<string, number>; // YYYY-MM-DD -> minutes
}

export interface GamificationState {
    level: UserLevel;
    streak: GameStreak;
    achievements: Achievement[];
    stats: GameStats;
}
