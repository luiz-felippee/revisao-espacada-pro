import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RotateCcw,
    Target,
    Clock,
    CheckCircle2,
    StickyNote,
    Sparkles,
    ChevronRight,
    Calendar
} from 'lucide-react';

interface TimelineItem {
    id: string;
    type: 'review' | 'progress' | 'focus' | 'completion' | 'note';
    title: string;
    description: string;
    timestamp: Date;
    badge?: string;
    progress?: number;
    duration?: number;
}

const SummaryDemo = () => {
    const [items, setItems] = useState<TimelineItem[]>([]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const addTimelineItem = (type: TimelineItem['type']) => {
        const timestamp = new Date();
        const newItem: TimelineItem = {
            id: `${type}-${Date.now()}`,
            type,
            timestamp,
            title: '',
            description: '',
        };

        switch (type) {
            case 'review':
                newItem.title = 'Revisão Espaciada Concluída';
                newItem.description = '1ª Revisão completada com sucesso';
                break;
            case 'progress':
                newItem.title = 'Meta Atualizada';
                newItem.description = 'Progresso da meta atualizado';
                newItem.progress = 20;
                break;
            case 'focus':
                newItem.title = 'Sessão de Foco Profundo';
                newItem.description = 'Pomodoro concluído';
                newItem.duration = 25;
                newItem.badge = 'FOCO';
                break;
            case 'completion':
                newItem.title = 'Atividade Concluída';
                newItem.description = 'Completada com sucesso!';
                newItem.badge = 'CONCLUSÃO';
                break;
            case 'note':
                newItem.title = 'Nota Importante';
                newItem.description = 'Lembre-se de revisar este conteúdo';
                newItem.badge = 'NOTA';
                break;
        }

        setItems(prev => [newItem, ...prev]);
    };

    const getItemConfig = (type: TimelineItem['type']) => {
        const configs = {
            review: {
                icon: RotateCcw,
                color: 'from-purple-500 to-purple-600',
                bgColor: 'bg-purple-500/10',
                borderColor: 'border-purple-500/30',
                textColor: 'text-purple-400',
                iconBg: 'bg-purple-500/20',
            },
            progress: {
                icon: Target,
                color: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-500/10',
                borderColor: 'border-blue-500/30',
                textColor: 'text-blue-400',
                iconBg: 'bg-blue-500/20',
            },
            focus: {
                icon: Clock,
                color: 'from-orange-500 to-orange-600',
                bgColor: 'bg-orange-500/10',
                borderColor: 'border-orange-500/30',
                textColor: 'text-orange-400',
                iconBg: 'bg-orange-500/20',
            },
            completion: {
                icon: CheckCircle2,
                color: 'from-green-500 to-green-600',
                bgColor: 'bg-green-500/10',
                borderColor: 'border-green-500/30',
                textColor: 'text-green-400',
                iconBg: 'bg-green-500/20',
            },
            note: {
                icon: StickyNote,
                color: 'from-yellow-500 to-yellow-600',
                bgColor: 'bg-yellow-500/10',
                borderColor: 'border-yellow-500/30',
                textColor: 'text-yellow-400',
                iconBg: 'bg-yellow-500/20',
            },
        };
        return configs[type];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 backdrop-blur-xl mb-6">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-300">Timeline Interativa</span>
                    </div>

                    <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
                        Sistema de Resumos
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Acompanhe todas as suas atividades em uma timeline visual e interativa
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-8 shadow-2xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Como Funciona</h2>
                            <p className="text-sm text-slate-400">Clique nos botões para adicionar eventos à timeline</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <button
                            onClick={() => addTimelineItem('review')}
                            className="group relative px-4 py-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <div className="relative flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <RotateCcw className="w-6 h-6 text-purple-400" />
                                </div>
                                <span className="text-sm font-semibold text-purple-300">Revisão</span>
                            </div>
                        </button>

                        <button
                            onClick={() => addTimelineItem('progress')}
                            className="group relative px-4 py-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <div className="relative flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Target className="w-6 h-6 text-blue-400" />
                                </div>
                                <span className="text-sm font-semibold text-blue-300">Progresso Meta</span>
                            </div>
                        </button>

                        <button
                            onClick={() => addTimelineItem('focus')}
                            className="group relative px-4 py-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 hover:border-orange-500/50 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <div className="relative flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Clock className="w-6 h-6 text-orange-400" />
                                </div>
                                <span className="text-sm font-semibold text-orange-300">Sessão Foco</span>
                            </div>
                        </button>

                        <button
                            onClick={() => addTimelineItem('completion')}
                            className="group relative px-4 py-4 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <div className="relative flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                </div>
                                <span className="text-sm font-semibold text-green-300">Conclusão</span>
                            </div>
                        </button>

                        <button
                            onClick={() => addTimelineItem('note')}
                            className="group relative px-4 py-4 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <div className="relative flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <StickyNote className="w-6 h-6 text-yellow-400" />
                                </div>
                                <span className="text-sm font-semibold text-yellow-300">Nota</span>
                            </div>
                        </button>
                    </div>
                </motion.div>

                {/* Timeline */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Timeline de Atividades</h2>
                            <p className="text-sm text-slate-400">
                                {items.length > 0
                                    ? `${items.length} ${items.length === 1 ? 'evento registrado' : 'eventos registrados'}`
                                    : 'Clique nos botões acima para começar'
                                }
                            </p>
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-10 h-10 text-slate-500" />
                            </div>
                            <p className="text-slate-500 text-lg font-medium mb-2">Nenhum evento ainda</p>
                            <p className="text-slate-600 text-sm">Use os botões acima para adicionar eventos à timeline</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/20 via-blue-500/20 to-transparent" />

                            <AnimatePresence mode="popLayout">
                                {items.map((item, index) => {
                                    const config = getItemConfig(item.type);
                                    const Icon = config.icon;

                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 50 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="relative flex gap-6 mb-6 group"
                                        >
                                            {/* Timeline Icon */}
                                            <div className="relative z-10 flex-shrink-0">
                                                <div className={`w-16 h-16 rounded-2xl ${config.iconBg} border ${config.borderColor} flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                                                    <Icon className={`w-7 h-7 ${config.textColor}`} />
                                                </div>
                                            </div>

                                            {/* Content Card */}
                                            <div className={`flex-1 p-5 rounded-xl ${config.bgColor} border ${config.borderColor} backdrop-blur-sm hover:bg-opacity-80 transition-all duration-300 group-hover:scale-[1.02]`}>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className={`text-lg font-bold ${config.textColor}`}>
                                                            {item.title}
                                                        </h3>
                                                        {item.badge && (
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${config.color} text-white shadow-lg`}>
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="font-medium">{formatTime(item.timestamp)}</span>
                                                    </div>
                                                </div>

                                                <p className="text-slate-300 mb-3">{item.description}</p>

                                                {/* Extra Info */}
                                                <div className="flex items-center gap-4 text-sm">
                                                    {item.progress !== undefined && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden w-32">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${item.progress}%` }}
                                                                    transition={{ delay: 0.5, duration: 0.8 }}
                                                                    className={`h-full bg-gradient-to-r ${config.color}`}
                                                                />
                                                            </div>
                                                            <span className={`font-semibold ${config.textColor}`}>
                                                                {item.progress}%
                                                            </span>
                                                        </div>
                                                    )}
                                                    {item.duration !== undefined && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className={`w-4 h-4 ${config.textColor}`} />
                                                            <span className={config.textColor}>
                                                                {item.duration} min
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
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Custom Styles */}
            <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </div>
    );
};

export default SummaryDemo;
