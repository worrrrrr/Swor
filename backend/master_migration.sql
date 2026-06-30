-- ==============================================
-- MASTER MIGRATION: Full Schema + RLS
-- Safe to re-run (uses IF NOT EXISTS for everything)
-- ==============================================

-- ── Notebooks ──
CREATE TABLE IF NOT EXISTS notebooks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notebooks ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE notebooks ADD COLUMN IF NOT EXISTS cover_url text DEFAULT '';
ALTER TABLE notebooks ADD COLUMN IF NOT EXISTS preview_content text DEFAULT '';
ALTER TABLE notebooks ADD COLUMN IF NOT EXISTS published boolean DEFAULT false;
ALTER TABLE notebooks ADD COLUMN IF NOT EXISTS premium boolean DEFAULT false;
ALTER TABLE notebooks ADD COLUMN IF NOT EXISTS views int DEFAULT 0;

-- ── Notebook Sources (NotebookLM) ──
CREATE TABLE IF NOT EXISTS notebook_sources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  notebook_id uuid REFERENCES notebooks(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  source_type text DEFAULT 'text',
  created_at timestamptz DEFAULT now()
);

-- ── Chat Sessions ──
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text DEFAULT 'แชทใหม่',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS notebook_id uuid REFERENCES notebooks(id) ON DELETE SET NULL;

-- ── Chat Messages ──
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  provider text,
  created_at timestamptz DEFAULT now()
);

-- ── Posts (Blog) ──
CREATE TABLE IF NOT EXISTS posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text DEFAULT '',
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views int DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count int DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS notebook_id uuid REFERENCES notebooks(id) ON DELETE SET NULL;

-- ── Comments ──
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── Post Likes ──
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique ON post_likes(post_id, user_id);

-- ── Notebook Items ──
CREATE TABLE IF NOT EXISTS notebook_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  notebook_id uuid REFERENCES notebooks(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  source_id uuid,
  content text,
  created_at timestamptz DEFAULT now()
);

-- ── Notes ──
CREATE TABLE IF NOT EXISTS notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notes ADD COLUMN IF NOT EXISTS notebook_id uuid REFERENCES notebooks(id) ON DELETE SET NULL;

-- ── Prompts ──
CREATE TABLE IF NOT EXISTS prompts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ════════════════════════════════════════════
-- Indexes
-- ════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_prompts_user ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_sources_notebook ON notebook_sources(notebook_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notebook_items_notebook ON notebook_items(notebook_id);

-- ════════════════════════════════════════════
-- RLS Policies
-- ════════════════════════════════════════════
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Notebooks: owner sees all, public sees only published
DROP POLICY IF EXISTS "notebooks_select" ON notebooks;
CREATE POLICY "notebooks_select" ON notebooks
  FOR SELECT USING (auth.uid() = user_id OR published = true);

DROP POLICY IF EXISTS "notebooks_insert" ON notebooks;
CREATE POLICY "notebooks_insert" ON notebooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notebooks_update" ON notebooks;
CREATE POLICY "notebooks_update" ON notebooks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notebooks_delete" ON notebooks;
CREATE POLICY "notebooks_delete" ON notebooks
  FOR DELETE USING (auth.uid() = user_id);

-- Notebook Sources: via notebook owner
DROP POLICY IF EXISTS "sources_select" ON notebook_sources;
CREATE POLICY "sources_select" ON notebook_sources
  FOR SELECT USING (EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_id AND (user_id = auth.uid() OR published = true)));

DROP POLICY IF EXISTS "sources_insert" ON notebook_sources;
CREATE POLICY "sources_insert" ON notebook_sources
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "sources_delete" ON notebook_sources;
CREATE POLICY "sources_delete" ON notebook_sources
  FOR DELETE USING (EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_id AND user_id = auth.uid()));

-- Chat Sessions
DROP POLICY IF EXISTS "chats_select" ON chat_sessions;
CREATE POLICY "chats_select" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chats_insert" ON chat_sessions;
CREATE POLICY "chats_insert" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chats_delete" ON chat_sessions;
CREATE POLICY "chats_delete" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Chat Messages: via session owner
DROP POLICY IF EXISTS "messages_select" ON chat_messages;
CREATE POLICY "messages_select" ON chat_messages
  FOR SELECT USING (EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "messages_insert" ON chat_messages;
CREATE POLICY "messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "messages_delete" ON chat_messages;
CREATE POLICY "messages_delete" ON chat_messages
  FOR DELETE USING (EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid()));

-- Posts: public can read published, owner can CRUD own
DROP POLICY IF EXISTS "posts_select" ON posts;
CREATE POLICY "posts_select" ON posts
  FOR SELECT USING (published = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_insert" ON posts;
CREATE POLICY "posts_insert" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_update" ON posts;
CREATE POLICY "posts_update" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_delete" ON posts;
CREATE POLICY "posts_delete" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Comments
DROP POLICY IF EXISTS "comments_select" ON comments;
CREATE POLICY "comments_select" ON comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "comments_insert" ON comments;
CREATE POLICY "comments_insert" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_delete" ON comments;
CREATE POLICY "comments_delete" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Post Likes
DROP POLICY IF EXISTS "likes_select" ON post_likes;
CREATE POLICY "likes_select" ON post_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "likes_insert" ON post_likes;
CREATE POLICY "likes_insert" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "likes_delete" ON post_likes;
CREATE POLICY "likes_delete" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Notebook Items: via notebook owner
DROP POLICY IF EXISTS "items_select" ON notebook_items;
CREATE POLICY "items_select" ON notebook_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "items_insert" ON notebook_items;
CREATE POLICY "items_insert" ON notebook_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "items_delete" ON notebook_items;
CREATE POLICY "items_delete" ON notebook_items
  FOR DELETE USING (EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_id AND user_id = auth.uid()));

-- Notes
DROP POLICY IF EXISTS "notes_select" ON notes;
CREATE POLICY "notes_select" ON notes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notes_insert" ON notes;
CREATE POLICY "notes_insert" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notes_delete" ON notes;
CREATE POLICY "notes_delete" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Prompts
DROP POLICY IF EXISTS "prompts_select" ON prompts;
CREATE POLICY "prompts_select" ON prompts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "prompts_insert" ON prompts;
CREATE POLICY "prompts_insert" ON prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "prompts_update" ON prompts;
CREATE POLICY "prompts_update" ON prompts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "prompts_delete" ON prompts;
CREATE POLICY "prompts_delete" ON prompts
  FOR DELETE USING (auth.uid() = user_id);
