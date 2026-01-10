-- Consolidated Security & Collaboration Migration
-- Created: 2026-01-04
-- This script ensures all tables exist and applies advanced RLS policies.

-- ============================================
-- 1. ENSURE TABLES EXIST (COLABORATION & PROJECTS)
-- ============================================

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planning' 
        CHECK (status IN ('planning', 'active', 'completed', 'archived')),
    category TEXT,
    start_date TIMESTAMPTZ,
    deadline TIMESTAMPTZ,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT MILESTONES TABLE
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    deadline TIMESTAMPTZ,
    completed BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COLLABORATORS TABLE
CREATE TABLE IF NOT EXISTS collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('theme', 'project')),
    resource_id UUID NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' 
        CHECK (role IN ('owner', 'editor', 'viewer')),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    CONSTRAINT collaborator_user_or_email CHECK (
        user_id IS NOT NULL OR email IS NOT NULL
    )
);

-- SHARE LINKS TABLE
CREATE TABLE IF NOT EXISTS share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('theme', 'project')),
    resource_id UUID NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    share_code TEXT NOT NULL UNIQUE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(resource_type, resource_id)
);

-- ============================================
-- 2. ENABLE RLS
-- ============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. APPLY ENHANCED RLS POLICIES
-- ============================================

-- THEMES: Allow access for collaborators
DROP POLICY IF EXISTS "Users can view own themes" ON themes;
CREATE POLICY "Users and collaborators can view themes" ON themes 
FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM collaborators 
        WHERE resource_type = 'theme' AND resource_id = themes.id 
        AND (user_id = auth.uid() OR email = auth.email())
    )
);

DROP POLICY IF EXISTS "Users can update own themes" ON themes;
CREATE POLICY "Users and editors can update themes" ON themes 
FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM collaborators 
        WHERE resource_type = 'theme' AND resource_id = themes.id 
        AND (user_id = auth.uid() OR email = auth.email())
        AND role IN ('editor', 'owner')
    )
);

-- SUBTHEMES (Linked to themes)
DROP POLICY IF EXISTS "Users can view own subthemes" ON subthemes;
CREATE POLICY "Users and collaborators can view subthemes" ON subthemes 
FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM collaborators 
        WHERE resource_type = 'theme' AND resource_id = subthemes.theme_id 
        AND (user_id = auth.uid() OR email = auth.email())
    )
);

DROP POLICY IF EXISTS "Users can update own subthemes" ON subthemes;
CREATE POLICY "Users and editors can update subthemes" ON subthemes 
FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM collaborators 
        WHERE resource_type = 'theme' AND resource_id = subthemes.theme_id 
        AND (user_id = auth.uid() OR email = auth.email())
        AND role IN ('editor', 'owner')
    )
);

-- TASKS (Linked to themes)
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
CREATE POLICY "Users and collaborators can view tasks" ON tasks 
FOR SELECT USING (
    auth.uid() = user_id OR 
    (theme_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM collaborators 
        WHERE resource_type = 'theme' AND resource_id = tasks.theme_id 
        AND (user_id = auth.uid() OR email = auth.email())
    ))
);

DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
CREATE POLICY "Users and editors can update tasks" ON tasks 
FOR UPDATE USING (
    auth.uid() = user_id OR 
    (theme_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM collaborators 
        WHERE resource_type = 'theme' AND resource_id = tasks.theme_id 
        AND (user_id = auth.uid() OR email = auth.email())
        AND role IN ('editor', 'owner')
    ))
);

-- GOALS (Linked to themes)
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
CREATE POLICY "Users and collaborators can view goals" ON goals 
FOR SELECT USING (
    auth.uid() = user_id OR 
    (theme_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM collaborators 
        WHERE resource_type = 'theme' AND resource_id = goals.theme_id 
        AND (user_id = auth.uid() OR email = auth.email())
    ))
);

DROP POLICY IF EXISTS "Users can update own goals" ON goals;
CREATE POLICY "Users and editors can update goals" ON goals 
FOR UPDATE USING (
    auth.uid() = user_id OR 
    (theme_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM collaborators 
        WHERE resource_type = 'theme' AND resource_id = goals.theme_id 
        AND (user_id = auth.uid() OR email = auth.email())
        AND role IN ('editor', 'owner')
    ))
);

-- PROJECTS
DROP POLICY IF EXISTS "Users can manage own projects" ON projects;
CREATE POLICY "Users and collaborators can view projects" ON projects 
FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM collaborators 
        WHERE resource_type = 'project' AND resource_id = projects.id 
        AND (user_id = auth.uid() OR email = auth.email())
    )
);

CREATE POLICY "Users and editors can update projects" ON projects 
FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM collaborators 
        WHERE resource_type = 'project' AND resource_id = projects.id 
        AND (user_id = auth.uid() OR email = auth.email())
        AND role IN ('editor', 'owner')
    )
);

-- PROJECT MILESTONES
DROP POLICY IF EXISTS "Users can manage own milestones" ON project_milestones;
CREATE POLICY "Users and collaborators can view milestones" ON project_milestones 
FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM collaborators 
        WHERE resource_type = 'project' AND resource_id = project_milestones.project_id 
        AND (user_id = auth.uid() OR email = auth.email())
    )
);

CREATE POLICY "Users and editors can update milestones" ON project_milestones 
FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM collaborators 
        WHERE resource_type = 'project' AND resource_id = project_milestones.project_id 
        AND (user_id = auth.uid() OR email = auth.email())
        AND role IN ('editor', 'owner')
    )
);

-- PROFILE: Allow users to delete their account
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile" ON profiles 
FOR DELETE USING (auth.uid() = id);

-- COLLABORATORS: Self-correction (Make sure users can manage their invites)
DROP POLICY IF EXISTS "Owners can manage collaborators" ON collaborators;
CREATE POLICY "Owners can manage collaborators" ON collaborators FOR ALL 
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can view where they are collaborators" ON collaborators;
CREATE POLICY "Users can view where they are collaborators" ON collaborators FOR SELECT 
USING (auth.uid() = user_id OR email = auth.email());

-- SHARE LINKS
DROP POLICY IF EXISTS "Owners can manage share links" ON share_links;
CREATE POLICY "Owners can manage share links" ON share_links FOR ALL 
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Anyone can view public links" ON share_links FOR SELECT 
USING (is_public = TRUE);
