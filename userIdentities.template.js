const users = [
    {
        id: '123',
        usernames: ['username', 'nickname'],
        displayName: 'name the bot should use',
        isCreator: false,
        isGod: false,
        traits: ['human', 'not stupid'],
    },
    {
        id: '123',
        usernames: ['Anti-Andrew', 'Anti'],
        displayName: 'Anti-Andrew',
        isCreator: false,
        isGod: false,
        traits: ['enemy of Andrew']
    }
];

async function findUserIdentity({ id = null, name = '', guild = null }) {
    const normalised = (name ? name.toLowerCase().trim() : '');

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
                isCreator: false,
                traits: [],
                note: `This is a person in the server.`,
                id: member.id
            };
        }
    }
}

module.exports = {
    users,
    findUserIdentity,
};