/**
 * Utility functions for data export and import
 */

import type { Theme, Task, Goal } from '../types';
import type { GamificationState } from '../types/gamification';

export interface PomodoroSettings {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    strictMode: boolean;
}

export interface UserProfile {
    username?: string;
    email?: string;
    avatar?: string;
}

export interface BackupData {
    timestamp: string;
    profile?: UserProfile;
    settings?: PomodoroSettings;
    themes: Theme[];
    tasks: Task[];
    goals: Goal[];
    gamification: Partial<GamificationState>;
    zenMode?: boolean;
}

/**
 * Export all data to JSON file
 */
export const exportToJSON = (data: BackupData): void => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-panel-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Validate imported backup data structure
 */
export const validateBackupData = (data: unknown): { valid: boolean; error?: string } => {
    // Check if it's a valid object
    if (typeof data !== 'object' || data === null) {
        return { valid: false, error: 'Arquivo inválido: não é um objeto JSON' };
    }

    const backupData = data as Record<string, unknown>;

    // Check for required fields
    const requiredFields = ['themes', 'tasks', 'goals', 'gamification'];
    for (const field of requiredFields) {
        if (!(field in backupData)) {
            return { valid: false, error: `Arquivo inválido: campo "${field}" não encontrado` };
        }
    }

    // Check if arrays are actually arrays
    if (!Array.isArray(backupData.themes)) {
        return { valid: false, error: 'Arquivo inválido: "themes" não é um array' };
    }
    if (!Array.isArray(backupData.tasks)) {
        return { valid: false, error: 'Arquivo inválido: "tasks" não é um array' };
    }
    if (!Array.isArray(backupData.goals)) {
        return { valid: false, error: 'Arquivo inválido: "goals" não é um array' };
    }

    return { valid: true };
};

/**
 * Read and parse JSON file
 */
export const readJSONFile = (file: File): Promise<BackupData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text) as BackupData;
                resolve(data);
            } catch (error) {
                reject(new Error('Erro ao ler o arquivo: JSON inválido'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Erro ao ler o arquivo'));
        };

        reader.readAsText(file);
    });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
