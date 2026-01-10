import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStudy } from '../../context/StudyContext';
import { Trophy, Zap, Crown, ChevronRight, Star, TrendingUp } from 'lucide-react';
import { getTitleForLevel, getNextTitleForLevel } from '../../config/gamification.config';
import { cn } from '../../lib/utils'; // Assuming this exists

interface ProfessionalHeroProps {
    onClick?: () => void;
}

import { useAuth } from '../../context/AuthContext';

export const ProfessionalHero: React.FC<ProfessionalHeroProps> = ({ onClick }) => {
    const { gamification } = useStudy();
    const { user } = useAuth();
    // Default to level 1 if data is missing to prevent crashes
    const level = gamification?.level || { level: 1, currentXp: 0, nextLevelXp: 500, totalXp: 0 };
    const [isHovered, setIsHovered] = useState(false);

    // Memoize expensive calculations
    const { percentage, currentTitle, nextTitle, remainingXp } = useMemo(() => {
        const pct = Math.min(100, Math.max(0, (level.currentXp / level.nextLevelXp) * 100));
        return {
            percentage: pct || 0,
            currentTitle: getTitleForLevel(level.level || 1),
            nextTitle: getNextTitleForLevel(level.level || 1),
            remainingXp: Math.max(0, (level.nextLevelXp || 0) - (level.currentXp || 0))
        };
    }, [level.currentXp, level.nextLevelXp, level.level]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            onClick={onClick}
            className={cn(
                "group relative w-full overflow-hidden rounded-[2.5rem] bg-slate-900 border border-white/5 shadow-2xl transition-all duration-500 hover:border-blue-500/40 hover:shadow-blue-500/10",
                onClick && "cursor-pointer"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* High-End Background Effects */}
            <div className="absolute inset-0 bg-[#020617]" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5" />

            {/* Moving Light Beam on Hover */}
            <motion.div
                animate={{
                    x: isHovered ? ['-100%', '100%'] : '-100%',
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
            />

            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-opacity duration-1000" style={{ opacity: isHovered ? 0.3 : 0.1 }} />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-1000" style={{ opacity: isHovered ? 0.3 : 0.1 }} />

            <div className="relative z-10 p-5 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-16">

                {/* 1. Identity Section */}
                <div className="flex-1 flex items-center gap-5 md:gap-8">
                    {/* 3D Glass Badge */}
                    <div className="relative w-20 h-20 md:w-28 md:h-28 flex-shrink-0">
                        {/* Level Ring around Avatar */}
                        <svg className="absolute inset-[-8px] w-[calc(100%+16px)] h-[calc(100%+16px)] -rotate-90 pointer-events-none">
                            <circle
                                cx="50%" cy="50%" r="54"
                                className="fill-none stroke-slate-800/40 stroke-[3]"
                            />
                            <motion.circle
                                cx="50%" cy="50%" r="54"
                                className="fill-none stroke-blue-500 stroke-[4]"
                                strokeDasharray="339.3"
                                initial={{ strokeDashoffset: 339.3 }}
                                animate={{ strokeDashoffset: 339.3 - (339.3 * percentage / 100) }}
                                transition={{ duration: 2, ease: "circOut", delay: 0.5 }}
                                strokeLinecap="round"
                            />
                        </svg>

                        <div className="w-full h-full rounded-3xl bg-slate-950 border border-white/10 shadow-2xl flex items-center justify-center transform transition-all duration-700 group-hover:scale-105 overflow-hidden ring-1 ring-white/5">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-20 pointer-events-none" />

                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="Profile"
                                    className="w-full h-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                                    loading="eager"
                                />
                            ) : (
                                <Trophy className="w-12 h-12 text-blue-400 filter drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
                            )}

                            {/* Level Badge Hook */}
                            <div className="absolute top-1 right-1 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-[11px] font-black text-white shadow-xl border border-white/20 z-30">
                                {level.level}
                            </div>
                        </div>

                        {/* XP Notification Dot */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-950 animate-bounce" />
                    </div>

                    <div className="flex flex-col text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-2 justify-start mb-1"
                        >
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Rank Atual
                            </span>
                        </motion.div>
                        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter mb-1 group-hover:text-blue-400 transition-colors duration-500 italic">
                            {currentTitle}
                        </h2>
                        <div className="flex items-center gap-3 justify-start">
                            <div className="flex -space-x-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-4 h-4 rounded-full bg-slate-800 border-[1.5px] border-slate-950" />)}
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest whitespace-nowrap">
                                Próximo: <span className="text-slate-300 ml-1">{nextTitle}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Stats & Progress */}
                <div className="flex-1 w-full md:w-auto bg-white/[0.02] rounded-[2rem] p-8 border border-white/5 backdrop-blur-xl relative overflow-hidden group/stats transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />

                    <div className="flex items-end justify-between mb-5 relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Progresso do Rank</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-mono font-black text-white italic tracking-tighter">
                                    {(level.currentXp || 0).toLocaleString()}
                                </span>
                                <span className="text-sm text-slate-600 font-bold uppercase tracking-widest">
                                    / {(level.nextLevelXp || 500).toLocaleString()} XP
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-black text-blue-400 font-mono tracking-tighter italic">
                                {Math.round(percentage || 0)}%
                            </p>
                        </div>
                    </div>

                    {/* High-Performance Progress Bar */}
                    <div className="relative h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-1">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage || 0}%` }}
                            transition={{ duration: 1.5, ease: "circOut", delay: 0.8 }}
                            className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] relative overflow-hidden"
                        >
                            {/* Animated Shine inside progress */}
                            <motion.div
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                            />
                        </motion.div>
                    </div>

                    <div className="mt-5 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase">Top 5%</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                                <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                                <span>{(remainingXp || 0).toLocaleString()} XP falta</span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-700 group-hover/stats:text-blue-500 group-hover/stats:translate-x-1 transition-all" />
                    </div>
                </div>

            </div>
        </motion.div>
    );
};
