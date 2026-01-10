import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { Modal } from '../../components/ui/Modal';
import { Trophy, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LeaderboardTab } from './LeaderboardTab';
import { OverviewTab } from './OverviewTab';
import { AchievementsTab } from './AchievementsTab';
import { XPTableTab } from './XPTableTab';

interface GamificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GamificationModal: React.FC<GamificationModalProps> = ({ isOpen, onClose }) => {
    const { gamification } = useStudy();
    const level = gamification?.level || { level: 1, currentXp: 0, nextLevelXp: 500, totalXp: 0 };
    const achievements = gamification?.achievements || [];
    const [activeTab, setActiveTab] = React.useState<'overview' | 'achievements' | 'xp_table' | 'leaderboard'>('overview');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            maxWidth="full"
            wrapperClassName="!p-1 !justify-start"
            className="!max-w-[calc(100vw-1rem)] !ml-1"
        >
            <div className="relative overflow-hidden p-6 pt-2 min-h-[500px] flex flex-col">
                {/* Realistic Background Layers */}
                <div className="absolute inset-0 bg-slate-950" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center mb-6">
                    {/* Tab Navigation */}
                    <div className="flex p-1 bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/5 mb-6 overflow-x-auto max-w-full">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={cn(
                                "px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                                activeTab === 'overview' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-white"
                            )}
                        >
                            Visão Geral
                        </button>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={cn(
                                "px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5",
                                activeTab === 'leaderboard' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <Globe className="w-3 h-3" />
                            Ranking
                        </button>
                        <button
                            onClick={() => setActiveTab('achievements')}
                            className={cn(
                                "px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5",
                                activeTab === 'achievements' ? "bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <Trophy className="w-3 h-3" />
                            Conquistas
                        </button>
                        <button
                            onClick={() => setActiveTab('xp_table')}
                            className={cn(
                                "px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                                activeTab === 'xp_table' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"
                            )}
                        >
                            Tabela XP
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="w-full animation-fade-in">
                        {activeTab === 'overview' && (
                            <OverviewTab level={level} />
                        )}

                        {activeTab === 'leaderboard' && (
                            <LeaderboardTab />
                        )}

                        {activeTab === 'achievements' && (
                            <AchievementsTab achievements={achievements} />
                        )}

                        {activeTab === 'xp_table' && (
                            <XPTableTab />
                        )}
                    </div>
                </div>
            </div>
        </Modal >
    );
};
