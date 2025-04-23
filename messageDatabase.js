const { AttachmentBuilder } = require('discord.js');
const path = require('node:path');

const emojis = [
    "<:tomoko_cup:1358095740299116614>",
    "<:cirnoarc:1358517895809990793>",
    "<:tomokoarc:1358500281956044991>",
    "<:depressed:1358517922938617883>",
    "<:emoji_52:1358517952311463956>",
    "<:tomoko_konata:1358518030547816570>",
    "<:tomoko_bread:1358518885829185816>",
    "<:tomoko_like:1358518895627210762>",
    "<:umarucry:1358518905219584120>",
    "<:wtf:1358518914631602449>",
    "<:xd:1358518924303667272>",
]

const possibleMessages = [
    "<:tomoko_cup:1358095740299116614>",
    "Hello watafriends",
    "https://tenor.com/view/larsandtherealgirl-trailer-ryangosling-newgirlfriend-doll-gif-3525692",
    "https://tenor.com/view/republican-gif-24490147",
    "https://tenor.com/view/wesker-resident-evil-5-the-mastermind-dead-by-daylight-project-w-gif-8481201659685876360",
    "https://tenor.com/view/griffith-berserk-haha-smile-griffith-gif-24652295",
    "https://tenor.com/view/mads-mikkelsen-smoking-gif-24232377",
    "From the the screen to the pen to the ring to the king",
    "https://tenor.com/view/dont-care-go-my-metal-sonic-metal-sonic-sonic-cd-knuckles-chaotix-go-metal-sonic-gif-5455408462557000696",
    "You are so based yeezy",
    "https://tenor.com/view/anime-berserk-griffith-necklace-off-gif-17645086",
    "Me whit tomoko doll",
    "I am prime Griffith",
    "<:cirnoarc:1358517895809990793>",
    "<:tomokoarc:1358500281956044991>",
    "<:depressed:1358517922938617883>",
    "https://tenor.com/view/minion-gooning-gym-smoking-nevergoon-gif-16345362028907877022",
    "She know that i am a bully",
    "She Wanna Hop in a rari",
    "Preacherman an rari are +SSS Tier songs",
    "Cope harder",
    "https://tenor.com/view/persona-persona3-minato-arisato-makoto-yuki-battle-gif-17813346",
    "-9999 watapoints",
    "average sonic fan ⬆️",
    "least schizo sonic fan",
    "lain red pill aura",
    "I want watamote movie someday",
    "https://tenor.com/view/touhou-cirno-pumped-excited-punch-gif-17552731",
    "https://tenor.com/view/tomoko-kuroki-gif-25980950",
    "Send csgo clips",
    "https://tenor.com/view/smoking-duck-dj-khaled-what-does-he-even-do-gif-8004262131450496811",
    "Wataland = falconia",
    "Lain should Nuke all",
    "I am rightchad",
    "Alt right chad",
    "im based rightchad",
    "i am a right chad",
    "https://tenor.com/view/springtrap-gif-22758628",
    "https://tenor.com/view/fumo-ayumu-kasuga-osaka-cirno-azumanga-daioh-gif-20739417",
    "Silent Hill  tesla",
    "Lain=Akira",
    "Le Ferrari F8 Lamborghini roadster",
    "https://tenor.com/view/pepe-popcorn-pepe-pepe-frog-frog-meme-pepe-gif-13771789960385103599",
    "https://tenor.com/view/azumanga-daioh-osaka-osaker-speech-gif-12106132575117515996",
    "https://tenor.com/view/patrick-bateman-gif-26282297",
    "https://tenor.com/view/incel-wojak-meme-anime-glasses-gif-21218188",
    "https://tenor.com/view/yay-yippee-clap-fuuka-yamagishi-gif-11473661067883569119",
    "https://tenor.com/view/kanye-west-kanye-ye-vultures-vultures-1-gif-16466379573931117087",
    "Hail Mussolini",
    "Mark my words meeper",
    "Meeper how you do?",
    "Whats your secret meeper",
    "Ahahahahah",
    "https://tenor.com/view/back-to-the-future-ronald-gif-21233116",
    "https://tenor.com/view/based-metal-gear-metal-gear-solid-big-boss-venom-snake-gif-21735928",
    "https://tenor.com/view/squirtle-pokemon-gif-23882585",
    "https://tenor.com/view/postal-postal-dude-breaking-bad-walter-white-meme-gif-26851972",
    "https://tenor.com/view/vultures-vultures-1-kanye-west-ye-yeezy-gif-14661580508021642873",
    "How I'm anti-Semitic?\nI just fucked a Jewish bitch\nI just fucked Scooter's bitch and we ran her like Olympics\nGot pregnant in the threesome, so whose baby is it?\nWhose baby is it?",
    "https://tenor.com/view/ronald-reagan-its-a-great-feeling-1949-well-well-well-jack-curtiz-in-person-barber-shop-gif-21273551",
];

const possibleMessages2 = [
    "I think i am kinda incel and blackpilled",
    "Sorry all",
];

const possibleMessages3 = [
  "lain power: nuke",
  "https://tenor.com/view/serial-experiments-lain-lain-anime-smug-anime-smile-gif-14038034",
];

const possibleMessages4 = [
    "Watamote movie can be a crossover whit azumanga dahio",
    "What you guys think about this",
];

const possibleMessages5 = [
    "https://tenor.com/view/kanye-west-kanye-ye-vultures-vultures-1-gif-16466379573931117087",
    "This Is crazy so well made",
];

function getTimedMessage() {
    return new Date().getUTCHours() < 6 ? 'GN' : new Date().getUTCHours() < 12 ? 'morning' : new Date().getUTCHours() < 22 ? 'hello' : 'GN';
}

const griffith_messages = [
    getTimedMessage() + ' all i am Griffith', 'I am prime Griffith', 
    { files: [new AttachmentBuilder(path.join(__dirname, './media/griffith.png'))] },
    { files: [new AttachmentBuilder(path.join(__dirname, './media/griffith2.jpg'))] },
];

const kanye_messages = [
	"Kanye the goat", "I love Kanye", "Kanye will drop new album", "new kanye interview", "Like new Kanye album?", 
	"This aint cheddar this quiche", "I hang whit the vultures", "You like vultures also?", "I like vultures", "Vultures 2 is goated", 
	"I got all to hang whit the vultures", "https://tenor.com/view/kanye-west-vultures-everybody-new-gif-12847039774498163445", 
	"https://tenor.com/view/ye-kanye-kanye-vultures-vultures-listening-party-vultures-lp-gif-14111380029791063141", 
	"https://tenor.com/view/kanye-west-gif-1846075065280866456", "https://tenor.com/view/kanye-west-kanye-ye-um-uhm-gif-1371611536126645899", 
	"https://tenor.com/view/kanye-west-my-reaction-to-that-information-my-honest-reaction-meme-gif-15000744814966995138",
];

const reagan_messages = [
	"Reagan was the best", "Reagan number 1", "Reagan number 1 president ever", "Reagan turn down the wall", "Trump and Reagan goats", 
	"Reagan and Trump best presidents ever", "Ronald pls", "https://tenor.com/view/republican-gif-24490147", 
	"https://tenor.com/view/ronald-reagan-reagan-republican-usa-president-gif-14605911613553531779",
];

const nick_messages = [
	"nick fuentes is straight", "https://tenor.com/view/nick-fuentes-fuentes-nicholas-j-fuentes-is-for-me-me-gif-3856804053130586186",
	"https://tenor.com/view/fuentes-shooting-you-are-fun-gif-1701233573689015350",
];

const ksi_messages = [
	"ksi is based", "ksi is funny", "from the screen to the ring to the pen to the king", "https://youtu.be/At8v_Yc044Y",
	"https://tenor.com/view/from-the-screen-to-the-ring-the-the-pen-to-the-king-ksi-gif-12257927774644906851",
];

module.exports = {
    emojis,
    possibleMessages,
    possibleMessages2,
    possibleMessages3,
    possibleMessages4,
    possibleMessages5,
    griffith_messages,
    kanye_messages,
    reagan_messages,
    nick_messages,
    ksi_messages,
}
