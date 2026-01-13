import React from 'react';
// usePomodoroContext removed to prevent re-renders
import { Target, CheckCircle2, Clock, TrendingUp, FolderKanban } from 'lucide-react';
import { motion } from 'framer-motion';
import { CalendarWidget } from './CalendarWidget';
// Lazy Load

import { ProfessionalHero } from './ProfessionalHero';
import { GamificationModal } from '../gamification/GamificationModal';
import { RealisticKPICard } from './components/RealisticKPICard';
import { ActiveGoalsWidget } from './components/ActiveGoalsWidget';
import { MissionPreviewWidget } from './components/MissionPreviewWidget';
import { AchievementsSummaryWidget } from './components/AchievementsSummaryWidget';
import { LeaderboardWidget } from './components/LeaderboardWidget';
import { useDashboardData } from '../../hooks/useDashboardData';

interface DashboardProps {
    onNavigate: (tab: string) => void;
    onOpenSummaryModal: () => void;
    setIsMissionModalOpen: (isOpen: boolean) => void;
}


// Lazy Load Chart
const ConsistencyHeatmap = React.lazy(() => import('../../components/analytics/ConsistencyHeatmap').then(m => ({ default: m.ConsistencyHeatmap })));
import { AIInsightsWidget } from './components/AIInsightsWidget';

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenSummaryModal, setIsMissionModalOpen }) => {
    // ... existing hook calls ...

    const {
        zenMode,
        gamification,
        goals,
        themes,
        activeGoals,
        projectCount,
        dueReviews,
        progressPercent,
        isAllDone,
        completedCount,
        totalCount
    } = useDashboardData();



    // const { startFocusSession } = usePomodoroContext(); // UNUSED and causes re-renders
    const [isGamificationModalOpen, setIsGamificationModalOpen] = React.useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 md:space-y-8 pt-4 md:pt-0"
        >

            {/* Professional Gamification Hero */}
            {!zenMode && (
                <motion.div variants={itemVariants}>
                    <ProfessionalHero onClick={() => setIsGamificationModalOpen(true)} />
                </motion.div>
            )}

            {/* Gamification Modal */}
            <GamificationModal
                isOpen={isGamificationModalOpen}
                onClose={() => setIsGamificationModalOpen(false)}
            />

            {/* KPI Cards (Realistic 3D Glass) */}
            <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <motion.div variants={itemVariants}>
                    <RealisticKPICard
                        title="Dias"
                        value={gamification?.streak?.current?.toString() || "0"}
                        icon={TrendingUp}
                        gradient="from-purple-600 to-indigo-600"
                        shadowColor="purple"
                        onClick={() => setIsGamificationModalOpen(true)}
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <RealisticKPICard
                        title="Metas"
                        value={activeGoals.toString()}
                        icon={Target}
                        gradient="from-emerald-500 to-teal-600"
                        shadowColor="emerald"
                        onClick={() => onNavigate('goals')}
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <RealisticKPICard
                        title="Revisões"
                        value={dueReviews.toString()}
                        icon={CheckCircle2}
                        gradient="from-blue-500 to-cyan-500"
                        shadowColor="blue"
                        onClick={() => setIsMissionModalOpen(true)}
                        alert={dueReviews > 0}
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <RealisticKPICard
                        title="Projetos"
                        value={projectCount.toString()}
                        icon={FolderKanban}
                        gradient="from-amber-500 to-orange-600"
                        shadowColor="amber"
                        onClick={onOpenSummaryModal}
                    />
                </motion.div>
            </motion.div>

            {/* Analytics Section (Chart) - Hide in Zen Mode */}
            {!zenMode && (
                <motion.div variants={itemVariants} className="relative group">
                    {/* Decoration */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <React.Suspense fallback={<div className="h-[280px] w-full bg-slate-900/50 rounded-3xl animate-pulse" />}>
                        <ConsistencyHeatmap />
                    </React.Suspense>
                </motion.div>
            )}

            {/* AI Insights & Battery - New Section */}
            {!zenMode && (
                <motion.div variants={itemVariants}>
                    <AIInsightsWidget />
                </motion.div>
            )}

            {/* Main Grid: Goals & Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3): Active Goals List (Detailed) */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <ActiveGoalsWidget goals={goals} onNavigate={onNavigate} />
                </motion.div>

                {/* Right Column (1/3): Widgets */}
                <div className="space-y-6">
                    <motion.div variants={itemVariants}>
                        <CalendarWidget />
                    </motion.div>

                    {/* Today's Mission Preview (Refined) */}
                    <motion.div variants={itemVariants}>
                        <MissionPreviewWidget
                            progressPercent={progressPercent}
                            isAllDone={isAllDone}
                            completedCount={completedCount}
                            totalCount={totalCount}
                            setIsMissionModalOpen={setIsMissionModalOpen}
                        />
                    </motion.div>

                    {/* Achievements Summary */}
                    <motion.div variants={itemVariants}>
                        <AchievementsSummaryWidget
                            unlockedAchievements={gamification?.achievements || []}
                            onNavigate={onNavigate}
                        />
                    </motion.div>

                    {/* Global Leaderboard (Gamification) */}
                    <motion.div variants={itemVariants}>
                        <LeaderboardWidget
                            userXp={gamification?.level?.totalXp || 0}
                            userLevel={gamification?.level?.level || 1}
                        />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
