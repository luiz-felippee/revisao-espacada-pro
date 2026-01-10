import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { StatCard } from './components/StatCard';
import { WeeklyFocusChart } from './components/WeeklyFocusChart';
import { HeatmapWidget } from './components/HeatmapWidget';
import { RetentionChart } from './components/RetentionChart';
import { Clock, TrendingUp, Zap, Trophy } from 'lucide-react';
import { DetailedStatsTable } from './components/DetailedStatsTable';
import { AchievementsList } from './components/AchievementsList';
import { CategoryDistributionChart } from './components/CategoryDistributionChart';
import { XPProgressionChart } from './components/XPProgressionChart';

export const AnalyticsPage: React.FC = () => {
    const { gamification, themes, tasks, goals } = useStudy();
    const stats = gamification.stats || {};
    const totalMinutes = stats.totalFocusMinutes || 0;
    const streak = gamification.streak?.current || 0;
    const level = gamification.level?.level || 1;

    // Calculate Average Retention
    const allCompletedReviews = themes.flatMap(t => t.subthemes.flatMap(st => st.reviews.filter(r => r.status === 'completed')));
    const avgRetention = allCompletedReviews.length === 0
        ? 0
        : Math.round(allCompletedReviews.reduce((acc, r) => {
            switch (r.difficulty) {
                case 'easy': return acc + 100;
                case 'hard': return acc + 60;
                default: return acc + 90;
            }
        }, 0) / allCompletedReviews.length);

    return (
        <div className="pb-20 space-y-8 animate-in fade-in duration-500">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            {/* Header */}
            <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                        Estatísticas de Estudo
                    </h1>
                </div>
                <p className="text-slate-400/80 font-medium ml-1">Visualize seu progresso e mantenha a consistência.</p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Tempo Total"
                    value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
                    icon={Clock}
                    color="blue"
                    description="Desde o início da jornada"
                />
                <StatCard
                    title="Sequência (Streak)"
                    value={`${streak} Dias`}
                    icon={Zap}
                    color="amber"
                    trend={{ value: 100, isPositive: true }}
                />
                <StatCard
                    title="Nível Atual"
                    value={`Lvl ${level}`}
                    icon={Trophy}
                    color="purple"
                    description={`${gamification.level?.totalXp || 0} XP acumulado`}
                />
                <StatCard
                    title="Retenção Média"
                    value={`${avgRetention}%`}
                    icon={TrendingUp}
                    color="emerald"
                    description={`${allCompletedReviews.length} revisões feitas`}
                />
            </div>

            {/* XP Progression Chart - Full Width */}
            <XPProgressionChart
                dailyHistory={stats.dailyHistory || {}}
                currentXP={gamification.level?.totalXp || 0}
                currentLevel={level}
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <WeeklyFocusChart dailyHistory={stats.dailyHistory || {}} />
                </div>
                <div className="lg:col-span-1">
                    <CategoryDistributionChart themes={themes} tasks={tasks} goals={goals} />
                </div>
            </div>

            {/* Achievements & Secondary Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <AchievementsList unlockedAchievements={gamification.achievements || []} />
                </div>
                <div className="lg:col-span-1">
                    <RetentionChart themes={themes} />
                </div>
            </div>

            {/* Drill-Down Detailed Stats */}
            <DetailedStatsTable themes={themes} tasks={tasks} goals={goals} />

            {/* Heatmap Full Width */}
            <HeatmapWidget dailyHistory={stats.dailyHistory || {}} />

        </div>
    );
};
