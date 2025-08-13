const path = require('node:path');
const { AttachmentBuilder } = require('discord.js');
const { upset_fucker } = require('./messageDatabase.js');

const griffith_checks = ['griffith', 'femto', 'falconia'];
const griffith_images = [
    './media/griffith.png',
    './media/griffith2.jpg',
];

const food_images = [
    './media/alabamaburger.jpg',
    './media/alabamachicken.jpg',
];

// This is for AI responses to have the ability to send an attachment
function aiAttachment(responseText, probability = 0.50) {
    const lowerText = responseText.toLowerCase();
    const attachments = [];

    // Upset check
    if (upset_fucker.some(str => lowerText.includes(str))) {
        if (Math.random() < probability) {
            attachments.push(new AttachmentBuilder(path.join(__dirname, './media/WTF.png')));
        }
    }

    // Griffith check
    if (griffith_checks.some(str => lowerText.includes(str))) {
        if (Math.random() < probability) {
            attachments.push(new AttachmentBuilder(path.join(__dirname, griffith_images[Math.floor(Math.random() * griffith_images.length)])));
        }
    }

    // Food check
    if (lowerText.includes('burger')) {
        if (Math.random() < probability) {
            attachments.push(new AttachmentBuilder(path.join(__dirname, food_images[0])));
        }
    }
    if (lowerText.includes('chicken')) {
        if (Math.random() < probability) {
            attachments.push(new AttachmentBuilder(path.join(__dirname, food_images[1])));
        }
    }

    // Alien X check
    if (lowerText.includes('alien x')) {
        if (Math.random() < probability) {
            attachments.push(new AttachmentBuilder(path.join(__dirname, './media/andrewx.jpg')));
        }
    }

    return attachments.length > 0 ? attachments : null;
}

module.exports = { aiAttachment };