import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import {
    Zap, // Keep if used (actually CheckSquare/Target etc might still be used if passed as props? No, logic moved.)
    Sparkles, // Check usages
    Flame
} from 'lucide-react';
// Removing format, ptBR as well if unused
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { usePomodoroState } from '../context/PomodoroContext'; // Optimized import
import { useAudio } from '../context/AudioContext';
import { LayoutModals } from '../components/layout/LayoutModals';
import { useLayoutModals } from '../hooks/useLayoutModals';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCalendarEvents } from '../features/calendar/hooks/useCalendarEvents';
import { useProjectContext } from '../context/ProjectProvider';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { InstallPWAHint } from '../components/InstallPWAHint';
import { GlobalActionBar } from '../components/layout/GlobalActionBar';
import { PomodoroWidget } from '../features/pomodoro/PomodoroWidget';
import { useDevice } from '../hooks/useDevice';
import { OfflineIndicator } from '../components/ui/OfflineIndicator';


interface MainLayoutProps {
    children: React.ReactNode;
    isSummaryModalOpen: boolean;
    setIsSummaryModalOpen: (isOpen: boolean) => void;
    isMissionModalOpen: boolean;
    setIsMissionModalOpen: (isOpen: boolean) => void;
}


// ...

export const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    isSummaryModalOpen,
    setIsSummaryModalOpen,
    isMissionModalOpen,
    setIsMissionModalOpen
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Derive activeTab from URL
    // e.g. /dashboard -> dashboard, / -> dashboard
    const path = location.pathname.substring(1);
    const activeTab = path || 'dashboard';

    const onTabChange = (tab: string) => {
        navigate(`/${tab}`);
    };

    const { activeFocus, syncStatus, zenMode, toggleZenMode, clearSyncQueue, themes, tasks, goals } = useStudy();
    const { projects } = useProjectContext();
    const { user, logout } = useAuth();
    const { isIOS, isPWA, safeAreaTopClass, safeAreaBottomClass } = useDevice();
    const [time, setTime] = useState(new Date());
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- MISSION & PROJECT COUNTS ---
    const { getEventsForDay } = useCalendarEvents({ themes, tasks, goals, projects });
    const todayEvents = React.useMemo(() => {
        return getEventsForDay(new Date());
    }, [themes, tasks, goals, projects, getEventsForDay]);

    const missionCount = React.useMemo(() => {
        const pendingTasks = todayEvents.tasks.filter(t => t.status === 'pending').length;
        const pendingGoals = todayEvents.goals.filter(g => !g.isCompletedToday).length;
        const pendingReviews = todayEvents.reviews.filter(r => r.status !== 'completed').length;
        const pendingIntros = todayEvents.intros.length;
        return pendingTasks + pendingGoals + pendingReviews + pendingIntros;
    }, [todayEvents]);

    const projectCount = React.useMemo(() => {
        // Count goals that are linked to themes of category 'project'
        const themeProjectIds = themes.filter(t => t.category === 'project').map(t => t.id);
        const linkedGoalsCount = goals.filter(g => g.relatedThemeId && themeProjectIds.includes(g.relatedThemeId)).length;

        const standaloneProjectsCount = projects.length;
        return linkedGoalsCount + standaloneProjectsCount;
    }, [themes, goals, projects]);

    // Use Layout Modals Hook
    const modals = useLayoutModals(!!activeFocus, setIsSummaryModalOpen, isMissionModalOpen, setIsMissionModalOpen);

    // Auto-close overlaying UI when Focus Mode starts (logic moved to hook mostly, but sidebar/mobilemenu manual handling might be needed if not in hook)
    // Hook handles: summary, mission, task, goal, theme, sidebar.
    // We still have MobileMenu here.
    useEffect(() => {
        if (activeFocus) {
            setIsMobileMenuOpen(false);
        }
    }, [activeFocus]);


    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Scroll Detection for Header
    const mainRef = useRef<HTMLDivElement>(null);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = mainRef.current?.scrollTop || 0;

            // Header only visible at the very top to avoid clashing with sticky subtitles/calendar
            if (currentScrollY < 10) {
                setIsHeaderVisible(true);
            } else if (currentScrollY > lastScrollY.current + 50) {
                // Large down scroll always hides
                setIsHeaderVisible(false);
            } else if (currentScrollY < lastScrollY.current - 100) {
                // Only show on significant up-scroll if we want that, 
                // but user asked to "oculte o de cima", so we'll keep it hidden except at top.
                setIsHeaderVisible(false);
            }

            lastScrollY.current = currentScrollY;
        };

        const mainElement = mainRef.current;
        if (mainElement) {
            mainElement.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => {
            if (mainElement) {
                mainElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const { settings: pomoSettings, isActive, mode } = usePomodoroState();
    const { startAudio, stopAudio, isPlaying } = useAudio();

    // Auto-start/stop audio based on Pomodoro state
    const prevIsActive = useRef(isActive);
    useEffect(() => {
        // DISABLED: Auto-start audio - users can manually enable in Pomodoro widget
        // if (isActive && mode === 'focus' && !prevIsActive.current) {
        //     startAudio();
        // }
        // When focus session stops (isActive goes from true to false)
        if (!isActive && prevIsActive.current && isPlaying) {
            stopAudio();
        }
        prevIsActive.current = isActive;
    }, [isActive, mode, startAudio, stopAudio, isPlaying]);

    const isStrictFocus = pomoSettings.strictMode && isActive && mode === 'focus';
    const showSidebar = (!zenMode && !isStrictFocus) && (modals.state.isSidebarOpen || window.innerWidth >= 768);

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden relative" style={{ scrollbarGutter: 'stable' }}>

            {/* Sidebar Desktop */}
            <Sidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                zenMode={zenMode}
                user={user}
                logout={logout}
                showSidebar={showSidebar}
                isSidebarOpen={modals.state.isSidebarOpen}
                onCloseSidebar={() => modals.actions.setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <Header
                    isPWA={isPWA}
                    isIOS={isIOS}
                    safeAreaTopClass={safeAreaTopClass}
                    isHeaderVisible={isHeaderVisible}
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    zenMode={zenMode}
                    toggleZenMode={toggleZenMode}
                    setIsMissionModalOpen={modals.actions.setIsMissionModalOpen} // Use action from hook
                    setIsSummaryModalOpen={setIsSummaryModalOpen}
                    setIsTaskModalOpen={modals.actions.setIsTaskModalOpen} // Use action from hook
                    isSidebarOpen={modals.state.isSidebarOpen}
                    setIsSidebarOpen={modals.actions.setIsSidebarOpen}
                    setIsThemeModalOpen={modals.actions.setIsThemeModalOpen}
                    syncStatus={syncStatus}
                    clearSyncQueue={clearSyncQueue}
                    time={time}
                    user={user}
                    onTabChange={onTabChange}
                    logout={logout}
                    missionCount={missionCount}
                    projectCount={projectCount}
                />

                {/* Modals */}
                <LayoutModals
                    modals={modals}
                    isSummaryModalOpen={isSummaryModalOpen}
                    setIsSummaryModalOpen={setIsSummaryModalOpen}
                    zenMode={zenMode}
                />



                {/* Scrollable Area */}
                <main
                    ref={mainRef}
                    className={cn(
                        "flex-1 overflow-y-scroll custom-scrollbar overscroll-none px-4 md:px-8 relative",
                        isPWA && isIOS ? "pt-20 pb-32" : "pt-18 pb-24 md:pb-8", // Aligned with h-18 header
                        safeAreaBottomClass // Ensure content doesn't get cut by home bar
                    )}
                >
                    {/* Zen Mode Backdrop Override */}
                    {zenMode && <div className="fixed inset-0 bg-slate-950/20 backdrop-grayscale pointer-events-none z-0" />}

                    <div className="max-w-6xl mx-auto w-full relative z-10 h-full flex flex-col">
                        {children}
                    </div>
                </main>

                {/* Mobile Bottom Navigation (Visible only on mobile) */}
                <div className={cn("md:hidden", safeAreaBottomClass)}>
                    <MobileBottomNav
                        activeTab={activeTab}
                        onTabChange={onTabChange}
                        onOpenMission={() => modals.actions.setIsMissionModalOpen(true)}
                        missionCount={missionCount}
                    />
                </div>

                {/* Hints */}
                <InstallPWAHint />

                <GlobalActionBar />
                <PomodoroWidget />
                <OfflineIndicator />

            </div >
        </div >
    );
};
