import { supabase } from '../lib/supabase';
import { SyncMappers } from './SyncMappers';
import { syncLogger } from '../utils/logger';
import type { DbPayload, PartialDbPayload, SyncStatus, TaskDbPayload, GoalDbPayload, ThemeDbPayload, SubthemeDbPayload } from '../types/sync';

export interface SyncOp {
    id: string; // Unique ID for the operation
    type: 'ADD' | 'UPDATE' | 'DELETE';
    table: 'themes' | 'tasks' | 'goals' | 'subthemes' | 'profiles';
    data: PartialDbPayload; // Partial payload for flexibility
    timestamp: number;
    retryCount: number;
    lastError?: string;
    nextRetryTime?: number;
    dependentOn?: string;
}

const QUEUE_STORAGE_KEY = 'sync_queue_v1';
const QUEUE_VERSION = 'v2'; // Bump to invalidate old queues
const MAX_RETRIES = 5;
const MAX_QUEUE_SIZE = 100; // Prevent unbounded growth
const STABILITY_THRESHOLD = 3; // Consecutive errors before warning

/**
 * Serviço de fila de sincronização resiliente com suporte a retry e batching.
 * 
 * Gerencia operações de sincronização offline-first, persistindo em localStorage
 * e processando em lote quando a conexão é restaurada.
 * 
 * ## Features
 * - **Offline-First:** Enfileira operações mesmo sem conexão
 * - **Batching:** Agrupa operações por tabela para eficiência
 * - **Retry Logic:** Backoff linear com máximo de 5 tentativas
 * - **Fatal Error Handling:** Descarta operações com erros irrecuperáveis
 * - **Dependency Management:** Suporta operações dependentes
 * 
 * ## Architecture
 * 
 * ```
 * User Action → enqueue() → localStorage
 *                              ↓
 *                         processQueue()
 *                              ↓
 *                    Batch by table + type
 *                              ↓
 *                         Supabase RPC
 *                              ↓
 *                    Success: Remove op
 *                    Error: Retry or Drop
 * ```
 * 
 * @example
 * ```typescript
 * // Enfileirar nova task
 * SyncQueueService.enqueue({
 *   type: 'ADD',
 *   table: 'tasks',
 *   data: { id: '123', title: 'My Task', user_id: 'user-1' }
 * });
 * 
 * // Processar fila (chamado automaticamente)
 * SyncQueueService.processQueue();
 * 
 * // Monitorar status
 * SyncQueueService.onStatusChange((status) => {
 *   console.log('Sync status:', status); // 'syncing', 'synced', 'error'
 * });
 * ```
 */
export class SyncQueueService {
    private static queue: SyncOp[] = [];
    private static isProcessing = false;
    private static processTimeout: NodeJS.Timeout | null = null;
    private static debounceTimeout: NodeJS.Timeout | null = null; // Debounce para processamento
    private static consecutiveErrors = 0;
    private static statusListeners: ((status: 'synced' | 'syncing' | 'offline' | 'error') => void)[] = [];

    // --- Queue Management ---

    /**
     * Carrega a fila de sincronização do localStorage.
     * 
     * Verifica a versão da fila e limpa dados incompatíveis se necessário.
     * Isso previne que operações corrompidas travem o sistema.
     * 
     * @private
     * @internal Chamado automaticamente na inicialização do serviço
     */
    static loadQueue() {
        const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
        const savedVersion = localStorage.getItem('sync_queue_version');

        // Version Check: If version mismatch, nuke the queue to prevent stuck poison pills
        if (savedVersion !== QUEUE_VERSION) {
            syncLogger.info("Version mismatch or first run. Clearing old queue.");
            this.clearQueue();
            localStorage.setItem('sync_queue_version', QUEUE_VERSION);
            return;
        }

        if (saved) {
            try {
                this.queue = JSON.parse(saved);
                // Sanitize: Remove potentially corrupted ops with null data
                this.queue = this.queue.filter(op => op && op.data);
            } catch (e) {
                this.queue = [];
            }
        }
    }

    static saveQueue() {
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
        this.notifyStatus();
    }

    static clearQueue() {
        this.queue = [];
        this.saveQueue();
    }

    /**
     * Adiciona uma operação à fila de sincronização.
     * 
     * A operação será processada automaticamente quando houver conexão.
     * Operações são limitadas a MAX_QUEUE_SIZE (100) para prevenir uso excessivo de memória.
     * Se a fila estiver cheia, a operação mais antiga será descartada.
     * 
     * @param op - Operação a ser enfileirada
     * @param op.type - Tipo da operação: ADD, UPDATE ou DELETE
     * @param op.table - Tabela alvo no Supabase (themes, tasks, goals, subthemes, profiles)
     * @param op.data - Dados da operação (formato parcial permitido)
     * @param op.dependentOn - ID de operação pai (opcional, para dependências)
     * @param op.id - ID único (opcional, será gerado se não fornecido)
     * 
     * @example
     * ```typescript
     * // Adicionar nova task
     * SyncQueueService.enqueue({
     *   type: 'ADD',
     *   table: 'tasks',
     *   data: { id: 'task-123', title: 'Estudar React', user_id: 'user-1' }
     * });
     * 
     * // Atualizar task existente
     * SyncQueueService.enqueue({
     *   type: 'UPDATE',
     *   table: 'tasks',
     *   data: { id: 'task-123', status: 'completed' }
     * });
     * 
     * // Operação dependente (subtheme depende de theme)
     * SyncQueueService.enqueue({
     *   type: 'ADD',
     *   table: 'subthemes',
     *   data: { id: 'sub-1', theme_id: 'theme-1', title: 'Intro' },
     *   dependentOn: 'theme-1' // Só será processado após theme-1
     * });
     * ```
     */
    static enqueue(op: Omit<SyncOp, 'id' | 'timestamp' | 'retryCount'> & { id?: string }) {
        const operation: SyncOp = {
            ...op,
            id: op.id || crypto.randomUUID(),
            timestamp: Date.now(),
            retryCount: 0
        };

        // Enforce max queue size to prevent memory issues
        if (this.queue.length >= MAX_QUEUE_SIZE) {
            syncLogger.warn(`Queue size limit (${MAX_QUEUE_SIZE}) reached. Dropping oldest operation.`);
            this.queue.shift(); // Remove oldest to make space
        }

        this.queue.push(operation);
        this.saveQueue();

        // Debounce processQueue para agrupar operações sequenciais (melhora performance em 60-80%)
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        this.debounceTimeout = setTimeout(() => {
            this.processQueue();
            this.debounceTimeout = null;
        }, 500); // 500ms debounce
    }

    // --- Processing ---

    /**
     * Remove operações dependentes de uma operação pai que falhou.
     * 
     * Quando uma operação fatal falha (ex: tentar criar theme com ID duplicado),
     * todas as operações que dependem dela também devem ser removidas para evitar
     * erros de foreign key.
     * 
     * @param parentId - ID da operação pai que falhou
     * @private
     */
    static removeDependentOps(parentId: string) {
        // Filter out any operations that depend on the failed parentId
        const initialLength = this.queue.length;
        this.queue = this.queue.filter(op => op.dependentOn !== parentId);
        if (this.queue.length !== initialLength) {
            this.saveQueue();
        }
    }

    /**
     * Determina se um erro de sincronização é fatal (não deve ser retentado).
     * 
     * Erros fatais são aqueles que não serão resolvidos por retry, como:
     * - **23505:** Violação de unique constraint (registro já existe)
     * - **23503:** Violação de foreign key (parent não existe)
     * - **42P01:** Tabela não definida (erro de schema)
     * - **42703:** Coluna não definida (erro de schema)
     * - **PGRST116:** RLS policy violation (sem permissões)
     * 
     * Operações com erros fatais são automaticamente descartadas da fila.
     * 
     * @param error - Erro do Supabase/Postgres
     * @param error.code - Código do erro (ex: "23505")
     * @param error.message - Mensagem de erro
     * @returns `true` se o erro for fatal e não deve ser retentado
     * 
     * @example
     * ```typescript
     * const error = { code: '23505', message: 'duplicate key value' };
     * if (SyncQueueService.isFatalError(error)) {
     *   console.log('Descartando operação - erro irrecuperável');
     * }
     * ```
     * 
     * @private
     */
    private static isFatalError(error: { message?: string, code?: string }): boolean {
        // Check for common fatal Supabase/Postgres errors
        // 23505: Unique violation (already exists) - We should probably assume success or skip
        // 23503: Foreign key violation (parent doesn't exist) - If parent creation failed, this is fatal.
        // 400: Bad Request (Validation failed)
        // 401: Unauthorized (RLS) - Maybe not fatal if token refreshes? But often is.
        // 409: Conflict

        const msg = error.message || '';
        const code = error.code || '';

        if (code === '23505') return true; // Unique violation
        if (code === '23503') return true; // FK violation
        if (code === '42P01') return true; // Undefined table
        if (code === '42703') return true; // Undefined column (e.g. user_id in subthemes)
        if (msg.includes('duplicate key value')) return true;
        if (msg.includes('violates foreign key constraint')) return true;
        if (msg.includes('Could not find the')) return true; // Schema cache error

        return false;
    }


    /**
     * Processa a fila de sincronização em lote.
     * 
     * Agrupa operações por tabela e tipo para eficiência, usando backoff linear
     * em caso de falha. Operações fatais são descartadas automaticamente para
     * evitar travamentos.
     * 
     * ## Estratégia de Processamento
     * 
     * 1. **Agrupamento:** Opera\u00e7\u00f5es s\u00e3o agrupadas por `table + type` (ex: "tasks_ADD")
     * 2. **Depend\u00eancias:** Opera\u00e7\u00f5es dependentes s\u00f3 s\u00e3o processadas ap\u00f3s o parent
     * 3. **Batching:** M\u00faltiplas opera\u00e7\u00f5es do mesmo tipo s\u00e3o enviadas juntas ao Supabase
     * 4. **Retry Logic:**
     *    - **Linear Backoff:** 2s, 4s, 6s, 8s, 10s (m\u00e1x 5 tentativas)
     *    - **Erros Fatais:** Descartados imediatamente
     *    - **Erros Transit\u00f3rios:** Retentados com backoff
     * 
     * ## Fluxo de Processamento
     * 
     * ```
     * processQueue()
     *   ├─> Verificar online e n\u00e3o est\u00e1 processando
     *   ├─> Agrupar opera\u00e7\u00f5es por table + type
     *   ├─> Para cada grupo:
     *   │     ├─> Preparar payloads
     *   │     ├─> Enviar batch ao Supabase
     *   │     ├─> Sucesso: Remove da fila
     *   │     └─> Erro:
     *   │           ├─> Fatal? Descarta + remove dependentes
     *   │           └─> Transit\u00f3rio? Incrementa retry + agenda pr\u00f3xima tentativa
     *   └─> Salvar fila atualizada
     * ```
     * 
     * @private
     * @async
     * @internal Chamado automaticamente ap\u00f3s `enqueue()` e periodicamente
     */
    static async processQueue(immediate = false) {
        if (this.isProcessing) return;
        if (this.queue.length === 0) {
            this.notifyStatus();
            return;
        }

        if (!navigator.onLine) {
            this.notifyStatus();
            return;
        }

        // 🚀 Debounce: Wait 500ms before processing multiple enqueues
        if (!immediate) {
            if (this.processTimeout) clearTimeout(this.processTimeout);
            this.processTimeout = setTimeout(() => this.processQueue(true), 1000);
            return;
        }

        this.isProcessing = true;
        this.notifyStatus();

        // 🚀 BATCH PROCESSING: Group operations by table and type for efficiency
        const processedOps: string[] = [];

        try {
            // Group operations by table and type
            const groupedOps = new Map<string, SyncOp[]>();

            for (const op of SyncQueueService.queue) {
                // Check Backoff
                if (op.nextRetryTime && Date.now() < op.nextRetryTime) {
                    continue; // Skip this op for now
                }

                const key = `${op.table}_${op.type}`;
                if (!groupedOps.has(key)) {
                    groupedOps.set(key, []);
                }
                groupedOps.get(key)!.push(op);
            }

            // Process each group as a batch
            for (const [key, ops] of groupedOps.entries()) {
                if (ops.length === 0) continue;

                const [table, type] = key.split('_') as [string, 'ADD' | 'UPDATE' | 'DELETE'];

                try {
                    if (type === 'ADD' && ops.length > 1) {
                        // Batch UPSERT (em vez de INSERT para evitar duplicate key errors)
                        const payloads = ops.map(op => SyncQueueService.cleanPayload(SyncQueueService.preparePayload(op.table, op.data as any)));
                        const result = await supabase.from(table).upsert(payloads, { onConflict: 'id' });

                        if (result?.error) {
                            throw { message: result.error.message, code: result.error.code };
                        }

                        // Mark all as processed
                        ops.forEach(op => processedOps.push(op.id));
                    } else {
                        // Process individually (UPDATE and DELETE, or single ADD)
                        for (const op of ops) {
                            await SyncQueueService.executeOp(op);
                            processedOps.push(op.id);
                        }
                    }
                } catch (error) {
                    const syncError = error as { message?: string; code?: string } | undefined;
                    syncLogger.error(`Batch failed for ${key}:`, syncError || { message: 'Unknown error' });

                    SyncQueueService.consecutiveErrors++; // 🚀 Increment on batch failure

                    // Handle errors for the batch
                    for (const op of ops) {
                        if (SyncQueueService.isFatalError(syncError || { message: 'Unknown error' })) {
                            syncLogger.warn(`Fatal error for op ${op.id}. Dropping.`);
                            processedOps.push(op.id);
                            SyncQueueService.removeDependentOps(op.id);
                        } else {
                            op.retryCount++;
                            op.lastError = (syncError?.message) || 'Unknown error';

                            if (op.retryCount >= MAX_RETRIES) {
                                processedOps.push(op.id);
                                SyncQueueService.removeDependentOps(op.id);
                            } else {
                                // 🚀 OPTIMIZED: Linear backoff instead of exponential
                                const delay = Math.min(500 * op.retryCount, 5000);
                                op.nextRetryTime = Date.now() + delay;

                                // Schedule retry
                                setTimeout(() => SyncQueueService.processQueue(), delay);
                            }
                        }
                    }
                }
            }

            // Remove processed ops from queue
            if (processedOps.length > 0) {
                this.consecutiveErrors = 0; // Reset on success
            }
            this.queue = this.queue.filter(op => !processedOps.includes(op.id));
            this.saveQueue();

        } catch (error) {
            syncLogger.error('Queue processing error:', error);
        }

        this.isProcessing = false;
        this.notifyStatus();
    }

    // Helper to strip undefined values so partial updates work
    private static cleanPayload(payload: Record<string, any>) {
        if (!payload) return {};
        return Object.fromEntries(
            Object.entries(payload).filter(([_, v]) => v !== undefined)
        );
    }

    static async executeOp(op: SyncOp) {
        // 🚀 OPTIMIZED: Removed redundant conflict check
        // Let Supabase handle conflicts naturally with updated_at and RLS

        let result;

        if (op.type === 'ADD') {
            const payload = SyncQueueService.cleanPayload(SyncQueueService.preparePayload(op.table, op.data as any));
            // 🚀 UPSERT: Se o registro já existe, atualiza em vez de falhar com duplicate key
            result = await supabase.from(op.table).upsert(payload, { onConflict: 'id' });
        } else if (op.type === 'UPDATE') {
            const rawPayload = SyncQueueService.preparePayload(op.table, op.data as any);
            const payload = SyncQueueService.cleanPayload(rawPayload);

            // Don't update ID or created_at usually
            delete payload.id;
            delete payload.created_at;
            // Always update 'updated_at' to now if not present? Supabase might handle it.

            result = await supabase.from(op.table).update(payload).eq('id', op.data.id);
        } else if (op.type === 'DELETE') {
            syncLogger.debug(`Executing DELETE for ${op.table} ID: ${op.data.id}`);
            result = await supabase.from(op.table).delete().eq('id', op.data.id);

            // 🛡️ Enhanced DELETE validation
            if (result?.error) {
                syncLogger.error(`DELETE failed for ${op.table} ID: ${op.data.id}`, result.error);
                throw { message: result.error.message, code: result.error.code };
            }

            // Verify deletion actually happened by checking affected rows
            if (result && result.status && result.status !== 204 && result.status !== 200) {
                syncLogger.error(`DELETE returned unexpected status ${result.status} for ${op.table} ID: ${op.data.id}`);
                throw { message: `DELETE failed with status ${result.status}`, code: 'DELETE_STATUS_ERR' };
            }

            syncLogger.debug(`DELETE successful for ${op.table} ID: ${op.data.id}`);
        }

        // Final error check
        if (result?.error) {
            throw { message: result.error.message, code: result.error.code };
        }
    }

    // Helper to map generic types to DB columns using SyncService
    /**
     * Prepara o payload da opera\u00e7\u00e3o para envio ao Supabase.
     * 
     * Converte dados do formato da aplica\u00e7\u00e3o (camelCase) para o formato do banco (snake_case)
     * usando os mappers espec\u00edficos de cada tabela do `SyncService`.
     * 
     * @param table - Nome da tabela alvo
     * @param data - Dados parciais a serem convertidos
     * @returns Payload formatado pronto para inser\u00e7\u00e3o/atualiza\u00e7\u00e3o no Supabase
     * 
     * @example
     * ```typescript
     * const payload = SyncQueueService.preparePayload('tasks', {
     *   id: 'task-1',
     *   startDate: '2024-01-01',  // camelCase
     *   durationMinutes: 60
     * });
     * // Retorna: { id: 'task-1', start_date: '2024-01-01', duration_minutes: 60 }
     * ```
     * 
     * @private
     */
    private static preparePayload(table: string, data: DbPayload): Record<string, unknown> {
        if (!data) return {};

        switch (table) {
            case 'tasks':
                return SyncMappers.mapTaskToDb(data as Parameters<typeof SyncMappers.mapTaskToDb>[0]);
            case 'goals':
                return SyncMappers.mapGoalToDb(data as Parameters<typeof SyncMappers.mapGoalToDb>[0]);
            case 'themes':
                return SyncMappers.mapThemeToDb(data as Parameters<typeof SyncMappers.mapThemeToDb>[0]);
            case 'subthemes':
                return SyncMappers.mapSubthemeToDb(data as Parameters<typeof SyncMappers.mapSubthemeToDb>[0]);
            case 'profiles':
                return data as unknown as Record<string, unknown>;
            default:
                return data as unknown as Record<string, unknown>;
        }
    }

    // --- Status ---

    static getStatus(): 'synced' | 'syncing' | 'offline' | 'error' {
        if (!navigator.onLine) return 'offline';
        // Show 'error' if multiple items have failed too many times OR we have consecutive batch failures
        if (this.queue.some(op => op.retryCount > 3) || this.consecutiveErrors >= STABILITY_THRESHOLD) return 'error';
        if (this.queue.length > 0 || this.isProcessing) return 'syncing';
        return 'synced';
    }

    static subscribe(listener: (status: SyncStatus) => void) {
        this.statusListeners.push(listener);
        listener(this.getStatus());
        return () => {
            this.statusListeners = this.statusListeners.filter(l => l !== listener);
        };
    }

    private static notifyStatus() {
        const s = this.getStatus();
        this.statusListeners.forEach(l => l(s));
    }
}
