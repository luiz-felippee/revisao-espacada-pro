-- MIGRATION DE CORREÇÃO TOTAL DO SCHEMA
-- Copie e cole TUDO ISSO no SQL Editor do Supabase Dashboard e clique em RUN.

-- 1. Atualizar Tabela THEMES
ALTER TABLE themes 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'study',
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notification_time TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS summaries JSONB DEFAULT '[]'::jsonb;

-- 2. Atualizar Tabela GOALS
ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completion_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS summaries JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_habit BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence JSONB,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'simple'; -- simple, checklist, habit

-- Se a coluna related_theme_id não existir, mas theme_id sim, vamos garantir que o frontend consiga trabalhar.
-- Não vamos renomear theme_id para não quebrar dados antigos, o frontend que se adapte (já adaptamos o mapper).

-- 3. Atualizar Tabela SUBTHEMES
ALTER TABLE subthemes
ADD COLUMN IF NOT EXISTS intro_date TIMESTAMPTZ, -- as vezes chamado de introduction_date no frontend
ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS text_content TEXT,
ADD COLUMN IF NOT EXISTS summaries JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 4. Atualizar Tabela TASKS (só por garantia)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS recurrence JSONB,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'day',
ADD COLUMN IF NOT EXISTS date TEXT, -- YYYY-MM-DD
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completion_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS sessions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS summaries JSONB DEFAULT '[]'::jsonb;

-- 5. Atualizar RLS (Reforço de Segurança e Permissão)
-- Garantir que policies existam e permitam tudo para o dono

-- Themes
DROP POLICY IF EXISTS "Users can manage own themes" ON themes;
CREATE POLICY "Users can manage own themes" ON themes USING (auth.uid() = user_id);

-- Goals
DROP POLICY IF EXISTS "Users can manage own goals" ON goals;
CREATE POLICY "Users can manage own goals" ON goals USING (auth.uid() = user_id);

-- Tasks
DROP POLICY IF EXISTS "Users can manage own tasks" ON tasks;
CREATE POLICY "Users can manage own tasks" ON tasks USING (auth.uid() = user_id);

-- Subthemes
DROP POLICY IF EXISTS "Users can manage own subthemes" ON subthemes;
CREATE POLICY "Users can manage own subthemes" ON subthemes USING (auth.uid() = user_id);

-- 6. Grant Permissions (Caso use service role ou anon em algum lugar, mas auth server cuida disso)
GRANT ALL ON themes TO authenticated;
GRANT ALL ON goals TO authenticated;
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON subthemes TO authenticated;
GRANT ALL ON projects TO authenticated;
GRANT ALL ON project_milestones TO authenticated;
