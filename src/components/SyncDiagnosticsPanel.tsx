import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Trash2, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { SyncQueueService, type SyncOp } from '../services/SyncQueueService';
import { SimpleSyncService } from '../services/SimpleSyncService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface SyncDiagnosticsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SyncDiagnosticsPanel: React.FC<SyncDiagnosticsPanelProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [queue, setQueue] = useState<SyncOp[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
    const [refreshKey, setRefreshKey] = useState(0);
    const [simpleSyncInfo, setSimpleSyncInfo] = useState<any>(null);

    const loadQueue = useCallback(() => {
        // Access private queue via reflection (for diagnostics only)
        const queueData = (SyncQueueService as any).queue || [];
        setQueue([...queueData]);
    }, []);

    const testConnection = useCallback(async () => {
        setConnectionStatus('testing');
        try {
            const { error } = await supabase.from('profiles').select('id').limit(1);
            setConnectionStatus(error ? 'failed' : 'connected');
        } catch {
            setConnectionStatus('failed');
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadQueue();
            testConnection();
            setSimpleSyncInfo(SimpleSyncService.getDebugInfo());
        }
    }, [isOpen, refreshKey, loadQueue, testConnection]);

    // Timer para atualizar dados do SimpleSync quando aberto
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            setSimpleSyncInfo(SimpleSyncService.getDebugInfo());
        }, 1000);
        return () => clearInterval(interval);
    }, [isOpen]);

    const handleClearQueue = () => {
        if (confirm('⚠️ Isso irá limpar TODAS as operações pendentes. Dados não sincronizados serão perdidos. Continuar?')) {
            SyncQueueService.clearQueue();
            setRefreshKey(prev => prev + 1);
        }
    };

    const handleForceSync = () => {
        SyncQueueService.processQueue(true);
        setTimeout(() => setRefreshKey(prev => prev + 1), 1000);
    };

    const handleExportQueue = () => {
        const data = JSON.stringify(queue, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sync-queue-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDeleteOp = (opId: string) => {
        if (confirm('Remover esta operação da fila?')) {
            (SyncQueueService as any).queue = queue.filter((op: SyncOp) => op.id !== opId);
            (SyncQueueService as any).saveQueue();
            setRefreshKey(prev => prev + 1);
        }
    };

    const getOpStatusIcon = (op: SyncOp) => {
        if (op.lastError) return <AlertTriangle className="w-4 h-4 text-red-400" />;
        if (op.retryCount > 0) return <RefreshCw className="w-4 h-4 text-yellow-400" />;
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Diagnóstico de Sincronização</h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    Debug e monitoramento da fila de sync
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Connection Status */}
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <h3 className="text-sm font-bold text-slate-300 mb-3">Status da Conexão</h3>
                                <div className="flex items-center gap-3">
                                    {connectionStatus === 'testing' && (
                                        <>
                                            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                                            <span className="text-sm text-slate-400">Testando conexão...</span>
                                        </>
                                    )}
                                    {connectionStatus === 'connected' && (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                                            <span className="text-sm text-emerald-400 font-medium">Conectado ao Supabase</span>
                                        </>
                                    )}
                                    {connectionStatus === 'failed' && (
                                        <>
                                            <AlertTriangle className="w-5 h-5 text-red-400" />
                                            <span className="text-sm text-red-400 font-medium">Falha na conexão</span>
                                        </>
                                    )}
                                    <button
                                        onClick={testConnection}
                                        className="ml-auto px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-300 transition-colors"
                                    >
                                        Testar
                                    </button>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">User ID:</span>
                                        <span className="text-slate-300 font-mono">{user?.id || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Online:</span>
                                        <span className="text-slate-300">{navigator.onLine ? '✅ Sim' : '❌ Não'}</span>
                                    </div>
                                </div>
                            </div>


                            {/* SimpleSync Status (NEW) */}
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <h3 className="text-sm font-bold text-slate-300 mb-3">Sincronização em Tempo Real (Polling)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500">Status:</p>
                                        <p className={`text-sm font-mono ${simpleSyncInfo?.isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                                            {simpleSyncInfo?.isActive ? '✅ ATIVO' : '🛑 PARADO'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Ouvintes:</p>
                                        <p className="text-sm text-slate-300 font-mono">
                                            {simpleSyncInfo?.listenersCount || 0} providers
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Intervalo:</p>
                                        <p className="text-sm text-slate-300 font-mono">
                                            {simpleSyncInfo?.syncInterval || 0}ms
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">User ID (Sync):</p>
                                        <p className="text-xs text-slate-300 font-mono truncate" title={simpleSyncInfo?.userId}>
                                            {simpleSyncInfo?.userId?.substring(0, 8)}...
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Queue Info */}
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-slate-300">Fila de Sincronização</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleExportQueue}
                                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-300 transition-colors flex items-center gap-1.5"
                                        >
                                            <Download className="w-3 h-3" />
                                            Exportar
                                        </button>
                                        <button
                                            onClick={handleForceSync}
                                            disabled={queue.length === 0}
                                            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-xs text-blue-400 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            Forçar Sync
                                        </button>
                                        <button
                                            onClick={handleClearQueue}
                                            disabled={queue.length === 0}
                                            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs text-red-400 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Limpar
                                        </button>
                                    </div>
                                </div>

                                <div className="text-sm text-slate-400 mb-4">
                                    {queue.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            ✅ Nenhuma operação pendente
                                        </div>
                                    ) : (
                                        <span>{queue.length} operação(ões) na fila</span>
                                    )}
                                </div>

                                {/* Queue Items */}
                                {queue.length > 0 && (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {queue.map((op) => (
                                            <div
                                                key={op.id}
                                                className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30"
                                            >
                                                <div className="flex items-start gap-3">
                                                    {getOpStatusIcon(op)}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-mono font-bold text-blue-400">
                                                                {op.type}
                                                            </span>
                                                            <span className="text-xs text-slate-500">→</span>
                                                            <span className="text-xs font-medium text-slate-300">
                                                                {op.table}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 font-mono truncate">
                                                            ID: {op.data?.id || 'N/A'}
                                                        </div>
                                                        {op.lastError && (
                                                            <div className="mt-1 text-xs text-red-400 truncate">
                                                                ⚠️ {op.lastError}
                                                            </div>
                                                        )}
                                                        {op.retryCount > 0 && (
                                                            <div className="mt-1 text-xs text-yellow-400">
                                                                🔄 Tentativa {op.retryCount}/5
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteOp(op.id)}
                                                        className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3 text-red-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

