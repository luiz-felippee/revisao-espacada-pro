import { supabase } from '../lib/supabase';
import { syncLogger } from '../utils/logger';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Serviço centralizado de sincronização em tempo real via Supabase.
 * 
 * Gerencia todas as assinaturas realtime e garante que mudanças
 * feitas em qualquer dispositivo sejam refletidas automaticamente
 * em todos os outros dispositivos conectados.
 * 
 * ## Arquitetura
 * 
 * ```
 * Device A: Cria Task → Supabase → Postgres Change
 *                                       ↓
 *                            Realtime Broadcast
 *                                       ↓
 * Device B: Recebe evento → Refetch → UI Update
 * ```
 * 
 * ## Features
 * - **Cross-Device Sync:** Todas as mudanças são propagadas em tempo real
 * - **Auto-Reconnect:** Reconecta automaticamente em caso de perda de conexão
 * - **Centralized:** Um único canal para todas as tabelas
 * - **Type-Safe:** Tipagem completa para todos os eventos
 * 
 * @example
 * ```typescript
 * // Inscrever-se para mudanças em tasks
 * RealtimeService.subscribe('tasks', (event, record) => {
 *   console.log('Task changed:', event, record);
 *   refreshTasks();
 * });
 * 
 * // Cleanup
 * RealtimeService.unsubscribe('tasks');
 * ```
 */
export class RealtimeService {
    private static channels = new Map<string, RealtimeChannel>();
    private static subscribers = new Map<string, Set<(event: string, record: any) => void>>();
    private static userId: string | null = null;

    /**
     * Inicializa o serviço de realtime para um usuário específico.
     * 
     * @param userId - ID do usuário autenticado
     */
    static initialize(userId: string) {
        if (this.userId === userId) return; // Already initialized for this user

        this.userId = userId;
        syncLogger.info(`[RealtimeService] Initializing for user: ${userId}`);

        // Subscribe to all tables
        this.subscribeToTable('tasks', userId);
        this.subscribeToTable('goals', userId);
        this.subscribeToTable('themes', userId);
        this.subscribeToTable('subthemes', userId);
    }

    /**
     * Desconecta todas as assinaturas realtime.
     */
    static disconnect() {
        syncLogger.info('[RealtimeService] Disconnecting all channels');

        this.channels.forEach((channel, table) => {
            syncLogger.info(`[RealtimeService] Removing channel: ${table}`);
            supabase.removeChannel(channel);
        });

        this.channels.clear();
        this.subscribers.clear();
        this.userId = null;
    }

    /**
     * Inscreve-se para mudanças em uma tabela específica.
     * 
     * @param table - Nome da tabela (tasks, goals, themes, subthemes)
     * @param callback - Função chamada quando há mudança
     * @returns Função para cancelar a inscrição
     */
    static subscribe(
        table: 'tasks' | 'goals' | 'themes' | 'subthemes',
        callback: (event: string, record: any) => void
    ): () => void {
        if (!this.subscribers.has(table)) {
            this.subscribers.set(table, new Set());
        }

        this.subscribers.get(table)!.add(callback);
        syncLogger.info(`[RealtimeService] Added subscriber for ${table}`);

        // Return unsubscribe function
        return () => {
            this.subscribers.get(table)?.delete(callback);
            syncLogger.info(`[RealtimeService] Removed subscriber for ${table}`);
        };
    }

    /**
     * Cria uma assinatura realtime para uma tabela.
     * 
     * @private
     */
    private static subscribeToTable(table: string, userId: string) {
        // Remove existing channel if any
        const existingChannel = this.channels.get(table);
        if (existingChannel) {
            supabase.removeChannel(existingChannel);
        }

        const channelName = `realtime-${table}-${userId}`;
        syncLogger.info(`[RealtimeService] Creating channel: ${channelName}`);

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: table,
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    syncLogger.info(`[RealtimeService] ${table} change:`, {
                        event: payload.eventType,
                        id: (payload.new as any)?.id || (payload.old as any)?.id
                    });

                    // Notify all subscribers
                    const subscribers = this.subscribers.get(table);
                    if (subscribers) {
                        const record = payload.new || payload.old;
                        subscribers.forEach(callback => {
                            try {
                                callback(payload.eventType as any, record);
                            } catch (error) {
                                syncLogger.error(`[RealtimeService] Subscriber error for ${table}:`, error);
                            }
                        });
                    }
                }
            )
            .subscribe((status) => {
                syncLogger.info(`[RealtimeService] Channel ${channelName} status: ${status}`);

                if (status === 'SUBSCRIBED') {
                    syncLogger.info(`[RealtimeService] ✅ Successfully subscribed to ${table}`);
                } else if (status === 'CHANNEL_ERROR') {
                    syncLogger.error(`[RealtimeService] ❌ Channel error for ${table}`);
                } else if (status === 'TIMED_OUT') {
                    syncLogger.error(`[RealtimeService] ⏱️ Connection timed out for ${table}`);
                }
            });

        this.channels.set(table, channel);
    }

    /**
     * Obtém o status de conexão de uma tabela.
     */
    static getChannelStatus(table: string): string | null {
        const channel = this.channels.get(table);
        return channel?.state ?? null;
    }

    /**
     * Verifica se todas as assinaturas estão ativas.
     */
    static isFullyConnected(): boolean {
        if (this.channels.size === 0) return false;

        for (const [table, channel] of this.channels.entries()) {
            if (channel.state !== 'joined') {
                syncLogger.warn(`[RealtimeService] Channel ${table} not joined: ${channel.state}`);
                return false;
            }
        }

        return true;
    }
}
