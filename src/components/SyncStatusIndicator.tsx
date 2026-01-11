import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, AlertCircle, CheckCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { SyncQueueService } from '../services/SyncQueueService';
import { SyncDiagnosticsPanel } from './SyncDiagnosticsPanel';
import type { SyncStatus } from '../types/sync';

export const SyncStatusIndicator: React.FC = () => {
    const [status, setStatus] = useState<SyncStatus>('synced');
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDiagnostics, setShowDiagnostics] = useState(false);
    const [queueInfo, setQueueInfo] = useState<{ pending: number; lastSync?: string }>({ pending: 0 });

    useEffect(() => {
        const unsubscribe = SyncQueueService.subscribe((newStatus) => {
            setStatus(newStatus);

            // Update queue info
            const queue = SyncQueueService['queue'] || [];
            setQueueInfo({
                pending: queue.length,
                lastSync: queue.length === 0 ? new Date().toLocaleTimeString() : undefined
            });
        });

        return unsubscribe;
    }, []);

    const getStatusConfig = () => {
        switch (status) {
            case 'synced':
                return {
                    icon: CheckCircle,
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    label: 'Sincronizado',
                    pulse: false
                };
            case 'syncing':
                return {
                    icon: RefreshCw,
                    color: 'text-blue-400',
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/20',
                    label: 'Sincronizando',
                    pulse: true
                };
            case 'offline':
                return {
                    icon: CloudOff,
                    color: 'text-slate-400',
                    bg: 'bg-slate-500/10',
                    border: 'border-slate-500/20',
                    label: 'Offline',
                    pulse: false
                };
            case 'error':
                return {
                    icon: AlertCircle,
                    color: 'text-red-400',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    label: 'Erro de Sincronização',
                    pulse: true
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    const handleForceSync = () => {
        SyncQueueService.processQueue(true);
    };

    return (
        <>
            <div className="fixed bottom-24 right-4 z-40 lg:bottom-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-end gap-2"
                >
                    {/* Main Status Button */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`
                            ${config.bg} ${config.border} ${config.color}
                            border backdrop-blur-xl rounded-full
                            px-3 py-2 flex items-center gap-2
                            transition-all duration-200
                            hover:scale-105 active:scale-95
                            shadow-lg
                        `}
                    >
                        <Icon className={`w-4 h-4 ${config.pulse ? 'animate-spin' : ''}`} />
                        <span className="text-xs font-medium hidden sm:inline">{config.label}</span>
                        {queueInfo.pending > 0 && (
                            <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                {queueInfo.pending}
                            </span>
                        )}
                        {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                        ) : (
                            <ChevronUp className="w-3 h-3" />
                        )}
                    </button>

                    {/* Expanded Details */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-lg p-4 shadow-2xl min-w-[280px]"
                            >
                                <div className="space-y-3">
                                    {/* Status Info */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            Status de Sincronização
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <Icon className={`w-5 h-5 ${config.color} ${config.pulse ? 'animate-spin' : ''}`} />
                                            <span className={`text-sm font-medium ${config.color}`}>
                                                {config.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Queue Info */}
                                    <div className="border-t border-slate-800/50 pt-3">
                                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                            <span>Operações Pendentes:</span>
                                            <span className="font-mono font-bold text-slate-300">{queueInfo.pending}</span>
                                        </div>
                                        {queueInfo.lastSync && (
                                            <div className="flex items-center justify-between text-xs text-slate-400">
                                                <span>Última Sincronização:</span>
                                                <span className="font-mono text-slate-300">{queueInfo.lastSync}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="border-t border-slate-800/50 pt-3 flex gap-2">
                                        <button
                                            onClick={handleForceSync}
                                            disabled={status === 'offline' || status === 'syncing'}
                                            className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            Forçar Sync
                                        </button>
                                        <button
                                            onClick={() => setShowDiagnostics(true)}
                                            className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <Cloud className="w-3 h-3" />
                                            Debug
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Diagnostics Panel */}
            <SyncDiagnosticsPanel
                isOpen={showDiagnostics}
                onClose={() => setShowDiagnostics(false)}
            />
        </>
    );
};
