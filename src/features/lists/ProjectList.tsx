import React, { useEffect, useState } from 'react';
import { Plus, Filter, LayoutGrid, LayoutList } from 'lucide-react';
import { useProjectContext } from '../../context/ProjectProvider';
import { ProjectCard } from '../projects/components/ProjectCard';
import { AddProjectModal } from '../projects/components/AddProjectModal';
import type { Project } from '../../types';

export const ProjectList = () => {
    const { projects } = useProjectContext();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<Project['status'] | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<Project['category'] | 'all'>('all');

    const filteredProjects = projects.filter(project => {
        if (statusFilter !== 'all' && project.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && project.category !== categoryFilter) return false;
        return true;
    });

    const statusCounts = {
        all: projects.length,
        planning: projects.filter(p => p.status === 'planning').length,
        active: projects.filter(p => p.status === 'active').length,
        paused: projects.filter(p => p.status === 'paused').length,
        completed: projects.filter(p => p.status === 'completed').length,
    };

    return (
        <div className="space-y-6 w-full pt-8 relative pb-20 fade-in">
            {/* Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Projetos
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Gerencie seus projetos profissionais e pessoais
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Novo Projeto
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {/* Status Filters */}
                {(['all', 'planning', 'active', 'paused', 'completed'] as const).map(status => {
                    const labels = {
                        all: 'Todos',
                        planning: 'Planejando',
                        active: 'Ativos',
                        paused: 'Pausados',
                        completed: 'Concluídos',
                    };

                    const colors = {
                        all: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
                        planning: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
                        active: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                        paused: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                        completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                    };

                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm border transition-all ${statusFilter === status
                                    ? colors[status] + ' ring-2 ring-white/20'
                                    : 'bg-slate-900/50 text-slate-400 border-slate-700 hover:bg-slate-800'
                                }`}
                        >
                            {labels[status]} ({statusCounts[status]})
                        </button>
                    );
                })}
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <div className="w-24 h-24 bg-slate-900/30 backdrop-blur-md rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10">
                        <LayoutGrid className="w-10 h-10 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {statusFilter === 'all' ? 'Nenhum projeto ainda' : `Nenhum projeto ${statusFilter === 'planning' ? 'em planejamento' : statusFilter}`}
                    </h3>
                    <p className="text-slate-400 max-w-sm mb-6">
                        {statusFilter === 'all'
                            ? 'Crie seu primeiro projeto para começar a organizar suas entregas'
                            : 'Experimente filtrar por outro status'}
                    </p>
                    {statusFilter === 'all' && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Criar Primeiro Projeto
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={() => {
                                // TODO: Open details modal
                                console.log('Open project:', project.id);
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Add Project Modal */}
            <AddProjectModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
};
