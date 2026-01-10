import React from 'react';
import { CheckSquare, Clock, Calendar, Trophy, PlayCircle, Zap, FileText } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { useStudy } from '../../../context/StudyContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
import type { Task } from '../../../types';
import SummaryTimeline from '../../../components/ui/SummaryTimeline';
import { usePomodoroContext } from '../../../context/PomodoroContext';
import { IconRenderer } from '../../../components/ui/IconRenderer';

interface TaskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ isOpen, onClose, task }) => {
    const { startFocus } = useStudy();
    const { startFocusSession } = usePomodoroContext();

    if (!task) return null;

    const isCompleted = task.status === 'completed';
    const isPeriod = task.type === 'period';
    const isRecurring = task.type === 'recurring';

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
            gradient: 'from-blue-600 to-indigo-600'
        };

    const handleStartFocus = () => {
        const duration = task.durationMinutes || 25;
        startFocus(task.id, 'task', task.title, duration);
        startFocusSession(task.id, "task", task.title, duration);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="2xl">
            <div className="relative overflow-hidden p-6 sm:p-8">
                {/* Background Decoration */}
                <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-8">
                    {/* Header: Icon, Title, Category */}
                    <div className="flex items-start gap-6">
                        <div className={cn(
                            "w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl border-2 relative overflow-hidden",
                            "bg-gradient-to-br",
                            isCompleted ? "from-emerald-600 to-emerald-500 border-emerald-400/50" : "from-blue-600 to-indigo-600 border-blue-400/50"
                        )}>

                            <IconRenderer icon={task.icon} size={40} className="text-white drop-shadow-lg relative z-10" fallback={<CheckSquare className="w-10 h-10" />} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    colorScheme.bg, colorScheme.text, colorScheme.border
                                )}>
                                    TAREFA
                                </span>
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 border border-slate-800/50">
                                    {task.type === 'day' ? 'ÚNICA' : isPeriod ? 'PERÍODO' : 'RECORRENTE'}
                                </span>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    task.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                )}>
                                    {task.priority === 'high' ? 'ALTA' : task.priority === 'medium' ? 'MÉDIA' : 'BAIXA'}
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-white leading-tight break-words">
                                {task.title}
                            </h2>
                        </div>
                    </div>

                    {/* Progress Bar Display (for Period/Recurring) */}
                    {(isPeriod || isRecurring) && task.progress && (
                        <div className="bg-slate-900/20 rounded-3xl p-6 shadow-inner">
                            <div className="flex justify-between items-end mb-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Trophy className="w-3 h-3" /> Progresso da Missão
                                    </span>
                                    <div className="text-4xl font-black text-white">
                                        {task.progress.current}/{task.progress.total}
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-end gap-2">
                                        Status Atual
                                    </span>
                                    <div className={cn(
                                        "text-sm font-bold",
                                        isCompleted ? "text-emerald-400" : "text-blue-400"
                                    )}>
                                        {isCompleted ? 'Finalizado' : 'Em Andamento'}
                                    </div>
                                </div>
                            </div>
                            <div className="h-4 bg-slate-950/80 rounded-full p-1 border border-slate-800/50 shadow-inner relative overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000 ease-out shadow-lg",
                                        "bg-gradient-to-r",
                                        colorScheme.gradient
                                    )}
                                    style={{ width: `${Math.min(100, (task.progress.current / task.progress.total) * 100)}%` }}
                                >

                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-slate-900/20 rounded-2xl p-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Início</span>
                            <div className="text-white font-bold flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                {task.startDate || task.date ? format(new Date((task.startDate || task.date) + 'T00:00:00'), 'dd/MM/yy') : '--/--/--'}
                            </div>
                        </div>
                        <div className="bg-slate-900/20 rounded-2xl p-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Prazo</span>
                            <div className="text-white font-bold flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-rose-400" />
                                {task.endDate || task.date ? format(new Date((task.endDate || task.date) + 'T00:00:00'), 'dd/MM/yy') : '--/--/--'}
                            </div>
                        </div>
                        <div className="bg-slate-900/20 rounded-2xl p-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Duração</span>
                            <div className="text-white font-bold flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-amber-400" />
                                {task.durationMinutes || 25} min
                            </div>
                        </div>
                        <div className="bg-slate-900/20 rounded-2xl p-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Total Gasto</span>
                            <div className="text-white font-bold flex items-center gap-2 text-sm">
                                <Zap className="w-4 h-4 text-emerald-400" />
                                {Math.floor((task.timeSpent || 0) / 60)}h {(task.timeSpent || 0) % 60}m
                            </div>
                        </div>
                    </div>

                    {/* Description or Current Summary Note */}
                    <div className="bg-slate-900/20 rounded-3xl p-6 space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                            <FileText className="w-4 h-4" /> Notas da Tarefa
                        </h3>
                        <div className="text-slate-300 text-sm leading-relaxed italic bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                            {task.summary || "Nenhuma nota específica para esta tarefa ainda."}
                        </div>
                    </div>

                    {/* Summary Timeline - Box de Resumo/Histórico */}
                    <div className="bg-slate-900/40 rounded-[2rem] overflow-hidden">
                        <div className="p-6 sm:p-8 bg-slate-950/40">
                            <SummaryTimeline
                                summaries={task.summaries || []}
                                title="Histórico da Tarefa"
                                maxItems={5}
                                showEmptyState={true}
                            />
                        </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 h-14 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-white uppercase tracking-widest transition-all shadow-xl active:scale-[0.98]"
                        >
                            Fechar
                        </button>
                        {!isCompleted && (
                            <button
                                onClick={handleStartFocus}
                                className="flex-[2] h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/20 rounded-2xl font-black text-white uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <PlayCircle className="w-6 h-6" />
                                Iniciar Foco
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
