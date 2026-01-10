import type { Achievement } from '../types/gamification';

export const GAME_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
    {
        id: 'first_steps',
        title: 'Primeiros Passos',
        description: 'Ganhe seus primeiros 100 XP.',
        iconName: 'Footprints',
        condition: { type: 'xp', target: 100 },
        xpReward: 100
    },
    {
        id: 'streak_3',
        title: 'Em Chamas',
        description: 'Mantenha uma ofensiva de 3 dias.',
        iconName: 'Flame',
        condition: { type: 'streak', target: 3 },
        xpReward: 300
    },
    {
        id: 'streak_7',
        title: 'Imparável',
        description: 'Mantenha uma ofensiva de 7 dias.',
        iconName: 'Zap',
        condition: { type: 'streak', target: 7 },
        xpReward: 1000
    },
    {
        id: 'streak_30',
        title: 'Lendário',
        description: 'Mantenha uma ofensiva de 30 dias.',
        iconName: 'Crown',
        condition: { type: 'streak', target: 30 },
        xpReward: 5000
    },
    {
        id: 'review_master_10',
        title: 'Mente Afiada',
        description: 'Complete 10 revisões.',
        iconName: 'Brain',
        condition: { type: 'reviews', target: 10 },
        xpReward: 500
    },
    {
        id: 'review_master_50',
        title: 'Sábio de Dados',
        description: 'Complete 50 revisões.',
        iconName: 'Cpu',
        condition: { type: 'reviews', target: 50 },
        xpReward: 2000
    },
    {
        id: 'task_warrior_20',
        title: 'Guerreiro de Tarefas',
        description: 'Complete 20 tarefas.',
        iconName: 'ShieldCheck',
        condition: { type: 'tasks', target: 20 },
        xpReward: 1000
    },
    {
        id: 'task_warrior_100',
        title: 'Maestro da Produtividade',
        description: 'Complete 100 tarefas.',
        iconName: 'Award',
        condition: { type: 'tasks', target: 100 },
        xpReward: 5000
    },
    {
        id: 'focus_guru_500',
        title: 'Foco Profundo',
        description: 'Acumule 500 minutos de foco.',
        iconName: 'Timer',
        condition: { type: 'xp', target: 5000 },
        xpReward: 500
    },
    {
        id: 'level_10',
        title: 'Graduado',
        description: 'Alcance o nível 10.',
        iconName: 'GraduationCap',
        condition: { type: 'xp', target: 15000 },
        xpReward: 1500
    }
];
