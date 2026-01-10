import React from 'react';
import { GAME_ACHIEVEMENTS } from '../../../config/achievements';
import type { Achievement } from '../../../types/gamification';
import * as Icons from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Lock, CheckCircle2 } from 'lucide-react';

interface AchievementsListProps {
    unlockedAchievements: Achievement[];
}

export const AchievementsList: React.FC<AchievementsListProps> = ({ unlockedAchievements }) => {
    return (
        <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group">
            {/* Ambient Light */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <Icons.Trophy className="w-6 h-6 text-yellow-500" />
                        Conquistas
                    </h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                        {unlockedAchievements.length} de {GAME_ACHIEVEMENTS.length} desbloqueadas
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                {GAME_ACHIEVEMENTS.map((config) => {
                    const unlocked = unlockedAchievements.find(a => a.id === config.id);
                    const Icon = (Icons as any)[config.iconName] || Icons.Trophy;

                    return (
                        <div
                            key={config.id}
                            className={cn(
                                "relative p-4 rounded-2xl border transition-all duration-500 group/achievement overflow-hidden",
                                unlocked
                                    ? "bg-slate-800/40 border-yellow-500/20 shadow-lg shadow-yellow-500/5"
                                    : "bg-slate-950/40 border-white/5 opacity-60 grayscale"
                            )}
                        >
                            {/* Unlocked Shine */}
                            {unlocked && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent -translate-x-full group-hover/achievement:translate-x-full transition-transform duration-1000" />
                            )}

                            <div className="flex items-center gap-4 relative z-10">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner",
                                    unlocked
                                        ? "bg-gradient-to-br from-yellow-400 to-orange-600 text-white"
                                        : "bg-slate-800 text-slate-600"
                                )}>
                                    {unlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className={cn(
                                        "text-sm font-bold truncate",
                                        unlocked ? "text-white" : "text-slate-500"
                                    )}>
                                        {config.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 leading-tight line-clamp-2 mt-0.5">
                                        {config.description}
                                    </p>
                                </div>

                                {unlocked && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                )}
                            </div>

                            {/* Progress bar (Visual only for now since we don't track steps) */}
                            {!unlocked && (
                                <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-slate-700 w-1/3" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
