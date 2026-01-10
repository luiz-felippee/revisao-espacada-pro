import React from 'react';
import { Target, ChevronRight, Clock, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyStateWidget } from '../../../components/ui/EmptyStateWidget';

interface ActiveGoalsWidgetProps {
    goals: any[];
    onNavigate: (tab: string) => void;
}

export const ActiveGoalsWidget = ({ goals, onNavigate }: ActiveGoalsWidgetProps) => {
    return (
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-5 md:p-8 shadow-xl relative overflow-hidden h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Metas em Progresso</h3>
                        <p className="text-slate-400 text-xs text-medium">Continue avançando para manter o ritmo.</p>
                    </div>
                </div>
                {goals.length > 0 && (
                    <button onClick={() => onNavigate('goals')} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                        VER TODAS <ChevronRight className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* List */}
            {goals.length === 0 ? (
                <EmptyStateWidget
                    icon={Target}
                    title="Sem metas ativas"
                    description="Defina objetivos claros para alcançar seus sonhos mais rápido."
                    actionLabel="CRIAR NOVA META"
                    onAction={() => onNavigate('goals')}
                    gradient="from-emerald-500 to-teal-600"
                    className="h-full"
                />
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {goals.filter((g: any) => g.progress < 100 && !g.relatedThemeId).slice(0, 3).map((goal: any, index: number) => (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative bg-slate-800/20 hover:bg-slate-800/50 border border-white/5 hover:border-emerald-500/30 rounded-2xl p-5 transition-all duration-300 cursor-pointer"
                                onClick={() => onNavigate('goals')}
                            >
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div className="flex flex-col">
                                        <h4 className="font-bold text-slate-200 group-hover:text-white transition-colors text-base md:text-lg">{goal.title}</h4>
                                        {goal.deadline && (
                                            <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" />
                                                Até {format(new Date(goal.deadline), 'dd MMM')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500 bg-slate-950/50 px-2 py-1 rounded-lg border border-slate-800 font-mono">
                                            {goal.progress}%
                                        </span>
                                    </div>
                                </div>

                                <div className="relative h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${goal.progress}%` }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};
