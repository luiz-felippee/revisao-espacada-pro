import { createContext, useContext } from 'react';
import type { Task } from '../types';

export interface TaskContextType {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    deleteTask: (taskId: string) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    toggleTask: (taskId: string, date?: string, summaryText?: string) => void;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error('useTask must be used within TaskProvider');
    return context;
};

export const useTaskContext = useTask;
