export interface GoalItem {
    /** Identificador único do item da checklist */
    id: string;
    /** Título ou descrição curta do item */
    title: string;
    /** Número de dias de duração estimada (opcional) */
    durationDays?: number;
    /** Indica se o item já foi concluído */
    completed: boolean;
    /** Ordem de exibição dentro da checklist (opcional) */
    order?: number;
    /** Data de criação (timestamp em milissegundos) */
    createdAt?: number;
    /** Data de prazo para este item específico */
    deadline?: string;
    /** Observações adicionais sobre o item */
    notes?: string;
}
