-- ============================================
-- 1. TABLES
-- ============================================

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    gamification JSONB DEFAULT '{"level":{"level":1,"xp":0,"xpToNext":100},"stats":{"tasksCompleted":0,"goalsCompleted":0,"reviewsCompleted":0,"streakDays":0,"totalXP":0},"achievements":[],"lastLoginDate":null}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- THEMES
CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT CHECK (category IN ('study', 'project')),
    color TEXT,
    icon TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    notification_time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBTHEMES
CREATE TABLE IF NOT EXISTS subthemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')),
    introduction_date DATE,
    deadline DATE,
    content TEXT,
    notes TEXT,
    reviews JSONB DEFAULT '[]'::jsonb,
    sessions JSONB DEFAULT '[]'::jsonb,
    summaries JSONB DEFAULT '[]'::jsonb,
    time_spent INTEGER DEFAULT 0,
    duration_minutes INTEGER DEFAULT 25,
    mastery REAL DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('day', 'period')) DEFAULT 'day',
    status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    date DATE,
    start_date DATE,
    end_date DATE,
    notification_time TEXT,
    duration_minutes INTEGER DEFAULT 25,
    time_spent INTEGER DEFAULT 0,
    image_url TEXT,
    completion_history JSONB DEFAULT '[]'::jsonb,
    sessions JSONB DEFAULT '[]'::jsonb,
    summaries JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GOALS
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('simple', 'checklist', 'habit')) DEFAULT 'simple',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    category TEXT,
    progress INTEGER DEFAULT 0,
    target INTEGER DEFAULT 100,
    icon TEXT,
    color TEXT,
    deadline DATE,
    start_date DATE,
    notification_time TEXT,
    duration_minutes INTEGER DEFAULT 25,
    time_spent INTEGER DEFAULT 0,
    recurrence INTEGER[] DEFAULT ARRAY[]::integer[],
    checklist JSONB DEFAULT '[]'::jsonb,
    completion_history JSONB DEFAULT '[]'::jsonb,
    sessions JSONB DEFAULT '[]'::jsonb,
    summaries JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_themes_user_id ON themes(user_id);
CREATE INDEX IF NOT EXISTS idx_subthemes_user_id ON subthemes(user_id);
CREATE INDEX IF NOT EXISTS idx_subthemes_theme_id ON subthemes(theme_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_theme_id ON tasks(theme_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_theme_id ON goals(theme_id);

-- ============================================
-- 3. RLS (Row Level Security)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subthemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- POLICIES: profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- POLICIES: themes
CREATE POLICY "Users can view own themes" ON themes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own themes" ON themes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own themes" ON themes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own themes" ON themes FOR DELETE USING (auth.uid() = user_id);

-- POLICIES: subthemes
CREATE POLICY "Users can view own subthemes" ON subthemes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subthemes" ON subthemes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subthemes" ON subthemes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subthemes" ON subthemes FOR DELETE USING (auth.uid() = user_id);

-- POLICIES: tasks
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- POLICIES: goals
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
