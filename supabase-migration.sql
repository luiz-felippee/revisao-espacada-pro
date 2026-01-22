-- ========================================
-- MIGRATION SCRIPT: VAMOSAGORA V1 → V2
-- Data: 2026-01-20
-- Descrição: Schema completo do banco de dados
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLE: profiles
-- ========================================
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    name text,
    email text,
    avatar_url text,
    gamification jsonb DEFAULT '{}'::jsonb
);

-- ========================================
-- TABLE: themes
-- ========================================
CREATE TABLE public.themes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    color text,
    icon text,
    category text,
    priority text,
    notification_time text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- TABLE: subthemes
-- ========================================
CREATE TABLE public.subthemes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme_id uuid NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text,
    notes text,
    status text,
    mastery real DEFAULT 0,
    duration_minutes integer DEFAULT 0,
    time_spent integer DEFAULT 0,
    introduction_date date,
    deadline date,
    order_index integer DEFAULT 0,
    reviews jsonb DEFAULT '[]'::jsonb,
    summaries jsonb DEFAULT '[]'::jsonb,
    sessions jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- TABLE: tasks
-- ========================================
CREATE TABLE public.tasks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme_id uuid REFERENCES public.themes(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    type text,
    status text,
    priority text,
    date date,
    start_date date,
    end_date date,
    duration_minutes integer DEFAULT 0,
    time_spent integer DEFAULT 0,
    notification_time text,
    image_url text,
    completion_history jsonb DEFAULT '[]'::jsonb,
    sessions jsonb DEFAULT '[]'::jsonb,
    summaries jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- TABLE: goals
-- ========================================
CREATE TABLE public.goals (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme_id uuid REFERENCES public.themes(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    type text,
    priority text,
    category text,
    color text,
    icon text,
    progress integer DEFAULT 0,
    target integer,
    start_date date,
    deadline date,
    duration_minutes integer DEFAULT 0,
    time_spent integer DEFAULT 0,
    notification_time text,
    recurrence text[],
    checklist jsonb DEFAULT '[]'::jsonb,
    completion_history jsonb DEFAULT '[]'::jsonb,
    sessions jsonb DEFAULT '[]'::jsonb,
    summaries jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- TABLE: projects
-- ========================================
CREATE TABLE public.projects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    category text,
    status text NOT NULL DEFAULT 'active',
    progress integer DEFAULT 0,
    start_date timestamp with time zone,
    deadline timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- TABLE: project_milestones
-- ========================================
CREATE TABLE public.project_milestones (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    deadline timestamp with time zone,
    completed boolean DEFAULT false,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- TABLE: share_links
-- ========================================
CREATE TABLE public.share_links (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resource_id uuid NOT NULL,
    resource_type text NOT NULL,
    share_code text NOT NULL UNIQUE,
    is_public boolean DEFAULT false,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- TABLE: collaborators
-- ========================================
CREATE TABLE public.collaborators (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    resource_id uuid NOT NULL,
    resource_type text NOT NULL,
    email text,
    role text NOT NULL,
    invited_at timestamp with time zone DEFAULT now(),
    accepted_at timestamp with time zone
);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subthemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Themes policies
CREATE POLICY "Users can view own themes" ON public.themes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own themes" ON public.themes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own themes" ON public.themes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own themes" ON public.themes
    FOR DELETE USING (auth.uid() = user_id);

-- Subthemes policies
CREATE POLICY "Users can view own subthemes" ON public.subthemes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subthemes" ON public.subthemes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subthemes" ON public.subthemes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subthemes" ON public.subthemes
    FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON public.goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
    FOR DELETE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- Project milestones policies
CREATE POLICY "Users can view own project_milestones" ON public.project_milestones
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project_milestones" ON public.project_milestones
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project_milestones" ON public.project_milestones
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own project_milestones" ON public.project_milestones
    FOR DELETE USING (auth.uid() = user_id);

-- Share links policies
CREATE POLICY "Users can view own share_links" ON public.share_links
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own share_links" ON public.share_links
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own share_links" ON public.share_links
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own share_links" ON public.share_links
    FOR DELETE USING (auth.uid() = owner_id);

-- Collaborators policies
CREATE POLICY "Users can view own collaborators" ON public.collaborators
    FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = user_id);

CREATE POLICY "Users can insert own collaborators" ON public.collaborators
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own collaborators" ON public.collaborators
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own collaborators" ON public.collaborators
    FOR DELETE USING (auth.uid() = owner_id);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX idx_themes_user_id ON public.themes(user_id);
CREATE INDEX idx_subthemes_user_id ON public.subthemes(user_id);
CREATE INDEX idx_subthemes_theme_id ON public.subthemes(theme_id);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_theme_id ON public.tasks(theme_id);
CREATE INDEX idx_tasks_date ON public.tasks(date);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_theme_id ON public.goals(theme_id);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_project_milestones_project_id ON public.project_milestones(project_id);
CREATE INDEX idx_project_milestones_user_id ON public.project_milestones(user_id);

-- ========================================
-- REALTIME PUBLICATION
-- ========================================

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.themes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subthemes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_milestones;

-- ========================================
-- FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_themes
    BEFORE UPDATE ON public.themes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_subthemes
    BEFORE UPDATE ON public.subthemes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_tasks
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_goals
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_projects
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_project_milestones
    BEFORE UPDATE ON public.project_milestones
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
