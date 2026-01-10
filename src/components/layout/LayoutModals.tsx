import React, { Suspense, lazy } from 'react';
import { DailyRewardModal } from '../../features/gamification/DailyRewardModal';
import type { Goal, Theme } from '../../types';
// Checking MainLayout: PomodoroWidget is at the end, not within the "Modals" block. I will NOT move PomodoroWidget into LayoutModals unless it makes sense. It's a widget, usually strictly positioned. I'll leave it in MainLayout for now or move to a "Widgets" container.
// Wait, SummaryModal and others are here.

// Lazy Load Modals
const AddTaskModal = lazy(() => import('../../features/forms/AddTaskModal').then(m => ({ default: m.AddTaskModal })));
const AddGoalModal = lazy(() => import('../../features/goals/components/AddGoalModal').then(m => ({ default: m.AddGoalModal })));
const AddThemeModal = lazy(() => import('../../features/themes/components/AddThemeModal').then(m => ({ default: m.AddThemeModal })));
const TodayMissionModal = lazy(() => import('../../features/dashboard/TodayMissionModal'));
const SummaryModal = lazy(() => import('../../features/dashboard/SummaryModal').then(m => ({ default: m.SummaryModal })));
const AchievementModal = lazy(() => import('../../components/gamification/AchievementModal').then(m => ({ default: m.AchievementModal })));
const OnboardingModal = lazy(() => import('../../features/onboarding/OnboardingModal').then(m => ({ default: m.OnboardingModal })));

interface LayoutModalsProps {
    modals: {
        state: {
            isTaskModalOpen: boolean;
            isGoalModalOpen: boolean;
            isThemeModalOpen: boolean;
            isMissionModalOpen: boolean;
            isSidebarOpen: boolean;
            isOnboardingOpen: boolean;
            goalToEdit: Goal | undefined;
            themeToEdit: Theme | undefined;
            preselectedThemeId: string | undefined;
            themeCategory: 'study' | 'project';
            defaultGoalType: 'simple' | 'checklist' | 'habit';
        };
        actions: {
            setIsTaskModalOpen: (v: boolean) => void;
            setIsGoalModalOpen: (v: boolean) => void;
            setIsThemeModalOpen: (v: boolean) => void;
            setIsMissionModalOpen: (v: boolean) => void;
            setIsSidebarOpen: (v: boolean) => void;
            setIsOnboardingOpen: (v: boolean) => void;
            setGoalToEdit: (v: Goal | undefined) => void;
            setThemeToEdit: (v: Theme | undefined) => void;
            setPreselectedThemeId: (v: string | undefined) => void;
            setThemeCategory: (v: 'study' | 'project') => void;
            setDefaultGoalType: (v: 'simple' | 'checklist' | 'habit') => void;
            handleEditGoal: (v: Goal) => void;
            handleEditTheme: (v: Theme) => void;
            handleOpenGoalModalWithTheme: (v: string) => void;
        };
    };
    isSummaryModalOpen: boolean;
    setIsSummaryModalOpen: (isOpen: boolean) => void;
    zenMode: boolean;
}

export const LayoutModals: React.FC<LayoutModalsProps> = ({
    modals,
    isSummaryModalOpen,
    setIsSummaryModalOpen,
    zenMode
}) => {
    const { state, actions } = modals;

    return (
        <>
            <Suspense fallback={null}>
                {state.isMissionModalOpen && <TodayMissionModal isOpen={state.isMissionModalOpen} onClose={() => actions.setIsMissionModalOpen(false)} />}
                {isSummaryModalOpen && (
                    <SummaryModal
                        isOpen={isSummaryModalOpen}
                        onClose={() => setIsSummaryModalOpen(false)}
                        onOpenGoalModal={(type?: 'simple' | 'checklist' | 'habit') => {
                            actions.setGoalToEdit(undefined);
                            actions.setPreselectedThemeId(undefined);
                            actions.setDefaultGoalType(type || 'simple');
                            actions.setIsGoalModalOpen(true);
                        }}
                        onOpenThemeModal={() => {
                            actions.setThemeCategory('project'); // Default to Project when opening from Summary
                            actions.setThemeToEdit(undefined);
                            actions.setIsThemeModalOpen(true);
                            setIsSummaryModalOpen(false);
                        }}
                        onEditGoal={(goal: Goal) => {
                            actions.setGoalToEdit(goal);
                            actions.setIsGoalModalOpen(true);
                        }}
                        onEditTheme={(theme: Theme) => {
                            actions.setThemeToEdit(theme);
                            actions.setIsThemeModalOpen(true);
                        }}
                        onAddGoalToTheme={actions.handleOpenGoalModalWithTheme}
                    />
                )}
                {/* Hide Celebration in Zen Mode */}
                {!zenMode && <AchievementModal />}
                <DailyRewardModal />
            </Suspense>

            <AddTaskModal isOpen={state.isTaskModalOpen} onClose={() => actions.setIsTaskModalOpen(false)} />

            <AddGoalModal
                isOpen={state.isGoalModalOpen}
                onClose={() => {
                    actions.setIsGoalModalOpen(false);
                    actions.setGoalToEdit(undefined); // Reset editing state on close
                    actions.setPreselectedThemeId(undefined);
                    actions.setDefaultGoalType('simple');
                }}
                goalToEdit={state.goalToEdit}
                defaultThemeId={state.preselectedThemeId}
                defaultType={state.defaultGoalType}
            />

            <AddThemeModal
                isOpen={state.isThemeModalOpen}
                onClose={() => {
                    actions.setIsThemeModalOpen(false);
                    actions.setThemeToEdit(undefined); // Reset editing state on close
                }}
                themeToEdit={state.themeToEdit}
                defaultCategory={state.themeCategory}
            />

            <Suspense fallback={null}>
                {state.isOnboardingOpen && <OnboardingModal isOpen={state.isOnboardingOpen} onClose={() => actions.setIsOnboardingOpen(false)} />}
            </Suspense>
        </>
    );
};
