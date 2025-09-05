const db = require('./db.js');

async function getUsers() {
    const { rows } = await db.query(`
        SELECT id, username, display_name, nicknames, traits, is_creator, is_god
        FROM users;
    `);

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

async function findUserIdentity({ id = null, name = '', guild = null }) {
    const normalised = (name ? name.toLowerCase().trim() : '');
    const users = await getUsers();

    let user = users.find(user =>
        (id && user.id === id) ||
        user.usernames.some(u => u.toLowerCase() === normalised)
    );

    if (user) return user;

    if (guild) {
        if (!guild.members.cache.size) {
            await guild.members.fetch();
        }

        const member = guild.members.cache.find(
            m =>
                m.user.username.toLowerCase() === normalised ||
                m.displayName.toLowerCase() === normalised
        );

        if (member) {
            return {
                displayName: member.displayName,
                usernames: [member.user.username],
                traits: [],
                note: `This is a person in the server.`,
                id: member.id
            };
        }
    }
}

module.exports = {
    findUserIdentity,
};