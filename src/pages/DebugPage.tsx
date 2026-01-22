import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { SimpleSyncService } from '../services/SimpleSyncService';
import { supabase } from '../lib/supabase';

/**
 * 🕵️ Debug Page - Diagnóstico in-app
 * Mostra estado interno para identificar problemas de sync
 */
export const DebugPage: React.FC = () => {
    const { user } = useAuth();
    const { tasks, goals, themes } = useStudy();
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [supabaseStatus, setSupabaseStatus] = useState<string>('Verificando...');
    const [logs, setLogs] = useState<string[]>([]);

    const refreshDebugInfo = () => {
        setDebugInfo(SimpleSyncService.getDebugInfo());
    };

    const checkSupabase = async () => {
        try {
            setSupabaseStatus('⏳ Testando conexão...');
            const start = Date.now();
            const { count, error } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
            const time = Date.now() - start;

            if (error) throw error;
            setSupabaseStatus(`✅ Conectado (${time}ms) | Total Tasks no DB: ${count}`);
        } catch (e: any) {
            setSupabaseStatus(`❌ Erro: ${e.message}`);
        }
    };

    const clearCache = () => {
        if (confirm('Isso vai limpar TODO o cache local e recarregar. Continuar?')) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    };

    useEffect(() => {
        refreshDebugInfo();
        checkSupabase();

        // Timer para atualizar UI
        const interval = setInterval(refreshDebugInfo, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!user) {
        return (
            <div className="p-8 text-white bg-gray-900 min-h-screen font-mono">
                <h1 className="text-xl text-red-500 mb-4">❌ Não Logado</h1>
                <p>Por favor faça login para ver dados de debug.</p>
                <a href="/" className="text-blue-400 underline mt-4 block">Voltar para Home</a>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-900 text-xs font-mono text-green-400 min-h-screen overflow-auto">
            <h1 className="text-xl font-bold mb-4 border-b border-green-800 pb-2">🕵️ DEBUG PANEL v1.0</h1>

            <section className="mb-6">
                <h2 className="text-white text-sm font-bold mb-2">👤 IDENTIDADE</h2>
                <div className="bg-black p-3 rounded border border-gray-700">
                    <p><span className="text-gray-500">User ID:</span> <span className="text-yellow-400">{user.id}</span></p>
                    <p><span className="text-gray-500">Email:</span> {user.email}</p>
                    <p><span className="text-gray-500">Last Sign In:</span> {new Date((user as any).last_sign_in_at || '').toLocaleString()}</p>
                </div>
            </section>

            <section className="mb-6">
                <h2 className="text-white text-sm font-bold mb-2">🔄 SYNC STATUS</h2>
                <div className="bg-black p-3 rounded border border-gray-700">
                    <p><span className="text-gray-500">Service Active:</span> {debugInfo?.isActive ? '✅ SIM' : '❌ NÃO'}</p>
                    <p><span className="text-gray-500">Listeners:</span> {debugInfo?.listenersCount}</p>
                    <p><span className="text-gray-500">Interval:</span> {debugInfo?.syncInterval}ms</p>
                    <p><span className="text-gray-500">Supabase Connection:</span> <br />{supabaseStatus}</p>
                </div>
            </section>

            <section className="mb-6">
                <h2 className="text-white text-sm font-bold mb-2">📦 DADOS LOCAIS (CACHE)</h2>
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-800 p-2 rounded text-center">
                        <span className="block text-2xl font-bold text-white">{tasks.length}</span>
                        <span className="text-gray-400">Tasks</span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded text-center">
                        <span className="block text-2xl font-bold text-white">{goals.length}</span>
                        <span className="text-gray-400">Goals</span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded text-center">
                        <span className="block text-2xl font-bold text-white">{themes.length}</span>
                        <span className="text-gray-400">Themes</span>
                    </div>
                </div>
            </section>

            <section className="mb-6">
                <h2 className="text-white text-sm font-bold mb-2">🛠 AÇÕES</h2>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => SimpleSyncService.forceSync()}
                        className="bg-blue-600 text-white p-3 rounded font-bold active:bg-blue-800"
                    >
                        🔄 FORÇAR SYNC AGORA
                    </button>

                    <button
                        onClick={checkSupabase}
                        className="bg-gray-700 text-white p-3 rounded font-bold active:bg-gray-800"
                    >
                        📡 TESTAR CONEXÃO
                    </button>

                    <button
                        onClick={clearCache}
                        className="bg-red-600 text-white p-3 rounded font-bold active:bg-red-800"
                    >
                        🗑️ LIMPAR CACHE TOTAL (RESET)
                    </button>
                </div>
            </section>

            <section className="mt-8 border-t border-gray-800 pt-4">
                <p className="text-center text-gray-500">
                    Build Time: {new Date().toLocaleString()}
                </p>
                <div className="text-center mt-4">
                    <a href="/" className="text-blue-400 underline p-4 inline-block text-sm">
                        ← Voltar para App
                    </a>
                </div>
            </section>
        </div>
    );
};
