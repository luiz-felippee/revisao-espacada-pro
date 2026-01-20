import { supabase } from '../lib/supabase';
import { syncLogger } from '../utils/logger';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * 🚀 RealtimeService v2 - Serviço de Sincronização em Tempo Real
 * 
 * Este serviço gerencia TODA a comunicação em tempo real com o Supabase.
 * Ele é inicializado UMA VEZ quando o usuário faz login e mantém
 * conexões persistentes para todas as tabelas relevantes.
 * 
 * ## Arquitetura
 * 
 * ```
 * Dispositivo A                    Supabase                    Dispositivo B
 *      │                              │                              │
 *      │── INSERT/UPDATE/DELETE ─────▶│                              │
 *      │                              │── Postgres Changes ─────────▶│
 *      │                              │                              │
 *      │◀────── Realtime Event ───────│                              │
 * ```
 */

export type SyncTable = 'tasks' | 'goals' | 'themes' | 'subthemes';
export type SyncEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface SyncCallback {
    (event: SyncEvent, record: any, oldRecord?: any): void;
}

class RealtimeServiceClass {
    private channel: RealtimeChannel | null = null;
    private userId: string | null = null;
    private callbacks: Map<SyncTable, Set<SyncCallback>> = new Map();
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    /**
     * Inicializa o serviço de Realtime para um usuário
     */
    initialize(userId: string): void {
        if (this.userId === userId && this.isConnected) {
            syncLogger.info('[RealtimeService] Already initialized for this user');
            return;
        }

        // Desconectar anterior se existir
        if (this.channel) {
            this.disconnect();
        }

        this.userId = userId;
        this.reconnectAttempts = 0;

        syncLogger.info(`[RealtimeService] 🚀 Initializing for user: ${userId.substring(0, 8)}...`);

        this.createChannel();
    }

    /**
     * Cria o canal de Realtime e inscreve em todas as tabelas
     */
    private createChannel(): void {
        if (!this.userId) return;

        const channelName = `sync-${this.userId.substring(0, 8)}-${Date.now()}`;

        this.channel = supabase.channel(channelName);

        // Inscrever em cada tabela
        const tables: SyncTable[] = ['tasks', 'goals', 'themes', 'subthemes'];

        tables.forEach(table => {
            this.channel!
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: table,
                        filter: `user_id=eq.${this.userId}`
                    },
                    (payload: RealtimePostgresChangesPayload<any>) => {
                        this.handleChange(table, payload);
                    }
                );
        });

        // Conectar e monitorar status
        this.channel.subscribe((status) => {
            syncLogger.info(`[RealtimeService] Channel status: ${status}`);

            if (status === 'SUBSCRIBED') {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                syncLogger.info('[RealtimeService] ✅ Connected and listening');
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                this.isConnected = false;
                syncLogger.error(`[RealtimeService] ❌ Connection error: ${status}`);
                this.handleReconnect();
            } else if (status === 'CLOSED') {
                this.isConnected = false;
                syncLogger.warn('[RealtimeService] Channel closed');
            }
        });
    }

    /**
     * Processa mudanças recebidas do Realtime
     */
    private handleChange(table: SyncTable, payload: RealtimePostgresChangesPayload<any>): void {
        const event = payload.eventType as SyncEvent;
        const record = payload.new || payload.old;
        const oldRecord = payload.old;

        syncLogger.info(`[RealtimeService] 📥 ${table} ${event}:`, {
            id: record?.id?.substring(0, 8)
        });

        // Notificar todos os callbacks registrados para esta tabela
        const callbacks = this.callbacks.get(table);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(event, record, oldRecord);
                } catch (error) {
                    syncLogger.error(`[RealtimeService] Callback error for ${table}:`, error);
                }
            });
        }
    }

    /**
     * Tenta reconectar em caso de falha
     */
    private handleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            syncLogger.error('[RealtimeService] Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

        syncLogger.info(`[RealtimeService] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            if (this.userId && !this.isConnected) {
                this.createChannel();
            }
        }, delay);
    }

    /**
     * Registra um callback para mudanças em uma tabela
     * 
     * @returns Função para cancelar a inscrição
     */
    subscribe(table: SyncTable, callback: SyncCallback): () => void {
        if (!this.callbacks.has(table)) {
            this.callbacks.set(table, new Set());
        }

        this.callbacks.get(table)!.add(callback);
        syncLogger.info(`[RealtimeService] 📝 Subscribed to ${table}`);

        // Retornar função de cleanup
        return () => {
            this.callbacks.get(table)?.delete(callback);
            syncLogger.info(`[RealtimeService] 🗑️ Unsubscribed from ${table}`);
        };
    }

    /**
     * Desconecta e limpa recursos
     */
    disconnect(): void {
        syncLogger.info('[RealtimeService] 🔌 Disconnecting...');

        if (this.channel) {
            supabase.removeChannel(this.channel);
            this.channel = null;
        }

        this.callbacks.clear();
        this.isConnected = false;
        this.userId = null;
        this.reconnectAttempts = 0;
    }

    /**
     * Verifica se está conectado
     */
    isFullyConnected(): boolean {
        return this.isConnected;
    }

    /**
     * Obtém o status atual
     */
    getStatus(): 'connected' | 'connecting' | 'disconnected' | 'error' {
        if (this.isConnected) return 'connected';
        if (this.channel && !this.isConnected) return 'connecting';
        if (this.reconnectAttempts >= this.maxReconnectAttempts) return 'error';
        return 'disconnected';
    }
}

// Exportar instância singleton
export const RealtimeService = new RealtimeServiceClass();
