import React from 'react';
import { Trophy, Star, Lock, ChevronRight } from 'lucide-react';
import { GAME_ACHIEVEMENTS } from '../../../config/achievements';
import type { Achievement } from '../../../types/gamification';
import * as Icons from 'lucide-react';
import { cn } from '../../../lib/utils';

interface AchievementsSummaryWidgetProps {
    unlockedAchievements: Achievement[];
    onNavigate: (tab: string) => void;
}

export const AchievementsSummaryWidget: React.FC<AchievementsSummaryWidgetProps> = ({ unlockedAchievements, onNavigate }) => {
    const totalCount = GAME_ACHIEVEMENTS.length;
    const unlockedCount = unlockedAchievements.length;

    // Get last 3 unlocked in reverse chronological order
    const recentAchievements = [...unlockedAchievements]
        .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
        .slice(0, 3);

    // Fill with locked if empty? No, just show what we have.

    return (
        <div className="bg-gradient-to-br from-slate-900/50 via-slate-900/40 to-slate-950/50 backdrop-blur-md border border-white/10 rounded-3xl p-4 md:p-5 shadow-2xl relative overflow-hidden group/achievements">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500/60 via-orange-500/60 to-transparent opacity-60" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-yellow-500/10 ring-1 ring-yellow-500/20">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                        </div>
                        <h3 className="font-bold text-white text-base tracking-tight">Conquistas</h3>
                    </div>
                    <span className="text-[10px] font-black text-yellow-500/80 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                        {unlockedCount}/{totalCount}
                    </span>
                </div>

                {/* Progress Bar (Radial or linear?) Let's go linear for a compact widget */}
                <div className="mb-6">
                    <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5">
                        <span>Minhas Medalhas</span>
                        <span>{Math.round((unlockedCount / totalCount) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 p-[1px]">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Recent Unlocks List */}
                <div className="space-y-3">
                    {recentAchievements.length > 0 ? (
                        recentAchievements.map((achievement) => {
                            const Icon = (Icons as any)[achievement.iconName] || Trophy;
                            return (
                                <div key={achievement.id} className="flex items-center gap-3 p-2 bg-slate-800/40 rounded-xl border border-white/5 hover:bg-slate-800/60 transition-colors">
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg">
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-white truncate">{achievement.title}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{achievement.description}</p>
                                    </div>
                                    <Star className="w-3 h-3 text-yellow-500 ml-auto fill-yellow-500" />
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                            <Lock className="w-6 h-6 text-slate-600 mb-2" />
                            <p className="text-[10px] text-slate-500 font-medium">Continue focado!</p>
                        </div>
                    )}
                </div>

                {/* View All Button */}
                <button
                    onClick={() => onNavigate('analytics')}
                    className="mt-4 w-full py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-white/10 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                >
                    GALERIA DE TROFÉUS
                    <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};
