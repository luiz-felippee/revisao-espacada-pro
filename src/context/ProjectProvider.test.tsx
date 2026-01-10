import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { ProjectProvider, useProjectContext } from './ProjectProvider';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

vi.stubGlobal('localStorage', localStorageMock);

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ProjectProvider>{children}</ProjectProvider>
);

describe('ProjectProvider', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it('should initialize with empty projects if localStorage is empty', () => {
        const { result } = renderHook(() => useProjectContext(), { wrapper });
        expect(result.current.projects).toEqual([]);
    });

    it('should load projects from localStorage on mount', () => {
        const mockProjects = [
            { id: '1', title: 'Test Project', milestones: [], linkedTaskIds: [], linkedGoalIds: [], createdAt: Date.now(), progress: 0, category: 'professional', status: 'active' }
        ];
        localStorageMock.setItem('study_projects', JSON.stringify(mockProjects));

        const { result } = renderHook(() => useProjectContext(), { wrapper });
        expect(result.current.projects).toEqual(mockProjects);
    });

    it('should add a new project', () => {
        const { result } = renderHook(() => useProjectContext(), { wrapper });

        act(() => {
            result.current.addProject({
                title: 'New Project',
                category: 'personal',
                status: 'planning',
                linkedTaskIds: [],
                linkedGoalIds: []
            });
        });

        expect(result.current.projects).toHaveLength(1);
        expect(result.current.projects[0].title).toBe('New Project');
        expect(result.current.projects[0].id).toContain('project-');
    });

    it('should update an existing project', () => {
        const { result } = renderHook(() => useProjectContext(), { wrapper });

        act(() => {
            result.current.addProject({
                title: 'Project to Update',
                category: 'academic',
                status: 'active',
                linkedTaskIds: [],
                linkedGoalIds: []
            });
        });

        const projectId = result.current.projects[0].id;

        act(() => {
            result.current.updateProject(projectId, { title: 'Updated Title', status: 'completed' });
        });

        expect(result.current.projects[0].title).toBe('Updated Title');
        expect(result.current.projects[0].status).toBe('completed');
    });

    it('should delete a project', () => {
        const { result } = renderHook(() => useProjectContext(), { wrapper });

        act(() => {
            result.current.addProject({
                title: 'Project to Delete',
                category: 'personal',
                status: 'planning',
                linkedTaskIds: [],
                linkedGoalIds: []
            });
        });

        const projectId = result.current.projects[0].id;

        act(() => {
            result.current.deleteProject(projectId);
        });

        expect(result.current.projects).toHaveLength(0);
    });

    describe('Milestones', () => {
        it('should add a milestone and update progress', () => {
            const { result } = renderHook(() => useProjectContext(), { wrapper });

            act(() => {
                result.current.addProject({
                    title: 'Project with Milestones',
                    category: 'professional',
                    status: 'active',
                    linkedTaskIds: [],
                    linkedGoalIds: []
                });
            });

            const projectId = result.current.projects[0].id;

            act(() => {
                result.current.addMilestone(projectId, { title: 'M1', completed: false, order: 1 });
            });

            expect(result.current.projects[0].milestones).toHaveLength(1);
            expect(result.current.projects[0].progress).toBe(0);

            act(() => {
                result.current.addMilestone(projectId, { title: 'M2', completed: true, order: 2 });
            });

            expect(result.current.projects[0].milestones).toHaveLength(2);
            expect(result.current.projects[0].progress).toBe(50);
        });

        it('should toggle milestone completion', () => {
            const { result } = renderHook(() => useProjectContext(), { wrapper });

            act(() => {
                result.current.addProject({
                    title: 'Toggle TestProject',
                    category: 'professional',
                    status: 'active'
                } as any);
            });

            const projectId = result.current.projects[0].id;

            act(() => {
                result.current.addMilestone(projectId, { title: 'M1', completed: false, order: 1 });
            });

            const milestoneId = result.current.projects[0].milestones[0].id;

            act(() => {
                result.current.toggleMilestone(projectId, milestoneId);
            });

            expect(result.current.projects[0].milestones[0].completed).toBe(true);
            expect(result.current.projects[0].progress).toBe(100);

            act(() => {
                result.current.toggleMilestone(projectId, milestoneId);
            });

            expect(result.current.projects[0].milestones[0].completed).toBe(false);
            expect(result.current.projects[0].progress).toBe(0);
        });

        it('should delete a milestone', () => {
            const { result } = renderHook(() => useProjectContext(), { wrapper });

            act(() => {
                result.current.addProject({ title: 'Del Milestone Project' } as any);
            });

            const projectId = result.current.projects[0].id;

            act(() => {
                result.current.addMilestone(projectId, { title: 'M1', completed: true, order: 1 });
            });

            const milestoneId = result.current.projects[0].milestones[0].id;

            act(() => {
                result.current.deleteMilestone(projectId, milestoneId);
            });

            expect(result.current.projects[0].milestones).toHaveLength(0);
            expect(result.current.projects[0].progress).toBe(0);
        });
    });

    describe('Linking Entites', () => {
        it('should link and unlink tasks', () => {
            const { result } = renderHook(() => useProjectContext(), { wrapper });

            act(() => {
                result.current.addProject({ title: 'Link Test', linkedTaskIds: [] } as any);
            });

            const projectId = result.current.projects[0].id;

            act(() => {
                result.current.linkTask(projectId, 'task-1');
            });

            expect(result.current.projects[0].linkedTaskIds).toContain('task-1');

            act(() => {
                result.current.unlinkTask(projectId, 'task-1');
            });

            expect(result.current.projects[0].linkedTaskIds).not.toContain('task-1');
        });

        it('should link and unlink goals', () => {
            const { result } = renderHook(() => useProjectContext(), { wrapper });

            act(() => {
                result.current.addProject({ title: 'Link Test Goals', linkedGoalIds: [] } as any);
            });

            const projectId = result.current.projects[0].id;

            act(() => {
                result.current.linkGoal(projectId, 'goal-1');
            });

            expect(result.current.projects[0].linkedGoalIds).toContain('goal-1');

            act(() => {
                result.current.unlinkGoal(projectId, 'goal-1');
            });

            expect(result.current.projects[0].linkedGoalIds).not.toContain('goal-1');
        });
    });
});
