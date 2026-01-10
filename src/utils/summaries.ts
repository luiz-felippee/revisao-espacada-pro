import type { SummaryEntry } from '../types';

/**
 * Utilitário para criar e gerenciar resumos com timestamps
 */

export const createSummaryEntry = (
    type: SummaryEntry['type'],
    data: Partial<SummaryEntry> = {}
): SummaryEntry => {
    return {
        id: `summary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        type,
        ...data,
    };
};

export const addReviewSummary = (
    currentSummaries: SummaryEntry[] = [],
    reviewNumber: number,
    description?: string,
    category: 'study' | 'project' = 'study',
    entityInfo?: { id: string, type: 'task' | 'goal' | 'theme' | 'project', title: string }
): SummaryEntry[] => {
    const entry = createSummaryEntry('review', {
        title: `${reviewNumber}ª Revisão`,
        description: description || `Revisão ${reviewNumber} concluída`,
        number: reviewNumber,
        metadata: {
            reviewNumber,
            status: 'completed',
            category,
            entityId: entityInfo?.id,
            entityType: entityInfo?.type,
            entityTitle: entityInfo?.title
        },
    });

    return [...currentSummaries, entry];
};

export const addGoalProgressSummary = (
    currentSummaries: SummaryEntry[] = [],
    progress: number,
    description?: string,
    category: string = 'personal',
    entityInfo?: { id: string, type: 'task' | 'goal' | 'theme' | 'project', title: string }
): SummaryEntry[] => {
    const entry = createSummaryEntry('goal', {
        title: `Progresso: ${progress}%`,
        description: description || `Meta atualizada para ${progress}%`,
        number: progress,
        metadata: {
            goalProgress: progress,
            status: progress >= 100 ? 'completed' : 'in-progress',
            category,
            entityId: entityInfo?.id,
            entityType: entityInfo?.type,
            entityTitle: entityInfo?.title
        },
    });

    return [...currentSummaries, entry];
};

export const addSessionSummary = (
    currentSummaries: SummaryEntry[] = [],
    durationMinutes: number,
    description?: string,
    category: string = 'focus',
    entityInfo?: { id: string, type: 'task' | 'goal' | 'theme' | 'project', title: string }
): SummaryEntry[] => {
    const entry = createSummaryEntry('session', {
        title: `Sessão de Foco`,
        description: description || `Sessão de ${durationMinutes} minutos concluída`,
        metadata: {
            sessionDuration: durationMinutes,
            status: 'completed',
            category,
            entityId: entityInfo?.id,
            entityType: entityInfo?.type,
            entityTitle: entityInfo?.title
        },
    });

    return [...currentSummaries, entry];
};

export const addCompletionSummary = (
    currentSummaries: SummaryEntry[] = [],
    description?: string,
    category: string = 'general',
    entityInfo?: { id: string, type: 'task' | 'goal' | 'theme' | 'project', title: string }
): SummaryEntry[] => {
    const entry = createSummaryEntry('completion', {
        title: 'Concluído',
        description: description || 'Item marcado como concluído',
        metadata: {
            status: 'completed',
            category,
            entityId: entityInfo?.id,
            entityType: entityInfo?.type,
            entityTitle: entityInfo?.title
        },
    });

    return [...currentSummaries, entry];
};

export const addNoteSummary = (
    currentSummaries: SummaryEntry[] = [],
    title: string,
    description: string,
    category: string = 'note',
    entityInfo?: { id: string, type: 'task' | 'goal' | 'theme' | 'project', title: string }
): SummaryEntry[] => {
    const entry = createSummaryEntry('note', {
        title,
        description,
        metadata: {
            status: 'note',
            category,
            entityId: entityInfo?.id,
            entityType: entityInfo?.type,
            entityTitle: entityInfo?.title
        },
    });

    return [...currentSummaries, entry];
};

export const addThemeActivitySummary = (
    currentSummaries: SummaryEntry[] = [],
    title: string,
    description?: string,
    category: string = 'study',
    entityInfo?: { id: string, type: 'task' | 'goal' | 'theme' | 'project', title: string }
): SummaryEntry[] => {
    const entry = createSummaryEntry('progress', {
        title: title || 'Atividade no Tema',
        description: description || 'Alteração ou progresso registrado no tema',
        metadata: {
            status: 'updated',
            category,
            entityId: entityInfo?.id,
            entityType: entityInfo?.type,
            entityTitle: entityInfo?.title
        },
    });

    return [...currentSummaries, entry];
};

export const formatSummaryDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

export const formatSummaryFull = (isoDate: string): string => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date);
};

export const formatSummaryTime = (isoDate: string): string => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};
