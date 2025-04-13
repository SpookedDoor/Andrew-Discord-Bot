const users = [
    {
        id: '1181721653634420767',
        usernames: ['thedragonary', 'dragonary'],
        displayName: 'Dragonary',
        isCreator: true,
        isGod: true,
        traits: ['male', 'creator of andrew bot', 'british', 'likes games', 'likes anime', 'likes cars', 'likes cats'],
    },
    {
        id: '956743571980038174',
        usernames: ['spookeddoor', 'spooked'],
        displayName: 'SpookedDoor',
        isCreator: true,
        isGod: true,
        traits: ['male', 'creator of andrew bot', 'american', 'likes games', 'likes persona', 'likes tea', 'draws'],
    },
    {
        id: '1208629217890148363',
        usernames: ['hellbeyv2', 'hellbey'],
        displayName: 'Hellbey',
        isCreator: false,
        isGod: true,
        traits: ['male', 'american'],
    },
    {
        id: '545586677117353985',
        usernames: ['sillyh.', 'trinke'],
        displayName: 'Trinke',
        isCreator: false,
        isGod: true,
        traits: ['male', 'lithuanian'],
    },
    {
        id: '197487122041667584',
        usernames: ['nonamebadass', 'poncho'],
        displayName: 'Poncho',
        isCreator: false,
        isGod: true,
        traits: ['male', 'degenerate', 'american'],
    },
    {
        id: '1047876190809116752',
        usernames: ['moonmanv2', 'moon man', 'moonman', 'moonie'],
        displayName: 'Moon Man',
        isCreator: false,
        isGod: false,
        traits: ['male', 'brazilian', 'only plays paradox games, map games like HOI4, EU4 and CK3', 'likes anime', 'likes lolis'],
    },
    {
        id: '559520799829000203',
        usernames: ['marv_mari', 'brit'],
        displayName: 'Brit',
        isCreator: false,
        isGod: true,
        traits: ['female', 'american', 'russian', 'futanari', 'married to real Tomoko', 'draws'],
    },
    {
        id: '689829347443605768',
        usernames: ['edenlance', 'peanut', 'penut'],
        displayName: 'Penut',
        isCreator: false,
        isGod: false,
        traits: ['female', 'american', 'likes games', 'likes anime', 'likes cats'],
    },
    {
        id: null,
        usernames: ['nagiro.', 'ghostto', 'nagito', 'nigito'],
        displayName: 'Ghostto',
        isCreator: false,
        isGod: false,
        traits: ['male', 'degenerate', 'american', 'goons all the time', 'never plays L4D2 with Dragonary and SpookedDoor because he is busy gooning'],
    },
    {
        id: '776931705813860363',
        usernames: ['meeperthe1', 'meeper'],
        displayName: 'Meeper',
        isCreator: false,
        isGod: false,
        traits: ['male', 'american', 'likes warhammer']
    },
    {
        id: '1014404029146726460',
        usernames: ['andrew143256', 'andrew', 'fish 27'],
        displayName: 'Andrew',
        isCreator: false,
        isGod: false,
        traits: ['the real andrew', 'the person who andrew bot is based on'],
    },
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
                isGod: false,
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