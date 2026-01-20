/**
 * 🔍 SCRIPT DE DIAGNÓSTICO DE SINCRONIZAÇÃO
 * 
 * Cole este código no Console do navegador (F12) para diagnosticar problemas
 * 
 * Execute em AMBOS dispositivos (desktop e mobile) para comparar
 */

(async function diagnosticoSync() {
    console.log('🔍 INICIANDO DIAGNÓSTICO DE SINCRONIZAÇÃO...\n');

    // 1. Verificar usuário logado
    console.log('📱 1. VERIFICAÇÃO DE USUÁRIO');
    const authToken = localStorage.getItem('sb-*-auth-token') ||
        Object.keys(localStorage).find(k => k.includes('sb-') && k.includes('auth'));

    if (!authToken) {
        console.error('❌ USUÁRIO NÃO LOGADO! Faça login primeiro.');
        return;
    }

    // Tentar pegar user ID de diferentes fontes
    let userId = null;
    try {
        const sessionKey = Object.keys(localStorage).find(k => k.includes('sb-') && k.includes('auth'));
        if (sessionKey) {
            const session = JSON.parse(localStorage.getItem(sessionKey));
            userId = session?.user?.id || session?.currentSession?.user?.id;
        }
    } catch (e) { }

    console.log('User ID:', userId || 'Não encontrado');

    // 2. Verificar fila de sincronização
    console.log('\n📤 2. FILA DE SINCRONIZAÇÃO');
    const queueRaw = localStorage.getItem('sync_queue_v1');
    if (queueRaw) {
        try {
            const queue = JSON.parse(queueRaw);
            console.log(`Operações pendentes: ${queue.length}`);
            if (queue.length > 0) {
                console.table(queue.map(op => ({
                    tipo: op.type,
                    tabela: op.table,
                    id: op.data?.id?.substring(0, 8) + '...',
                    tentativas: op.retryCount,
                    erro: op.lastError || 'Nenhum'
                })));
                console.warn('⚠️ EXISTE FILA PENDENTE! Isso pode indicar problemas de conexão ou erros.');
            } else {
                console.log('✅ Fila vazia - operações estão sincronizando corretamente');
            }
        } catch (e) {
            console.error('❌ Erro ao ler fila:', e);
        }
    } else {
        console.log('✅ Sem fila de sincronização (pode ser bom ou ruim)');
    }

    // 3. Verificar dados locais
    console.log('\n💾 3. DADOS LOCAIS (localStorage)');
    const tasksBackup = localStorage.getItem('study_tasks_backup');
    const localTasks = tasksBackup ? JSON.parse(tasksBackup) : [];
    console.log(`Tasks locais: ${localTasks.length}`);

    // 4. Verificar conexão com Supabase
    console.log('\n🔌 4. TESTE DE CONEXÃO COM SUPABASE');
    try {
        // Importar supabase (isso só funciona se o módulo estiver carregado)
        const { supabase } = await import('/src/lib/supabase.ts');

        // Verificar sessão
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.error('❌ Erro de sessão:', sessionError.message);
        } else if (sessionData?.session) {
            console.log('✅ Sessão válida');
            console.log('User ID (Supabase):', sessionData.session.user.id);
            userId = sessionData.session.user.id;
        } else {
            console.error('❌ SEM SESSÃO ATIVA!');
            return;
        }

        // 5. Buscar tasks do servidor
        console.log('\n🌐 5. DADOS NO SUPABASE (SERVIDOR)');
        const { data: serverTasks, error: tasksError } = await supabase
            .from('tasks')
            .select('id, title, status, user_id')
            .eq('user_id', userId);

        if (tasksError) {
            console.error('❌ Erro ao buscar tasks:', tasksError.message);
        } else {
            console.log(`Tasks no servidor: ${serverTasks?.length || 0}`);

            if (serverTasks && serverTasks.length > 0) {
                console.log('Primeiras 5 tasks do servidor:');
                console.table(serverTasks.slice(0, 5).map(t => ({
                    titulo: t.title?.substring(0, 30) + '...',
                    status: t.status,
                    id: t.id?.substring(0, 8) + '...'
                })));
            }
        }

        // 6. Comparar local vs servidor
        console.log('\n📊 6. COMPARAÇÃO LOCAL vs SERVIDOR');
        const localIds = new Set(localTasks.map(t => t.id));
        const serverIds = new Set((serverTasks || []).map(t => t.id));

        const onlyLocal = localTasks.filter(t => !serverIds.has(t.id));
        const onlyServer = (serverTasks || []).filter(t => !localIds.has(t.id));

        console.log(`Tasks APENAS no local (não sincronizadas): ${onlyLocal.length}`);
        if (onlyLocal.length > 0) {
            console.warn('⚠️ PROBLEMA: Existem tasks locais que não estão no servidor!');
            console.log('Tasks não sincronizadas:');
            console.table(onlyLocal.slice(0, 5).map(t => ({
                titulo: t.title?.substring(0, 30),
                id: t.id?.substring(0, 8) + '...'
            })));
        }

        console.log(`Tasks APENAS no servidor (não no local): ${onlyServer.length}`);
        if (onlyServer.length > 0) {
            console.warn('⚠️ PROBLEMA: Existem tasks no servidor que não estão no local!');
            console.log('Isso significa que o fetch inicial não está funcionando corretamente.');
        }

        // 7. Verificar Realtime
        console.log('\n🔄 7. STATUS DO REALTIME');
        console.log('Para verificar manualmente, observe se os canais estão "SUBSCRIBED":');
        console.log('- Execute: RealtimeService.isFullyConnected()');

    } catch (e) {
        console.error('❌ Erro ao testar Supabase:', e);
        console.log('Tente executar este diagnóstico na página da aplicação logada.');
    }

    // Resumo
    console.log('\n' + '='.repeat(50));
    console.log('📋 RESUMO DO DIAGNÓSTICO');
    console.log('='.repeat(50));
    console.log(`Local Tasks: ${localTasks.length}`);
    console.log(`User ID: ${userId || 'Desconhecido'}`);
    console.log('\nPróximos passos:');
    console.log('1. Compare os resultados entre Desktop e Mobile');
    console.log('2. Se User ID for diferente, você está em contas diferentes');
    console.log('3. Se há fila pendente com erros, verifique as políticas RLS no Supabase');
    console.log('4. Se tasks locais > servidor, a sincronização de escrita está falhando');
    console.log('5. Se tasks servidor > locais, a sincronização de leitura está falhando');
})();
