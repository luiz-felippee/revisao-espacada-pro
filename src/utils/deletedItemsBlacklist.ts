/**
 * Deleted Items Blacklist
 * 
 * Mantém uma lista permanente de IDs de itens deletados para prevenir
 * "ressurreição" quando o Supabase falha em deletar ou quando há problemas de sincronização.
 * 
 * Esta é uma solução de último recurso que garante que itens excluídos
 * NUNCA voltem, independente de falhas no backend.
 */

const DELETED_TASKS_KEY = 'deleted_tasks_blacklist_v1';
const DELETED_GOALS_KEY = 'deleted_goals_blacklist_v1';
const DELETED_THEMES_KEY = 'deleted_themes_blacklist_v1';
const DELETED_SUBTHEMES_KEY = 'deleted_subthemes_blacklist_v1';

type ItemType = 'task' | 'goal' | 'theme' | 'subtheme';

const getBlacklistKey = (type: ItemType): string => {
    switch (type) {
        case 'task': return DELETED_TASKS_KEY;
        case 'goal': return DELETED_GOALS_KEY;
        case 'theme': return DELETED_THEMES_KEY;
        case 'subtheme': return DELETED_SUBTHEMES_KEY;
    }
};

/**
 * Adiciona um ID à blacklist permanente
 */
export const addToBlacklist = (id: string, type: ItemType): void => {
    try {
        const key = getBlacklistKey(type);
        const blacklist = getBlacklist(type);

        if (!blacklist.includes(id)) {
            blacklist.push(id);
            localStorage.setItem(key, JSON.stringify(blacklist));
            console.log(`🚫 Added ${id} to ${type} blacklist (total: ${blacklist.length})`);
        }
    } catch (error) {
        console.error('Error adding to blacklist:', error);
    }
};

/**
 * Verifica se um ID está na blacklist
 */
export const isBlacklisted = (id: string, type: ItemType): boolean => {
    try {
        const blacklist = getBlacklist(type);
        return blacklist.includes(id);
    } catch (error) {
        console.error('Error checking blacklist:', error);
        return false;
    }
};

/**
 * Remove um ID da blacklist (para rollback em caso de erro)
 */
export const removeFromBlacklist = (id: string, type: ItemType): void => {
    try {
        const key = getBlacklistKey(type);
        const blacklist = getBlacklist(type);
        const filtered = blacklist.filter(item => item !== id);

        if (filtered.length !== blacklist.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
            console.log(`✅ Removed ${id} from ${type} blacklist (rollback)`);
        }
    } catch (error) {
        console.error('Error removing from blacklist:', error);
    }
};

/**
 * Obtém a blacklist completa para um tipo
 */
export const getBlacklist = (type: ItemType): string[] => {
    try {
        const key = getBlacklistKey(type);
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading blacklist:', error);
        return [];
    }
};

/**
 * Limpa a blacklist completamente (útil para reset ou troubleshooting)
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
 * Filtra um array removendo IDs que estão na blacklist
 */
export const filterBlacklisted = <T extends { id: string }>(
    items: T[],
    type: ItemType
): T[] => {
    const blacklist = getBlacklist(type);
    if (blacklist.length === 0) return items;

    const filtered = items.filter(item => !blacklist.includes(item.id));
    const blockedCount = items.length - filtered.length;

    if (blockedCount > 0) {
        console.log(`🛡️ Blocked ${blockedCount} blacklisted ${type}(s) from resurrecting`);
    }

    return filtered;
};
