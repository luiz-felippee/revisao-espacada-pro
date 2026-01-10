-- Collaboration Migration
-- Created: 2026-01-02
-- Description: Add tables for sharing and collaboration

-- ============================================
-- COLLABORATORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- RLS
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage collaborators"
    ON collaborators FOR ALL
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can view where they are collaborators"
    ON collaborators FOR SELECT
    USING (auth.uid() = user_id OR auth.email() = email);

-- Indexes
CREATE INDEX idx_collaborators_resource ON collaborators(resource_type, resource_id);
CREATE INDEX idx_collaborators_owner ON collaborators(owner_id);
CREATE INDEX idx_collaborators_user ON collaborators(user_id);
CREATE INDEX idx_collaborators_email ON collaborators(email);

-- ============================================
-- SHARE LINKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS share_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('theme', 'project')),
    resource_id UUID NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    share_code TEXT NOT NULL UNIQUE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(resource_type, resource_id)
);

-- RLS
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage share links"
    ON share_links FOR ALL
    USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view public links"
    ON share_links FOR SELECT
    USING (is_public = TRUE);

-- Indexes
CREATE INDEX idx_share_links_resource ON share_links(resource_type, resource_id);
CREATE INDEX idx_share_links_code ON share_links(share_code);
CREATE INDEX idx_share_links_owner ON share_links(owner_id);
