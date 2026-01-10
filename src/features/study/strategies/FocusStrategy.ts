/**
 * Interface comum para estratégias de atualização após uma sessão de foco.
 * Segue o Princípio da Responsabilidade Única e Aberto/Fechado.
 */
export interface FocusStrategy {
    execute(
        id: string,
        sessionLog: any,
        user: any,
        contexts: {
            taskCtx: any;
            goalCtx: any;
            themeCtx: any;
        }
    ): Promise<void>;
}
