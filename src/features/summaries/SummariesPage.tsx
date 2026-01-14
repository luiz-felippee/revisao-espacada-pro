import React, { useMemo } from 'react';
import { FileText, Sparkles, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { Timeline } from '../../components/timeline';
import type { SummaryEntry } from '../../types';

export const SummariesPage: React.FC = () => {
    const { goals, themes, tasks } = useStudy();
    const [filterType, setFilterType] = React.useState<SummaryEntry['type'] | 'all'>('all');
    const [searchTerm, setSearchTerm] = React.useState('');

    // Collect all summaries from all sources
    const allSummaries = useMemo(() => {
        const summaries: SummaryEntry[] = [];

        // Track source type for each entry if not already in metadata
        tasks.forEach(task => {
            if (task.summaries) {
                task.summaries.forEach(s => {
                    summaries.push({
                        ...s,
                        metadata: {
                            ...s.metadata,
                            entityId: s.metadata?.entityId || task.id,
                            entityType: s.metadata?.entityType || 'task',
                            entityTitle: s.metadata?.entityTitle || task.title,
                        }
                    });
                });
            }
        });

        goals.forEach(goal => {
            if (goal.summaries) {
                goal.summaries.forEach(s => {
                    summaries.push({
                        ...s,
                        metadata: {
                            ...s.metadata,
                            entityId: s.metadata?.entityId || goal.id,
                            entityType: s.metadata?.entityType || 'goal',
                            entityTitle: s.metadata?.entityTitle || goal.title,
                        }
                    });
                });
            }
        });

        themes.forEach(theme => {
            const themeType = theme.category === 'project' ? 'project' : 'theme';
            if (theme.summaries) {
                theme.summaries.forEach(s => {
                    summaries.push({
                        ...s,
                        metadata: {
                            ...s.metadata,
                            entityId: s.metadata?.entityId || theme.id,
                            entityType: s.metadata?.entityType || themeType,
                            entityTitle: s.metadata?.entityTitle || theme.title,
                        }
                    });
                });
            }
            theme.subthemes.forEach(subtheme => {
                if (subtheme.summaries) {
                    subtheme.summaries.forEach(s => {
                        summaries.push({
                            ...s,
                            metadata: {
                                ...s.metadata,
                                entityId: s.metadata?.entityId || subtheme.id,
                                entityType: s.metadata?.entityType || themeType,
                                entityTitle: s.metadata?.entityTitle || subtheme.title,
                            }
                        });
                    });
                }
            });
        });

        return summaries.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }, [tasks, goals, themes]);

    // Update filter logic to use entityType
    const [entityFilter, setEntityFilter] = React.useState<NonNullable<SummaryEntry['metadata']>['entityType'] | 'all'>('all');

    const filteredSummaries = useMemo(() => {
        let filtered = allSummaries;

        if (entityFilter !== 'all') {
            filtered = filtered.filter(s => s.metadata?.entityType === entityFilter);
        }

        if (filterType !== 'all') {
            filtered = filtered.filter(s => s.type === filterType);
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.title?.toLowerCase().includes(term) ||
                s.description?.toLowerCase().includes(term) ||
                s.metadata?.entityTitle?.toLowerCase().includes(term)
            );
        }

        return filtered;
    }, [allSummaries, entityFilter, filterType, searchTerm]);

    const counts = useMemo(() => {
        return {
            all: allSummaries.length,
            task: allSummaries.filter(s => s.metadata?.entityType === 'task').length,
            goal: allSummaries.filter(s => s.metadata?.entityType === 'goal').length,
            theme: allSummaries.filter(s => s.metadata?.entityType === 'theme').length,
            project: allSummaries.filter(s => s.metadata?.entityType === 'project').length,
        };
    }, [allSummaries]);

    const entityButtons = [
        { type: 'all' as const, label: 'Todos', color: 'from-slate-500 to-slate-600', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30' },
        { type: 'goal' as const, label: 'Metas', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
        { type: 'task' as const, label: 'Tarefas', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
        { type: 'theme' as const, label: 'Temas', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
        { type: 'project' as const, label: 'Projetos', color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30' },
    ];

    const filterButtons: { type: SummaryEntry['type'] | 'all', label: string }[] = [
        { type: 'all', label: 'Todos os tipos' },
        { type: 'review', label: 'Revisões' },
        { type: 'session', label: 'Sessões de Foco' },
        { type: 'goal', label: 'Progresso' },
        { type: 'completion', label: 'Conclusões' },
        { type: 'note', label: 'Notas' }
    ];

    return (
        <div className="w-full min-h-screen relative pb-32">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center backdrop-blur-xl shadow-lg shadow-purple-900/20">
                            <FileText className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                                Resumos & Histórico
                            </h1>
                            <p className="text-slate-400 text-sm md:text-base">
                                Acompanhe todas as suas atividades e conquistas
                            </p>
                        </div>
                    </div>

                    {/* Entity Boxes - Main Categories */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-8 mb-8 shadow-2xl">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 px-2">Categorias de Histórico</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
                            {entityButtons.map((btn) => {
                                const count = counts[btn.type as keyof typeof counts] || (btn.type === 'all' ? counts.all : 0);
                                const isActive = entityFilter === btn.type;

                                return (
                                    <button
                                        key={btn.type}
                                        onClick={() => setEntityFilter(btn.type)}
                                        className={`
                                            relative p-6 rounded-[2rem] border transition-all duration-300 group
                                            ${isActive
                                                ? `${btn.bgColor} ${btn.borderColor} scale-105 shadow-xl`
                                                : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60'
                                            }
                                        `}
                                    >
                                        <div className="relative flex flex-col items-center">
                                            <div className={`
                                                text-3xl font-black mb-2 transition-transform duration-300 group-hover:scale-110
                                                ${isActive ? 'bg-gradient-to-r ' + btn.color + ' bg-clip-text text-transparent' : 'text-slate-300'}
                                            `}>
                                                {count}
                                            </div>
                                            <div className={`text-sm font-bold tracking-wide uppercase ${isActive ? 'text-white' : 'text-slate-500'}`}>
                                                {btn.label}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Filter Bar & Search */}
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                        <div className="flex flex-wrap gap-2 flex-1 w-full">
                            {filterButtons.map(btn => (
                                <button
                                    key={btn.type}
                                    onClick={() => setFilterType(filterType === btn.type ? 'all' : btn.type)}
                                    className={`
                                        px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap
                                        ${filterType === btn.type
                                            ? 'bg-white text-slate-900 shadow-lg'
                                            : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-700/50'}`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full lg:w-96">
                            <input
                                type="text"
                                placeholder="Buscar em resumos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-2xl py-3 px-4 pl-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-lg"
                            />
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        </div>
                    </div>
                </div>

                {/* Timeline Box */}
                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-10 shadow-2xl">
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center shadow-lg">
                            <CalendarIcon className="w-7 h-7 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Timeline de Atividades</h2>
                            <p className="text-slate-400 font-medium">
                                {filteredSummaries.length > 0
                                    ? `${filteredSummaries.length} ${filteredSummaries.length === 1 ? 'evento encontrado' : 'eventos encontrados'}`
                                    : 'Nenhum evento encontrado'
                                }
                            </p>
                        </div>
                    </div>

                    <Timeline
                        items={filteredSummaries}
                        emptyMessage={searchTerm ? 'Nenhum resultado encontrado' : 'Suas atividades aparecerão aqui automaticamente'}
                    />
                </div>
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
