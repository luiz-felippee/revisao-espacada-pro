import React from 'react';
import { Trophy, Medal, Crown, TrendingUp, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface LeaderboardUser {
    id: string;
    name: string;
    avatar?: string;
    xp: number;
    level: number;
    isMe?: boolean;
    trend: 'up' | 'down' | 'stable';
}

interface LeaderboardWidgetProps {
    userXp?: number;
    userLevel?: number;
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({ userXp = 0, userLevel = 1 }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    // Mock Data for "Global/Friend Rankings" (Merged with real user data)
    const competitors: LeaderboardUser[] = [
        { id: '1', name: 'Alex M.', xp: 15420, level: 24, trend: 'up' as const },
        { id: '2', name: 'Sarah Dr.', xp: 12850, level: 20, trend: 'stable' as const },
        { id: 'me', name: 'Você', xp: userXp, level: userLevel, isMe: true, trend: 'up' as const },
        { id: '4', name: 'Gustavo K.', xp: 8200, level: 12, trend: 'down' as const },
        { id: '5', name: 'Elena V.', xp: 7500, level: 11, trend: 'stable' as const },
        { id: '6', name: 'Marco S.', xp: 6200, level: 9, trend: 'up' as const },
        { id: '7', name: 'Lia R.', xp: 5800, level: 8, trend: 'stable' as const },
        { id: '8', name: 'Bruno P.', xp: 4500, level: 7, trend: 'down' as const },
        { id: '9', name: 'Julia T.', xp: 3200, level: 5, trend: 'stable' as const },
        { id: '10', name: 'Daniel F.', xp: 2100, level: 3, trend: 'up' as const },
    ].sort((a, b) => b.xp - a.xp);

    const visibleCompetitors = isExpanded ? competitors : competitors.slice(0, 5);

    return (
        <div className="bg-gradient-to-br from-slate-900/50 via-slate-900/40 to-slate-950/50 backdrop-blur-md border border-white/10 rounded-3xl p-4 md:p-5 shadow-2xl relative overflow-hidden group/leaderboard">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 ring-1 ring-indigo-500/20">
                            <Users className="w-4 h-4 text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-white text-base tracking-tight">Ranking Global</h3>
                    </div>
                    <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        LIGA OURO
                    </span>
                </div>

                {/* Rankings List */}
                <div className="space-y-2 transition-all duration-500 ease-in-out">
                    {visibleCompetitors.map((user, idx) => {
                        const rank = idx + 1;
                        const isTop3 = rank <= 3;

                        return (
                            <div
                                key={user.id}
                                className={cn(
                                    "flex items-center gap-3 p-2.5 rounded-2xl transition-all border",
                                    user.isMe
                                        ? "bg-indigo-500/10 border-indigo-500/30 scale-[1.02] shadow-lg shadow-indigo-500/10"
                                        : "bg-slate-800/30 border-white/5 hover:border-white/10"
                                )}
                            >
                                {/* Rank Icon/Number */}
                                <div className="w-6 flex justify-center shrink-0">
                                    {rank === 1 && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                    {rank === 2 && <Medal className="w-4 h-4 text-slate-300 fill-slate-300" />}
                                    {rank === 3 && <Medal className="w-4 h-4 text-amber-600 fill-amber-600" />}
                                    {rank > 3 && <span className="text-[10px] font-black text-slate-600">{rank}</span>}
                                </div>

                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-white/10 shrink-0 overflow-hidden">
                                    <span className="text-[10px] font-bold text-white uppercase">{user.name.substring(0, 2)}</span>
                                </div>

                                {/* Name & Level */}
                                <div className="min-w-0 flex-1">
                                    <p className={cn(
                                        "text-xs font-bold truncate",
                                        user.isMe ? "text-white" : "text-slate-300"
                                    )}>
                                        {user.name}
                                    </p>
                                    <p className="text-[9px] text-slate-500 font-medium">Nível {user.level}</p>
                                </div>

                                {/* XP */}
                                <div className="text-right">
                                    <p className="text-[10px] font-mono font-black text-white">{user.xp.toLocaleString()}</p>
                                    <p className="text-[8px] text-slate-600 font-bold tracking-tighter uppercase">XP TOTAL</p>
                                </div>

                                {/* Trend */}
                                <div className="ml-1">
                                    {user.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* View Full Ranking */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 w-full py-2 text-[10px] font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest border border-dashed border-slate-800 rounded-xl hover:bg-indigo-500/5 hover:border-indigo-500/20"
                >
                    {isExpanded ? 'Ver Menos' : 'Ver Ranking Completo'}
                </button>
            </div>
        </div>
    );
};
