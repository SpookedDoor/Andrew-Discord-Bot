const db = require('./db');

async function getHistory(serverId, userId, limit) {
    const id = serverId || userId;
    let query = 'SELECT username, content, role FROM server_history WHERE server_id = $1 ORDER BY created_at ASC';
    const params = [id];

    if (limit && limit > 0) {
        query += ' LIMIT $2';
        params.push(limit);
    }

    const { rows } = await db.query(query, params);
    return rows;
}

async function getFormattedHistory(serverId, userId, limit) {
    const rows = await getHistory(serverId, userId, limit);

    return rows.map(row => {
        let safeName;

        if (row.username) {
            safeName = row.username
                .toLowerCase()
                .replace(/[^a-z0-9_-]/gi, '_')
                .slice(0, 64);
        }

        return {
            role: row.role === "assistant" ? "assistant" : "user",
            name: safeName,
            content: row.content
        };
    });
}

async function addHistory(serverId, userId, username, content, role) {
    const id = serverId || userId;
    await db.query('INSERT INTO server_history (server_id, username, content, role) VALUES ($1, $2, $3, $4)', [id, username, content, role]);
}

module.exports = {
    getHistory,
    getFormattedHistory,
    addHistory
}