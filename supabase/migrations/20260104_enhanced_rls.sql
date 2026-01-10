-- Enhanced RLS Policies for Collaboration
-- Created: 2026-01-04
-- Description: Expand RLS to allow access for collaborators

-- ============================================
-- 1. UTILITY FUNCTIONS (Optional helper if used frequently)
-- ============================================

-- ============================================
-- 2. UPDATING POLICIES
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

-- NOTIFY: Cleanup for collaborators table
DROP POLICY IF EXISTS "Owners can manage collaborators" ON collaborators;
CREATE POLICY "Owners can manage collaborators" ON collaborators FOR ALL 
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can view where they are collaborators" ON collaborators;
CREATE POLICY "Users can view where they are collaborators" ON collaborators FOR SELECT 
USING (auth.uid() = user_id OR email = auth.email());
