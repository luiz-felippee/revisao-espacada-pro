// Script para testar sincronização com novo Supabase V2
// Execute este script no console do navegador após fazer login

async function testSyncV2() {
    console.log('🔍 TESTE DE SINCRONIZAÇÃO - SUPABASE V2');
    console.log('========================================\n');

    // 1. Verificar configuração do Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('📡 Configuração Supabase:');
    console.log('URL:', supabaseUrl);
    console.log('Key (primeiros 20 chars):', supabaseKey?.substring(0, 20) + '...');
    console.log('');

    // 2. Verificar se está usando o novo projeto
    const isNewProject = supabaseUrl?.includes('vzvrpiykgbbbhrlpsvxp');
    console.log('✅ Usando novo projeto V2?', isNewProject ? 'SIM' : 'NÃO');
    console.log('');

    // 3. Verificar fila de sincronização
    const syncQueue = localStorage.getItem('sync_queue_v1');
    const queue = syncQueue ? JSON.parse(syncQueue) : [];
    console.log('📦 Fila de Sincronização:');
    console.log('Itens na fila:', queue.length);
    if (queue.length > 0) {
        console.log('Primeiros 3 itens:', queue.slice(0, 3));
    }
    console.log('');

    // 4. Criar tarefa de teste
    console.log('📝 Criando tarefa de teste...');
    const testTask = {
        id: crypto.randomUUID(),
        user_id: 'CURRENT_USER_ID', // Será substituído automaticamente
        title: 'TESTE MIGRAÇÃO SUPABASE V2',
        description: 'Testando sincronização com novo projeto - ' + new Date().toISOString(),
        type: 'daily',
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    console.log('Tarefa criada:', testTask);
    console.log('');

    // 5. Instruções para verificação manual
    console.log('📋 PRÓXIMOS PASSOS MANUAIS:');
    console.log('1. Crie uma tarefa pela UI normal da aplicação');
    console.log('2. Aguarde 5 segundos');
    console.log('3. Verifique a fila: localStorage.getItem("sync_queue_v1")');
    console.log('4. Abra o Supabase Table Editor:');
    console.log('   https://supabase.com/dashboard/project/vzvrpiykgbbbhrlpsvxp/editor/17497');
    console.log('5. Verifique se a tarefa aparece na tabela "tasks"');
    console.log('');

    console.log('✅ Teste preparado! Execute os passos acima.');
}

// Executar teste
testSyncV2();
