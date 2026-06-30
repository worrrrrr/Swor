-- Fix RLS for prompts table
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Allow users to SELECT their own prompts
DROP POLICY IF EXISTS "Users can view own prompts" ON prompts;
CREATE POLICY "Users can view own prompts" ON prompts
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to INSERT their own prompts
DROP POLICY IF EXISTS "Users can insert own prompts" ON prompts;
CREATE POLICY "Users can insert own prompts" ON prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE their own prompts
DROP POLICY IF EXISTS "Users can update own prompts" ON prompts;
CREATE POLICY "Users can update own prompts" ON prompts
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to DELETE their own prompts
DROP POLICY IF EXISTS "Users can delete own prompts" ON prompts;
CREATE POLICY "Users can delete own prompts" ON prompts
  FOR DELETE USING (auth.uid() = user_id);
