import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Book, CheckSquare, Target, Clock, Folder, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Theme, Task, Goal } from '../../../types';

interface DetailedStatsTableProps {
    themes: Theme[];
    tasks: Task[];
    goals: Goal[];
}

type StatItem = {
    id: string;
    title: string;
    type: 'theme' | 'subtheme' | 'task' | 'goal';
    timeSpent: number; // minutes
    children?: StatItem[];
    icon?: React.ElementType;
    color?: string;
    count?: number; // e.g. review count or subtheme count
};

export const DetailedStatsTable: React.FC<DetailedStatsTableProps> = ({ themes, tasks, goals }) => {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    // --- Data Aggregation ---

    // 1. Themes & Subthemes
    const themeItems: StatItem[] = themes.map(t => {
        const subItems: StatItem[] = t.subthemes.map(st => ({
            id: st.id,
            title: st.title,
            type: 'subtheme' as const,
            timeSpent: st.timeSpent || 0,
            icon: Book,
            color: 'text-indigo-400'
        }));

        const totalThemeTime = (t.subthemes.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0));

        return {
            id: t.id,
            title: t.title,
            type: 'theme' as const,
            timeSpent: totalThemeTime,
            children: subItems,
            icon: Folder,
            color: 'text-blue-400',
            count: t.subthemes.length
        };
    }).sort((a, b) => b.timeSpent - a.timeSpent);

    // 2. Goals
    const goalItems: StatItem[] = goals.map(g => ({
        id: g.id,
        title: g.title,
        type: 'goal' as const,
        timeSpent: g.timeSpent || 0,
        icon: Target,
        color: 'text-emerald-400'
    })).filter(g => g.timeSpent > 0).sort((a, b) => b.timeSpent - a.timeSpent);

    // 3. Tasks
    const taskItems: StatItem[] = tasks.map(t => ({
        id: t.id,
        title: t.title,
        type: 'task' as const,
        timeSpent: t.timeSpent || 0, // Ensure tasks have timeSpent tracked in StudyContext/Pomodoro
        icon: CheckSquare,
        color: 'text-amber-400'
    })).filter(t => t.timeSpent > 0).sort((a, b) => b.timeSpent - a.timeSpent);


    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    const renderRow = (item: StatItem, depth = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedIds.has(item.id);

        return (
            <React.Fragment key={item.id}>
                <div
                    className={cn(
                        "group relative flex items-center justify-between p-4 rounded-xl transition-all duration-300 cursor-pointer",
                        depth === 0
                            ? "bg-gradient-to-br from-slate-800/60 to-slate-900/40 hover:from-slate-800/80 hover:to-slate-900/60 mb-2 border border-white/5 hover:border-white/10 shadow-lg hover:shadow-xl"
                            : "hover:bg-slate-800/50 border-l-2 border-indigo-500/30 ml-6 mb-1",
                        isExpanded && depth === 0 && "from-slate-800/80 to-slate-900/60 border-indigo-500/30 shadow-xl"
                    )}
                    onClick={() => hasChildren && toggleExpand(item.id)}
                    style={{ marginLeft: depth > 0 ? `${depth * 0.5}rem` : '0' }}
                >
                    {/* Glassmorphism overlay for depth 0 */}
                    {depth === 0 && (
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-xl pointer-events-none" />
                    )}

                    <div className="flex items-center gap-4 overflow-hidden relative z-10">
                        {/* Expand Icon */}
                        {hasChildren ? (
                            <button className="p-1.5 rounded-lg hover:bg-slate-800/50 transition-all duration-200 group-hover:scale-110">
                                {isExpanded
                                    ? <ChevronDown className="w-5 h-5 text-slate-300 transition-transform duration-300" />
                                    : <ChevronRight className="w-5 h-5 text-slate-400 transition-transform duration-300" />
                                }
                            </button>
                        ) : (
                            <div className="w-8" />
                        )}

                        {/* Type Icon with glow */}
                        {item.icon && (
                            <div className={cn(
                                "p-2 rounded-lg transition-all duration-300",
                                depth === 0
                                    ? "bg-gradient-to-br from-slate-700/50 to-slate-800/50 ring-1 ring-white/10 group-hover:ring-white/20 shadow-lg"
                                    : "bg-slate-800/30"
                            )}>
                                <item.icon className={cn("w-5 h-5 shrink-0", item.color)} />
                            </div>
                        )}

                        {/* Title */}
                        <div className="flex flex-col truncate">
                            <span className={cn(
                                "font-semibold truncate pr-4 transition-colors duration-300",
                                depth === 0 ? "text-slate-100 text-base" : "text-slate-300 text-sm"
                            )}>
                                {item.title}
                            </span>
                            {depth === 0 && item.type === 'theme' && (
                                <span className="text-xs text-slate-400 font-medium mt-0.5">
                                    {item.count} Subtema{item.count !== 1 ? 's' : ''} • {(item.timeSpent / 60).toFixed(1)}h Total
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Time Value */}
                    <div className="flex items-center gap-5 shrink-0 relative z-10">
                        {/* Progress Bar (Visual) */}
                        <div className="hidden md:block w-32 h-2.5 bg-slate-950/80 rounded-full overflow-hidden ring-1 ring-white/5 shadow-inner">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500 shadow-lg",
                                    item.color?.replace('text-', 'bg-'),
                                    "relative overflow-hidden"
                                )}
                                style={{ width: `${Math.min(100, (item.timeSpent / (Math.max(1, themeItems[0]?.timeSpent || 60))) * 100)}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                            </div>
                        </div>

                        <div className={cn(
                            "flex items-center gap-2.5 min-w-[90px] justify-end px-3 py-1.5 rounded-lg transition-all duration-300",
                            depth === 0
                                ? "bg-slate-900/60 ring-1 ring-white/10 group-hover:ring-white/20 shadow-md"
                                : "bg-slate-800/40"
                        )}>
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="font-bold text-slate-100 font-mono text-sm">
                                {formatTime(item.timeSpent)}
                            </span>
                        </div>
                    </div>
                </div>

                {isExpanded && item.children?.map(child => renderRow(child, depth + 1))}
            </React.Fragment>
        );
    };

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/50 via-slate-900/60 to-slate-950/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 ring-1 ring-blue-500/30 shadow-lg">
                        <Folder className="w-7 h-7 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                            Detalhamento de Tempo
                            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                        </h3>
                        <p className="text-sm text-slate-400 font-medium">Análise completa do tempo dedicado</p>
                    </div>
                </div>
            </div>

            {/* Table Header */}
            <div className="relative z-10 mb-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-5 py-3 flex justify-between items-center bg-slate-800/40 rounded-xl border border-white/5">
                    <span className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Item
                    </span>
                    <span className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Tempo Dedicado
                    </span>
                </div>
            </div>

            <div className="space-y-2 relative z-10">
                {/* Themes Section */}
                {themeItems.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                            <Folder className="w-4 h-4" />
                            Temas & Subtemas
                        </h4>
                        {themeItems.map(item => renderRow(item))}
                    </div>
                )}

                {/* Goals Section */}
                {goalItems.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Metas & Hábitos
                        </h4>
                        {goalItems.map(item => renderRow(item))}
                    </div>
                )}

                {/* Tasks Section */}
                {taskItems.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                            <CheckSquare className="w-4 h-4" />
                            Tarefas
                        </h4>
                        {taskItems.map(item => renderRow(item))}
                    </div>
                )}

                {themeItems.length === 0 && goalItems.length === 0 && taskItems.length === 0 && (
                    <div className="text-center py-16 text-slate-400">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 ring-1 ring-slate-700 mb-4">
                            <Clock className="w-8 h-8 text-slate-500" />
                        </div>
                        <p className="text-lg font-semibold mb-2">Nenhuma atividade registrada ainda</p>
                        <p className="text-sm text-slate-500">Inicie um foco em "Temas" ou "Tarefas" para ver dados aqui.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

