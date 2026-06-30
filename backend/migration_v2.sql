-- === Blog System v2: Comments, Likes, Views ===

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at DESC);

-- Likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique ON post_likes(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON post_likes(user_id);

-- Add counters to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views int DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count int DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
