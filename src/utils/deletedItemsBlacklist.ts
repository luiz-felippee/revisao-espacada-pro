/**
 * Deleted Items Blacklist - DESATIVADO
 * 
 * IMPORTANTE: Sistema de blacklist DESATIVADO por solicitação do usuário.
 * 
 * Ao deletar qualquer item (Task, Goal, Theme, Subtheme), a deleção é:
 * - ✅ PERMANENTE
 * - ✅ SEM histórico salvo
 * - ✅ SEM rastros em localStorage
 * - ✅ Completamente removido
 * 
 * As funções abaixo são mantidas apenas para compatibilidade com código existente,
 * mas NÃO salvam nenhum dado.
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
 * DESATIVADA - Não salva histórico de deleção
 * 
 * Esta função é mantida para compatibilidade, mas NÃO faz nada.
 * Deleção é permanente e limpa, sem rastros.
 */
export const addToBlacklist = (id: string, type: ItemType): void => {
    console.log(`🗑️ Permanent deletion of ${type}: ${id} (no history saved)`);
    // NÃO SALVA NADA - Deleção limpa e permanente
};

/**
 * DESATIVADA - Sempre retorna false
 * 
 * Como não salvamos mais blacklist, nenhum item está "blacklisted".
 */
export const isBlacklisted = (id: string, type: ItemType): boolean => {
    return false; // Sem blacklist, nada está bloqueado
};

/**
 * Não faz nada - mantida para compatibilidade
 */
export const removeFromBlacklist = (id: string, type: ItemType): void => {
    // Não precisa remover porque não adiciona
};

/**
 * DESATIVADA - Sempre retorna array vazio
 */
export const getBlacklist = (type: ItemType): string[] => {
    return []; // Sem blacklist
};

/**
 * Limpa qualquer blacklist antiga que possa existir
 */
export const clearBlacklist = (type: ItemType): void => {
    try {
        const key = getBlacklistKey(type);
        localStorage.removeItem(key);
        console.log(`🧹 Cleared old ${type} blacklist data`);
    } catch (error) {
        console.error('Error clearing blacklist:', error);
    }
};

/**
 * DESATIVADA - Retorna todos os itens sem filtrar
 * 
 * Como não há blacklist, nenhum item é filtrado.
 */
export const filterBlacklisted = <T extends { id: string }>(
    items: T[],
    type: ItemType
): T[] => {
    return items; // Retorna tudo - sem filtro
};

/**
 * Utilitário para limpar TODOS os dados de blacklist antigas
 * Deve ser chamado na inicialização para garantir limpeza completa
 */
export const clearAllBlacklists = (): void => {
    clearBlacklist('task');
    clearBlacklist('goal');
    clearBlacklist('theme');
    clearBlacklist('subtheme');
    console.log('🧹 All blacklist data cleared - clean deletion mode active');
};
