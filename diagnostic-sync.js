/**
 * 🔍 DIAGNÓSTICO DE SINCRONIZAÇÃO
 * 
 * Cole este código no Console do navegador (F12) em AMBOS dispositivos
 * Desktop E Mobile
 */

(async function diagnosticSync() {
    console.log('🔍 ========================================');
    console.log('   DIAGNÓSTICO DE SINCRONIZAÇÃO');
    console.log('========================================\n');

    // 1. Verificar autenticação
    console.log('1️⃣ VERIFICANDO AUTENTICAÇÃO...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('❌ NÃO ESTÁ LOGADO!');
        console.log('👉 Solução: Faça login primeiro\n');
        return;
    }

    console.log('✅ Logado como:', user.email);
    console.log('✅ User ID:', user.id);
    console.log('');

    // 2. Verificar tasks no Supabase
    console.log('2️⃣ VERIFICANDO TASKS NO SUPABASE...');
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

    if (tasksError) {
        console.error('❌ Erro ao buscar tasks:', tasksError.message);
        console.log('');
    } else {
        console.log(`✅ Total de Tasks no Supabase: ${tasks?.length || 0}`);
        if (tasks && tasks.length > 0) {
            console.log('📋 Lista de Tasks:');
            tasks.forEach((task, idx) => {
                console.log(`   ${idx + 1}. "${task.title}" (ID: ${task.id.slice(0, 8)}...)`);
            });
        }
        console.log('');
    }

    // 3. Verificar tasks no localStorage
    console.log('3️⃣ VERIFICANDO TASKS NO LOCALSTORAGE...');
    const localTasks = localStorage.getItem('study_tasks_backup');
    if (localTasks) {
        try {
            const parsed = JSON.parse(localTasks);
            console.log(`📦 Tasks em cache local: ${parsed.length || 0}`);
        } catch (e) {
            console.log('⚠️ Cache local corrompido');
        }
    } else {
        console.log('📦 Nenhum cache local');
    }
    console.log('');

    // 4. Verificar sync queue
    console.log('4️⃣ VERIFICANDO FILA DE SINCRONIZAÇÃO...');
    const syncQueue = localStorage.getItem('sync_queue_v1');
    if (syncQueue) {
        try {
            const queue = JSON.parse(syncQueue);
            console.log(`🔄 Operações pendentes na fila: ${queue.length || 0}`);
            if (queue.length > 0) {
                console.log('📋 Pendentes:');
                queue.forEach((op, idx) => {
                    console.log(`   ${idx + 1}. ${op.type} ${op.table} (${op.data?.id?.slice(0, 8) || 'N/A'}...)`);
                });
            }
        } catch (e) {
            console.log('⚠️ Fila corrompida');
        }
    } else {
        console.log('✅ Fila vazia (tudo sincronizado)');
    }
    console.log('');

    // 5. Verificar conexão Realtime
    console.log('5️⃣ VERIFICANDO REALTIME...');
    console.log('⚠️ Verifique nos logs se aparece:');
    console.log('   [RealtimeService] ✅ Successfully subscribed to tasks');
    console.log('   [AppProvider] Initializing RealtimeService for user: ...');
    console.log('');

    // 6. Resumo
    console.log('📊 ========================================');
    console.log('   RESUMO');
    console.log('========================================');
    console.log(`✅ Email: ${user.email}`);
    console.log(`✅ User ID: ${user.id}`);
    console.log(`📊 Tasks no Supabase: ${tasks?.length || 0}`);
    console.log('');
    console.log('👉 PRÓXIMO PASSO:');
    console.log('   1. Execute este script no DESKTOP');
    console.log('   2. Execute este script no MOBILE');
    console.log('   3. Compare os resultados');
    console.log('   4. User ID DEVE ser o MESMO em ambos!');
    console.log('   5. Tasks no Supabase DEVE ser o MESMO em ambos!');
    console.log('========================================\n');

    // Retornar objeto para fácil cópia
    return {
        email: user.email,
        userId: user.id,
        tasksInSupabase: tasks?.length || 0,
        taskTitles: tasks?.map(t => t.title) || [],
        taskIds: tasks?.map(t => t.id) || []
    };
})();
