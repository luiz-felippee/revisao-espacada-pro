import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/AuthContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useGuestReset } from './hooks/useGuestReset';
import { useAutoMigrator } from './hooks/useAutoMigrator';
import { StudyProvider } from './context/StudyProvider';
import { ProjectProvider } from './context/ProjectProvider';
import { PomodoroProvider } from './context/PomodoroProvider';
import { ToastProvider } from './context/ToastProvider';
import { ConfirmProvider } from './context/ConfirmProvider';
import { UIThemeProvider } from './context/UIThemeProvider';
import { SyncStatusWatcher } from './components/SyncStatusWatcher';
import { AudioProvider } from './context/AudioProvider';
import { AppearanceProvider } from './context/AppearanceContext';
import { QueryProvider } from './context/QueryProvider';
import { HelmetProvider } from 'react-helmet-async';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './features/auth/LoginPage';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { GlobalSearch } from './components/GlobalSearch';
import { NotificationPermissionBanner } from './components/NotificationPermissionBanner';
import { OnboardingTour } from './components/onboarding/OnboardingTour';
import { PWAPrompt } from './components/PWAPrompt';
import { SyncStatusIndicator } from './components/SyncStatusIndicator';
import { SyncDiagnostic } from './components/SyncDiagnostic';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Lazy load pages for better initial bundle size
const Dashboard = lazy(() => import('./features/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const Calendar = lazy(() => import('./features/calendar/Calendar').then(module => ({ default: module.Calendar })));
const ThemeList = lazy(() => import('./features/lists/ThemeList').then(module => ({ default: module.ThemeList })));
const ProjectList = lazy(() => import('./features/lists/ProjectList').then(module => ({ default: module.ProjectList })));
const GoalList = lazy(() => import('./features/lists/GoalList').then(module => ({ default: module.GoalList })));
const TaskList = lazy(() => import('./features/lists/TaskList').then(module => ({ default: module.TaskList })));
const AnalyticsPage = lazy(() => import('./features/analytics/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const Settings = lazy(() => import('./features/settings/Settings').then(module => ({ default: module.Settings })));
const SummariesPage = lazy(() => import('./features/summaries/SummariesPage').then(module => ({ default: module.SummariesPage })));
const SummaryDemo = lazy(() => import('./pages/SummaryDemo'));


function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" variant="primary" />
        <p className="text-slate-400 text-sm animate-pulse">Carregando...</p>
      </div>
    </div>
  );
}

// Wrapper to provide navigation prop to Dashboard
const DashboardWrapper = ({ setIsSummaryModalOpen, setIsMissionModalOpen }: { setIsSummaryModalOpen: (v: boolean) => void, setIsMissionModalOpen: (v: boolean) => void }) => {
  const navigate = useNavigate();
  return (
    <Dashboard
      onNavigate={(path) => navigate(`/${path}`)}
      onOpenSummaryModal={() => setIsSummaryModalOpen(true)}
      setIsMissionModalOpen={setIsMissionModalOpen}
    />
  );
};

function AppContent() {
  const { user } = useAuth();
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Hooks de infraestrutura extraídos para Clean Code
  useKeyboardShortcuts(() => setIsSearchOpen(true));
  useGuestReset(user?.id);
  useAutoMigrator(); // 🔄 Auto-migra tasks antigas
  const { showPWAPrompt, handlePWAInstall, handlePWADismiss, platform } = usePWAInstall();

  // If not logged in, show Login Page directly (Personal Use Mode)
  if (!user) {
    return <LoginPage />;
  }

  return (
    <StudyProvider key={user.id}> {/* Key forces reset when user changes */}
      <ProjectProvider>
        <PomodoroProvider>
          {/* Global Search Modal */}
          <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

          {/* Notification Permission Banner */}
          <NotificationPermissionBanner />

          {/* Onboarding Tour */}
          <OnboardingTour />

          {/* Sync Status Indicator */}
          <SyncStatusIndicator />

          {/* PWA Install Prompt */}
          {showPWAPrompt && (
            <PWAPrompt
              onInstall={handlePWAInstall}
              onDismiss={handlePWADismiss}
              platform={platform}
            />
          )}

          {/* 🔍 Sync Diagnostic Tool */}
          <SyncDiagnostic />

          <MainLayout
            isSummaryModalOpen={isSummaryModalOpen}
            setIsSummaryModalOpen={setIsSummaryModalOpen}
            isMissionModalOpen={isMissionModalOpen}
            setIsMissionModalOpen={setIsMissionModalOpen}
          >
            <main className="flex-1 relative overflow-x-hidden pb-24 lg:pb-0 min-h-screen">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "linear" }}
                  className="p-4 md:px-8 md:pb-8 max-w-[1600px] mx-auto"
                >
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes location={location} key={location.pathname}>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<DashboardWrapper setIsSummaryModalOpen={setIsSummaryModalOpen} setIsMissionModalOpen={setIsMissionModalOpen} />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/summaries" element={<SummariesPage />} />
                      <Route path="/themes" element={<ThemeList />} />
                      <Route path="/projects" element={<ProjectList />} />
                      <Route path="/goals" element={<GoalList />} />
                      <Route path="/tasks" element={<TaskList />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/summary-demo" element={<SummaryDemo />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </main>
          </MainLayout>
        </PomodoroProvider>
      </ProjectProvider>
    </StudyProvider>
  );
}

import { ContextComposer } from './components/utils/ContextComposer';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ContextComposer providers={[
          <QueryProvider children={null} />,
          <AuthProvider children={null} />,
          <AppearanceProvider children={null} />,
          <ToastProvider children={null} />,
          <ConfirmProvider children={null} />,
          <UIThemeProvider children={null} />,
          <AudioProvider children={null} />
        ]}>
          <SyncStatusWatcher />
          <AppContent />
        </ContextComposer>

        {/* Vercel Analytics & Speed Insights */}
        <Analytics />
        <SpeedInsights />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;

