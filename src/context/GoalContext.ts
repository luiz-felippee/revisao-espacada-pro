import { createContext, useContext } from 'react';
import type { Goal } from '../types';

export interface GoalContextType {
    goals: Goal[];
    setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
    addGoal: (goal: Omit<Goal, 'id' | 'progress' | 'createdAt'>) => void;
    deleteGoal: (goalId: string) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    toggleGoal: (goalId: string, date?: string, summaryText?: string) => void;
    toggleGoalItem: (goalId: string, itemId: string, date?: string, summaryText?: string) => void;
}

export const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const useGoal = () => {
    const context = useContext(GoalContext);
    if (!context) throw new Error('useGoal must be used within GoalProvider');
    return context;
};

export const useGoalContext = useGoal;
