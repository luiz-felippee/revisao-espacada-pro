import { Target, Pencil, Trash2, Calendar } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../../../lib/utils';
import { useConfirm } from '../../../../context/ConfirmContext';
import { IconRenderer } from '../../../../components/ui/IconRenderer';

interface LinkedProjectCardProps {
    goal: any;
    fullGoal: any;
    onEdit: (goal: any) => void;
    onDelete: (id: string) => void;
}

export const LinkedProjectCard = ({ goal, fullGoal, onEdit, onDelete }: LinkedProjectCardProps) => {
    const { confirm } = useConfirm();
    // Helper to parse YYYY-MM-DD as Local Midnight (avoiding UTC timezone issues)
    const parseLocalDate = (dateStr: string): Date => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d); // Local Midnight
        }
        return new Date(dateStr);
    };

    // Logic for time calculations (same as original modal)
    let timeProgress = 0;
    let timeLabel = "";

    if (fullGoal?.startDate && fullGoal?.deadline) {
        const start = parseLocalDate(fullGoal.startDate).getTime();
        const end = parseLocalDate(fullGoal.deadline).getTime();
        const now = new Date().getTime();
        const total = end - start;
        const elapsed = now - start;

        if (total > 0) {
            timeProgress = Math.min(100, Math.max(0, (elapsed / total) * 100));
        }

        const daysTotal = differenceInDays(parseLocalDate(fullGoal.deadline), parseLocalDate(fullGoal.startDate));
        const daysPassed = differenceInDays(new Date(), parseLocalDate(fullGoal.startDate));
        timeLabel = `${Math.max(0, daysPassed)}/${daysTotal} dias`;
    } else if (fullGoal?.createdAt && fullGoal?.deadline) {
        const start = fullGoal.createdAt;
        const end = parseLocalDate(fullGoal.deadline).getTime();
        const now = new Date().getTime();
        const total = end - start;
        const elapsed = now - start;
        timeProgress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    }

    return (
        <div className="flex flex-col gap-2 p-3 bg-slate-900 rounded-xl border border-white/5 hover:border-emerald-500/30 group hover:bg-slate-800/80 transition-all relative overflow-hidden">
            {/* Header Row */}
            <div className="flex items-center z-10 gap-3">
                {/* 1. Edit Button (Left) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (fullGoal) onEdit(fullGoal);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors shrink-0"
                    title="Editar Projeto"
                >
                    <Pencil className="w-4 h-4" />
                </button>

                {/* 2. Content (Center) */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">
                        <IconRenderer icon={fullGoal?.icon} size={16} fallback={<Target className="w-4 h-4" />} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-slate-300 text-sm truncate group-hover:text-white transition-colors">{goal.title}</h5>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                            <span>{goal.itemCount} itens</span>
                            <span>•</span>
                            <span>{Math.round(goal.progress)}% concluído</span>
                        </div>
                        {/* Start and Deadline Dates */}

                    </div>
                </div>

                {/* 3. Delete Button (Right) */}
                <button
                    onClick={async (e) => {
                        e.stopPropagation();
                        const confirmed = await confirm({
                            title: 'Excluir Projeto',
                            message: `Tem certeza que deseja excluir o projeto "${goal.title}"?`,
                            confirmText: 'Excluir',
                            cancelText: 'Cancelar',
                            isDangerous: true
                        });
                        if (confirmed) onDelete(goal.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors shrink-0"
                    title="Excluir Projeto"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Dates Row (New - Below Header) */}
            {(fullGoal?.startDate || fullGoal?.deadline) && (
                <div className="flex items-center gap-3 text-[10px] flex-wrap z-10 px-1">
                    {fullGoal?.startDate && (
                        <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span>Início: <span className="text-slate-400">{format(parseLocalDate(fullGoal.startDate), "dd MMM yyyy", { locale: ptBR })}</span></span>
                        </div>
                    )}
                    {fullGoal?.deadline && (
                        <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span>Conclusão: <span className={cn(
                                differenceInDays(parseLocalDate(fullGoal.deadline), new Date()) < 0
                                    ? "text-red-400"
                                    : differenceInDays(parseLocalDate(fullGoal.deadline), new Date()) <= 7
                                        ? "text-amber-400"
                                        : "text-emerald-400"
                            )}>{format(parseLocalDate(fullGoal.deadline), "dd MMM yyyy", { locale: ptBR })}</span></span>
                        </div>
                    )}
                </div>
            )}

            {/* Progress Bars Container */}
            <div className="mt-2 space-y-2 z-10">
                {/* Task Completion Progress */}
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>Conclusão</span>
                        <span>{Math.round(goal.progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${goal.progress}%` }}
                        />
                    </div>
                </div>

                {/* Time Progress (Only if timeLabel exists) */}
                {timeLabel && (
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <span>Tempo Restante</span>
                            <div className="flex gap-1">
                                {fullGoal?.deadline && (
                                    <span className={cn(
                                        "px-1.5 rounded text-[9px]",
                                        differenceInDays(parseLocalDate(fullGoal.deadline), new Date()) < 0
                                            ? "bg-red-500/20 text-red-400"
                                            : "bg-blue-500/20 text-blue-400"
                                    )}>
                                        {differenceInDays(parseLocalDate(fullGoal.deadline), new Date()) < 0 ? "Atrasado" : `${differenceInDays(parseLocalDate(fullGoal.deadline), new Date())} dias`}
                                    </span>
                                )}
                                <span className="text-slate-400 text-[9px]">({timeLabel})</span>
                            </div>
                        </div>
                        <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-blue-500/50 transition-all"
                                style={{ width: `${timeProgress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
