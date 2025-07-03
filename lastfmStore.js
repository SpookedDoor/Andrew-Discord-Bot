const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'lastfmLinks.json');

function loadLinks() {
    try {
        return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    } catch (e) {
        return {};
    }
}

function saveLinks(links) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(links, null, 2), 'utf8');
}

let userLastfmLinks = loadLinks();

function setUserLink(userId, lastfmUsername) {
    userLastfmLinks[userId] = lastfmUsername;
    saveLinks(userLastfmLinks);
}

function getUserLink(userId) {
    // Always reload to get latest from disk
    userLastfmLinks = loadLinks();
    return userLastfmLinks[userId];
}

module.exports = { userLastfmLinks, setUserLink, getUserLink };
