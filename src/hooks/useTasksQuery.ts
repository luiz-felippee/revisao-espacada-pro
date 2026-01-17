import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Task } from '../types';

/**
 * React Query Hooks para Tasks
 * 
 * Benefícios:
 * - Cache automático de 5 minutos
 * - Deduplica requests
 * - Retry em erros
 * - Optimistic updates
 * - Background refetching
 */

// Query Keys
export const taskKeys = {
    all: ['tasks'] as const,
    lists: () => [...taskKeys.all, 'list'] as const,
    list: (filters: string) => [...taskKeys.lists(), { filters }] as const,
    details: () => [...taskKeys.all, 'detail'] as const,
    detail: (id: string) => [...taskKeys.details(), id] as const,
};

/**
 * Hook para buscar todas as tasks do usuário
 */
export const useTasks = (userId?: string) => {
    return useQuery({
        queryKey: taskKeys.lists(),
        queryFn: async () => {
            if (!userId) throw new Error('User ID required');

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Task[];
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5min cache
    });
};

/**
 * Hook para criar task
 */
export const useCreateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newTask: Partial<Task>) => {
            const { data, error } = await supabase
                .from('tasks')
                .insert(newTask)
                .select()
                .single();

            if (error) throw error;
            return data as Task;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
    });
};

/**
 * Hook para atualizar task
 */
export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
            const { data, error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as Task;
        },
        // Optimistic update
        onMutate: async ({ id, updates }) => {
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

            const previousTasks = queryClient.getQueryData(taskKeys.lists());

            queryClient.setQueryData(taskKeys.lists(), (old: Task[] = []) =>
                old.map(task => task.id === id ? { ...task, ...updates } : task)
            );

            return { previousTasks };
        },
        onError: (err, variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(taskKeys.lists(), context.previousTasks);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
    });
};

/**
 * Hook para deletar task
 */
export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (taskId: string) => {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
    });
};

/**
 * Hook para marcar task como completa
 */
export const useCompleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (taskId: string) => {
            const { data, error } = await supabase
                .from('tasks')
                .update({ completed: true, completed_at: new Date().toISOString() })
                .eq('id', taskId)
                .select()
                .single();

            if (error) throw error;
            return data as Task;
        },
        // Optimistic update para UX instantânea
        onMutate: async (taskId) => {
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

            const previousTasks = queryClient.getQueryData(taskKeys.lists());

            queryClient.setQueryData(taskKeys.lists(), (old: Task[] = []) =>
                old.map(task =>
                    task.id === taskId
                        ? { ...task, completed: true, completed_at: new Date().toISOString() }
                        : task
                )
            );

            return { previousTasks };
        },
        onError: (err, variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(taskKeys.lists(), context.previousTasks);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
    });
};
