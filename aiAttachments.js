const path = require('node:path');
const { AttachmentBuilder } = require('discord.js');
const db = require('./db.js');

async function aiAttachment(responseText, probability = 0.5) {
    const lowerText = responseText.toLowerCase();
    const attachments = [];

    const { rows: triggers } = await db.query('SELECT * FROM attachment_triggers');
    for (const trigger of triggers) {
        if (lowerText.includes(trigger.trigger_text.toLowerCase()) && Math.random() < probability) {
            const { rows: files } = await db.query(
                'SELECT file_path FROM attachment_files WHERE category = $1',
                [trigger.category]
            );

            if (files.length > 0) {
                const file = files[Math.floor(Math.random() * files.length)].file_path;
                attachments.push(new AttachmentBuilder(path.join(__dirname, file)));
            }
        }
    }

    return attachments.length > 0 ? attachments : null;
}

module.exports = { aiAttachment };