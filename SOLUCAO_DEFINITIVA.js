/**
 * 🔥 SOLUÇÃO DEFINITIVA - MIGRAÇÃO FORÇADA
 * 
 * Cole este código no Console do DESKTOP (F12)
 * Vai migrar TODAS as tasks antigas para o Supabase
 * Depois o mobile vai ver tudo automaticamente
 */

(async function SOLUCAO_DEFINITIVA() {
    console.log('🔥 ========================================');
    console.log('   MIGRAÇÃO DEFINITIVA - DESKTOP → MOBILE');
    console.log('========================================\n');

    // 1. Verificar se está logado
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('❌ VOCÊ NÃO ESTÁ LOGADO!');
        console.log('👉 Faça login primeiro e rode o script novamente\n');
        return;
    }

    console.log('✅ Logado como:', user.email);
    console.log('✅ User ID:', user.id);
    console.log('');

    // 2. Buscar tasks do localStorage
    console.log('📦 Buscando tasks do localStorage...');
    const localTasks = localStorage.getItem('study_tasks_backup');

    if (!localTasks) {
        console.log('⚠️ Nenhuma task no localStorage');
        console.log('👉 Isso significa que as tasks já estão no Supabase!');
        console.log('👉 Problema é no MOBILE, não no desktop\n');

        // Verificar quantas tasks tem no Supabase
        const { data: supabaseTasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id);

        console.log(`📊 Tasks no Supabase: ${supabaseTasks?.length || 0}`);

        if (supabaseTasks && supabaseTasks.length > 0) {
            console.log('✅ Tasks estão no Supabase!');
            console.log('📋 Lista:');
            supabaseTasks.forEach((t, i) => {
                console.log(`   ${i + 1}. "${t.title}"`);
            });
            console.log('');
            console.log('🎯 SOLUÇÃO PARA O MOBILE:');
            console.log('   1. Mobile: Abra modo anônimo');
            console.log('   2. Acesse: https://revisao-espacada-pro.vercel.app/');
            console.log('   3. Faça login');
            console.log('   4. Tasks vão aparecer! ✅\n');
        }

        return;
    }

    let tasks = [];
    try {
        tasks = JSON.parse(localTasks);
        console.log(`📊 Encontradas ${tasks.length} tasks no localStorage\n`);
    } catch (e) {
        console.error('❌ Erro ao ler localStorage:', e);
        return;
    }

    if (tasks.length === 0) {
        console.log('⚠️ localStorage vazio');
        return;
    }

    // 3. Verificar quais tasks JÁ estão no Supabase
    console.log('🔍 Verificando Supabase...');
    const { data: supabaseTasks, error } = await supabase
        .from('tasks')
        .select('id, title')
        .eq('user_id', user.id);

    if (error) {
        console.error('❌ Erro ao buscar do Supabase:', error);
        return;
    }

    const supabaseIds = new Set(supabaseTasks?.map(t => t.id) || []);
    console.log(`✅ ${supabaseIds.size} tasks já estão no Supabase`);

    if (supabaseTasks && supabaseTasks.length > 0) {
        console.log('📋 Tasks no Supabase:');
        supabaseTasks.forEach((t, i) => {
            console.log(`   ${i + 1}. "${t.title}"`);
        });
    }
    console.log('');

    // 4. Identificar tasks que FALTAM
    const missingTasks = tasks.filter(t => !supabaseIds.has(t.id));

    if (missingTasks.length === 0) {
        console.log('✅ TODAS as tasks já estão no Supabase!');
        console.log('✅ Nada para migrar.\n');
        console.log('🎯 SOLUÇÃO PARA O MOBILE:');
        console.log('   O problema é CACHE do mobile, não falta de dados!');
        console.log('   1. Mobile: Limpe o cache do navegador');
        console.log('   2. OU use modo anônimo');
        console.log('   3. Tasks vão aparecer! ✅\n');
        return;
    }

    console.log(`🔄 ${missingTasks.length} tasks FALTANDO no Supabase:`);
    missingTasks.forEach((t, i) => {
        console.log(`   ${i + 1}. "${t.title}"`);
    });
    console.log('');

    // 5. MIGRAR tasks faltantes
    console.log('🚀 INICIANDO MIGRAÇÃO...\n');
    let success = 0;
    let failed = 0;

    for (const task of missingTasks) {
        const taskData = {
            id: task.id,
            user_id: user.id,
            title: task.title,
            status: task.status || 'pending',
            priority: task.priority || 'medium',
            type: task.type || 'day',
            date: task.date || null,
            start_date: task.startDate || null,
            end_date: task.endDate || null,
            recurrence: task.recurrence || null,
            icon: task.icon || null,
            color: task.color || null,
            image_url: task.imageUrl || null,
            duration_minutes: task.durationMinutes || null,
            time_spent: task.timeSpent || 0,
            completion_history: task.completionHistory || [],
            sessions: task.sessions || [],
            summaries: task.summaries || [],
            created_at: task.createdAt ? new Date(task.createdAt).toISOString() : new Date().toISOString()
        };

        const { error: insertError } = await supabase
            .from('tasks')
            .insert(taskData);

        if (insertError) {
            console.error(`❌ Erro ao migrar "${task.title}":`, insertError.message);
            failed++;
        } else {
            console.log(`✅ Migrada: "${task.title}"`);
            success++;
        }
    }

    console.log('');
    console.log('📊 ========================================');
    console.log('   RESUMO FINAL');
    console.log('========================================');
    console.log(`✅ Migradas com sucesso: ${success}`);
    console.log(`❌ Falhas: ${failed}`);
    console.log(`📊 Total no localStorage: ${tasks.length}`);
    console.log(`📊 Total no Supabase (antes): ${supabaseIds.size}`);
    console.log(`📊 Total no Supabase (agora): ${supabaseIds.size + success}`);
    console.log('');

    if (success > 0) {
        console.log('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('');
        console.log('👉 PRÓXIMOS PASSOS:');
        console.log('   1. Desktop: Recarregue esta página (F5)');
        console.log('   2. Mobile: Abra o app');
        console.log('   3. Mobile: Aguarde 5 segundos');
        console.log('   4. Mobile: Todas as tasks devem aparecer! ✅');
        console.log('');
        console.log('Se não aparecer no mobile:');
        console.log('   - Use modo anônimo');
        console.log('   - OU limpe cache do navegador');
        console.log('========================================\n');
    }

    return {
        total: tasks.length,
        inSupabase: supabaseIds.size,
        migrated: success,
        failed: failed
    };
})();
