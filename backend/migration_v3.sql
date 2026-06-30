-- === NotebookLM System: Sources, Publishing, Premium ===

-- Enhance notebooks
ALTER TABLE notebooks ADD COLUMN IF NOT EXISTS published boolean DEFAULT false;
ALTER TABLE notebooks ADD COLUMN IF NOT EXISTS premium boolean DEFAULT false;
ALTER TABLE notebooks ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE notebooks ADD COLUMN IF NOT EXISTS cover_url text DEFAULT '';
ALTER TABLE notebooks ADD COLUMN IF NOT EXISTS preview_content text DEFAULT '';
ALTER TABLE notebooks ADD COLUMN IF NOT EXISTS views int DEFAULT 0;

-- Sources table (documents, links, text uploaded to a notebook)
CREATE TABLE IF NOT EXISTS notebook_sources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  notebook_id uuid REFERENCES notebooks(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  source_type text DEFAULT 'text',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sources_notebook ON notebook_sources(notebook_id);

-- Notebook chat sessions (contextual AI chat)
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS notebook_id uuid REFERENCES notebooks(id) ON DELETE SET NULL;
