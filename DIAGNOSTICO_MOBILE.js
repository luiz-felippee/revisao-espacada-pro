/**
 * 🔍 DIAGNÓSTICO MOBILE - Cole no Console do Mobile
 * 
 * Este script vai identificar EXATAMENTE qual é o problema
 */

(async function diagnosticoMobile() {
    console.log('🔍 ========================================');
    console.log('   DIAGNÓSTICO MOBILE');
    console.log('========================================\n');

    const problemas = [];
    const solucoes = [];

    // 1. Verificar se está logado
    console.log('1️⃣ Verificando autenticação...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('❌ NÃO ESTÁ LOGADO!');
        problemas.push('Não está logado');
        solucoes.push('Faça login novamente');
    } else {
        console.log('✅ Logado como:', user.email);
        console.log('✅ User ID:', user.id);
    }
    console.log('');

    if (!user) {
        console.log('⚠️ Faça login e rode o script novamente\n');
        return;
    }

    // 2. Buscar tasks do Supabase DIRETO
    console.log('2️⃣ Buscando tasks do Supabase...');
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

    if (tasksError) {
        console.error('❌ Erro ao buscar tasks:', tasksError.message);
        problemas.push(`Erro no Supabase: ${tasksError.message}`);

        if (tasksError.message.includes('RLS')) {
            solucoes.push('Problema nas políticas RLS do Supabase');
        } else {
            solucoes.push('Problema de conexão com Supabase');
        }
    } else {
        console.log(`✅ ${tasks?.length || 0} tasks encontradas no Supabase`);

        if (tasks && tasks.length > 0) {
            console.log('📋 Tasks no Supabase:');
            tasks.forEach((t, i) => {
                console.log(`   ${i + 1}. "${t.title}"`);
            });
        } else {
            console.log('⚠️ Nenhuma task no Supabase para este usuário');
            problemas.push('Supabase vazio para este user_id');
            solucoes.push('Desktop pode estar usando conta diferente OU tasks não foram salvas');
        }
    }
    console.log('');

    // 3. Verificar localStorage
    console.log('3️⃣ Verificando localStorage...');
    const localTasks = localStorage.getItem('study_tasks_backup');

    if (localTasks) {
        try {
            const parsed = JSON.parse(localTasks);
            console.log(`📦 ${parsed.length} tasks em cache local`);

            if (parsed.length > 0) {
                console.log('📋 Tasks no cache:');
                parsed.slice(0, 5).forEach((t, i) => {
                    console.log(`   ${i + 1}. "${t.title}"`);
                });
                if (parsed.length > 5) {
                    console.log(`   ... e mais ${parsed.length - 5}`);
                }
            }
        } catch (e) {
            console.log('⚠️ Cache corrompido');
            problemas.push('localStorage corrompido');
            solucoes.push('Limpar localStorage');
        }
    } else {
        console.log('📦 Nenhum cache local');
    }
    console.log('');

    // 4. Comparar Supabase vs localStorage
    console.log('4️⃣ Comparando Supabase vs localStorage...');
    const supabaseCount = tasks?.length || 0;
    const localCount = localTasks ? JSON.parse(localTasks).length : 0;

    console.log(`Supabase: ${supabaseCount} tasks`);
    console.log(`Local: ${localCount} tasks`);

    if (supabaseCount > localCount) {
        console.log('⚠️ Supabase tem MAIS tasks que o cache local');
        problemas.push('Cache local desatualizado');
        solucoes.push('Limpar cache e recarregar');
    } else if (localCount > supabaseCount) {
        console.log('⚠️ Cache local tem MAIS tasks que Supabase');
        problemas.push('Tasks locais não foram sincronizadas');
        solucoes.push('Rodar migração de tasks antigas');
    } else if (supabaseCount === 0 && localCount === 0) {
        console.log('⚠️ Ambos estão vazios');
        problemas.push('Nenhuma task em lugar nenhum');
        solucoes.push('Verificar se desktop está salvando no Supabase');
    } else {
        console.log('✅ Contagens batem');
    }
    console.log('');

    // 5. Verificar se RealtimeService está ativo
    console.log('5️⃣ Verificando RealtimeService...');
    // Não podemos verificar diretamente, mas podemos ver se há subscrições
    console.log('⚠️ Verifique nos logs acima se aparece:');
    console.log('   [AppProvider] Initializing RealtimeService');
    console.log('   [RealtimeService] Successfully subscribed');
    console.log('');

    // 6. RESUMO
    console.log('📊 ========================================');
    console.log('   RESUMO DO DIAGNÓSTICO');
    console.log('========================================');

    if (problemas.length === 0) {
        console.log('✅ NENHUM PROBLEMA ENCONTRADO!');
        console.log('');
        console.log('Possíveis causas:');
        console.log('- Cache do navegador antigo');
        console.log('- PWA instalado com versão antiga');
        console.log('- Service Worker com cache');
        console.log('');
        console.log('🔧 SOLUÇÃO:');
        console.log('1. Limpe o cache do navegador completamente');
        console.log('2. OU use modo anônimo');
        console.log('3. OU desinstale PWA e acesse pelo navegador normal');
    } else {
        console.log('❌ PROBLEMAS ENCONTRADOS:');
        problemas.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p}`);
        });
        console.log('');
        console.log('🔧 SOLUÇÕES SUGERIDAS:');
        solucoes.forEach((s, i) => {
            console.log(`   ${i + 1}. ${s}`);
        });
    }
    console.log('');

    // 7. AÇÃO IMEDIATA
    console.log('🚀 AÇÃO IMEDIATA:');

    if (supabaseCount > 0 && localCount === 0) {
        console.log('✅ Tasks ESTÃO no Supabase!');
        console.log('');
        console.log('Execute este comando para forçar atualização:');
        console.log('');
        console.log('localStorage.clear(); location.reload();');
        console.log('');
    } else if (supabaseCount === 0) {
        console.log('⚠️ Supabase está VAZIO!');
        console.log('');
        console.log('Verifique no DESKTOP:');
        console.log('1. Abra console (F12)');
        console.log('2. Cole: (await supabase.auth.getUser()).data.user.id');
        console.log('3. Compare com este user_id:', user.id);
        console.log('4. Se DIFERENTES → Contas diferentes!');
        console.log('');
    }

    console.log('========================================\n');

    return {
        userEmail: user.email,
        userId: user.id,
        tasksInSupabase: supabaseCount,
        tasksInLocal: localCount,
        problemas,
        solucoes
    };
})();
