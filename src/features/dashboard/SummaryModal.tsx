import React, { useMemo } from 'react';
import { BookOpen, Target, Layout } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { differenceInDays } from 'date-fns';

import { ProjectsHeader } from './components/projects/ProjectsHeader';
import { ProjectsFilter } from './components/projects/ProjectsFilter';
import type { ProjectFilterType } from './components/projects/ProjectsFilter';
import { ThemeProjectCard } from './components/projects/ThemeProjectCard';
import { GoalProjectCard } from './components/projects/GoalProjectCard';

interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenGoalModal: (type?: 'simple' | 'checklist' | 'habit') => void;
    onOpenThemeModal: () => void;
    onEditGoal: (goal: any) => void;
    onEditTheme: (theme: any) => void;
    onAddGoalToTheme: (themeId: string) => void;
}

export const SummaryModal = ({ isOpen, onClose, onOpenGoalModal, onOpenThemeModal, onEditGoal, onEditTheme, onAddGoalToTheme }: SummaryModalProps) => {
    const { goals, themes, deleteGoal, deleteTheme } = useStudy();
    const [filter, setFilter] = React.useState<ProjectFilterType>('all');
    const [expandedThemeId, setExpandedThemeId] = React.useState<string | null>(null);

    // Transform Goals and Themes
    const { themeProjects, orphanGoalProjects } = useMemo(() => {
        // 1. Process Themes
        const themeProjs = themes.map(t => {
            const total = t.subthemes.length;
            const completed = t.subthemes.filter(s => s.status === 'completed').length;
            const progress = total > 0 ? (completed / total) * 100 : 0;
            const daysLeft = t.deadline ? differenceInDays(new Date(t.deadline), new Date()) : null;

            return {
                id: t.id,
                title: t.title,
                type: 'Tema' as const,
                progress,
                deadline: t.deadline,
                itemCount: t.subthemes.length,
                daysLeft,
                color: t.color || '#a855f7', // Purple
                icon: <BookOpen className="w-5 h-5 text-purple-400" />,
                isExpanded: expandedThemeId === t.id
            };
        });

        // 2. Process Goals (Checklists) - Find Orphans
        // FIX: User requested to REMOVE goals from Projects view entirely. 
        // Projects should ONLY be Themes with category='project'.
        const goalProjs: any[] = [];
        /*
        const goalProjs = goals.filter(g => !g.relatedThemeId).map(g => {
             // ... old logic ...
        });
        */

        // Filter Application
        let filteredThemes = themeProjs.filter(p => {
            const fullTheme = themes.find(t => t.id === p.id);
            return fullTheme?.category?.toLowerCase() === 'project';
        });
        let filteredGoals = goalProjs;

        if (filter === 'completed') {
            filteredThemes = themeProjs.filter(p => p.progress === 100);
            filteredGoals = goalProjs.filter(p => p.progress === 100);
        } else if (filter === 'overdue') {
            filteredThemes = themeProjs.filter(p => p.daysLeft !== null && p.daysLeft < 0 && p.progress < 100);
            filteredGoals = goalProjs.filter(p => p.daysLeft !== null && p.daysLeft < 0 && p.progress < 100);
        } else if (filter === 'active') {
            filteredThemes = themeProjs.filter(p => p.progress < 100 && (p.daysLeft === null || p.daysLeft >= 0));
            filteredGoals = goalProjs.filter(p => p.progress < 100 && (p.daysLeft === null || p.daysLeft >= 0));
        }

        return { themeProjects: filteredThemes, orphanGoalProjects: filteredGoals };
    }, [goals, themes, filter, expandedThemeId]);

    // Helper to get linked projects for a theme
    const getLinkedProjects = (themeId: string) => {
        return goals.filter(g => g.relatedThemeId === themeId).map(g => {
            const daysLeft = g.deadline ? differenceInDays(new Date(g.deadline), new Date()) : null;
            return {
                id: g.id,
                title: g.title,
                type: 'Meta' as const,
                progress: g.progress,
                deadline: g.deadline,
                itemCount: g.checklist?.length || 0,
                daysLeft,
                color: g.color || '#10b981',
                icon: <Target className="w-4 h-4 text-emerald-400" />
            };
        });
    };

    const combinedList = [...themeProjects];  // REMOVED ...orphanGoalProjects

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">

                <ProjectsHeader
                    onClose={onClose}
                    onOpenGoalModal={onOpenGoalModal}
                    onOpenThemeModal={onOpenThemeModal}
                />

                <div className="mt-8">
                    <ProjectsFilter filter={filter} setFilter={setFilter} />
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {combinedList.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            <Layout className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>Nenhum projeto ativo.</p>
                            <p className="text-sm text-slate-600">Crie uma Meta ou Tema para começar.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {/* Render Themes First (as containers) */}
                            {themeProjects.map((theme) => (
                                <ThemeProjectCard
                                    key={theme.id}
                                    theme={theme}
                                    linkedProjects={getLinkedProjects(theme.id)}
                                    isExpanded={!!theme.isExpanded}
                                    onToggleExpand={() => setExpandedThemeId(theme.isExpanded ? null : theme.id)}
                                    onEditTheme={(t) => {
                                        const fullTheme = themes.find(ft => ft.id === t.id);
                                        if (fullTheme) onEditTheme(fullTheme);
                                    }}
                                    onDeleteTheme={deleteTheme}
                                    onAddGoalToTheme={onAddGoalToTheme}
                                    allGoals={goals}
                                    onEditGoal={onEditGoal}
                                    onDeleteGoal={deleteGoal}
                                />
                            ))}

                            {/* Divider if we have both */}
                            {themeProjects.length > 0 && orphanGoalProjects.length > 0 && (
                                <div className="flex items-center gap-4 py-2">
                                    <div className="h-px bg-slate-800/50 flex-1" />
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Outros Projetos</span>
                                    <div className="h-px bg-slate-800/50 flex-1" />
                                </div>
                            )}

                            {/* Render Orphan Projects (Grid) */}
                            {orphanGoalProjects.length > 0 && (
                                <div className="grid grid-cols-1 grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                                    {orphanGoalProjects.map((project) => (
                                        <GoalProjectCard
                                            key={project.id}
                                            project={project}
                                            onEdit={(p) => {
                                                const fullGoal = goals.find(g => g.id === p.id);
                                                if (fullGoal) onEditGoal(fullGoal);
                                            }}
                                            onDelete={deleteGoal}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};
