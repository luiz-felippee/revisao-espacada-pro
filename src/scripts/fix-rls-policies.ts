import { supabase } from '../lib/supabase';

/**
 * Script de correção automática das políticas RLS
 * Execute este arquivo para aplicar as políticas faltantes no Supabase
 */

const RLS_FIX_SQL = `
-- TASKS: Adicionar INSERT e DELETE
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- GOALS: Adicionar INSERT e DELETE
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);

-- THEMES: Adicionar INSERT e DELETE
DROP POLICY IF EXISTS "Users can insert own themes" ON themes;
CREATE POLICY "Users can insert own themes" ON themes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own themes" ON themes;
CREATE POLICY "Users can delete own themes" ON themes FOR DELETE USING (auth.uid() = user_id);

-- SUBTHEMES: Adicionar INSERT e DELETE
DROP POLICY IF EXISTS "Users can insert own subthemes" ON subthemes;
CREATE POLICY "Users can insert own subthemes" ON subthemes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own subthemes" ON subthemes;
CREATE POLICY "Users can delete own subthemes" ON subthemes FOR DELETE USING (auth.uid() = user_id);
`;

export async function applyRLSFix() {
    console.log('🔧 Aplicando correção de políticas RLS...');

    try {
        const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: RLS_FIX_SQL
        });

        if (error) {
            console.error('❌ Erro ao aplicar políticas RLS:', error);
            console.log('\n📋 SOLUÇÃO MANUAL:');
            console.log('1. Acesse: https://app.supabase.com');
            console.log('2. Vá em SQL Editor');
            console.log('3. Cole o SQL abaixo e execute:\n');
            console.log(RLS_FIX_SQL);
            return false;
        }

        console.log('✅ Políticas RLS aplicadas com sucesso!');
        console.log('🔄 Recarregue a página para testar.');
        return true;
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
        console.log('\n📋 SOLUÇÃO MANUAL:');
        console.log('1. Acesse: https://app.supabase.com');
        console.log('2. Selecione seu projeto');
        console.log('3. Vá em SQL Editor (menu lateral)');
        console.log('4. Cole o código do arquivo:');
        console.log('   supabase/migrations/20260113_FIX_CRITICAL_RLS_INSERT_DELETE.sql');
        console.log('5. Clique em RUN');
        return false;
    }
}

// Auto-executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    applyRLSFix();
}
