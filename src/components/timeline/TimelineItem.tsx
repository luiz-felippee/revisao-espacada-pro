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
                gradient: 'from-violet-600 via-purple-500 to-fuchsia-500',
                bgGradient: 'from-violet-500/15 to-fuchsia-500/10',
                borderColor: 'border-violet-500/40',
                textColor: 'text-violet-300',
                iconBg: 'bg-gradient-to-br from-violet-500/25 to-fuchsia-500/20',
                badge: item.number ? `${item.number}ª Revisão` : 'Revisão',
                shadowColor: 'shadow-violet-500/30',
            },
            progress: {
                icon: Target,
                gradient: 'from-sky-600 via-blue-500 to-cyan-500',
                bgGradient: 'from-sky-500/15 to-cyan-500/10',
                borderColor: 'border-sky-500/40',
                textColor: 'text-sky-300',
                iconBg: 'bg-gradient-to-br from-sky-500/25 to-cyan-500/20',
                badge: 'Progresso',
                shadowColor: 'shadow-sky-500/30',
            },
            goal: {
                icon: Target,
                gradient: 'from-emerald-600 via-green-500 to-teal-500',
                bgGradient: 'from-emerald-500/15 to-teal-500/10',
                borderColor: 'border-emerald-500/40',
                textColor: 'text-emerald-300',
                iconBg: 'bg-gradient-to-br from-emerald-500/25 to-teal-500/20',
                badge: 'Meta',
                shadowColor: 'shadow-emerald-500/30',
            },
            session: {
                icon: Clock,
                gradient: 'from-orange-600 via-amber-500 to-yellow-500',
                bgGradient: 'from-orange-500/15 to-yellow-500/10',
                borderColor: 'border-orange-500/40',
                textColor: 'text-orange-300',
                iconBg: 'bg-gradient-to-br from-orange-500/25 to-yellow-500/20',
                badge: 'Sessão de Foco',
                shadowColor: 'shadow-orange-500/30',
            },
            completion: {
                icon: CheckCircle2,
                gradient: 'from-lime-600 via-green-500 to-emerald-600',
                bgGradient: 'from-lime-500/15 to-emerald-500/10',
                borderColor: 'border-lime-500/40',
                textColor: 'text-lime-300',
                iconBg: 'bg-gradient-to-br from-lime-500/25 to-emerald-500/20',
                badge: 'Conclusão',
                shadowColor: 'shadow-lime-500/30',
            },
            note: {
                icon: StickyNote,
                gradient: 'from-amber-600 via-yellow-500 to-orange-500',
                bgGradient: 'from-amber-500/15 to-orange-500/10',
                borderColor: 'border-amber-500/40',
                textColor: 'text-amber-300',
                iconBg: 'bg-gradient-to-br from-amber-500/25 to-orange-500/20',
                badge: 'Nota',
                shadowColor: 'shadow-amber-500/30',
            },
        };
        return configs[type];
    };

    const config = getItemConfig(item.type);
    const Icon = config.icon;

    // Use entityTitle from metadata if available, otherwise use title
    const displayTitle = item.metadata?.entityTitle || item.title || 'Atividade sem título';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="relative group mb-8 hover:translate-x-2 transition-transform duration-300"
        >
            {/* Card com Glassmorphism */}
            <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${config.bgGradient} backdrop-blur-xl border ${config.borderColor} shadow-xl ${config.shadowColor} hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 overflow-hidden`}>
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl`} />

                {/* Header com Badge e Horário */}
                <div className="relative flex items-start justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-xl ${config.iconBg} border ${config.borderColor} flex items-center justify-center shadow-lg ${config.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={`w-7 h-7 ${config.textColor}`} />
                        </div>

                        {/* Badge */}
                        <div className={`px-5 py-2 rounded-xl bg-gradient-to-r ${config.gradient} text-white shadow-lg font-bold text-sm uppercase tracking-wider`}>
                            {config.badge}
                        </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-3 text-slate-400">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold text-base">{formatTime(item.timestamp)}</span>
                    </div>
                </div>

                {/* Título da Atividade */}
                <h3 className={`text-2xl font-bold ${config.textColor} mb-5 line-clamp-2 leading-tight`}>
                    {displayTitle}
                </h3>

                {/* Descrição */}
                {item.description && (
                    <p className="text-slate-300 text-base mb-8 line-clamp-2 leading-relaxed">
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
