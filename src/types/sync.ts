/**
 * Type Definitions for Sync Operations
 * Replaces generic 'any' types with specific types for better type safety
 */

import type { Task, Goal, Theme, Subtheme } from './index';
import type { User as AuthUser } from '../context/AuthContext';

// ============================================
// User Types
// ============================================

export type User = AuthUser;

// ============================================
// Sync Queue Types
// ============================================

export type SyncTable = 'themes' | 'tasks' | 'goals' | 'subthemes' | 'profiles';
export type SyncOperationType = 'ADD' | 'UPDATE' | 'DELETE';
export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface SyncError extends Error {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    statusCode?: number;
}

export interface SyncResult<T = unknown> {
    data?: T;
    error?: SyncError;
    status?: number;
    count?: number;
}

export interface SupabaseError {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
}

// ============================================
// Database Payloads
// ============================================

export interface TaskDbPayload {
    id: string;
    title: string;
    type: 'day' | 'recurring' | 'period';
    status: 'pending' | 'completed';
    priority: 'low' | 'medium' | 'high';
    date?: string;
    start_date?: string;
    end_date?: string;
    recurrence?: number[];
    image_url?: string;
    duration_minutes?: number;
    time_spent?: number;
    completion_history?: string[];
    sessions?: Array<{
        start: string;
        end: string;
        durationMinutes: number;
        status: 'completed' | 'cancelled';
    }>;
    summaries?: Array<{
        id: string;
        timestamp: string;
        type: string;
        description?: string;
    }>;
    user_id?: string; // Optional for partial updates
    created_at?: string;
    updated_at?: string;
}

export interface GoalDbPayload {
    id: string;
    title: string;
    type: 'standard' | 'habit';
    category: string;
    progress: number;
    priority: 'low' | 'medium' | 'high';
    deadline?: string;
    image_url?: string;
    duration_minutes?: number;
    time_spent?: number;
    completion_history?: string[];
    checklist?: Array<{
        id: string;
        title: string;
        completed: boolean;
    }>;
    summaries?: Array<{
        id: string;
        timestamp: string;
        type: string;
    }>;
    user_id?: string; // Optional for partial updates
    related_theme_id?: string;
    is_habit?: boolean;
    start_date?: string;
    recurrence?: number[];
    created_at?: string;
    updated_at?: string;
}

export interface ThemeDbPayload {
    id: string;
    title: string;
    icon?: string;
    color?: string;
    category?: string;
    start_date?: string;
    deadline?: string;
    notification_time?: string;
    image_url?: string;
    priority?: 'low' | 'medium' | 'high';
    summaries?: Array<{
        id: string;
        timestamp: string;
    }>;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
    order_index?: number;
}

export interface SubthemeDbPayload {
    id: string;
    theme_id: string;
    title: string;
    status: 'queue' | 'active' | 'review_pending' | 'completed';
    introductionDate?: string;
    introduction_date?: string; // Legacy field
    reviews?: Array<{
        date: string;
        status: 'pending' | 'completed';
        number: number;
        summary?: string;
    }>;
    duration_minutes?: number;
    time_spent?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'module' | 'easy' | 'medium' | 'hard';
    text_content?: string;
    summaries?: Array<{
        id: string;
        timestamp: string;
    }>;
    user_id?: string;
    order_index?: number;
    created_at?: string;
    updated_at?: string;
}

export type DbPayload = TaskDbPayload | GoalDbPayload | ThemeDbPayload | SubthemeDbPayload;

// Partial payload for DELETE and UPDATE operations (only id required)
export type PartialDbPayload = Partial<DbPayload> & { id: string };

// Helper type for sync data
export interface SyncPayload {
    task?: TaskDbPayload;
    goal?: GoalDbPayload;
    theme?: ThemeDbPayload;
    subtheme?: SubthemeDbPayload;
}

// ============================================
// Event Handler Types
// ============================================

export type ReactChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
export type ReactFormEvent = React.FormEvent<HTMLFormElement>;
export type ReactMouseEvent = React.MouseEvent<HTMLButtonElement | HTMLDivElement>;
export type ReactKeyboardEvent = React.KeyboardEvent<HTMLInputElement>;

// ============================================
// Hook Return Types
// ============================================

export interface UseGoalsReturn {
    goals: Goal[];
    setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
    addGoal: (goal: Omit<Goal, 'id' | 'progress' | 'createdAt'>) => Promise<void>;
    updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    toggleGoal: (goalId: string, dateStr?: string, summaryText?: string) => Promise<void>;
    toggleGoalItem: (goalId: string, itemId: string, dateStr?: string, summaryText?: string) => Promise<void>;
}

export interface UseTasksReturn {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    toggleTask: (taskId: string, dateStr?: string, summaryText?: string) => Promise<void>;
}

export interface UseThemesReturn {
    themes: Theme[];
    setThemes: React.Dispatch<React.SetStateAction<Theme[]>>;
    addTheme: (theme: Omit<Theme, 'id' | 'subthemes'>) => Promise<void>;
    updateTheme: (id: string, updates: Partial<Theme>) => Promise<void>;
    deleteTheme: (id: string) => Promise<void>;
    addSubtheme: (themeId: string, subtheme: Omit<Subtheme, 'id'>) => Promise<void>;
    updateSubtheme: (themeId: string, subthemeId: string, updates: Partial<Subtheme>) => Promise<void>;
    deleteSubtheme: (themeId: string, subthemeId: string) => Promise<void>;
}

// ============================================
// Component Prop Types
// ============================================

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

export interface FormFieldProps {
    label: string;
    value: string | number;
    onChange: (e: ReactChangeEvent) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

// ============================================
// Template Types
// ============================================

export interface TemplateData {
    themes?: Array<Omit<Theme, 'id' | 'createdAt'>>;
    goals?: Array<Omit<Goal, 'id' | 'createdAt' | 'progress'>>;
    tasks?: Array<Omit<Task, 'id' | 'createdAt' | 'status'>>;
    [key: string]: unknown;
}
