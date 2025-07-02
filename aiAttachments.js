const { AttachmentBuilder } = require('discord.js');
const path = require('node:path');
const { upset_fucker } = require('./messageDatabase.js');

// This is for AI responses to have the ability to send an attachment
function upsetAttachment(responseText, probability = 1.00) {
    if (upset_fucker.some(str => responseText.includes(str))) {
        if (Math.random() < probability) {
            return new AttachmentBuilder(path.join(__dirname, './media/WTF.png'));
        }
    }
    return null;
}

module.exports = { upsetAttachment };