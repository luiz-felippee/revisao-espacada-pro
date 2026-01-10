import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Battery, Zap, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useInsights, type Insight } from '../../../hooks/useInsights';
import { clsx } from 'clsx';

export const AIInsightsWidget: React.FC = () => {
    const { insights, energyLevel } = useInsights();

    const getEnergyColor = (level: number) => {
        if (level > 70) return 'text-emerald-400';
        if (level > 40) return 'text-amber-400';
        return 'text-rose-400';
    };

    const getInsightIcon = (type: Insight['type']) => {
        switch (type) {
            case 'burnout': return <AlertCircle className="w-5 h-5 text-rose-400" />;
            case 'productivity': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
            case 'schedule': return <Zap className="w-5 h-5 text-amber-400" />;
            case 'positive': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
        }
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <Brain className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-200">Insights de Estudo com IA</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Energy Level Card */}
                <motion.div
                    whileHover={{ y: -2 }}
                    className="relative overflow-hidden p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-slate-400">Bateria Mental</span>
                        <Battery className={clsx("w-5 h-5", getEnergyColor(energyLevel))} />
                    </div>

                    <div className="flex items-end gap-2 mb-2">
                        <span className={clsx("text-3xl font-bold", getEnergyColor(energyLevel))}>
                            {energyLevel}%
                        </span>
                        <span className="text-sm text-slate-500 mb-1">estimado</span>
                    </div>

                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${energyLevel}%` }}
                            className={clsx("h-full",
                                energyLevel > 70 ? "bg-emerald-500" :
                                    energyLevel > 40 ? "bg-amber-500" : "bg-rose-500"
                            )}
                        />
                    </div>
                </motion.div>

                {/* Insights List */}
                <div className="md:col-span-2 space-y-3">
                    {insights.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-center py-8">
                            <p className="text-slate-500 text-sm italic">Estude mais para gerar insights...</p>
                        </div>
                    ) : (
                        insights.map((insight, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={clsx(
                                    "p-4 rounded-2xl border flex gap-4 items-start transition-all",
                                    insight.impact === 'high'
                                        ? "bg-rose-500/5 border-rose-500/20"
                                        : "bg-slate-900/50 border-slate-800"
                                )}
                            >
                                <div className="mt-0.5">
                                    {getInsightIcon(insight.type)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-200 text-sm flex items-center justify-between">
                                        {insight.title}
                                        {insight.impact === 'high' && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 uppercase tracking-tighter">
                                                Crítico
                                            </span>
                                        )}
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                        {insight.description}
                                    </p>
                                    {insight.action && (
                                        <button className="mt-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">
                                            {insight.action} →
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};
