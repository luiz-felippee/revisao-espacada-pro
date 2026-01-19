import { useState, useEffect } from 'react';

/**
 * Hook para auto-save de rascunhos em localStorage
 * 
 * Features:
 * - Salva automaticamente no localStorage
 * - Restaura ao reabrir
 * - Persiste mesmo após fechar aplicação
 * - Função para limpar rascunho
 * 
 * @param key - Chave única para localStorage (ex: 'draft_add_task')
 * @param defaultValues - Valores padrão
 * @returns [values, updateValue, clearDraft, hasDraft]
 */
export function useFormDraft<T extends Record<string, any>>(
    key: string,
    defaultValues: T
): [T, (field: keyof T, value: any) => void, () => void, boolean] {
    // Estado interno
    const [values, setValues] = useState<T>(() => {
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge com valores default para garantir campos novos
                return { ...defaultValues, ...parsed };
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
        return defaultValues;
    });

    // Verifica se tem rascunho salvo
    const [hasDraft, setHasDraft] = useState(() => {
        try {
            const saved = localStorage.getItem(key);
            return !!saved;
        } catch {
            return false;
        }
    });

    // Atualiza um campo específico
    const updateValue = (field: keyof T, value: any) => {
        setValues(prev => {
            const updated = { ...prev, [field]: value };

            // Salva no localStorage
            try {
                localStorage.setItem(key, JSON.stringify(updated));
                setHasDraft(true);
            } catch (error) {
                console.error('Error saving draft:', error);
            }

            return updated;
        });
    };

    // Limpa o rascunho
    const clearDraft = () => {
        try {
            localStorage.removeItem(key);
            setValues(defaultValues);
            setHasDraft(false);
        } catch (error) {
            console.error('Error clearing draft:', error);
        }
    };

    return [values, updateValue, clearDraft, hasDraft];
}

/**
 * Limpa TODOS os rascunhos de uma vez
 */
export function clearAllDrafts() {
    const draftKeys = [
        'draft_add_task',
        'draft_add_goal',
        'draft_add_theme'
    ];

    draftKeys.forEach(key => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error clearing ${key}:`, error);
        }
    });

    console.log('✅ All drafts cleared');
}
