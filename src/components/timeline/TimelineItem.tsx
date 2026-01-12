import React from 'react';
import { motion } from 'framer-motion';
import {
    RotateCcw,
    Target,
    Clock,
    CheckCircle2,
    StickyNote,
    Timer,
    Calendar
} from 'lucide-react';
import type { SummaryEntry } from '../../types';

interface TimelineItemProps {
    item: SummaryEntry;
    index: number;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ item, index }) => {
    const formatTime = (isoDate: string) => {
        return new Date(isoDate).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (isoDate: string) => {
        return new Date(isoDate).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getItemConfig = (type: SummaryEntry['type']) => {
        const configs = {
            review: {
                icon: RotateCcw,
                gradient: 'from-purple-600 via-purple-500 to-indigo-500',
                bgGradient: 'from-purple-500/10 to-indigo-500/5',
                borderColor: 'border-purple-500/30',
                textColor: 'text-purple-400',
                iconBg: 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20',
                badge: item.number ? `${item.number}ª Revisão` : 'Revisão',
                shadowColor: 'shadow-purple-500/20',
            },
            progress: {
                icon: Target,
                gradient: 'from-blue-600 via-blue-500 to-cyan-500',
                bgGradient: 'from-blue-500/10 to-cyan-500/5',
                borderColor: 'border-blue-500/30',
                textColor: 'text-blue-400',
                iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
                badge: 'Progresso',
                shadowColor: 'shadow-blue-500/20',
            },
            goal: {
                icon: Target,
                gradient: 'from-emerald-600 via-emerald-500 to-teal-500',
                bgGradient: 'from-emerald-500/10 to-teal-500/5',
                borderColor: 'border-emerald-500/30',
                textColor: 'text-emerald-400',
                iconBg: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
                badge: 'Meta',
                shadowColor: 'shadow-emerald-500/20',
            },
            session: {
                icon: Clock,
                gradient: 'from-orange-600 via-orange-500 to-amber-500',
                bgGradient: 'from-orange-500/10 to-amber-500/5',
                borderColor: 'border-orange-500/30',
                textColor: 'text-orange-400',
                iconBg: 'bg-gradient-to-br from-orange-500/20 to-amber-500/20',
                badge: 'Sessão de Foco',
                shadowColor: 'shadow-orange-500/20',
            },
            completion: {
                icon: CheckCircle2,
                gradient: 'from-green-600 via-green-500 to-emerald-500',
                bgGradient: 'from-green-500/10 to-emerald-500/5',
                borderColor: 'border-green-500/30',
                textColor: 'text-green-400',
                iconBg: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
                badge: 'Conclusão',
                shadowColor: 'shadow-green-500/20',
            },
            note: {
                icon: StickyNote,
                gradient: 'from-yellow-600 via-yellow-500 to-amber-500',
                bgGradient: 'from-yellow-500/10 to-amber-500/5',
                borderColor: 'border-yellow-500/30',
                textColor: 'text-yellow-400',
                iconBg: 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20',
                badge: 'Nota',
                shadowColor: 'shadow-yellow-500/20',
            },
        };
        return configs[type];
    };

    const config = getItemConfig(item.type);
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="relative group"
        >
            {/* Card com Glassmorphism */}
            <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${config.bgGradient} backdrop-blur-xl border ${config.borderColor} shadow-xl ${config.shadowColor} hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 overflow-hidden`}>
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl`} />

                {/* Header com Badge e Horário */}
                <div className="relative flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl ${config.iconBg} border ${config.borderColor} flex items-center justify-center shadow-lg ${config.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={`w-6 h-6 ${config.textColor}`} />
                        </div>

                        {/* Badge */}
                        <div className={`px-4 py-1.5 rounded-xl bg-gradient-to-r ${config.gradient} text-white shadow-lg font-bold text-xs uppercase tracking-wider`}>
                            {config.badge}
                        </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold text-sm">{formatTime(item.timestamp)}</span>
                    </div>
                </div>

                {/* Título da Atividade */}
                <h3 className={`text-xl font-bold ${config.textColor} mb-2 line-clamp-2 leading-tight`}>
                    {item.title || 'Atividade sem título'}
                </h3>

                {/* Descrição */}
                {item.description && (
                    <p className="text-slate-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {item.description}
                    </p>
                )}

                {/* Info Footer */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4">
                        {/* Duração da Sessão */}
                        {item.metadata?.sessionDuration !== undefined && (
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border ${config.borderColor}`}>
                                <Timer className={`w-4 h-4 ${config.textColor}`} />
                                <span className={`font-bold ${config.textColor}`}>
                                    {item.metadata.sessionDuration} min
                                </span>
                            </div>
                        )}

                        {/* Progresso da Meta */}
                        {item.metadata?.goalProgress !== undefined && (
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden w-24 border border-slate-600/30">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.metadata.goalProgress}%` }}
                                        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                                        className={`h-full bg-gradient-to-r ${config.gradient}`}
                                    />
                                </div>
                                <span className={`font-bold ${config.textColor} text-sm`}>
                                    {item.metadata.goalProgress}%
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Data */}
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-medium">{formatDate(item.timestamp)}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
