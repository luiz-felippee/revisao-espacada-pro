/**
 * 🔧 SCRIPT DE DIAGNÓSTICO - Sistema de Persistência
 * 
 * Cole este script no Console do navegador (F12 → Console)
 * e pressione Enter para executar o diagnóstico completo.
 */

console.clear();
console.log('%c🔧 DIAGNÓSTICO DO SISTEMA DE PERSISTÊNCIA', 'font-size: 20px; font-weight: bold; color: #4CAF50');
console.log('%c=====================================\n', 'color: #2196F3');

const diagnostico = {
    erros: [],
    avisos: [],
    sucesso: []
};

// ==========================================
// 1. VERIFICAR AUTENTICAÇÃO
// ==========================================
console.log('%c1️⃣ AUTENTICAÇÃO', 'font-size: 16px; font-weight: bold; color: #FF9800');
const user = localStorage.getItem('app_user');
if (user) {
    try {
        const userData = JSON.parse(user);
        console.log('%c✅ Usuário autenticado:', 'color: #4CAF50', userData);
        diagnostico.sucesso.push(`Usuário: ${userData.email || userData.id}`);
    } catch (e) {
        console.error('%c❌ Erro ao parsear dados do usuário:', 'color: #f44336', e);
        diagnostico.erros.push('Dados de usuário corrompidos');
    }
} else {
    console.warn('%c⚠️ NENHUM USUÁRIO AUTENTICADO!', 'color: #FF5722; font-weight: bold;');
    console.log('%cSolução: Faça login ou o sistema criará um Guest automaticamente.', 'color: #FFC107');
    diagnostico.avisos.push('Sem usuário autenticado - dados não serão salvos no Supabase');
}
console.log('');

//==========================================
// 2. VERIFICAR VARIÁVEIS DE AMBIENTE
// ==========================================
console.log('%c2️⃣ CONFIGURAÇÃO SUPABASE', 'font-size: 16px; font-weight: bold; color: #FF9800');
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
    console.log('%c✅ Variáveis de ambiente configuradas', 'color: #4CAF50');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey.substring(0, 20) + '...');
    diagnostico.sucesso.push('Supabase configurado');
} else {
    console.error('%c❌ VARIÁVEIS DE AMBIENTE NÃO ENCONTRADAS!', 'color: #f44336; font-weight: bold;');
    console.log('%cVerifique se o arquivo .env existe e está configurado corretamente.', 'color: #FFC107');
    diagnostico.erros.push('Variáveis Supabase não configuradas');
}
console.log('');

// ==========================================
// 3. VERIFICAR FILA DE SINCRONIZAÇÃO
// ==========================================
console.log('%c3️⃣ FILA DE SINCRONIZAÇÃO', 'font-size: 16px; font-weight: bold; color: #FF9800');
const queue = localStorage.getItem('sync_queue_v1');
if (queue) {
    try {
        const queueData = JSON.parse(queue);
        if (Array.isArray(queueData)) {
            if (queueData.length === 0) {
                console.log('%c✅ Fila vazia - todas operações processadas', 'color: #4CAF50');
                diagnostico.sucesso.push('Fila sincronizada');
            } else {
                console.warn(`%c⚠️ ${queueData.length} operações pendentes na fila`, 'color: #FF5722; font-weight: bold;');
                console.table(queueData.map(op => ({
                    Tipo: op.type,
                    Tabela: op.table,
                    ID: op.data?.id || 'N/A',
                    Tentativas: op.retryCount || 0,
                    Erro: op.lastError || 'N/A'
                })));

                const erros = queueData.filter(op => op.retryCount > 3);
                if (erros.length > 0) {
                    diagnostico.erros.push(`${erros.length} operações com falhas repetidas`);
                } else {
                    diagnostico.avisos.push(`${queueData.length} operações aguardando sincronização`);
                }
            }
        }
    } catch (e) {
        console.error('%c❌ Erro ao parsear fila:', 'color: #f44336', e);
        diagnostico.erros.push('Fila de sincronização corrompida');
    }
} else {
    console.log('%cℹ️ Nenhuma fila encontrada (normal na primeira execução)', 'color: #2196F3');
}
console.log('');

// ==========================================
// 4. VERIFICAR DADOS LOCAIS
// ==========================================
console.log('%c4️⃣ DADOS LOCAIS (localStorage)', 'font-size: 16px; font-weight: bold; color: #FF9800');

const dadosLocais = {
    'Tarefas': 'study_tasks_backup',
    'Metas': 'study_goals_backup',
    'Temas': 'study_themes_backup'
};

for (const [nome, chave] of Object.entries(dadosLocais)) {
    const data = localStorage.getItem(chave);
    if (data) {
        try {
            const parsed = JSON.parse(data);
            const count = Array.isArray(parsed) ? parsed.length : 0;
            console.log(`%c✅ ${nome}: ${count} itens`, count > 0 ? 'color: #4CAF50' : 'color: #FFC107');
            if (count > 0) {
                diagnostico.sucesso.push(`${nome}: ${count} itens`);
            }
        } catch (e) {
            console.error(`%c❌ ${nome}: Dados corrompidos`, 'color: #f44336');
            diagnostico.erros.push(`${nome} com dados inválidos`);
        }
    } else {
        console.log(`%cℹ️ ${nome}: Vazio`, 'color: #9E9E9E');
    }
}
console.log('');

// ==========================================
// 5. TESTE DE CONEXÃO
// ==========================================
console.log('%c5️⃣ CONEXÃO DE REDE', 'font-size: 16px; font-weight: bold; color: #FF9800');
if (navigator.onLine) {
    console.log('%c✅ Navegador online', 'color: #4CAF50');
    diagnostico.sucesso.push('Conexão de rede ativa');

    // Teste de conexão com Supabase
    if (supabaseUrl) {
        console.log('%cTestando conexão com Supabase...', 'color: #2196F3');
        fetch(supabaseUrl + '/rest/v1/', {
            headers: {
                'apikey': supabaseKey || '',
                'Content-Type': 'application/json'
            }
        })
            .then(r => {
                if (r.ok || r.status === 404) {
                    console.log('%c✅ Supabase acessível (Status:', r.status + ')', 'color: #4CAF50');
                    diagnostico.sucesso.push('Supabase acessível');
                } else {
                    console.error('%c❌ Supabase retornou erro:', r.status, 'color: #f44336');
                    diagnostico.erros.push(`Supabase erro ${r.status}`);
                }
            })
            .catch(e => {
                console.error('%c❌ Erro ao conectar no Supabase:', 'color: #f44336', e);
                diagnostico.erros.push('Falha de conexão com Supabase');
            });
    }
} else {
    console.warn('%c⚠️ NAVEGADOR OFFLINE', 'color: #FF5722; font-weight: bold;');
    diagnostico.avisos.push('Sem conexão de internet');
}
console.log('');

// ==========================================
// RESUMO FINAL
// ==========================================
setTimeout(() => {
    console.log('\n%c📊 RESUMO DO DIAGNÓSTICO', 'font-size: 18px; font-weight: bold; color: #673AB7');
    console.log('%c=====================================\n', 'color: #673AB7');

    if (diagnostico.sucesso.length > 0) {
        console.log('%c✅ FUNCIONANDO:', 'color: #4CAF50; font-weight: bold;');
        diagnostico.sucesso.forEach(msg => console.log('  • ' + msg));
        console.log('');
    }

    if (diagnostico.avisos.length > 0) {
        console.log('%c⚠️ AVISOS:', 'color: #FF9800; font-weight: bold;');
        diagnostico.avisos.forEach(msg => console.log('  • ' + msg));
        console.log('');
    }

    if (diagnostico.erros.length > 0) {
        console.log('%c❌ PROBLEMAS ENCONTRADOS:', 'color: #f44336; font-weight: bold;');
        diagnostico.erros.forEach(msg => console.log('  • ' + msg));
        console.log('');

        console.log('%c🔧 AÇÕES RECOMENDADAS:', 'color: #2196F3; font-weight: bold;');

        if (diagnostico.erros.some(e => e.includes('Supabase'))) {
            console.log('  1. Verifique o arquivo .env na raiz do projeto');
            console.log('  2. Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configurados');
            console.log('  3. Reinicie o servidor de desenvolvimento (npm run dev)');
        }

        if (diagnostico.erros.some(e => e.includes('fila') || e.includes('operações'))) {
            console.log('  1. Execute: localStorage.removeItem("sync_queue_v1")');
            console.log('  2. Recarregue a página');
        }

        if (diagnostico.erros.some(e => e.includes('corrompidos'))) {
            console.log('  1. Faça backup dos dados (se possível)');
            console.log('  2. Execute: localStorage.clear()');
            console.log('  3. Recarregue a página e faça login novamente');
        }
    } else if (diagnostico.avisos.length === 0) {
        console.log('%c🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
        console.log('%cSe ainda assim os dados não estão sendo salvos, execute:', 'color: #2196F3');
        console.log('%cSyncQueueService.processQueue(true)', 'background: #000; color: #0F0; padding: 5px; font-family: monospace;');
    }

    console.log('\n%c=====================================', 'color: #673AB7');
    console.log('%cDIAGNÓSTICO CONCLUÍDO', 'font-size: 16px; font-weight: bold; color: #673AB7');
}, 2000);
