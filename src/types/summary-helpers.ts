import {
    addReviewSummary,
    addGoalProgressSummary,
    addSessionSummary,
    addCompletionSummary,
    addNoteSummary
} from '../utils/summaries';

export type {
    Priority,
    SessionLog,
    SummaryEntry,
    Task,
    Goal,
    GoalItem,
    Theme,
    Subtheme,
    Review,
    CalendarIntroItem,
    CalendarReviewItem,
    CalendarTaskItem,
    CalendarGoalItem,
    AppState
} from './index';

export const SummaryHelpers = {
    addReview: addReviewSummary,
    addGoalProgress: addGoalProgressSummary,
    addSession: addSessionSummary,
    addCompletion: addCompletionSummary,
    addNote: addNoteSummary,
};
