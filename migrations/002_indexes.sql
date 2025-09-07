-- Indexes
CREATE INDEX IF NOT EXISTS idx_lastfm_links_username ON lastfm_links(lastfm_username);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_display_name ON users(display_name);
CREATE INDEX IF NOT EXISTS idx_messages_category_id ON messages(category_id);
CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_attachment_triggers_category ON attachment_triggers(category);
CREATE INDEX IF NOT EXISTS idx_attachment_files_category ON attachment_files(category);

-- Uniqueness constraints
ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS uq_messages,
  ADD CONSTRAINT uq_messages UNIQUE (category_id, content);

ALTER TABLE message_attachments
  DROP CONSTRAINT IF EXISTS uq_message_attachments,
  ADD CONSTRAINT uq_message_attachments UNIQUE (message_id, file_path);

ALTER TABLE attachment_files
  DROP CONSTRAINT IF EXISTS uq_attachment_files,
  ADD CONSTRAINT uq_attachment_files UNIQUE (category, file_path);