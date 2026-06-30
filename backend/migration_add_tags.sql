-- เพิ่มคอลัมน์ tags ให้ posts table
ALTER TABLE posts ADD COLUMN tags text[] DEFAULT '{}';
