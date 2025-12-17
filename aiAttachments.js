const { AttachmentBuilder } = require('discord.js');
const path = require('node:path');
const db = require('./db.js');

async function aiAttachment(responseText, probability = 0.25) {
    const lowerText = responseText.toLowerCase();
    const attachments = [];

    const { rows: triggers } = await db.query('SELECT * FROM attachment_triggers');
    for (const trigger of triggers) {
        if (lowerText.includes(trigger.trigger_text.toLowerCase()) && Math.random() < probability) {
            const { rows } = await db.query(
                'SELECT file_path FROM attachment_files WHERE category = $1 ORDER BY RANDOM() LIMIT 1',
                [trigger.category]
            );

            if (rows.length > 0) attachments.push(new AttachmentBuilder(path.join(__dirname, rows[0].file_path)));
        }
    }

    return attachments.length > 0 ? attachments : null;
}

module.exports = { aiAttachment };