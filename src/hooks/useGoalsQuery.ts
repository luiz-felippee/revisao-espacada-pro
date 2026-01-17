import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Goal } from '../types';

/**
 * React Query Hooks para Goals
 */

export const goalKeys = {
    all: ['goals'] as const,
    lists: () => [...goalKeys.all, 'list'] as const,
    list: (filters: string) => [...goalKeys.lists(), { filters }] as const,
    details: () => [...goalKeys.all, 'detail'] as const,
    detail: (id: string) => [...goalKeys.details(), id] as const,
};

export const useGoals = (userId?: string) => {
    return useQuery({
        queryKey: goalKeys.lists(),
        queryFn: async () => {
            if (!userId) throw new Error('User ID required');

            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Goal[];
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

export const useCreateGoal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newGoal: Partial<Goal>) => {
            const { data, error } = await supabase
                .from('goals')
                .insert(newGoal)
                .select()
                .single();

            if (error) throw error;
            return data as Goal;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
        },
    });
};

export const useUpdateGoal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Goal> }) => {
            const { data, error } = await supabase
                .from('goals')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as Goal;
        },
        onMutate: async ({ id, updates }) => {
            await queryClient.cancelQueries({ queryKey: goalKeys.lists() });
            const previousGoals = queryClient.getQueryData(goalKeys.lists());

            queryClient.setQueryData(goalKeys.lists(), (old: Goal[] = []) =>
                old.map(goal => goal.id === id ? { ...goal, ...updates } : goal)
            );

            return { previousGoals };
        },
        onError: (err, variables, context) => {
            if (context?.previousGoals) {
                queryClient.setQueryData(goalKeys.lists(), context.previousGoals);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
        },
    });
};

export const useDeleteGoal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (goalId: string) => {
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', goalId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
        },
    });
};
