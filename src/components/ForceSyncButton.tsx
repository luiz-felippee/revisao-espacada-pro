import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';

/**
 * 🔄 Botão de Sincronização Forçada
 * 
 * Força um refetch completo de todos os dados do Supabase
 * Útil quando o mobile não está mostrando dados do desktop
 */
export const ForceSyncButton: React.FC = () => {
    const { user } = useAuth();
    const { tasks, goals, themes } = useStudy();
    const [isSyncing, setIsSyncing] = useState(false);
    const [message, setMessage] = useState('');

    const forceSync = async () => {
        if (!user || isSyncing) return;

        setIsSyncing(true);
        setMessage('🔄 Sincronizando...');

        try {
            // Limpar localStorage
            localStorage.removeItem('study_tasks_backup');
            localStorage.removeItem('study_goals_backup');
            localStorage.removeItem('study_themes_backup');

            // Limpar flag de migração para permitir nova migração
            localStorage.removeItem(`migration_done_${user.id}`);

            setMessage('✅ Cache limpo! Recarregando...');

            // Recarregar página para refazer fetch
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('Erro ao forçar sincronização:', error);
            setMessage('❌ Erro ao sincronizar');
            setIsSyncing(false);
        }
    };

    return (
        <div className="fixed bottom-20 right-4 z-40">
            <button
                onClick={forceSync}
                disabled={isSyncing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white p-3 rounded-full shadow-lg flex items-center gap-2 transition-all"
                title="Forçar Sincronização"
            >
                <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                {message && (
                    <span className="text-xs font-bold whitespace-nowrap">
                        {message}
                    </span>
                )}
            </button>
        </div>
    );
};
