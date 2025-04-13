const users = [
    {
        id: '123456789012345678',
        usernames: ['thedragonary', 'dragonary'],
        displayName: 'Dragonary',
        isCreator: true
    },
    {
        id: '234567890123456789',
        usernames: ['spookeddoor', 'spooked'],
        displayName: 'SpookedDoor',
        isCreator: true
    },
    {
        id: '345678901234567890',
        usernames: ['hellbeyv2', 'hellbey'],
        displayName: 'Hellbey',
        isCreator: false
    },
    {
        id: '456789012345678901',
        usernames: ['sillyh.', 'trinke'],
        displayName: 'Trinke',
        isCreator: false
    },
    {
        id: '567890123456789012',
        usernames: ['nonamebadass', 'poncho'],
        displayName: 'Poncho',
        isCreator: false
    },
    {
        id: '678901234567890123',
        usernames: ['moonmanv2', 'moon man', 'moonman', 'moonie'],
        displayName: 'Moon Man',
        isCreator: false
    },
    {
        id: '789012345678901234',
        usernames: ['marv_mari', 'brit'],
        displayName: 'Brit',
        isCreator: false
    },
    {
        id: '890123456789012345',
        usernames: ['edenlance', 'peanut', 'penut'],
        displayName: 'Penut',
        isCreator: false
    },
    {
        id: '901234567890123456',
        usernames: ['nagiro.', 'ghostto'],
        displayName: 'Ghostto',
        isCreator: false
    },
    {
        id: '012345678901234567',
        usernames: ['meeperthe1', 'meeper'],
        displayName: 'Meeper',
        isCreator: false
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