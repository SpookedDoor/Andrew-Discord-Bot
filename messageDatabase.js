const db = require('./db');

async function getMessages(category) {
    const { rows } = await db.query(`
        SELECT m.id, m.content, ma.file_path
        FROM messages m
        LEFT JOIN message_attachments ma ON m.id = ma.message_id
        WHERE m.category_id = (
            SELECT id FROM message_categories WHERE name = $1
        )
        ORDER BY m.id;
    `, [category]);

    const grouped = {};
    rows.forEach(row => {
        if (!grouped[row.id]) {
            grouped[row.id] = {
                content: row.content ? row.content.replace(/\\n/g, "\n").replace("{greeting}", getTimedMessage()) : null,
                files: []
            };
        }
        if (row.file_path) {
            grouped[row.id].files.push(row.file_path);
        }
    });

    return Object.values(grouped);
}

async function getMessageById(id) {
    const { rows } = await db.query(`
        SELECT content
        FROM messages
        WHERE id = $1
        LIMIT 1;
    `, [id]);

    if (rows.length === 0) return null;
    return rows[0].content ? rows[0].content.replace(/\\n/g, "\n") : null;
}

async function getRandomMessage(category = null) {
    const params = [];
    let query = `
        SELECT m.id, m.content, ma.file_path
        FROM messages m
        LEFT JOIN message_attachments ma ON m.id = ma.message_id
    `;

    if (category) {
        query += ` WHERE m.category_id = (SELECT id FROM message_categories WHERE name = $1)`;
        params.push(category);
    }

    query += ` ORDER BY RANDOM() LIMIT 1;`;
    const { rows } = await db.query(query, params);
    if (rows.length === 0) return { content: null, files: [] };

    const message = {
        content: rows[0].content ? rows[0].content.replace(/\\n/g, "\n").replace("{greeting}", getTimedMessage()) : null,
        files: []
    };

    rows.forEach(row => {
        if (row.file_path) message.files.push(row.file_path);
    });

    return message;
}

async function getAllMessages() {
    const { rows } = await db.query(`
        SELECT mc.name AS category, m.content
        FROM messages m
        JOIN message_categories mc ON m.category_id = mc.id
        WHERE m.content IS NOT NULL
        ORDER BY mc.id, m.id;
    `);

    const result = {};
    rows.forEach(row => {
        if (!result[row.category]) result[row.category] = [];
        result[row.category].push(row.content.replace(/\\n/g, "\n"));
    });

    return result;
}

function getTimedMessage() {
    return new Date().getUTCHours() < 6 ? 'GN' : new Date().getUTCHours() < 12 ? 'morning' : new Date().getUTCHours() < 22 ? 'hello' : 'GN';
};

function getAge() {
    const birthDate = new Date(2002, 10, 19); // 19 November 2002
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

async function getHelloFollowup(userId) {
    if (Math.random() < 0.5) return null;
    const randomFollowup = await getRandomMessage('hello_followup');
    if (userId === '956743571980038174') { // Replace with your Discord user ID
        const options = ["Lefthand", "Righthand", randomFollowup.content];
        return options[Math.floor(Math.random() * options.length)];
    } else {
        return randomFollowup.content;
    }
}

module.exports = {
    getMessages,
    getMessageById,
    getRandomMessage,
    getAllMessages,
    getAge,
    getHelloFollowup
};