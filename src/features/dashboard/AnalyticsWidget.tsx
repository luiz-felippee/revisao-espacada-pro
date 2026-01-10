import { useStudy } from '../../context/StudyContext';
import { Zap, Clock, Target } from 'lucide-react';
import { RetentionChart } from './RetentionChart';

export const AnalyticsWidget = () => {
    const { gamification, goals } = useStudy();
    const defaultStats = { reviewsCompleted: 0, tasksCompleted: 0, habitsCompleted: 0, totalFocusMinutes: 0, dailyXp: 0, lastXpDate: '', dailyHistory: {} };
    const stats = { ...defaultStats, ...(gamification?.stats || {}) };

    // Calculate Stats
    const totalHours = (stats.totalFocusMinutes / 60).toFixed(1);
    const completedGoals = goals.filter(g => g.progress === 100).length;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Chart Section - New Advanced Retention Chart */}
            <div className="lg:col-span-2">
                <RetentionChart />
            </div>

            {/* Metrics Section */}
            <div className="space-y-6">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group hover:bg-slate-800/40 transition-all duration-500 shadow-2xl">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                <Clock className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tempo Total</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <div className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                                {totalHours}
                            </div>
                            <span className="text-xl font-medium text-slate-500">horas</span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-medium text-slate-400">
                            <span>{stats.totalFocusMinutes} minutos totais</span>
                            <span className="text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">Foco Vitalício</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group hover:bg-slate-800/40 transition-all duration-500 shadow-2xl">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                <Target className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Conquistas</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-4xl font-black text-white tracking-tighter">{completedGoals}</div>
                                <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    METAS
                                </div>
                            </div>
                            <div className="pl-4 border-l border-white/10">
                                <div className="text-4xl font-black text-white tracking-tighter">{stats.tasksCompleted}</div>
                                <div className="text-xs font-bold text-blue-400 mt-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    TAREFAS
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
