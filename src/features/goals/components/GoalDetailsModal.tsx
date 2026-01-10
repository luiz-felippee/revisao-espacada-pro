import React from 'react';
import { Target, CheckCircle2, Clock, Calendar, Trophy, ChevronRight, Zap } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { useStudy } from '../../../context/StudyContext';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';
import type { Goal } from '../../../types';
import SummaryTimeline from '../../../components/ui/SummaryTimeline';
import { IconRenderer } from '../../../components/ui/IconRenderer';

interface GoalDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    goal: Goal | null;
}

export const GoalDetailsModal: React.FC<GoalDetailsModalProps> = ({ isOpen, onClose, goal }) => {
    const { toggleGoal, toggleGoalItem } = useStudy();

    if (!goal) return null;

    const isCompleted = goal.progress === 100;
    const isHabit = goal.type === 'habit';
    const isChecklist = goal.type === 'checklist';

    const colorScheme = isCompleted
        ? {
            text: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            gradient: 'from-emerald-600 to-emerald-400'
        }
        : {
            text: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            gradient: 'from-blue-600 to-purple-600'
        };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={null} maxWidth="2xl">
            <div className="relative overflow-hidden p-6 sm:p-8">

                <div className="relative z-10 flex flex-col gap-8">
                    {/* Header: Icon, Title, Category */}
                    <div className="flex items-start gap-6">
                        <div className={cn(
                            "w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl border-2",
                            "bg-gradient-to-br",
                            isCompleted ? "from-emerald-600 to-emerald-500 border-emerald-400/50" : "from-blue-600 to-purple-600 border-blue-400/50"
                        )}>
                            {/* Gloss removed */}
                            <IconRenderer icon={goal.icon} size={40} className="text-white drop-shadow-lg" fallback={<Target className="w-10 h-10" />} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    colorScheme.bg, colorScheme.text, colorScheme.border
                                )}>
                                    {goal.category || (isHabit ? 'HÁBITO' : 'META')}
                                </span>
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 border border-slate-700/50">
                                    {isHabit ? 'Repetitivo' : isChecklist ? 'Sequencial' : 'Simples'}
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-white leading-tight break-words">
                                {goal.title}
                            </h2>
                        </div>
                    </div>

                    {/* Progress Bar Display */}
                    <div className="bg-slate-900/20 rounded-3xl p-6 shadow-inner">
                        <div className="flex justify-between items-end mb-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Trophy className="w-3 h-3" /> Progresso Geral
                                </span>
                                <div className="text-4xl font-black text-white">
                                    {Math.round(goal.progress)}%
                                </div>
                            </div>
                            {goal.deadline && (
                                <div className="text-right space-y-1">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-end gap-2">
                                        Prazo <Calendar className="w-3 h-3" />
                                    </span>
                                    <div className="text-sm font-bold text-slate-300">
                                        {format(new Date(goal.deadline), 'dd/MM/yyyy')}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="h-4 bg-slate-950/80 rounded-full p-1 border border-slate-800 shadow-inner">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000 ease-out shadow-lg",
                                    "bg-gradient-to-r",
                                    colorScheme.gradient
                                )}
                                style={{ width: `${goal.progress}%` }}
                            >

                            </div>
                        </div>
                    </div>

                    {/* Checklist Content */}
                    {isChecklist && goal.checklist && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <Zap className="w-4 h-4" /> Etapas do Projeto
                            </h3>
                            <div className="grid gap-3">
                                {[...(goal.checklist || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((item, idx) => (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleGoalItem(goal.id, item.id)}
                                        className={cn(
                                            "group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer",
                                            item.completed
                                                ? "bg-emerald-500/5 border-emerald-500/20 opacity-70"
                                                : "bg-slate-900/60 hover:bg-slate-800/60 shadow-lg"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                            item.completed
                                                ? "bg-emerald-500 text-white"
                                                : "bg-slate-800 text-slate-500 group-hover:bg-blue-500/20 group-hover:text-blue-400"
                                        )}>
                                            {item.completed ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-black text-lg">{idx + 1}</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={cn(
                                                "font-bold text-sm transition-all",
                                                item.completed ? "text-slate-400 line-through" : "text-white"
                                            )}>
                                                {item.title}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                {(item.durationDays ?? 0) > 0 && (
                                                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                                        <Clock className="w-2.5 h-2.5" /> {item.durationDays} dias
                                                    </span>
                                                )}
                                                {item.deadline && (
                                                    <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                                                        <Calendar className="w-2.5 h-2.5" /> {format(new Date(item.deadline), 'dd/MM')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className={cn(
                                            "w-4 h-4 transition-all transform group-hover:translate-x-1",
                                            item.completed ? "text-emerald-500/40" : "text-slate-600 group-hover:text-blue-400"
                                        )} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Habit History Content */}
                    {isHabit && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <Clock className="w-4 h-4" /> Histórico Recente
                            </h3>
                            <div className="bg-slate-900/20 rounded-3xl p-6">
                                <div className="flex flex-wrap gap-2">
                                    {/* Show last 14 days logic */}
                                    {Array.from({ length: 14 }).map((_, i) => {
                                        const d = new Date();
                                        d.setDate(d.getDate() - (13 - i));
                                        const dateStr = format(d, 'yyyy-MM-dd');
                                        const isDone = goal.completionHistory?.some(h => h.startsWith(dateStr));

                                        return (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all",
                                                    isDone
                                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                        : "bg-slate-800 text-slate-600 border border-slate-700/50"
                                                )}
                                                title={format(d, 'dd/MM/yyyy')}
                                            >
                                                {format(d, 'd')}
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-4 text-center">
                                    Visualizando os últimos 14 dias de consistência.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Stats or Additional Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/20 rounded-2xl p-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Início</span>
                            <div className="text-white font-bold flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                {goal.startDate ? format(new Date(goal.startDate), 'dd/MM/yyyy') : format(new Date(goal.createdAt), 'dd/MM/yyyy')}
                            </div>
                        </div>
                        <div className="bg-slate-900/20 rounded-2xl p-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Esforço Total</span>
                            <div className="text-white font-bold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-400" />
                                {Math.floor((goal.timeSpent || 0) / 60)}h {(goal.timeSpent || 0) % 60}m
                            </div>
                        </div>
                    </div>

                    {/* Summary Timeline - Box de Resumo/Histórico */}
                    <div className="bg-slate-900/40 rounded-[2rem] overflow-hidden">
                        <div className="p-6 sm:p-8 bg-slate-950/40">
                            <SummaryTimeline
                                summaries={goal.summaries || []}
                                title="Histórico da Meta"
                                maxItems={5}
                                showEmptyState={true}
                            />
                        </div>
                    </div>

                    {/* Bottom Action */}
                    <button
                        onClick={onClose}
                        className="w-full h-14 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-white uppercase tracking-widest transition-all shadow-xl active:scale-[0.98]"
                    >
                        Fechar Detalhes
                    </button>
                </div>
            </div>
        </Modal>
    );
};
