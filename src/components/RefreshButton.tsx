import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { SimpleSyncService } from '../services/SimpleSyncService';

/**
 * 🔄 Botão de Refresh Manual
 * 
 * Permite ao usuário forçar sincronização imediata
 * Útil quando quer ver mudanças instantaneamente
 */
export const RefreshButton: React.FC = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);

        try {
            await SimpleSyncService.forceSync();

            // Feedback visual
            setTimeout(() => {
                setIsRefreshing(false);
            }, 1000);
        } catch (error) {
            console.error('Erro ao sincronizar:', error);
            setIsRefreshing(false);
        }
    };

    return (
        <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white p-3 rounded-full shadow-lg transition-all"
            title="Atualizar dados"
        >
            <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
            />
        </button>
    );
};
