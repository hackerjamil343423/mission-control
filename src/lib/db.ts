import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL!);

export { sql };

// Database initialization SQL
export const initSchema = `
-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  assignee TEXT DEFAULT 'jamil' CHECK (assignee IN ('jamil', 'oto')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Content pipeline table
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  stage TEXT DEFAULT 'idea' CHECK (stage IN ('idea', 'scripting', 'thumbnail', 'filming', 'editing', 'published')),
  script TEXT,
  thumbnail_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Calendar table
CREATE TABLE IF NOT EXISTS calendar (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP NOT NULL,
  type TEXT CHECK (type IN ('cron', 'reminder', 'task')),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Team table
CREATE TABLE IF NOT EXISTS team (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'working')),
  avatar TEXT,
  description TEXT
);
`;
