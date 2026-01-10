import { BrainCircuit, CheckSquare, Target, Zap, BookOpen, Flame } from 'lucide-react';
import type { Achievement } from '../types/gamification';

export const XP_VALUES = {
    REVIEW: 100,
    INTRO: 50,
    TASK: 50,
    GOAL: 500,
    FOCUS_PER_MIN: 10,
    STREAK_BONUS_BASE: 50, // 50 * streak days
} as const;

export const XP_TABLE_DISPLAY = [
    { label: 'Revisão SRS', value: XP_VALUES.REVIEW, icon: BrainCircuit, color: 'text-purple-400' },
    { label: 'Novo Tópico', value: XP_VALUES.INTRO, icon: BookOpen, color: 'text-blue-400' },
    { label: 'Tarefa Concluída', value: XP_VALUES.TASK, icon: CheckSquare, color: 'text-emerald-400' },
    { label: 'Meta Alcançada', value: XP_VALUES.GOAL, icon: Target, color: 'text-yellow-400' },
    { label: 'Sessão de Foco', value: `${XP_VALUES.FOCUS_PER_MIN} / min`, icon: Zap, color: 'text-pink-400' },
    { label: 'Ofensiva Diária', value: '50x Dias', icon: Flame, color: 'text-orange-500' },
];

export const LEVEL_TITLES = [
    { level: 1, title: 'Recruta' },
    { level: 5, title: 'Soldado' },
    { level: 10, title: 'Cabo' },
    { level: 15, title: 'Sargento' },
    { level: 20, title: 'Tenente' },
    { level: 25, title: 'Capitão' },
    { level: 30, title: 'Major' },
    { level: 40, title: 'Coronel' },
    { level: 50, title: 'General' },
    { level: 75, title: 'Marechal' },
    { level: 100, title: 'Lenda' }
];

// ACHIEVEMENTS_LIST moved to achievements.ts

export const getTitleForLevel = (level: number) => {
    return LEVEL_TITLES.slice().reverse().find(t => level >= t.level)?.title || 'Novato';
};

export const getNextTitleForLevel = (currentLevel: number) => {
    const currentTitle = getTitleForLevel(currentLevel);

    // Find the next title in the progression
    const nextTitleEntry = LEVEL_TITLES.find(t => t.level > currentLevel);

    // If there's a next title, return it; otherwise return the current title with indicator
    return nextTitleEntry ? nextTitleEntry.title : currentTitle;
};
