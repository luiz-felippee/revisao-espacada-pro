import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Wifi, WifiOff, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SyncQueueService } from '../services/SyncQueueService';

interface DiagnosticResult {
    status: 'success' | 'warning' | 'error';
    message: string;
    action?: string;
}

export const SyncHealthMonitor: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [autoFix, setAutoFix] = useState(false);

    const runDiagnostics = () => {
        setIsRunning(true);
        const results: DiagnosticResult[] = [];

        // 1. Verificar autenticação
        if (!user) {
            results.push({
                status: 'error',
                message: 'Nenhum usuário autenticado',
                action: autoFix ? 'Tentando criar usuário Guest...' : 'Faça login ou recarregue a página'
            });
        } else {
            results.push({
                status: 'success',
                message: `Usuário autenticado: ${user.email || user.id}`
            });
        }

        // 2. Verificar variáveis de ambiente
        const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            results.push({
                status: 'error',
                message: 'Variáveis Supabase não configuradas',
                action: 'Configure o arquivo .env e reinicie o servidor'
            });
        } else {
            results.push({
                status: 'success',
                message: 'Supabase configurado corretamente'
            });
        }

        // 3. Verificar fila de sincronização
        try {
            const queueRaw = localStorage.getItem('sync_queue_v1');
            if (queueRaw) {
                const queue = JSON.parse(queueRaw);
                if (Array.isArray(queue)) {
                    if (queue.length === 0) {
                        results.push({
                            status: 'success',
                            message: 'Fila de sincronização vazia (tudo sincronizado)'
                        });
                    } else {
                        const errorsCount = queue.filter((op: any) => op.retryCount > 3).length;
                        if (errorsCount > 0) {
                            results.push({
                                status: 'error',
                                message: `${errorsCount} operações com falhas na fila`,
                                action: autoFix ? 'Limpando fila...' : 'Clique em "Corrigir Automaticamente"'
                            });

                            if (autoFix) {
                                localStorage.removeItem('sync_queue_v1');
                                results[results.length - 1].action = 'Fila limpa! Recarregue a página.';
                            }
                        } else {
                            results.push({
                                status: 'warning',
                                message: `${queue.length} operações aguardando sincronização`
                            });
                        }
                    }
                }
            }
        } catch (e) {
            results.push({
                status: 'error',
                message: 'Fila de sincronização corrompida',
                action: autoFix ? 'Limpando...' : 'Clique em "Corrigir Automaticamente"'
            });

            if (autoFix) {
                localStorage.removeItem('sync_queue_v1');
                results[results.length - 1].action = 'Fila limpa!';
            }
        }

        // 4. Verificar dados locais
        const localData = {
            'Tarefas': localStorage.getItem('study_tasks_backup'),
            'Metas': localStorage.getItem('study_goals_backup'),
            'Temas': localStorage.getItem('study_themes_backup')
        };

        let totalItems = 0;
        for (const [name, data] of Object.entries(localData)) {
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    const count = Array.isArray(parsed) ? parsed.length : 0;
                    totalItems += count;
                } catch (e) {
                    results.push({
                        status: 'error',
                        message: `Dados de ${name} corrompidos`,
                        action: autoFix ? 'Corrigindo...' : 'Requer ação manual'
                    });
                }
            }
        }

        if (totalItems > 0) {
            results.push({
                status: 'success',
                message: `${totalItems} itens salvos localmente`
            });
        }

        // 5. Verificar conexão
        if (!navigator.onLine) {
            results.push({
                status: 'warning',
                message: 'Sem conexão com a internet',
                action: 'Dados serão sincronizados quando voltar online'
            });
        } else {
            results.push({
                status: 'success',
                message: 'Conexão de rede ativa'
            });
        }

        setDiagnostics(results);
        setIsRunning(false);
    };

    const forceSyncNow = () => {
        SyncQueueService.processQueue(true);
        setTimeout(() => {
            runDiagnostics();
        }, 2000);
    };

    useEffect(() => {
        if (isOpen && diagnostics.length === 0) {
            runDiagnostics();
        }
    }, [isOpen]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-4 z-[9999] px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-2xl flex items-center gap-3 transition-all hover:scale-105 animate-pulse"
                style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }}
            >
                <AlertCircle className="w-6 h-6" />
                <span className="font-bold text-lg">🔧 Diagnóstico</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <AlertCircle className="w-6 h-6 text-blue-400" />
                            Diagnóstico de Sincronização
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Verificando saúde do sistema de persistência de dados
                        </p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {diagnostics.map((result, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-xl border ${result.status === 'success'
                                ? 'bg-green-500/10 border-green-500/30'
                                : result.status === 'warning'
                                    ? 'bg-yellow-500/10 border-yellow-500/30'
                                    : 'bg-red-500/10 border-red-500/30'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {result.status === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                                ) : result.status === 'warning' ? (
                                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                                )}
                                <div className="flex-1">
                                    <p className="text-white font-medium">{result.message}</p>
                                    {result.action && (
                                        <p className="text-slate-400 text-sm mt-1">{result.action}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {diagnostics.length === 0 && isRunning && (
                        <div className="text-center py-8">
                            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
                            <p className="text-slate-400">Executando diagnóstico...</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-slate-700 space-y-3">
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => {
                                setAutoFix(false);
                                runDiagnostics();
                            }}
                            disabled={isRunning}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                            Atualizar Diagnóstico
                        </button>

                        <button
                            onClick={() => {
                                setAutoFix(true);
                                runDiagnostics();
                            }}
                            disabled={isRunning}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Corrigir Automaticamente
                        </button>
                    </div>

                    <button
                        onClick={forceSyncNow}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {navigator.onLine ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                        Forçar Sincronização Agora
                    </button>

                    <div className="text-center text-slate-500 text-xs">
                        {navigator.onLine ? (
                            <span className="text-green-400">● Online</span>
                        ) : (
                            <span className="text-red-400">● Offline</span>
                        )}
                        {' • '}
                        {user ? `Conectado como ${user.email || 'Guest'}` : 'Não autenticado'}
                    </div>
                </div>
            </div>
        </div>
    );
};
