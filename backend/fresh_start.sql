-- ==============================================
-- FRESH START: Drop all + Create all
-- ==============================================

-- ── Drop everything ──
DROP TABLE IF EXISTS prompts CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS notebook_items CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS notebook_sources CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS notebooks CASCADE;

-- ── Notebooks ──
CREATE TABLE notebooks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  cover_url text DEFAULT '',
  preview_content text DEFAULT '',
  published boolean DEFAULT false,
  premium boolean DEFAULT false,
  views int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ── Notebook Sources ──
CREATE TABLE notebook_sources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  notebook_id uuid REFERENCES notebooks(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  source_type text DEFAULT 'text',
  created_at timestamptz DEFAULT now()
);

-- ── Chat Sessions ──
CREATE TABLE chat_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text DEFAULT 'แชทใหม่',
  notebook_id uuid REFERENCES notebooks(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ── Chat Messages ──
CREATE TABLE chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  provider text,
  created_at timestamptz DEFAULT now()
);

-- ── Posts (Blog) ──
CREATE TABLE posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text DEFAULT '',
  tags text[] DEFAULT '{}',
  published boolean DEFAULT false,
  views int DEFAULT 0,
  likes_count int DEFAULT 0,
  notebook_id uuid REFERENCES notebooks(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ── Comments ──
CREATE TABLE comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── Post Likes ──
CREATE TABLE post_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_likes_unique ON post_likes(post_id, user_id);

-- ── Notebook Items ──
CREATE TABLE notebook_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  notebook_id uuid REFERENCES notebooks(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  source_id uuid,
  content text,
  created_at timestamptz DEFAULT now()
);

-- ── Notes ──
CREATE TABLE notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text DEFAULT '',
  notebook_id uuid REFERENCES notebooks(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ── Prompts ──
CREATE TABLE prompts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ════════════════════════════════════════════
-- Indexes
-- ════════════════════════════════════════════
CREATE INDEX idx_prompts_user ON prompts(user_id);
CREATE INDEX idx_sources_notebook ON notebook_sources(notebook_id);
CREATE INDEX idx_comments_post ON comments(post_id, created_at DESC);
CREATE INDEX idx_likes_post ON post_likes(post_id);
CREATE INDEX idx_likes_user ON post_likes(user_id);
CREATE INDEX idx_chat_session ON chat_messages(session_id, created_at);
CREATE INDEX idx_posts_published ON posts(published, created_at DESC);
CREATE INDEX idx_notebook_items_notebook ON notebook_items(notebook_id);

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

-- Notebooks
CREATE POLICY "notebooks_select" ON notebooks FOR SELECT USING (auth.uid() = user_id OR published = true);
CREATE POLICY "notebooks_insert" ON notebooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notebooks_update" ON notebooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notebooks_delete" ON notebooks FOR DELETE USING (auth.uid() = user_id);

-- Notebook Sources
CREATE POLICY "sources_select" ON notebook_sources FOR SELECT USING (
  EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_id AND (user_id = auth.uid() OR published = true))
);
CREATE POLICY "sources_insert" ON notebook_sources FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_id AND user_id = auth.uid())
);
CREATE POLICY "sources_delete" ON notebook_sources FOR DELETE USING (
  EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_id AND user_id = auth.uid())
);

-- Chat Sessions
CREATE POLICY "chats_select" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chats_insert" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chats_delete" ON chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Chat Messages
CREATE POLICY "messages_select" ON chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid())
);
CREATE POLICY "messages_insert" ON chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid())
);
CREATE POLICY "messages_delete" ON chat_messages FOR DELETE USING (
  EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid())
);

-- Posts
CREATE POLICY "posts_select" ON posts FOR SELECT USING (published = true OR auth.uid() = user_id);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Post Likes
CREATE POLICY "likes_select" ON post_likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Notebook Items
CREATE POLICY "items_select" ON notebook_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_id AND user_id = auth.uid())
);
CREATE POLICY "items_insert" ON notebook_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_id AND user_id = auth.uid())
);
CREATE POLICY "items_delete" ON notebook_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_id AND user_id = auth.uid())
);

-- Notes
CREATE POLICY "notes_select" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notes_insert" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_delete" ON notes FOR DELETE USING (auth.uid() = user_id);

-- Prompts
CREATE POLICY "prompts_select" ON prompts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "prompts_insert" ON prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prompts_update" ON prompts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "prompts_delete" ON prompts FOR DELETE USING (auth.uid() = user_id);
