const pool = require('./db');

async function setUserLink(userId, lastfmUsername) {
  await pool.query(
    'INSERT INTO lastfm_links (discord_user_id, lastfm_username) VALUES ($1, $2) ON CONFLICT (discord_user_id) DO UPDATE SET lastfm_username = EXCLUDED.lastfm_username',
    [userId, lastfmUsername]
  );
}

async function getUserLink(userId) {
  const res = await pool.query(
    'SELECT lastfm_username FROM lastfm_links WHERE discord_user_id = $1',
    [userId]
  );
  return res.rows[0]?.lastfm_username || null;
}

module.exports = { setUserLink, getUserLink };
