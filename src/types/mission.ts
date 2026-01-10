/**
 * Type definitions for Mission-related components
 * Used in TodayMissionModal and related mission UI components
 */

import type { Task, Goal, Theme, Subtheme, Priority } from './index';

/**
 * Mission task with UI-specific properties
 */
export interface MissionTask extends Task {
    color?: string;
    isCompletedToday: boolean;
    label?: string; // e.g., "Início", "Prazo", "Em andamento"
}

/**
 * Mission goal with UI-specific properties
 */
export interface MissionGoal extends Goal {
    color?: string;
    isCompletedToday: boolean;
    isParent?: boolean;
    label?: string;
    // For checklist items
    checklist_item_id?: string;
    parentGoalId?: string;
    parentGoalTitle?: string;
    phaseProgress?: number;
    currentDay?: number;
    totalDays?: number;
}

/**
 * Review or introduction mission item
 */
export interface ReviewMissionItem {
    id: string;
    type: 'review' | 'intro';
    themeTitle: string;
    subthemeTitle: string;
    date: string;
    status: 'pending' | 'completed';
    priority: Priority;
    durationMinutes?: number;
    timeSpent?: number;
    color?: string;
    number?: number; // Review number
    reviewType?: 'review' | 'intro';
}

/**
 * Union type for all mission items
 */
export type MissionItem = MissionTask | MissionGoal | ReviewMissionItem;

/**
 * Grouped missions for display
 */
export interface MissionGroup {
    tasks: MissionTask[];
    goals: MissionGoal[];
    reviews: ReviewMissionItem[];
}

/**
 * Today's events structure from calendar
 */
export interface TodayEvents {
    tasks: Task[];
    goals: Goal[];
    reviews: Array<{
        id: string;
        themeTitle: string;
        subthemeTitle: string;
        date: string;
        status: string;
        priority: Priority;
        durationMinutes?: number;
        timeSpent?: number;
        color?: string;
        number?: number;
        type?: string;
    }>;
    intros: Array<{
        id: string;
        themeTitle: string;
        subthemeTitle: string;
        type: string;
        durationMinutes?: number;
        priority: Priority;
        timeSpent?: number;
        color?: string;
    }>;
}

/**
 * Projected review item from SRS system
 * Matches the structure returned by getAllProjectedReviews()
 */
export interface ProjectedReviewItem {
    subthemeId: string;
    subthemeTitle: string;
    themeTitle: string;
    date: string;
    description: string;
    isProjected: true;
    priority: 'low' | 'medium' | 'high';
    color?: string;
}

/**
 * Calendar events for a specific day
 */
export interface CalendarDayEvents {
    reviews: import('./index').CalendarReviewItem[];
    tasks: import('./index').CalendarTaskItem[];
    goals: import('./index').CalendarGoalItem[];
    projected: ProjectedReviewItem[];
}
