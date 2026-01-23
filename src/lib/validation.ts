import { z } from 'zod';

// --- Shared ---
// --- Shared ---
export const PrioritySchema = z.enum(['low', 'medium', 'high']);

const SessionLogSchema = z.object({
    start: z.string(),
    end: z.string(),
    durationMinutes: z.number(),
    status: z.enum(['completed', 'cancelled'])
});

// --- Task Validation ---
export const TaskSchema = z.object({
    id: z.string().optional(), // Often generated
    title: z.string().min(1, "O título é obrigatório").max(100),
    status: z.enum(['pending', 'completed']).default('pending'),
    priority: PrioritySchema,
    type: z.enum(['day', 'period', 'recurring']),
    date: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    durationMinutes: z.number().min(1).optional(),
    tag: z.string().optional(),
    sessions: z.array(SessionLogSchema).optional()
});

// --- Goal Validation ---
export const GoalItemSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "O título do item é obrigatório"),
    durationDays: z.number().min(0).default(1),
    completed: z.boolean().default(false),
    order: z.number()
});

export const GoalSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "O título do objetivo é obrigatório"),
    type: z.enum(['simple', 'checklist', 'habit']),
    category: z.string().min(1, "A categoria é obrigatória"),
    progress: z.number().min(0).max(100).default(0),
    checklist: z.array(GoalItemSchema).optional(),
    deadline: z.string().optional(),
    sessions: z.array(SessionLogSchema).optional()
});

// --- Theme Validation ---
export const SubthemeSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "O título do subtema é obrigatório"),
    status: z.enum(['queue', 'active', 'completed']).default('queue'),
    durationMinutes: z.number().optional(),
    sessions: z.array(SessionLogSchema).optional()
});

export const ThemeSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "O título do tema é obrigatório"),
    priority: PrioritySchema.optional(),
    subthemes: z.array(SubthemeSchema).optional()
});
