-- 🚀 HABILITAR REALTIME PARA TODAS AS TABELAS
-- Execute este script no SQL Editor do Supabase Dashboard

-- Habilitar realtime para a tabela tasks
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- Habilitar realtime para a tabela goals
ALTER TABLE public.goals REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;

-- Habilitar realtime para a tabela themes
ALTER TABLE public.themes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.themes;

-- Habilitar realtime para a tabela subthemes
ALTER TABLE public.subthemes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subthemes;

-- Verificar se funcionou
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
