import React from 'react';
import { motion } from 'framer-motion';
import {
    RotateCcw,
    Target,
    Clock,
    CheckCircle2,
    StickyNote,
    ChevronRight
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
            month: 'long',
            year: 'numeric'
        });
    };

    const getItemConfig = (type: SummaryEntry['type']) => {
        const configs = {
            review: {
                icon: RotateCcw,
                color: 'from-purple-500 to-purple-600',
                bgColor: 'bg-purple-500/10',
                borderColor: 'border-purple-500/30',
                textColor: 'text-purple-400',
                iconBg: 'bg-purple-500/20',
                badge: item.number ? `${item.number}ª REVISÃO` : 'REVISÃO',
            },
            progress: {
                icon: Target,
                color: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-500/10',
                borderColor: 'border-blue-500/30',
                textColor: 'text-blue-400',
                iconBg: 'bg-blue-500/20',
                badge: 'PROGRESSO',
            },
            goal: {
                icon: Target,
                color: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-500/10',
                borderColor: 'border-blue-500/30',
                textColor: 'text-blue-400',
                iconBg: 'bg-blue-500/20',
                badge: 'META',
            },
            session: {
                icon: Clock,
                color: 'from-orange-500 to-orange-600',
                bgColor: 'bg-orange-500/10',
                borderColor: 'border-orange-500/30',
                textColor: 'text-orange-400',
                iconBg: 'bg-orange-500/20',
                badge: 'FOCO',
            },
            completion: {
                icon: CheckCircle2,
                color: 'from-green-500 to-green-600',
                bgColor: 'bg-green-500/10',
                borderColor: 'border-green-500/30',
                textColor: 'text-green-400',
                iconBg: 'bg-green-500/20',
                badge: 'CONCLUSÃO',
            },
            note: {
                icon: StickyNote,
                color: 'from-yellow-500 to-yellow-600',
                bgColor: 'bg-yellow-500/10',
                borderColor: 'border-yellow-500/30',
                textColor: 'text-yellow-400',
                iconBg: 'bg-yellow-500/20',
                badge: 'NOTA',
            },
        };
        return configs[type];
    };

    const config = getItemConfig(item.type);
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-6 mb-6 group"
        >
            {/* Timeline Icon */}
            <div className="relative z-10 flex-shrink-0">
                <div className={`w-16 h-16 rounded-2xl ${config.iconBg} border ${config.borderColor} flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${config.textColor}`} />
                </div>
            </div>

            {/* Content Card */}
            <div className={`flex-1 min-w-0 p-5 rounded-xl ${config.bgColor} border ${config.borderColor} backdrop-blur-sm hover:bg-opacity-80 transition-all duration-300 group-hover:scale-[1.02]`}>
                <div className="flex items-start justify-between mb-3 flex-wrap gap-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h3 className={`text-lg font-bold ${config.textColor} break-words`}>
                            {item.title || 'Sem título'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${config.color} text-white shadow-lg`}>
                            {config.badge}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{formatTime(item.timestamp)}</span>
                    </div>
                </div>

                {item.description && (
                    <p className="text-slate-300 mb-3 break-words">{item.description}</p>
                )}

                {/* Extra Info */}
                <div className="flex items-center gap-4 text-sm">
                    {item.metadata?.goalProgress !== undefined && (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden w-32">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.metadata.goalProgress}%` }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                    className={`h-full bg-gradient-to-r ${config.color}`}
                                />
                            </div>
                            <span className={`font-semibold ${config.textColor}`}>
                                {item.metadata.goalProgress}%
                            </span>
                        </div>
                    )}
                    {item.metadata?.sessionDuration !== undefined && (
                        <div className="flex items-center gap-2">
                            <Clock className={`w-4 h-4 ${config.textColor}`} />
                            <span className={config.textColor}>
                                {item.metadata.sessionDuration} min
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-500 ml-auto">
                        <span className="text-xs">{formatDate(item.timestamp)}</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
