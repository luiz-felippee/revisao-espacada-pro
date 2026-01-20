/**
 * 🔄 MIGRAÇÃO DE TASKS ANTIGAS PARA SUPABASE
 * 
 * Use este script no DESKTOP para migrar tasks antigas que ficaram
 * só no localStorage
 * 
 * Cole no Console (F12) do Desktop
 */

(async function migrateOldTasks() {
    console.log('🔄 ========================================');
    console.log('   MIGRAÇÃO DE TASKS ANTIGAS');
    console.log('========================================\n');

    // 1. Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('❌ NÃO ESTÁ LOGADO!');
        return;
    }

    console.log('✅ Logado como:', user.email);
    console.log('✅ User ID:', user.id);
    console.log('');

    // 2. Pegar tasks do localStorage
    console.log('📦 Verificando localStorage...');
    const localTasks = localStorage.getItem('study_tasks_backup');

    if (!localTasks) {
        console.log('⚠️ Nenhuma task em cache local');
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

    // 3. Verificar quais tasks já estão no Supabase
    console.log('🔍 Verificando quais tasks já estão no Supabase...');
    const { data: supabaseTasks, error } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', user.id);

    if (error) {
        console.error('❌ Erro ao buscar tasks do Supabase:', error);
        return;
    }

    const supabaseIds = new Set(supabaseTasks.map(t => t.id));
    console.log(`✅ ${supabaseIds.size} tasks já estão no Supabase\n`);

    // 4. Identificar tasks que faltam
    const missingTasks = tasks.filter(t => !supabaseIds.has(t.id));

    if (missingTasks.length === 0) {
        console.log('✅ Todas as tasks já estão no Supabase!');
        console.log('✅ Nada para migrar.\n');
        return;
    }

    console.log(`🔄 ${missingTasks.length} tasks precisam ser migradas:`);
    missingTasks.forEach((t, idx) => {
        console.log(`   ${idx + 1}. "${t.title}"`);
    });
    console.log('');

    // 5. Migrar tasks faltantes
    console.log('🚀 Iniciando migração...\n');
    let success = 0;
    let failed = 0;

    for (const task of missingTasks) {
        // Preparar dados para Supabase
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

        // Inserir no Supabase
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
    console.log('   RESUMO DA MIGRAÇÃO');
    console.log('========================================');
    console.log(`✅ Migradas com sucesso: ${success}`);
    console.log(`❌ Falhas: ${failed}`);
    console.log(`📊 Total no localStorage: ${tasks.length}`);
    console.log(`📊 Total no Supabase (antes): ${supabaseIds.size}`);
    console.log(`📊 Total no Supabase (depois): ${supabaseIds.size + success}`);
    console.log('');
    console.log('👉 PRÓXIMO PASSO:');
    console.log('   1. Recarregue o Desktop (F5)');
    console.log('   2. Recarregue o Mobile (pull down)');
    console.log('   3. Todas as tasks devem aparecer agora!');
    console.log('========================================\n');

    return {
        total: tasks.length,
        inSupabase: supabaseIds.size,
        migrated: success,
        failed: failed
    };
})();
