-- Fix FK constraint on chat_sessions.notebook_id to use SET NULL
-- (ป้องกันไม่ให้แชทถูกลบเมื่อลบ notebook)

-- ลบ constraint เก่า
ALTER TABLE chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_notebook_id_fkey;

-- เพิ่ม constraint ใหม่แบบ SET NULL
ALTER TABLE chat_sessions ADD CONSTRAINT chat_sessions_notebook_id_fkey
  FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE SET NULL;
