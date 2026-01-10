-- Initial Schema Migration
-- Created: 2026-01-02
-- Description: Core tables for Study Panel

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- THEMES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for themes
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own themes"
    ON themes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own themes"
    ON themes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own themes"
    ON themes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own themes"
    ON themes FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_themes_user_id ON themes(user_id);
CREATE INDEX idx_themes_order ON themes(user_id, order_index);

-- ============================================
-- SUBTHEMES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subthemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for subthemes
ALTER TABLE subthemes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subthemes"
    ON subthemes FOR ALL
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_subthemes_theme_id ON subthemes(theme_id);
CREATE INDEX idx_subthemes_user_id ON subthemes(user_id);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
    subtheme_id UUID REFERENCES subthemes(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    summary TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- RLS for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks"
    ON tasks FOR ALL
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_theme_id ON tasks(theme_id);
CREATE INDEX idx_tasks_completed ON tasks(user_id, completed);
CREATE INDEX idx_tasks_due_date ON tasks(user_id, due_date);

-- ============================================
-- GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT,
    start_date TIMESTAMPTZ,
    deadline TIMESTAMPTZ,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- RLS for goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals"
    ON goals FOR ALL
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_theme_id ON goals(theme_id);
CREATE INDEX idx_goals_deadline ON goals(user_id, deadline);

-- ============================================
-- GAMIFICATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS gamification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for gamification
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own gamification"
    ON gamification FOR ALL
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_gamification_user_id ON gamification(user_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subthemes_updated_at BEFORE UPDATE ON subthemes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gamification_updated_at BEFORE UPDATE ON gamification
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
