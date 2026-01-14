-- CORREÇÃO CRÍTICA: Adicionar políticas INSERT e DELETE faltantes
-- Sem essas políticas, o usuário não consegue criar ou deletar registros
-- Execute este script no SQL Editor do Supabase Dashboard

-- ============================================
-- TASKS: Adicionar INSERT e DELETE
-- ============================================
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
CREATE POLICY "Users can insert own tasks" ON tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
CREATE POLICY "Users can delete own tasks" ON tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- GOALS: Adicionar INSERT e DELETE
-- ============================================
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
CREATE POLICY "Users can insert own goals" ON goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
CREATE POLICY "Users can delete own goals" ON goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- THEMES: Adicionar INSERT e DELETE
-- ============================================
DROP POLICY IF EXISTS "Users can insert own themes" ON themes;
CREATE POLICY "Users can insert own themes" ON themes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own themes" ON themes;
CREATE POLICY "Users can delete own themes" ON themes 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- SUBTHEMES: Adicionar INSERT e DELETE
-- ============================================
DROP POLICY IF EXISTS "Users can insert own subthemes" ON subthemes;
CREATE POLICY "Users can insert own subthemes" ON subthemes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own subthemes" ON subthemes;
CREATE POLICY "Users can delete own subthemes" ON subthemes 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- PROJECTS: Adicionar INSERT e DELETE  
-- ============================================
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
CREATE POLICY "Users can insert own projects" ON projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects" ON projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- PROJECT MILESTONES: Adicionar INSERT e DELETE
-- ============================================
DROP POLICY IF EXISTS "Users can insert own milestones" ON project_milestones;
CREATE POLICY "Users can insert own milestones" ON project_milestones 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own milestones" ON project_milestones;
CREATE POLICY "Users can delete own milestones" ON project_milestones 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- VERIFICAR SE FOI APLICADO
-- ============================================
-- Execute esta query para confirmar que as políticas foram criadas:
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('tasks', 'goals', 'themes', 'subthemes', 'projects', 'project_milestones')
ORDER BY tablename, cmd;
