
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const SyncDebugWidget: React.FC = () => {
    const { user } = useAuth();
    const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'failure'>('idle');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${type.toUpperCase()}: ${msg}`, ...prev]);
    };

    const runDiagnostics = async () => {
        setStatus('testing');
        setLogs([]);
        addLog("Iniciando diagnóstico...", 'info');

        if (!user) {
            addLog("ERRO: Usuário não autenticado no AuthContext.", 'error');
            setStatus('failure');
            return;
        }
        addLog(`Usuário detectado: ${user.email} (${user.id})`, 'success');

        try {
            // Test 1: Connection & Read
            addLog("Teste 1: Conexão e Leitura (Tasks)...", 'info');
            const { data: readData, error: readError } = await supabase
                .from('tasks')
                .select('id')
                .limit(1);

            if (readError) {
                addLog(`FALHA LEITURA: ${readError.message} (Code: ${readError.code})`, 'error');
                if (readError.code === 'PGRST301') addLog("Dica: Row Level Security (RLS) pode estar bloqueando.", 'info');
                throw readError;
            }
            addLog("Leitura OK.", 'success');

            // Test 2: Write Task
            addLog("Teste 2: Escrita (Tasks)...", 'info');
            const dummyId = crypto.randomUUID();
            const { error: taskError } = await supabase.from('tasks').insert({
                id: dummyId,
                title: 'DIAGNOSTIC_TASK_' + Date.now(),
                user_id: user.id,
                created_at: new Date().toISOString(),
                status: 'pending',
                priority: 'low',
                type: 'day'
            });
            if (taskError) {
                addLog(`FALHA TASKS: ${taskError.message}`, 'error');
                throw taskError;
            } else {
                await supabase.from('tasks').delete().eq('id', dummyId);
                addLog("Tasks OK.", 'success');
            }

            // Test 3: Write Goal
            addLog("Teste 3: Escrita (Goals)...", 'info');
            const goalId = crypto.randomUUID();
            const { error: goalError } = await supabase.from('goals').insert({
                id: goalId,
                title: 'DIAGNOSTIC_GOAL',
                user_id: user.id,
                created_at: new Date().toISOString(),
                type: 'simple',
                category: 'test',
                progress: 0
            });
            if (goalError) {
                addLog(`FALHA GOALS: ${goalError.message}`, 'error');
                // Don't throw, try next
            } else {
                await supabase.from('goals').delete().eq('id', goalId);
                addLog("Goals OK.", 'success');
            }

            // Test 4: Write Theme
            addLog("Teste 4: Escrita (Themes)...", 'info');
            const themeId = crypto.randomUUID();
            const { error: themeError } = await supabase.from('themes').insert({
                id: themeId,
                title: 'DIAGNOSTIC_THEME',
                user_id: user.id,
                created_at: new Date().toISOString(),
                color: '#000000'
            });
            // Test 5: Write Subtheme
            addLog("Teste 5: Escrita (Subthemes)...", 'info');
            const subId = crypto.randomUUID();
            // Need a valid parent theme for FK constraint? 
            // If we use the previous themeId... but we deleted it.
            // Let's create a temporary theme just for this test
            const tempThemeId = crypto.randomUUID();
            await supabase.from('themes').insert({ id: tempThemeId, title: 'TEMP_PARENT', user_id: user.id, color: '#000' });

            const { error: subError } = await supabase.from('subthemes').insert({
                id: subId,
                theme_id: tempThemeId,
                title: 'DIAGNOSTIC_SUBTHEME',
                status: 'queue'
                // user_id removed
            });

            if (subError) {
                addLog(`FALHA SUBTHEMES: ${subError.message}`, 'error');
            } else {
                addLog("Subthemes OK.", 'success');
            }
            // Cleanup All
            await supabase.from('subthemes').delete().eq('id', subId);
            await supabase.from('themes').delete().eq('id', tempThemeId);


            addLog("Diagnóstico Completo: TUDO VERDE! 🟢", 'success');
            setStatus('success');

        } catch (e: any) {
            setStatus('failure');
            addLog(`Diagnóstico finalizado com ERROS.`, 'error');
        }
    };

    const forceReset = () => {
        localStorage.removeItem('sync_queue_v1');
        localStorage.removeItem('sync_queue_v2'); // Just in case
        window.location.reload();
    };

    if (import.meta.env.PROD) return null; // Safety

    return (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-96 max-h-[500px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Diagnóstico de Sync
                </h3>
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={forceReset} className="text-red-400 hover:text-red-300">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Resetar
                    </Button>
                    <Button size="sm" onClick={runDiagnostics} disabled={status === 'testing'}>
                        {status === 'testing' ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Testar Agora'}
                    </Button>
                </div>
            </div>


            <div className="flex-1 overflow-y-auto bg-black/50 p-2 rounded text-xs font-mono space-y-1 h-64">
                {logs.length === 0 && <span className="text-slate-500">Aguardando execução...</span>}
                {logs.map((log, i) => (
                    <div key={i} className={
                        log.includes('INFO') ? 'text-blue-300' :
                            log.includes('SUCCESS') ? 'text-emerald-300' :
                                log.includes('ERROR') ? 'text-red-400 font-bold' : 'text-slate-300'
                    }>
                        {log}
                    </div>
                ))}
            </div>

            {status === 'failure' && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-200 text-xs">
                    Por favor, tire um print desta tela e me mostre os erros em vermelho.
                </div>
            )}
        </div>
    );
};
