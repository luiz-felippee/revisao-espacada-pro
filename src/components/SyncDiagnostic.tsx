import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bug } from 'lucide-react';

/**
 * 🔍 Componente de Diagnóstico de Sincronização
 * 
 * Adicione este componente em qualquer página para fazer diagnóstico
 */
export const SyncDiagnostic: React.FC = () => {
    const [result, setResult] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);

    const runDiagnostic = async () => {
        let output = '🔍 DIAGNÓSTICO DE SINCRONIZAÇÃO\n\n';

        try {
            // 1. Verificar autenticação
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                output += '❌ NÃO ESTÁ LOGADO!\n';
                setResult(output);
                return;
            }

            output += `✅ Logado como: ${user.email}\n`;
            output += `✅ User ID: ${user.id}\n\n`;

            // 2. Verificar tasks no Supabase
            const { data: tasks, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id);

            if (tasksError) {
                output += `❌ Erro ao buscar tasks: ${tasksError.message}\n\n`;
            } else {
                output += `📊 Total de Tasks no Supabase: ${tasks?.length || 0}\n`;
                if (tasks && tasks.length > 0) {
                    output += '📋 Lista de Tasks:\n';
                    tasks.forEach((task: any, idx: number) => {
                        output += `   ${idx + 1}. "${task.title}"\n`;
                    });
                }
                output += '\n';
            }

            // 3. Verificar goals
            const { data: goals } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id);
            output += `📊 Total de Metas no Supabase: ${goals?.length || 0}\n\n`;

            // 4. Verificar themes
            const { data: themes } = await supabase
                .from('themes')
                .select('*')
                .eq('user_id', user.id);
            output += `📊 Total de Temas no Supabase: ${themes?.length || 0}\n\n`;

            // 5. Verificar sync queue
            const syncQueue = localStorage.getItem('sync_queue_v1');
            if (syncQueue) {
                try {
                    const queue = JSON.parse(syncQueue);
                    output += `🔄 Operações pendentes na fila: ${queue.length || 0}\n\n`;
                } catch (e) {
                    output += '⚠️ Fila corrompida\n\n';
                }
            } else {
                output += '✅ Fila vazia (tudo sincronizado)\n\n';
            }

            // 6. Resumo
            output += '📊 RESUMO FINAL:\n';
            output += `Email: ${user.email}\n`;
            output += `Tasks: ${tasks?.length || 0}\n`;
            output += `Metas: ${goals?.length || 0}\n`;
            output += `Temas: ${themes?.length || 0}\n\n`;
            output += '👉 Compare este resultado no Desktop e Mobile!\n';
            output += 'User ID e números devem ser IGUAIS em ambos.\n';

        } catch (error: any) {
            output += `❌ ERRO: ${error.message}\n`;
        }

        setResult(output);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
                title="Diagnóstico de Sincronização"
            >
                <Bug className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Bug className="w-6 h-6 text-blue-400" />
                        Diagnóstico de Sincronização
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                <button
                    onClick={runDiagnostic}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold mb-4"
                >
                    🔍 Executar Diagnóstico
                </button>

                {result && (
                    <div className="flex-1 overflow-auto">
                        <pre className="bg-slate-950 text-slate-200 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono">
                            {result}
                        </pre>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(result);
                                alert('Resultado copiado!');
                            }}
                            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                        >
                            📋 Copiar Resultado
                        </button>
                    </div>
                )}

                <p className="text-slate-400 text-xs mt-4 text-center">
                    Execute este diagnóstico no Desktop E no Mobile.<br />
                    Compare os resultados - devem ser iguais!
                </p>
            </div>
        </div>
    );
};
