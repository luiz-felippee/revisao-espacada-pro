import { useState, useRef } from 'react';
import { useStudy } from '../../context/StudyContext';
import { usePomodoroState } from '../../context/PomodoroContext';
import { useConfirm } from '../../context/ConfirmContext';
import { Target, Pencil, Trash2, Clock, CheckCircle2, Play, Lock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { parseLocalDate } from '../../utils/dateHelpers';
import { AddGoalModal } from '../goals/components/AddGoalModal';
import { GoalDetailsModal } from '../goals/components/GoalDetailsModal';
import type { Goal } from '../../types';
import { cn } from '../../lib/utils';

export const GoalList = () => {
    const { goals, toggleGoal, deleteGoal, startFocus } = useStudy();
    const { startFocusSession, linkedItemId, isActive } = usePomodoroState();
    const { confirm } = useConfirm();
    const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGoalForDetails, setSelectedGoalForDetails] = useState<Goal | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

    const handleCloseEditModal = () => {
        setEditingGoal(undefined);
        setIsEditModalOpen(false);
    };

    const handleEditGoal = (goal: Goal) => {
        setEditingGoal(goal);
        setIsEditModalOpen(true);
    };

    const handleOpenDetails = (goal: Goal) => {
        setSelectedGoalForDetails(goal);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetails = () => {
        setSelectedGoalForDetails(null);
        setIsDetailsModalOpen(false);
    };

    // Card dimensions - Premium layout
    const CARD_HEIGHT = 340;
    const MIN_COL_WIDTH = 340;
    const GAP = 24;

    const filteredGoals = goals.filter(g => {
        if (g.relatedThemeId) return false;
        const cat = g.category || (g.type === 'habit' ? 'Hábitos' : 'Geral');
        return selectedCategory === 'Todos' || cat === selectedCategory;
    });

    const categories = ['Todos', ...Array.from(new Set(goals.filter(g => !g.relatedThemeId).map(g => g.category || (g.type === 'habit' ? 'Hábitos' : 'Geral'))))];

    // Premium Goal Card PRO - Ultra Modern Design
    const GoalCard = ({ goal }: { goal: Goal }) => {
        const isCompleted = goal.progress === 100;

        // Dynamic Color System - Unique colors per category (no repeats unless same category)
        const getColors = () => {
            if (isCompleted) return {
                bg: 'bg-emerald-950/30',
                border: 'border-emerald-500/30',
                glow: 'shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]',
                accent: 'text-emerald-400',
                gradient: 'from-emerald-500 to-emerald-700',
                button: 'bg-emerald-500 text-white shadow-emerald-500/40'
            };

            // Pool of 12 distinct color themes
            const colorPool = [
                { // Blue
                    bg: 'bg-blue-950/30', border: 'border-blue-500/30',
                    glow: 'shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]', accent: 'text-blue-400',
                    gradient: 'from-blue-500 to-indigo-600', button: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/40'
                },
                { // Rose
                    bg: 'bg-rose-950/30', border: 'border-rose-500/30',
                    glow: 'shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)]', accent: 'text-rose-400',
                    gradient: 'from-rose-500 to-pink-600', button: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-rose-500/40'
                },
                { // Orange
                    bg: 'bg-orange-950/30', border: 'border-orange-500/30',
                    glow: 'shadow-[0_0_40px_-10px_rgba(249,115,22,0.3)]', accent: 'text-orange-400',
                    gradient: 'from-orange-500 to-amber-600', button: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-500/40'
                },
                { // Cyan
                    bg: 'bg-cyan-950/30', border: 'border-cyan-500/30',
                    glow: 'shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)]', accent: 'text-cyan-400',
                    gradient: 'from-cyan-500 to-teal-600', button: 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-cyan-500/40'
                },
                { // Violet
                    bg: 'bg-violet-950/30', border: 'border-violet-500/30',
                    glow: 'shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]', accent: 'text-violet-400',
                    gradient: 'from-violet-500 to-purple-600', button: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-violet-500/40'
                },
                { // Lime
                    bg: 'bg-lime-950/30', border: 'border-lime-500/30',
                    glow: 'shadow-[0_0_40px_-10px_rgba(132,204,22,0.3)]', accent: 'text-lime-400',
                    gradient: 'from-lime-500 to-green-600', button: 'bg-gradient-to-r from-lime-500 to-green-600 text-white shadow-lime-500/40'
                },
                { // Amber
                    bg: 'bg-amber-950/30', border: 'border-amber-500/30',
                    glow: 'shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]', accent: 'text-amber-400',
                    gradient: 'from-amber-500 to-yellow-600', button: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-amber-500/40'
                },
                { // Pink
                    bg: 'bg-pink-950/30', border: 'border-pink-500/30',
                    glow: 'shadow-[0_0_40px_-10px_rgba(236,72,153,0.3)]', accent: 'text-pink-400',
                    gradient: 'from-pink-500 to-fuchsia-600', button: 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-pink-500/40'
                },
                { // Teal
                    bg: 'bg-teal-950/30', border: 'border-teal-500/30',
                    glow: 'shadow-[0_0_40px_-10px_rgba(20,184,166,0.3)]', accent: 'text-teal-400',
                    gradient: 'from-teal-500 to-emerald-600', button: 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-teal-500/40'
                },
                { // Indigo
                    bg: 'bg-indigo-950/30', border: 'border-indigo-500/30',
                    glow: 'shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)]', accent: 'text-indigo-400',
                    gradient: 'from-indigo-500 to-blue-600', button: 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-indigo-500/40'
                },
                { // Red
                    bg: 'bg-red-950/30', border: 'border-red-500/30',
                    glow: 'shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)]', accent: 'text-red-400',
                    gradient: 'from-red-500 to-rose-600', button: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/40'
                },
                { // Sky
                    bg: 'bg-sky-950/30', border: 'border-sky-500/30',
                    glow: 'shadow-[0_0_40px_-10px_rgba(14,165,233,0.3)]', accent: 'text-sky-400',
                    gradient: 'from-sky-500 to-blue-600', button: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-500/40'
                }
            ];

            // Hash function to get consistent index from category name
            const hashCategory = (str: string): number => {
                let hash = 0;
                const s = str.toLowerCase().trim();
                for (let i = 0; i < s.length; i++) {
                    const char = s.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash; // Convert to 32bit integer
                }
                return Math.abs(hash);
            };

            const category = goal.category || goal.type || 'geral';
            const colorIndex = hashCategory(category) % colorPool.length;

            return colorPool[colorIndex];
        };

        const theme = getColors();

        // Date-based locking logic
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const isFuture = !!(goal.startDate && goal.startDate > todayStr);
        const lockReason = isFuture ? `Agendado para ${format(new Date(goal.startDate + 'T00:00:00'), 'dd/MM')}` : "";

        return (
            <div className="h-full relative">
                {/* Card Container */}
                <div
                    className={cn(
                        "relative h-full flex flex-col rounded-[1.5rem] overflow-hidden transition-all duration-500",
                        "border backdrop-blur-3xl",
                        theme.bg, theme.border, theme.glow
                    )}
                >
                    {/* Background Noise/Texture */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />





                    {/* CONTENT AREA */}
                    <div className="flex-1 p-4 flex flex-col relative z-20">

                        {/* HEADER: Icon & Title */}
                        <div className="flex items-start gap-3 mb-2">
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-md relative overflow-hidden",
                                "bg-gradient-to-br border border-slate-800/50",
                                theme.gradient
                            )}>
                                {/* Inner Shine */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-60" />
                                <div className="relative z-10 text-lg">
                                    {goal.icon || <Target className="w-5 h-5 text-white" />}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-white leading-tight tracking-tight line-clamp-1 mb-1">
                                    {goal.title}
                                </h3>
                                {/* Meta Tags */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className={cn(
                                        "text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border bg-slate-800/50",
                                        theme.border, theme.accent
                                    )}>
                                        {goal.category || (goal.type === 'habit' ? 'Hábito' : 'Meta')}
                                    </span>
                                    {goal.deadline && (
                                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {format(parseLocalDate(goal.deadline), 'dd/MM')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* ACTIONS - Static & Organized */}
                            <div className="flex items-center gap-1.5 ml-auto shrink-0 self-start">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEditGoal(goal); }}
                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/50 transition-colors duration-300"
                                    title="Editar"
                                >
                                    <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const confirmed = await confirm({
                                            title: 'Excluir Meta',
                                            message: `Excluir "${goal.title}"?`,
                                            confirmText: 'Excluir',
                                            isDangerous: true
                                        });
                                        if (confirmed) deleteGoal(goal.id);
                                    }}
                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-800/80 hover:bg-red-900/50 text-slate-300 hover:text-red-400 border border-slate-600/50 transition-colors duration-300"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* MIDDLE: Progress */}
                        <div className="mt-auto space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Progresso</span>
                                <div className="flex items-baseline gap-0.5">
                                    <span className={cn("text-2xl font-black tracking-tighter", theme.accent)}>
                                        {goal.progress}
                                    </span>
                                    <span className="text-sm font-bold text-slate-600">%</span>
                                </div>
                            </div>

                            {/* Ultra Bar */}
                            <div className="h-4 bg-slate-950/50 rounded-full p-1 shadow-inner border border-slate-800/50">
                                <div
                                    className={cn(
                                        "h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out",
                                        theme.gradient
                                    )}
                                    style={{ width: `${Math.max(goal.progress, 5)}%` }} // Min width for visibility
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_8s_infinite]" />
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM: Actions */}
                        <div className="mt-3 flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (goal.type === 'habit') {
                                        const isDone = goal.completionHistory?.some((d: string) => d.startsWith(format(new Date(), 'yyyy-MM-dd')));
                                        if (!isDone) toggleGoal(goal.id);
                                    } else {
                                        handleOpenDetails(goal);
                                    }
                                }}
                                className={cn(
                                    "flex-1 rounded-lg font-bold text-[10px] uppercase tracking-wide transition-all active:scale-95 border border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-800/50 text-slate-300 flex items-center justify-center gap-1.5 h-10",
                                    goal.type === 'habit' ? 'bg-slate-800/50' : 'bg-transparent'
                                )}
                            >
                                {goal.type === 'habit' ? (
                                    <>
                                        {isFuture ? <Lock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                        <span>{isFuture ? "Bloqueado" : "Concluir"}</span>
                                    </>
                                ) : 'Detalhes'}
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isFuture) return;
                                    const duration = goal.durationMinutes || 25;
                                    startFocus(goal.id, 'goal', goal.title, duration);
                                    startFocusSession(goal.id, "goal", goal.title, duration);
                                }}
                                disabled={isFuture}
                                className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-all active:scale-95",
                                    isFuture
                                        ? "bg-slate-800 border border-slate-700 text-slate-600 cursor-not-allowed"
                                        : linkedItemId === goal.id
                                            ? "bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse"
                                            : theme.button
                                )}
                                title={isFuture ? lockReason : linkedItemId === goal.id ? "Foco Ativo" : "Iniciar Foco"}
                            >
                                {isFuture ? <Lock className="w-4 h-4" /> : linkedItemId === goal.id ? (
                                    <Loader2
                                        className="w-4 h-4 animate-spin"
                                        style={{ animationPlayState: isActive ? 'running' : 'paused' }}
                                    />
                                ) : (
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 w-full relative pb-20">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-6 relative z-10 pt-4 md:pt-0">
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter text-glow drop-shadow-xl text-center md:text-left">Minhas Metas</h2>
                    <p className="text-slate-400 text-sm font-medium tracking-wide text-center md:text-left">Transforme seus sonhos em realidade.</p>
                </div>

                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-bold shadow-xl shadow-blue-900/30 active:scale-95 transition-all flex items-center gap-3 ring-1 ring-white/10 backdrop-blur-md"
                >
                    <span className="text-2xl leading-none font-light pb-0.5">+</span>
                    Nova Meta
                </button>
            </div>

            {/* Filters */}
            {goals.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide px-6 relative z-10">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border backdrop-blur-md shadow-lg",
                                selectedCategory === cat
                                    ? "bg-blue-600/20 border-blue-500/50 text-blue-200 shadow-blue-900/20 active-glow"
                                    : "bg-slate-900/40 border-slate-800/50 text-slate-500 hover:bg-slate-800/40 hover:text-slate-300"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            <div className="relative px-2 z-10">
                {filteredGoals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[500px] text-center px-4">
                        <div className="w-32 h-32 bg-slate-900/30 backdrop-blur-md rounded-full flex items-center justify-center mb-8 ring-1 ring-white/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent skew-x-12 opacity-50" />
                            <Target className="w-12 h-12 text-slate-600 drop-shadow-lg" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-3 text-glow">Nenhuma meta encontrada</h3>
                        <p className="text-slate-400 max-w-sm mb-10 leading-relaxed">Não encontramos metas nesta categoria. Que tal criar algo novo?</p>
                        <button onClick={() => setIsEditModalOpen(true)} className="px-10 py-4 bg-slate-800/50 hover:bg-white/10 border border-slate-800/50 text-white rounded-2xl font-bold transition-all shadow-lg backdrop-blur-sm">
                            Criar Nova Meta
                        </button>
                    </div>
                ) : (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredGoals.map((goal) => (
                                <div key={goal.id} className="h-[200px]">
                                    <GoalCard goal={goal} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <AddGoalModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                goalToEdit={editingGoal}
            />

            <GoalDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetails}
                goal={selectedGoalForDetails}
            />
        </div>
    );
};
