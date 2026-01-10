# Supabase Database Migrations

## Setup

### Install Supabase CLI
```bash
npm install -D supabase
```

### Initialize
```bash
npx supabase init
```

## Creating Migrations

### New Migration
```bash
npx supabase migration new add_projects_table
```

### Example Migration
```sql
-- supabase/migrations/20260102_add_projects.sql
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);
```

## Applying Migrations

### Local
```bash
npx supabase db reset
```

### Production
```bash
npx supabase db push
```

## Viewing Schema
```bash
npx supabase db diff
```

## Best Practices
- Always test locally first
- Use descriptive migration names
- Include RLS policies
- Version control migrations
