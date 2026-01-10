import { Trophy } from 'lucide-react';
import { getTitleForLevel } from '../../config/gamification.config';

interface OverviewTabProps {
    level: {
        level: number;
        currentXp: number;
        nextLevelXp: number;
        totalXp: number;
    };
}

export const OverviewTab = ({ level }: OverviewTabProps) => {
    const percentage = Math.min(100, Math.max(0, (level.currentXp / level.nextLevelXp) * 100));
    const currentTitle = getTitleForLevel(level.level);

    return (
        <div className="space-y-8">
            {/* Header: Rank & Badge */}
            <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative w-32 h-32 group perspective-1000">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-3xl blur-2xl opacity-40 animate-pulse" />
                    <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-black border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden ring-1 ring-white/10 transform transition-transform duration-500 hover:rotate-y-12 hover:rotate-x-12">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 pointer-events-none" />
                        <div className="relative z-10 flex flex-col items-center">
                            <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
                            <span className="text-4xl font-black text-white drop-shadow-lg mt-2">{level.level}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400 tracking-tight">
                        {currentTitle}
                    </h2>
                    <p className="text-sm font-medium text-slate-400 mt-1">Nível Atual</p>
                </div>
            </div>

            {/* Progress */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 backdrop-blur-md shadow-inner">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Progresso XP</span>
                    <div className="text-right">
                        <span className="text-lg font-bold text-white">{level.currentXp}</span>
                        <span className="text-sm text-slate-500"> / {level.nextLevelXp}</span>
                    </div>
                </div>
                <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }} />
                </div>
                <div className="mt-3 flex justify-between items-center text-xs text-slate-400">
                    <span>Faltam <span className="text-white font-bold">{Math.max(0, (level.nextLevelXp || 0) - (level.currentXp || 0))} XP</span> para o próximo nível</span>
                    <span className="font-bold text-blue-400">{Math.round(percentage || 0)}%</span>
                </div>
            </div>
        </div>
    );
};
