import React, { useEffect, useState } from 'react';
import { Trophy, Medal, User, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data for now (replace with Supabase query later)
const MOCK_LEADERBOARD = [
    { id: '1', name: 'Mestre Jedi', xp: 12500, level: 42, avatar: 'M' },
    { id: '2', name: 'Padawan Focado', xp: 8900, level: 25, avatar: 'P' },
    { id: '3', name: 'Viajante do Tempo', xp: 7200, level: 18, avatar: 'V' },
    { id: '4', name: 'Estudante Pro', xp: 6500, level: 15, avatar: 'E' },
    { id: '5', name: 'Novato Curioso', xp: 3200, level: 8, avatar: 'N' },
];

export const LeaderboardTab = () => {
    // const { user } = useAuth(); // If we want to highlight current user
    const [loading, setLoading] = useState(false);

    // Simulate fetch
    useEffect(() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 800);
    }, []);

    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />;
        if (index === 1) return <Medal className="w-5 h-5 text-slate-300" />;
        if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className="text-slate-500 font-bold ml-1.5">{index + 1}</span>;
    };

    return (
        <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Top 5 Global
                </h3>

                <div className="space-y-2">
                    {MOCK_LEADERBOARD.map((player, index) => (
                        <motion.div
                            key={player.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${index === 0
                                    ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div className="w-8 flex justify-center">
                                {getRankIcon(index)}
                            </div>

                            <div className="flex items-center gap-3 flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-inner ring-2 ${index === 0 ? 'bg-yellow-600 ring-yellow-500/50 text-white' : 'bg-slate-700 ring-white/10 text-slate-300'
                                    }`}>
                                    {player.avatar}
                                </div>
                                <div>
                                    <div className={`text-sm font-bold ${index === 0 ? 'text-yellow-100' : 'text-slate-200'}`}>
                                        {player.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium">
                                        Nível {player.level}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-sm font-bold text-slate-100 font-mono">
                                    {player.xp.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">XP</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                    <p className="text-xs text-blue-300">
                        Você está no top <strong>15%</strong> dos estudantes essa semana!
                    </p>
                </div>
            </div>
        </div>
    );
};
