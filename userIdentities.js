const db = require('./db.js');

async function getUser(id) {
    const { rows } = await db.query(`SELECT id, username, display_name, nicknames, traits, is_creator, is_god FROM users WHERE id = $1`, [id]);
    const row = rows[0];
    if (!row) return null;

    const nicknames = row.nicknames ? row.nicknames.split(',').map(n => n.trim()) : [];
    const usernames = [row.username, ...nicknames].filter(Boolean);

    return {
        id: row.id,
        usernames,
        displayName: row.display_name,
        traits: row.traits ? row.traits.split(',').map(t => t.trim()) : [],
        isCreator: row.is_creator,
        isGod: row.is_god
    };
}

async function getUsers() {
    const { rows } = await db.query(`SELECT id, username, display_name, nicknames, traits, is_creator, is_god FROM users`);

    return rows.map(row => {
        const nicknames = row.nicknames ? row.nicknames.split(',').map(n => n.trim()) : [];
        const usernames = [row.username, ...nicknames].filter(Boolean);

        return {
            id: row.id,
            usernames,
            displayName: row.display_name,
            traits: row.traits ? row.traits.split(',').map(t => t.trim()) : [],
            isCreator: row.is_creator,
            isGod: row.is_god,
        };
    });
}

async function getAllUserInfo() {
    const users = await getUsers();
    return users.map(user =>
        `Display Name: ${user.displayName}, 
        Usernames / Nicknames: ${user.usernames.join(', ')}, 
        Traits: ${user.traits.join(', ')}, 
        ${user.isCreator ? 'This user has the isCreator tag.' : ''}, ${user.isGod ? 'This user has the isGod tag.' : ''}`
    ).join('\n');
}

async function findUserIdentity(id = null, client) {
    const user = await getUser(id);
    if (user) return user;

    if (!user && id) {
        try {
            const user = await client.users.fetch(id, { force: true });

            if (user) {
                return {
                    id: user.id,
                    displayName: user.displayName ?? user.username,
                    usernames: [user.username]
                };
            }
        } catch (err) {}
    }
}

module.exports = {
    getAllUserInfo,
    findUserIdentity,
};