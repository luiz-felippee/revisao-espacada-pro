import React from 'react';
import type { Project } from '../../../types';
import { Calendar, CheckCircle2, Link2, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { IconRenderer } from '../../../components/ui/IconRenderer';

interface ProjectCardProps {
    project: Project;
    onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
    const statusConfig = {
        planning: { label: 'Planejando', color: 'bg-slate-500/20 text-slate-300', dot: 'bg-slate-500' },
        active: { label: 'Ativo', color: 'bg-blue-500/20 text-blue-300', dot: 'bg-blue-500' },
        paused: { label: 'Pausado', color: 'bg-amber-500/20 text-amber-300', dot: 'bg-amber-500' },
        completed: { label: 'Concluído', color: 'bg-emerald-500/20 text-emerald-300', dot: 'bg-emerald-500' },
    };

    const categoryConfig = {
        professional: { label: 'Profissional', icon: '💼' },
        personal: { label: 'Pessoal', icon: '🏠' },
        academic: { label: 'Acadêmico', icon: '🎓' },
    };

    const status = statusConfig[project.status];
    const category = categoryConfig[project.category];
    const completedMilestones = project.milestones.filter(m => m.completed).length;

    return (
        <div
            onClick={onClick}
            className="bg-slate-900/40 hover:bg-slate-800/50 border border-slate-800/50 rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">
                        <IconRenderer icon={project.icon || category.icon} size={32} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors">
                            {project.title}
                        </h3>
                        <p className="text-slate-400 text-xs mt-0.5">{category.label}</p>
                    </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${status.color}`}>
                    <div className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
                    {status.label}
                </div>
            </div>

            {/* Description */}
            {project.description && (
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {project.description}
                </p>
            )}

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Progresso</span>
                    <span className="text-xs font-bold text-blue-400">{project.progress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                    />
                </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-slate-500">
                {project.milestones.length > 0 && (
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{completedMilestones}/{project.milestones.length} marcos</span>
                    </div>
                )}

                {(project.linkedTaskIds.length > 0 || project.linkedGoalIds.length > 0) && (
                    <div className="flex items-center gap-1.5">
                        <Link2 className="w-4 h-4" />
                        <span>{project.linkedTaskIds.length + project.linkedGoalIds.length} vinculados</span>
                    </div>
                )}

                {project.deadline && (
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(project.deadline), "d 'de' MMM", { locale: ptBR })}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
