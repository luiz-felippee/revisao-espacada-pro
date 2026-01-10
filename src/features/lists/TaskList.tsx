import { useState, useRef, useMemo, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useStudy } from '../../context/StudyContext';
import { usePomodoroState } from '../../context/PomodoroContext';
import { useAudio } from '../../context/AudioContext';
import { useConfirm } from '../../context/ConfirmContext';
import { CheckSquare, Pencil, Trash2, Play, Lock, Target, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { parseLocalDate } from '../../utils/dateHelpers';
import { AddTaskModal } from '../forms/AddTaskModal';
import { TaskDetailsModal } from '../tasks/components/TaskDetailsModal';
import type { Task } from '../../types';
import * as ReactWindow from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const List = (ReactWindow as any).VariableSizeList || (ReactWindow as any).default?.VariableSizeList;

export const TaskList = () => {
    const { tasks, toggleTask, deleteTask, startFocus, goals, toggleGoalItem } = useStudy();
    const { startFocusSession, linkedItemId, isActive } = usePomodoroState();
    const { startAudio } = useAudio();
    const { confirm } = useConfirm();
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDetailedTask, setSelectedDetailedTask] = useState<Task | null>(null);

    // We need a ref to the list to reset cache when tasks change (if using VariableSizeList with index-based size)
    const listRef = useRef<any>(null);

    // Sort tasks: Newest first (by createdAt)
    const sortedItems = useMemo(() => {
        // Flatten Goal Steps
        const steps = goals.flatMap(g =>
            (g.checklist || []).map(item => ({
                id: item.id,
                title: `${item.title} (${g.title})`, // Contextual title
                status: (item.completed ? 'completed' : 'pending') as 'completed' | 'pending',
                createdAt: g.createdAt || 0, // Fallback to goal creation
                type: 'step', // Internal type
                goalId: g.id, // Reference to parent
                priority: g.priority,
                imageUrl: undefined as string | undefined, // Steps don't have images usually
                color: g.color, // Inherit goal color
                date: item.deadline, // Map deadline to date
                startDate: undefined as string | undefined,
                endDate: undefined as string | undefined,
                durationMinutes: 25, // Default duration
                completionHistory: [] as string[]
            }))
        );

        const all = [...tasks, ...steps];

        return all.sort((a, b) => {
            // Sort by status (pending first) then by date
            if (a.status === 'pending' && b.status === 'completed') return -1;
            if (a.status === 'completed' && b.status === 'pending') return 1;

            const timeA = a.createdAt || 0;
            const timeB = b.createdAt || 0;
            return timeB - timeA;
        });
    }, [tasks, goals]);

    // Reset list cache when tasks change to ensure correct heights map
    useEffect(() => {
        if (listRef.current) {
            listRef.current.resetAfterIndex(0);
        }
    }, [sortedItems]);

    return (
        <div className="space-y-6 h-full flex flex-col overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0 mb-4 px-4 gap-4 pt-4 md:pt-0">
                <h2 className="text-2xl font-bold text-slate-100 text-center md:text-left">Minhas Tarefas</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="group relative px-4 py-2 bg-slate-900 rounded-lg font-bold text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 overflow-hidden ring-1 ring-white/10"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-1.5 text-sm">
                        <span className="text-lg leading-none font-light mb-0.5">+</span>
                        Nova Tarefa
                    </span>
                </button>
            </div>

            <div className="flex-1 min-h-0 relative px-4">
                {sortedItems.length === 0 ? (
                    <div className="glass-card text-center py-20 rounded-3xl relative overflow-hidden group border border-slate-800/50 border-dashed bg-slate-900/30">
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-white/10 shadow-xl shadow-black/20 group-hover:scale-110 transition-transform duration-500">
                                <CheckSquare className="w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Tudo em dia!</h3>
                            <p className="text-slate-500 max-w-xs mx-auto mb-6 text-sm">Nenhuma tarefa pendente. Aproveite para adicionar novos objetivos.</p>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-bold transition-all hover:scale-105 shadow-lg shadow-blue-500/25 ring-1 ring-white/20 text-sm"
                            >
                                Criar Primeira Tarefa
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full">
                        <AutoSizer>
                            {({ height, width }) => (
                                <List
                                    ref={listRef}
                                    height={height}
                                    width={width}
                                    itemCount={sortedItems.length}
                                    itemSize={(index: number) => (sortedItems[index].imageUrl ? 230 : 130) + 12} // Height + gap
                                    itemData={{
                                        items: sortedItems,
                                        linkedItemId,
                                        isActive,
                                        startFocus,
                                        startFocusSession,
                                        toggleTask,
                                        deleteTask,
                                        setEditingTask,
                                        setSelectedDetailedTask,
                                        confirm,
                                        startAudio
                                    }}
                                >
                                    {Row}
                                </List>
                            )}
                        </AutoSizer>
                    </div>
                )}
            </div>

            {/* Modals */}
            < AddTaskModal
                isOpen={!!editingTask || isAddModalOpen}
                onClose={() => {
                    setEditingTask(undefined);
                    setIsAddModalOpen(false);
                }}
                taskToEdit={editingTask}
            />

            <TaskDetailsModal
                isOpen={!!selectedDetailedTask}
                onClose={() => setSelectedDetailedTask(null)}
                task={selectedDetailedTask}
            />
        </div >
    );
};

// Row Component for Virtualization
const Row = ({ index, style, data }: any) => {
    const {
        items,
        linkedItemId,
        isActive,
        startFocus,
        startFocusSession,
        toggleTask,
        confirm,
        deleteTask,
        setEditingTask,
        setSelectedDetailedTask,
        startAudio
    } = data;

    const item = items[index];
    const isLinked = linkedItemId === item.id;
    const isLocked = isLinked;
    const isStep = item.type === 'step';

    // Date-based locking
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const itemDate = item.date || (('startDate' in item && item.startDate) ? (item.startDate as string).split('T')[0] : undefined);
    const isFuture = !!(itemDate && itemDate > todayStr);

    // Find first pending task
    const firstPendingIndex = items.findIndex((t: any) => t.status === 'pending');
    const isFirstPending = index === firstPendingIndex && item.status === 'pending';
    const isBlocked = !!((item.status === 'pending' && !isFirstPending) || isFuture);
    const lockReason = isFuture ? `Agendado para ${format(parseLocalDate(itemDate || todayStr), 'dd/MM')}` : "Complete a tarefa anterior primeiro";

    return (
        <div style={style} className="px-1 pr-4">
            <div
                style={{ height: item.imageUrl ? 230 : 130, '--hover-color': item.color || '#3b82f6' } as React.CSSProperties}
                className={`border rounded-xl overflow-hidden transition-colors transition-shadow duration-300 group flex flex-col ${isBlocked
                    ? 'bg-slate-900/30 border-slate-800/30 opacity-60'
                    : isLinked
                        ? 'bg-slate-900 border-rose-500/50 shadow-lg shadow-rose-900/10'
                        : 'bg-slate-900 border-slate-800 hover:border-[var(--hover-color)]'
                    }`}
            >
                {item.imageUrl && (
                    <div className="h-24 w-full relative bg-slate-800 shrink-0">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="flex items-center gap-4 p-4 flex-1">
                    <button
                        onClick={() => {
                            return;
                        }}
                        aria-label={item.status === 'completed' ? `Tarefa ${item.title} concluída` : `Tarefa ${item.title} pendente`}
                        disabled={true}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${isBlocked
                            ? 'border-slate-600 bg-slate-800/50 cursor-not-allowed'
                            : isLocked
                                ? 'border-rose-500/50 bg-rose-500/10 cursor-not-allowed'
                                : item.status === 'completed'
                                    ? 'bg-emerald-500 border-emerald-500 cursor-not-allowed'
                                    : (() => {
                                        const today = format(new Date(), 'yyyy-MM-dd');
                                        const isDoneToday = item.completionHistory?.some((d: string) => d.startsWith(today));
                                        return isDoneToday
                                            ? 'bg-emerald-500/20 border-emerald-500/50 cursor-not-allowed'
                                            : 'border-slate-500 hover:border-emerald-500 cursor-default';
                                    })()
                            }`}
                        title={isBlocked ? lockReason : isLocked ? "Conclua o Pomodoro primeiro!" : "Utilize o Pomodoro para concluir"}
                    >
                        {isBlocked ? (
                            <Lock className="w-3 h-3 text-slate-500" />
                        ) : isLocked ? (
                            <Lock className="w-3 h-3 text-rose-500" />
                        ) : (
                            (item.status === 'completed' || item.completionHistory?.some((d: string) => d.startsWith(format(new Date(), 'yyyy-MM-dd')))) && <CheckSquare className="w-4 h-4 text-white" />
                        )}
                    </button>

                    <div className="flex-1 min-w-0" onClick={() => !isStep && setSelectedDetailedTask(item as Task)}>
                        <div className="flex items-center gap-2">
                            {isStep && <Target className="w-3 h-3 text-slate-500" />}
                            <p className={`font-medium truncate ${isBlocked
                                ? 'text-slate-600'
                                : item.status === 'completed'
                                    ? 'text-slate-500 line-through'
                                    : (item.date && parseLocalDate(item.date) < new Date(new Date().setHours(0, 0, 0, 0)))
                                        ? 'text-red-400'
                                        : 'text-slate-200 cursor-pointer hover:underline'
                                }`}>
                                {item.title}
                            </p>
                        </div>

                        {(item.type === 'period' || item.type === 'recurring') && 'progress' in item && item.progress && (
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider">Progresso</span>
                                    <span className="text-slate-400 font-bold">
                                        {item.progress.current}/{item.progress.total}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, (item.progress.current / item.progress.total) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                            {isBlocked && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-800/50 text-slate-600 rounded font-medium shrink-0">
                                    <Lock className="w-3 h-3" />
                                    Bloqueada
                                </span>
                            )}
                            <span className={`capitalize px-2 py-0.5 rounded font-medium shrink-0 ${item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                item.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-slate-800 text-slate-400'
                                }`}>
                                {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                            </span>
                            <span className="capitalize px-2 py-0.5 bg-slate-800 rounded shrink-0">
                                {item.type === 'day' ? 'Dia' : item.type === 'period' ? 'Período' : item.type === 'recurring' ? 'Recorrente' : 'Meta'}
                            </span>
                            {item.type === 'period' && item.startDate && (
                                <span className="shrink-0 text-slate-400">
                                    Início: {format(parseLocalDate(item.startDate), 'dd/MM/yyyy')}
                                </span>
                            )}
                            {item.type === 'period' && item.endDate && (
                                <span className={`shrink-0 ${parseLocalDate(item.endDate) < new Date(new Date().setHours(0, 0, 0, 0)) ? 'text-red-400 font-bold animate-pulse' : 'text-slate-400'}`}>
                                    Fim: {format(parseLocalDate(item.endDate), 'dd/MM/yyyy')}
                                </span>
                            )}
                            {item.type === 'day' && item.date && (
                                <span className={`shrink-0 ${!item.status && parseLocalDate(item.date) < new Date(new Date().setHours(0, 0, 0, 0)) ? 'text-red-400 font-bold animate-pulse' : ''}`}>
                                    {isBlocked ? 'Início: ' : ''}{format(parseLocalDate(item.date), 'dd/MM/yyyy')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 items-center shrink-0">
                        {item.status !== 'completed' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isBlocked) {
                                        alert(lockReason || "Esta tarefa está bloqueada.");
                                        return;
                                    }

                                    // PRIORIDADE MÁXIMA: Bloqueio de dias futuros
                                    const todayStr = format(new Date(), 'yyyy-MM-dd');
                                    const itemDate = item.date || (('startDate' in item && item.startDate) ? (item.startDate as string).split('T')[0] : undefined);

                                    if (itemDate && itemDate > todayStr) {
                                        alert(`Item agendado para o futuro (${format(parseLocalDate(itemDate), 'dd/MM/yyyy')}).`);
                                        return;
                                    }

                                    const duration = item.durationMinutes || 25;
                                    if (isStep && item.goalId) {
                                        startFocus(item.id, 'goal', item.title, duration, undefined, undefined, item.goalId);
                                        startFocusSession(item.id, 'goal', item.title, duration);
                                    } else {
                                        startFocus(item.id, 'task', item.title, duration);
                                        startFocusSession(item.id, 'task', item.title, duration);
                                    }
                                }}
                                disabled={isBlocked}
                                aria-label={isBlocked ? `Bloqueado: ${lockReason}` : `Iniciar foco em ${item.title}`}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg group/btn hover:scale-105 active:scale-95",
                                    isBlocked
                                        ? 'bg-slate-800/30 border-slate-700/30 text-slate-600 cursor-not-allowed'
                                        : isLinked
                                            ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                                            : 'bg-slate-800 hover:bg-emerald-500 border border-slate-700 hover:border-emerald-500 text-slate-400 hover:text-white'
                                )}
                                title={isBlocked ? lockReason : "Iniciar Foco Imediatamente"}
                            >
                                {isLinked ? (
                                    <Loader2
                                        className="w-5 h-5 animate-spin"
                                        style={{ animationPlayState: isActive ? 'running' : 'paused' }}
                                    />
                                ) : (
                                    <Play className={`w-4 h-4 fill-current ml-0.5`} />
                                )}
                            </button>
                        )}

                        <div className="w-px h-4 bg-slate-800 mx-1" />

                        {!isStep && !isBlocked && (
                            <>
                                <button
                                    onClick={() => setEditingTask(item as Task)}
                                    aria-label={`Editar ${item.title}`}
                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-300 relative z-20"
                                >
                                    <Pencil className="w-4 h-4" aria-hidden="true" />
                                </button>
                                <button
                                    onClick={async () => {
                                        const confirmed = await confirm({
                                            title: 'Excluir Tarefa',
                                            message: `Tem certeza que deseja excluir "${item.title}"?`,
                                            confirmText: 'Excluir',
                                            cancelText: 'Cancelar',
                                            isDangerous: true
                                        });
                                        if (confirmed) deleteTask(item.id);
                                    }}
                                    aria-label={`Excluir ${item.title}`}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-300 relative z-20"
                                >
                                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
