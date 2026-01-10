// Types Definitions
import type { GoalItem } from './GoalItem';
export type { GoalItem } from './GoalItem';
export type Priority = 'low' | 'medium' | 'high';

export interface SessionLog {
    start: string; // ISO 8601
    end: string;   // ISO 8601
    durationMinutes: number;
    status: 'completed' | 'cancelled';
    summary?: string;
}

export interface SummaryEntry {
    id: string;
    timestamp: string; // ISO 8601
    type: 'review' | 'goal' | 'session' | 'completion' | 'progress' | 'note';
    title?: string; // Título do resumo
    description?: string; // Descrição detalhada
    number?: number; // Número da revisão (1ª, 2ª, 3ª) ou progresso da meta
    metadata?: {
        reviewNumber?: number; // Qual revisão (1-6)
        goalProgress?: number; // Progresso da meta (0-100)
        sessionDuration?: number; // Duração da sessão em minutos
        status?: string; // Status específico
        entityId?: string; // ID da entidade pai
        entityType?: 'task' | 'goal' | 'theme' | 'project'; // Tipo da entidade pai
        entityTitle?: string; // Título da entidade pai
        [key: string]: any; // Metadados adicionais
    };
}

export interface Task {
    id: string;
    title: string;
    status: 'pending' | 'completed';
    priority: Priority;
    type: 'day' | 'period' | 'recurring';
    date?: string; // For day tasks (YYYY-MM-DD)
    startDate?: string; // For period
    endDate?: string; // For period
    recurrence?: number[]; // [0, 1...6] for Sunday-Saturday
    progress?: { current: number; total: number }; // For period/recurring tracking
    createdAt: number;
    icon?: string; // Emoji
    imageUrl?: string; // Banner
    color?: string;
    durationMinutes?: number;
    timeSpent?: number;
    completionHistory?: string[]; // Dates (YYYY-MM-DD) when this was completed
    sessions?: SessionLog[]; // History of focus sessions
    notificationTime?: string; // HH:mm
    summary?: string; // User written summary/notes
    summaries?: SummaryEntry[]; // Detailed history with timestamps
}

export interface Goal {
    id: string;
    title: string;
    type: 'simple' | 'checklist' | 'habit';
    category: string;
    icon?: string;
    imageUrl?: string; // Banner
    color?: string;
    checklist?: GoalItem[];
    progress: number; // 0-100
    isHabit?: boolean; // If converted to daily habit
    startDate?: string; // YYYY-MM-DD
    deadline?: string; // YYYY-MM-DD
    recurrence?: number[]; // [0, 1...6] for Sunday-Saturday
    createdAt: number;
    durationMinutes?: number;
    priority?: Priority;
    timeSpent?: number;
    completionHistory?: string[]; // Dates (YYYY-MM-DD) when this was completed
    sessions?: SessionLog[]; // History of focus sessions
    relatedThemeId?: string; // Links this goal to a Theme (Project Parent)
    summary?: string; // User written summary/notes
    summaries?: SummaryEntry[]; // Detailed history with timestamps and goal progress
    // Newly added optional fields for detailed tracking
    targetValue?: number;
    currentValue?: number;
    unit?: string;
    // Existing recurrence already present
    totalXp?: number;
    currentLevel?: number;
}

// === PROJECT MANAGEMENT TYPES ===

export interface Project {
    id: string;
    title: string;
    description?: string;
    category: 'professional' | 'personal' | 'academic';
    status: 'planning' | 'active' | 'paused' | 'completed';
    progress: number; // 0-100 (calculated from milestones)
    milestones: ProjectMilestone[];
    linkedTaskIds: string[]; // IDs of linked tasks
    linkedGoalIds: string[]; // IDs of linked goals
    startDate?: string; // YYYY-MM-DD
    deadline?: string; // YYYY-MM-DD
    color?: string;
    icon?: string; // Emoji
    imageUrl?: string; // Banner
    createdAt: number;
    summaries?: SummaryEntry[]; // Project activity history
}

export interface ProjectMilestone {
    id: string;
    projectId: string;
    title: string;
    description?: string;
    dueDate?: string; // YYYY-MM-DD
    completed: boolean;
    completedAt?: string; // ISO 8601
    order: number; // For sorting
    createdAt: number;
}

// === COLLABORATION TYPES ===

export interface Collaborator {
    userId: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: 'owner' | 'editor' | 'viewer';
    invitedAt: string; // ISO 8601
    acceptedAt?: string; // ISO 8601
}

export interface ShareableItem {
    collaborators: Collaborator[];
    isPublic: boolean;
    shareLink?: string;
}


export interface Theme {
    id: string;
    title: string;
    subthemes: Subtheme[];
    icon?: string; // Emoji
    imageUrl?: string; // Banner
    color?: string;
    startDate?: string; // YYYY-MM-DD
    deadline?: string; // YYYY-MM-DD
    createdAt: number;
    priority?: Priority;
    category?: 'study' | 'project'; // 'study' = SRS/World, 'project' = Group of Goals
    notificationTime?: string; // HH:mm
    summary?: string; // User written summary/notes
    summaries?: SummaryEntry[]; // Detailed history with timestamps
    // Newly added optional field for difficulty
    difficulty?: string;
}

export interface Subtheme {
    id: string;
    theme_id?: string; // For DB linking
    title: string;
    status: 'queue' | 'active' | 'completed';
    introductionDate?: string; // When it moved from queue to active
    reviews: Review[];
    durationMinutes?: number;
    timeSpent?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'module' | 'beginner' | 'intermediate' | 'advanced';
    text_content?: string; // Rich text content for flashcards/notes
    sessions?: SessionLog[]; // History of focus sessions
    summaries?: SummaryEntry[]; // Detailed history with review numbers and timestamps
    order_index?: number; // Ordering
    // Newly added optional fields for description and alternative text content naming
    description?: string;
    // Note: text_content already covers textContent; keep alias if needed elsewhere
}

export interface Review {
    date: string; // YYYY-MM-DD
    status: 'pending' | 'completed';
    number: number; // 1 to 6 (representing 0, 1, 2, 7, 15, 30)
    completedAt?: string; // ISO 8601
    completedBy?: string; // User ID if needed
    summary?: string; // What was learned/understood
    difficulty?: 'easy' | 'medium' | 'hard';
}

export interface CalendarIntroItem {
    id: string;
    subthemeTitle: string;
    themeTitle: string;
    priority?: Priority;
    durationMinutes?: number;
}

export interface CalendarReviewItem extends Review {
    id: string;
    subthemeTitle: string;
    themeTitle: string;
    priority?: Priority;
    durationMinutes?: number;
    completionHistory?: string[];
}

export interface CalendarTaskItem extends Task {
    isCompletedToday?: boolean;
    label?: string;
}

export interface CalendarGoalItem extends Omit<Goal, 'type'> {
    type: 'simple' | 'checklist' | 'habit' | 'goal-step' | 'goal-phase' | 'project-start' | 'project-deadline' | 'project-milestone';
    checklist_item_id?: string;
    parentGoalId?: string;
    parentGoalTitle?: string;
    currentDay?: number;
    totalDays?: number;
    phaseProgress?: number;
    label?: string;
    isCompletedToday?: boolean;
}

export interface AppState {
    tasks: Task[];
    goals: Goal[];
    themes: Theme[];
    settings: {
        username: string;
        focusTime: number; // minutes
    };
    gamification: import('./gamification').GamificationState;
}
