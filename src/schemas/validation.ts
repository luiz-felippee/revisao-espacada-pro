import { z } from 'zod';

/**
 * Task Validation Schema
 */
export const taskSchema = z.object({
    id: z.string().uuid().optional(),
    user_id: z.string().uuid().optional(),
    theme_id: z.string().uuid().nullable().optional(),
    subtheme_id: z.string().uuid().nullable().optional(),
    title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
    summary: z.string().max(1000, 'Resumo muito longo').optional().nullable(),
    completed: z.boolean().default(false),
    priority: z.enum(['low', 'medium', 'high']).optional().nullable(),
    due_date: z.string().datetime().optional().nullable(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
    completed_at: z.string().datetime().optional().nullable(),
});

export type TaskInput = z.infer<typeof taskSchema>;

/**
 * Goal Validation Schema
 */
export const goalSchema = z.object({
    id: z.string().uuid().optional(),
    user_id: z.string().uuid().optional(),
    theme_id: z.string().uuid().nullable().optional(),
    title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
    category: z.string().max(100).optional().nullable(),
    start_date: z.string().datetime().optional().nullable(),
    deadline: z.string().datetime().optional().nullable(),
    completed: z.boolean().default(false),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
    completed_at: z.string().datetime().optional().nullable(),
});

export type GoalInput = z.infer<typeof goalSchema>;

/**
 * Theme Validation Schema
 */
export const themeSchema = z.object({
    id: z.string().uuid().optional(),
    user_id: z.string().uuid().optional(),
    title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').default('#3b82f6'),
    icon: z.string().max(50).optional().nullable(),
    order_index: z.number().int().min(0).default(0),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export type ThemeInput = z.infer<typeof themeSchema>;

/**
 * Project Validation Schema
 */
export const projectSchema = z.object({
    id: z.string().uuid().optional(),
    user_id: z.string().uuid().optional(),
    title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
    description: z.string().max(2000, 'Descrição muito longa').optional().nullable(),
    status: z.enum(['planning', 'active', 'completed', 'archived']).default('planning'),
    category: z.string().max(100).optional().nullable(),
    start_date: z.string().datetime().optional().nullable(),
    deadline: z.string().datetime().optional().nullable(),
    progress: z.number().int().min(0).max(100).default(0),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;

/**
 * Validation Helper Functions
 */

/**
 * Safely parse data with Zod schema
 * Returns { success: true, data } or { success: false, error }
 */
export function safeParse<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
}

/**
 * Validate and throw on error
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}

/**
 * Get user-friendly error messages
 */
export function getErrorMessages(error: z.ZodError): string[] {
    return error.issues.map((err) => err.message);
}
