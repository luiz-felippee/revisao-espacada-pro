import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Project, ProjectMilestone } from '../types';

interface ProjectContextType {
    projects: Project[];
    addProject: (project: Omit<Project, 'id' | 'createdAt' | 'progress' | 'milestones'>) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    addMilestone: (projectId: string, milestone: Omit<ProjectMilestone, 'id' | 'projectId' | 'createdAt'>) => void;
    toggleMilestone: (projectId: string, milestoneId: string) => void;
    deleteMilestone: (projectId: string, milestoneId: string) => void;
    linkTask: (projectId: string, taskId: string) => void;
    unlinkTask: (projectId: string, taskId: string) => void;
    linkGoal: (projectId: string, goalId: string) => void;
    unlinkGoal: (projectId: string, goalId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjectContext = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjectContext must be used within ProjectProvider');
    }
    return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>([]);

    // Load from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('study_projects');
        if (stored) {
            try {
                setProjects(JSON.parse(stored));
            } catch (error) {
                console.error('Error loading projects:', error);
            }
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('study_projects', JSON.stringify(projects));
    }, [projects]);

    // Calculate progress based on milestones
    const calculateProgress = (milestones: ProjectMilestone[]): number => {
        if (milestones.length === 0) return 0;
        const completed = milestones.filter(m => m.completed).length;
        return Math.round((completed / milestones.length) * 100);
    };

    const addProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt' | 'progress' | 'milestones'>) => {
        const newProject: Project = {
            ...projectData,
            id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
            progress: 0,
            milestones: [],
            linkedTaskIds: projectData.linkedTaskIds || [],
            linkedGoalIds: projectData.linkedGoalIds || [],
        };
        setProjects(prev => [...prev, newProject]);
    }, []);

    const updateProject = useCallback((id: string, updates: Partial<Project>) => {
        setProjects(prev => prev.map(project => {
            if (project.id !== id) return project;

            const updated = { ...project, ...updates };
            // Recalculate progress if milestones changed
            if (updates.milestones) {
                updated.progress = calculateProgress(updates.milestones);
            }
            return updated;
        }));
    }, []);

    const deleteProject = useCallback((id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id));
    }, []);

    const addMilestone = useCallback((projectId: string, milestoneData: Omit<ProjectMilestone, 'id' | 'projectId' | 'createdAt'>) => {
        setProjects(prev => prev.map(project => {
            if (project.id !== projectId) return project;

            const newMilestone: ProjectMilestone = {
                ...milestoneData,
                id: `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                projectId,
                createdAt: Date.now(),
                completed: milestoneData.completed || false,
            };

            const updatedMilestones = [...project.milestones, newMilestone];
            return {
                ...project,
                milestones: updatedMilestones,
                progress: calculateProgress(updatedMilestones),
            };
        }));
    }, []);

    const toggleMilestone = useCallback((projectId: string, milestoneId: string) => {
        setProjects(prev => prev.map(project => {
            if (project.id !== projectId) return project;

            const updatedMilestones = project.milestones.map(milestone => {
                if (milestone.id !== milestoneId) return milestone;
                return {
                    ...milestone,
                    completed: !milestone.completed,
                    completedAt: !milestone.completed ? new Date().toISOString() : undefined,
                };
            });

            return {
                ...project,
                milestones: updatedMilestones,
                progress: calculateProgress(updatedMilestones),
            };
        }));
    }, []);

    const deleteMilestone = useCallback((projectId: string, milestoneId: string) => {
        setProjects(prev => prev.map(project => {
            if (project.id !== projectId) return project;

            const updatedMilestones = project.milestones.filter(m => m.id !== milestoneId);
            return {
                ...project,
                milestones: updatedMilestones,
                progress: calculateProgress(updatedMilestones),
            };
        }));
    }, []);

    const linkTask = useCallback((projectId: string, taskId: string) => {
        setProjects(prev => prev.map(project => {
            if (project.id !== projectId) return project;
            if (project.linkedTaskIds.includes(taskId)) return project;

            return {
                ...project,
                linkedTaskIds: [...project.linkedTaskIds, taskId],
            };
        }));
    }, []);

    const unlinkTask = useCallback((projectId: string, taskId: string) => {
        setProjects(prev => prev.map(project => {
            if (project.id !== projectId) return project;

            return {
                ...project,
                linkedTaskIds: project.linkedTaskIds.filter(id => id !== taskId),
            };
        }));
    }, []);

    const linkGoal = useCallback((projectId: string, goalId: string) => {
        setProjects(prev => prev.map(project => {
            if (project.id !== projectId) return project;
            if (project.linkedGoalIds.includes(goalId)) return project;

            return {
                ...project,
                linkedGoalIds: [...project.linkedGoalIds, goalId],
            };
        }));
    }, []);

    const unlinkGoal = useCallback((projectId: string, goalId: string) => {
        setProjects(prev => prev.map(project => {
            if (project.id !== projectId) return project;

            return {
                ...project,
                linkedGoalIds: project.linkedGoalIds.filter(id => id !== goalId),
            };
        }));
    }, []);

    const value: ProjectContextType = {
        projects,
        addProject,
        updateProject,
        deleteProject,
        addMilestone,
        toggleMilestone,
        deleteMilestone,
        linkTask,
        unlinkTask,
        linkGoal,
        unlinkGoal,
    };

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};
