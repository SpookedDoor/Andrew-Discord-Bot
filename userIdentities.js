const users = [
    {
        id: '1181721653634420767',
        usernames: ['thedragonary', 'dragonary'],
        displayName: 'Dragonary',
        isCreator: true,
        isGod: true,
        traits: ['male', 'creator of andrew bot', 'british'],
    },
    {
        id: '956743571980038174',
        usernames: ['spookeddoor', 'spooked'],
        displayName: 'SpookedDoor',
        isCreator: true,
        isGod: true,
        traits: ['male', 'creator of andrew bot', 'american'],
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
        traits: ['male', 'brazilian'],
    },
    {
        id: '559520799829000203',
        usernames: ['marv_mari', 'brit'],
        displayName: 'Brit',
        isCreator: false,
        isGod: false,
        traits: ['female', 'american', 'russian', 'futanari', 'married to Tomoko'],
    },
    {
        id: '689829347443605768',
        usernames: ['edenlance', 'peanut', 'penut'],
        displayName: 'Penut',
        isCreator: false,
        isGod: false,
        traits: ['female', 'american'],
    },
    {
        id: null,
        usernames: ['nagiro.', 'ghostto'],
        displayName: 'Ghostto',
        isCreator: false,
        isGod: false,
        traits: ['male', 'degenerate', 'american']
    },
    {
        id: '776931705813860363',
        usernames: ['meeperthe1', 'meeper'],
        displayName: 'Meeper',
        isCreator: false,
        isGod: false,
        traits: ['male', 'likes warhammer', 'american']
    },
    {
        id: '1014404029146726460',
        usernames: ['andrew143256', 'andrew', 'fish 27'],
        displayName: 'Andrew',
        isCreator: true,
        isGod: false,
        traits: ['the real andrew', 'the person who andrew bot is based on'],
    },
];

function findUserIdentity({ id = null, name = '' }) {
    const normalized = name.toLowerCase().trim();

    return users.find(user =>
        (id && user.id === id) ||
        user.usernames.some(u => u.toLowerCase() === normalized)
    );
}

module.exports = {
    users,
    findUserIdentity
};