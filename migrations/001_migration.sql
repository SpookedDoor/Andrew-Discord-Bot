-- Links table: Maps Discord user IDs to Last.fm usernames
CREATE TABLE IF NOT EXISTS lastfm_links (
    discord_user_id VARCHAR(32) PRIMARY KEY,
    lastfm_username VARCHAR(64) NOT NULL
);

-- Disabled guilds table: Prevents the bot sending random messages in these servers
CREATE TABLE IF NOT EXISTS disabled_guilds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Default channels table: Sets default channels for random messages
CREATE TABLE IF NOT EXISTS default_channels (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL
);

-- Users table: Stores user information
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(32) PRIMARY KEY,
    username TEXT NOT NULL,
    display_name TEXT,
    nicknames TEXT,
    traits TEXT,
    is_creator BOOL DEFAULT FALSE,
    is_god BOOL DEFAULT FALSE
);

-- Categories table: Defines message categories (wakeytime, sleepytime, etc.)
CREATE TABLE IF NOT EXISTS message_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL      -- e.g., 'wakeytime', 'kanye_messages'
);

-- Messages table: Stores individual messages
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES message_categories(id) ON DELETE CASCADE,
    content TEXT,         -- message text (can be NULL if only attachments)
    created_at TIMESTAMP DEFAULT NOW()
);

-- Attachments table: Stores files, images, or extra media for messages
CREATE TABLE IF NOT EXISTS message_attachments (
    id SERIAL PRIMARY KEY,
    message_id INT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_path TEXT,                -- path or URL to the file
    created_at TIMESTAMP DEFAULT NOW()
);

-- Keywords or triggers for attachment responses
CREATE TABLE IF NOT EXISTS attachment_triggers (
    id SERIAL PRIMARY KEY,
    trigger_text TEXT UNIQUE NOT NULL,  -- e.g., 'griffith', 'femto', 'burger'
    category TEXT NOT NULL              -- e.g., 'griffith', 'food', 'alien_x'
);

-- Attachment files associated with a category
CREATE TABLE IF NOT EXISTS attachment_files (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,             -- matches attachment_triggers.category
    file_path TEXT UNIQUE NOT NULL      -- './media/griffith.png'
);

-- Keyword responses
CREATE TABLE IF NOT EXISTS keywords (
    id SERIAL,
    keyword TEXT NOT NULL,
    response TEXT NOT NULL
);