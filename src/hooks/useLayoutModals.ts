import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import type { Goal, Theme } from '../types';

export const useLayoutModals = (
    activeFocus: boolean,
    setIsSummaryModalOpen: (isOpen: boolean) => void,
    isMissionModalOpen: boolean,
    setIsMissionModalOpen: (isOpen: boolean) => void
) => {
    const { user } = useAuth();
    const { themes, goals, tasks } = useStudy();

    // Modals
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

    // Edit states
    const [goalToEdit, setGoalToEdit] = useState<undefined | Goal>(undefined);
    const [themeToEdit, setThemeToEdit] = useState<undefined | Theme>(undefined);
    const [preselectedThemeId, setPreselectedThemeId] = useState<undefined | string>(undefined);
    const [themeCategory, setThemeCategory] = useState<'study' | 'project'>('study');
    const [defaultGoalType, setDefaultGoalType] = useState<'simple' | 'checklist' | 'habit'>('simple');

    const handleEditGoal = (goal: Goal) => {
        setGoalToEdit(goal);
        setIsGoalModalOpen(true);
        setIsSummaryModalOpen(false);
    };

    const handleEditTheme = (theme: Theme) => {
        setThemeToEdit(theme);
        // Determine category from theme
        setThemeCategory((theme as any).category || 'study');
        setIsThemeModalOpen(true);
        setIsSummaryModalOpen(false);
    };

    const handleOpenGoalModalWithTheme = (themeId: string) => {
        setPreselectedThemeId(themeId);
        setGoalToEdit(undefined); // Ensure we are not editing
        setIsGoalModalOpen(true);
        setIsSummaryModalOpen(false); // Close summary to focus on creation
    };

    // Onboarding Trigger
    useEffect(() => {
        const isCompletelyEmpty = themes.length === 0 && goals.length === 0 && tasks.length === 0;
        const isDismissed = localStorage.getItem('onboarding_dismissed') === 'true';

        const timer = setTimeout(() => {
            if (user && !isDismissed && (user.name === 'User' || user.name === undefined || isCompletelyEmpty)) {
                setIsOnboardingOpen(true);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [user, themes.length, goals.length, tasks.length]);

    // Auto-close overlaying UI when Focus Mode starts
    useEffect(() => {
        if (activeFocus) {
            setIsSummaryModalOpen(false);
            setIsMissionModalOpen(false);
            setIsTaskModalOpen(false);
            setIsGoalModalOpen(false);
            setIsThemeModalOpen(false);
            setIsSidebarOpen(false);
            // Note: isMobileMenuOpen logic remains in component or needs to be passed here if managed here
            // But MobileMenu logic was in MainLayout state: [isMobileMenuOpen, setIsMobileMenuOpen] 
            // We should probably include it here to centralize ALL overlay UI state.
        }
    }, [activeFocus, setIsSummaryModalOpen]);


    return {
        state: {
            isTaskModalOpen,
            isGoalModalOpen,
            isThemeModalOpen,
            isMissionModalOpen,
            isSidebarOpen,
            isOnboardingOpen,
            goalToEdit,
            themeToEdit,
            preselectedThemeId,
            themeCategory,
            defaultGoalType
        },
        actions: {
            setIsTaskModalOpen,
            setIsGoalModalOpen,
            setIsThemeModalOpen,
            setIsMissionModalOpen,
            setIsSidebarOpen,
            setIsOnboardingOpen,
            setGoalToEdit,
            setThemeToEdit,
            setPreselectedThemeId,
            setThemeCategory,
            setDefaultGoalType,
            handleEditGoal,
            handleEditTheme,
            handleOpenGoalModalWithTheme
        }
    };
};
