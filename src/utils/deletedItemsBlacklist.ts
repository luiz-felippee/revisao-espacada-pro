/**
 * Deleted Items Blacklist - Sistema de proteção contra ressurreição
 * 
 * Este sistema impede que itens deletados reapareçam quando:
 * - Outro dispositivo recarrega dados antes da sync completar
 * - O Realtime envia uma atualização antes da deleção ser processada
 * 
 * A blacklist é mantida no localStorage e persiste entre sessões.
 * IDs são removidos automaticamente após 24 horas para evitar acúmulo.
 */

const DELETED_TASKS_KEY = 'deleted_tasks_blacklist_v2';
const DELETED_GOALS_KEY = 'deleted_goals_blacklist_v2';
const DELETED_THEMES_KEY = 'deleted_themes_blacklist_v2';
const DELETED_SUBTHEMES_KEY = 'deleted_subthemes_blacklist_v2';

// Tempo de expiração: 24 horas em ms
const EXPIRATION_MS = 24 * 60 * 60 * 1000;

type ItemType = 'task' | 'goal' | 'theme' | 'subtheme';

interface BlacklistEntry {
    id: string;
    deletedAt: number;
}

const getBlacklistKey = (type: ItemType): string => {
    switch (type) {
        case 'task': return DELETED_TASKS_KEY;
        case 'goal': return DELETED_GOALS_KEY;
        case 'theme': return DELETED_THEMES_KEY;
        case 'subtheme': return DELETED_SUBTHEMES_KEY;
    }
};

/**
 * Carrega a blacklist do localStorage, removendo entradas expiradas
 */
const loadBlacklist = (type: ItemType): BlacklistEntry[] => {
    try {
        const key = getBlacklistKey(type);
        const raw = localStorage.getItem(key);
        if (!raw) return [];

        const entries: BlacklistEntry[] = JSON.parse(raw);
        const now = Date.now();

        // Filtrar entradas expiradas
        const valid = entries.filter(e => (now - e.deletedAt) < EXPIRATION_MS);

        // Se houve limpeza, salvar de volta
        if (valid.length !== entries.length) {
            localStorage.setItem(key, JSON.stringify(valid));
        }

        return valid;
    } catch (error) {
        console.error('Error loading blacklist:', error);
        return [];
    }
};

/**
 * Salva a blacklist no localStorage
 */
const saveBlacklist = (type: ItemType, entries: BlacklistEntry[]): void => {
    try {
        const key = getBlacklistKey(type);
        localStorage.setItem(key, JSON.stringify(entries));
    } catch (error) {
        console.error('Error saving blacklist:', error);
    }
};

/**
 * Adiciona um item à blacklist de deleção
 * 
 * Isso impede que o item reapareça mesmo se outro dispositivo
 * enviar uma atualização via Realtime antes da deleção ser sincronizada.
 */
export const addToBlacklist = (id: string, type: ItemType): void => {
    try {
        const entries = loadBlacklist(type);

        // Evitar duplicatas
        if (!entries.some(e => e.id === id)) {
            entries.push({ id, deletedAt: Date.now() });
            saveBlacklist(type, entries);
            console.log(`🛡️ Added ${type} ${id.substring(0, 8)}... to deletion blacklist`);
        }
    } catch (error) {
        console.error('Error adding to blacklist:', error);
    }
};

/**
 * Verifica se um item está na blacklist
 */
export const isBlacklisted = (id: string, type: ItemType): boolean => {
    try {
        const entries = loadBlacklist(type);
        return entries.some(e => e.id === id);
    } catch (error) {
        console.error('Error checking blacklist:', error);
        return false;
    }
};

/**
 * Remove um item da blacklist (usado em caso de rollback)
 */
export const removeFromBlacklist = (id: string, type: ItemType): void => {
    try {
        const entries = loadBlacklist(type);
        const filtered = entries.filter(e => e.id !== id);
        if (filtered.length !== entries.length) {
            saveBlacklist(type, filtered);
            console.log(`🔓 Removed ${type} ${id.substring(0, 8)}... from blacklist`);
        }
    } catch (error) {
        console.error('Error removing from blacklist:', error);
    }
};

/**
 * Retorna todos os IDs na blacklist
 */
export const getBlacklist = (type: ItemType): string[] => {
    try {
        const entries = loadBlacklist(type);
        return entries.map(e => e.id);
    } catch (error) {
        console.error('Error getting blacklist:', error);
        return [];
    }
};

/**
 * Limpa a blacklist de um tipo específico
 */
export const clearBlacklist = (type: ItemType): void => {
    try {
        const key = getBlacklistKey(type);
        localStorage.removeItem(key);
        console.log(`🧹 Cleared ${type} blacklist`);
    } catch (error) {
        console.error('Error clearing blacklist:', error);
    }
};

/**
 * Filtra itens que estão na blacklist de deleção
 * 
 * Use esta função ao receber dados do servidor para garantir
 * que itens deletados localmente não reapareçam.
 */
export const filterBlacklisted = <T extends { id: string }>(
    items: T[],
    type: ItemType
): T[] => {
    try {
        const blacklistedIds = new Set(getBlacklist(type));

        if (blacklistedIds.size === 0) {
            return items;
        }

        const filtered = items.filter(item => !blacklistedIds.has(item.id));

        const removedCount = items.length - filtered.length;
        if (removedCount > 0) {
            console.log(`🛡️ Blocked ${removedCount} blacklisted ${type}(s) from resurrection`);
        }

        return filtered;
    } catch (error) {
        console.error('Error filtering blacklisted items:', error);
        return items;
    }
};

/**
 * Utilitário para limpar TODAS as blacklists
 */
export const clearAllBlacklists = (): void => {
    clearBlacklist('task');
    clearBlacklist('goal');
    clearBlacklist('theme');
    clearBlacklist('subtheme');
    console.log('🧹 All blacklists cleared');
};
