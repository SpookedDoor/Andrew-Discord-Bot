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
    "<:pekostare:1365786858465919046>",
];

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
    "Cope harder you all",
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
    "Hahahahaa",
    "https://tenor.com/view/back-to-the-future-ronald-gif-21233116",
    "https://tenor.com/view/based-metal-gear-metal-gear-solid-big-boss-venom-snake-gif-21735928",
    "https://tenor.com/view/squirtle-pokemon-gif-23882585",
    "https://tenor.com/view/postal-postal-dude-breaking-bad-walter-white-meme-gif-26851972",
    "https://tenor.com/view/vultures-vultures-1-kanye-west-ye-yeezy-gif-14661580508021642873",
    "How I'm anti-Semitic?\nI just fucked a Jewish bitch\nI just fucked Scooter's bitch and we ran her like Olympics\nGot pregnant in the threesome, so whose baby is it?\nWhose baby is it?",
    "https://tenor.com/view/ronald-reagan-its-a-great-feeling-1949-well-well-well-jack-curtiz-in-person-barber-shop-gif-21273551",
    "https://tenor.com/view/tomoko-watamote-tomoko-kuroki-kuroki-dance-gif-3529097142210118205",
    "Lain>Cthulhu",
    "https://tenor.com/view/lain-sel-serial-experiments-lain-iwakura-silly-gif-26865566583074851370",
    "https://tenor.com/view/berserk-griffith-smile-gif-26958203",
    "Boy dont play whit me you know i am fried",
    "https://tenor.com/view/griffith-berserk-seinen-manga-manga-seinen-gif-16052926",
    "https://tenor.com/view/pokemon-pokeani-anipoke-pokemon-horizons-shuckle-gif-1434229247519097369",
    "https://youtu.be/4DmnuewuOws?si=vcc46az7vsRR8rLj",
    "New Kanye song Is wild",
    "Danganropa Kanye west",
    "i am spittin venom",
    "I'm spittin' out venom",
    "God of falconia AND  wataland",
    "Too much money to be in the streets\nToo much money to spend all on me\nToo much hate and not enough love\nFree Larry, free Young Thug\nFree Larry, free Young Thug",
    "Shuckle hang whit arceus",
    "Arceus Nuke type wold be broken",
    "What if Miku appear in watamote movie ?",
    "Miku house",
    "Miku town",
    "Miku country someday who knows",
    "CAT bird pog\nPeak of evolution\n1- Cirno \n2- CAT bird \n3- DOG bird",
    "NHH",
    "Hello Gods",
    "Kanye drop Cuck album",
    "Normal Tomoko silver Tomoko vultures Tomoko",
    "Free Diddy",
    "Kanye music",
    "Lain at my side",
    "Osaka Wanna Hop in a rari",
    "Hello citizens of wataland falconia",
    "Also neco Arc  in fornite wold be crazy",
    "Yeezy in fornite",
    "Osaka Bein Kanye fan Is canon",
    "https://tenor.com/view/berserk-gif-2898366366016578155",
    "https://tenor.com/view/femto-griffith-berserk-manga-anime-gif-14902110100260594587",
    "Gonna run for president someday",
    "Shhhhhhh i am listening preacherman",
    "Tomoko whit a vultures shirt in fornite someday",
    "Nuke all",
    "Lain pls",
    "https://tenor.com/view/hatred-gun-edgy-gif-18213167",
    "Nitrous really fucked whit my  brain",
    "She eat my kids like jared",
    "https://youtu.be/2RdI94t0FXQ?si=fD5upc9R4vYmNQsk",
    "I am a God",
    "Thanks Reagan  now we have cat birds",
    "The free world won",
    "Pubg",
    "I am ye fan",
    "Catbirds are a thing because of Reagan you know?",
    "Nitrous really fucked my head",
    "Watamote season two Is the one piece",
    "Maybe Tomoko Is the one piece the best friend that someone can have",
    "Alabamian pancakes",
    "Reagan wold say vultures 2 Is goated",
    "Reagan wold say he have redneck aura",
    "Gonna rock a swastika Chain someday as my goat",
    "Kanye west Cousin song",
    "I hig diff Sonic.exe\nAlso all scp",
    "I solo all",
    "Summon Tails.exe",
    "Based",
    "https://www.youtube.com/watch?v=S2Q8hVhoCKU",
    "https://www.youtube.com/watch?v=gZsX4hY_XxE",
    "I am in love whit the nitrous",
    "I'm in love whit the nitrous",
    "While i try be king as shuckle the third",
    "Nuke china",
    "Gonna rule all someday\nAs Kanye west the goat",
    "Nuke china from the Dam orbit\nSimple as that",
    "I am Alien X",
    "Hello\nCitizens of Wataland\nFalconia",
    "I am european hooligan in my Hart",
    "Black Yoshi nukin luigi",
    "Hello guys",
    "Tomoko haters irl\nRats",
    "Buy a gun better",
    "America number 1",
    "USA USA USA",
    "Nukes for all",
    "Hitler ye and jesuschrist",
    "https://www.youtube.com/watch?v=gZsX4hY_XxE",
    "Listening Hitler ye and jesuschrist rn",
    "Also listening rn Hitler ye and jesuschrist",
    "Hitler ye an jesuschrist",
    "I am Griffith in wataland",
    "All caps ANDREW GOD",
    {
        content: 'Alabamian cousine',
        files: [new AttachmentBuilder(path.join(__dirname, './media/alabamachicken.jpg'))]
    },
    { 
        content: 'SSS+ burger from alabama\nAlso alabamian tomatoe',
        files: [new AttachmentBuilder(path.join(__dirname, './media/alabamaburger.jpg'))] 
    },
    { files: [new AttachmentBuilder(path.join(__dirname, './media/andrewx.jpg'))] },
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

const possibleMessages6 = [
    "Someday gonna rock a swastika diamond chain",
    "As Kanye west the goat",
];

const possibleMessages7 = [
    "Kanye new music Is good",
    "Cousins",
    "Free diddy",
    "Cosby",
    "Top Tier SSS+ songs",
    "Also nitrous",
];

const possibleMessages8 = [
    "Yes i am a mad God",
    "I am evil",
    "As Kanye west the great",
];

const possibleMessages9 = [
    "Watafriends power level top\n1- hellbey God\n2- lain\n3- Alien X  Andrew total  control\n4-Tomoko\n5- Andrew femto form\n6- trinke God\n7- Kanye west 1% of power\n8- Andrew bot Is a chaotic force too be recognize",
    "Drago Is close to lain place 2 power he create  Andrew bot\nPeanut goddes Is at top 2 as lain",
    "To use my Alien X form at total control i need to talk to the voices that's why i am top 3 i am at top 10 in my normal form\nBasically murloc npc",
    "Also you see the power tierlist ?\nThougs?",
];

const possibleMessages10 = [
    "Literally me\nIn school years ago",
    "Then i become edgy\nThen a discord owner\nThen a ex discord owner",
    "Then SpookedDoor become my right hand\nThen Trump won\nHappy history",
];

// When adding new possible message lists, make sure to add them to exports, then update ready.js and characterPrompt.js

function getTimedMessage() {
    return new Date().getUTCHours() < 6 ? 'GN' : new Date().getUTCHours() < 12 ? 'morning' : new Date().getUTCHours() < 22 ? 'hello' : 'GN';
};

const griffith_messages = [
    getTimedMessage() + ' all i am Griffith', 'I am prime Griffith', "I am Femto God", "I am Griffith God",
    { files: [new AttachmentBuilder(path.join(__dirname, './media/griffith.png'))] },
    { files: [new AttachmentBuilder(path.join(__dirname, './media/griffith2.jpg'))] },
];

const wakeytime = [
	"morning all i am Griffith", "morning all i am Griffith", "morning all i am Griffith", 
    "Good morning", "Morning", "Good morning uh uh uh", "Morning all",
    "https://tenor.com/view/griffith-berserk-good-morning-good-morning-chat-hello-chat-gif-7712373713074364619",
    "https://tenor.com/view/whale-shark-good-morning-gm-good-night-gn-gif-26569624", "https://tenor.com/view/kanye-fuzzle-good-morning-gif-26126244",

];

const sleepytime = [
	"GN all i am Griffith", "GN all i am Griffith", "GN all i am Griffith", "GN all dream whit wataland falconia", 
    "GN all dream whit Kanye west", "Gn all friends of wataland", "GN all", "Gn", "GN guys", "gn friends",
    "https://tenor.com/view/sleep-gif-16267239586470775658", "Gn watafriends", "Gn all watafriends", "gn tomoko fan club",
    "GN knights", "GN all dream whit tomboy  cirno", "https://tenor.com/view/gypsy-crusader-gypsy-joker-gn-gif-23761746",
    "https://tenor.com/view/osaka-azuman-goodnight-gn-sleep-gif-24066064", "Goodnight kingdom of wataland falconia",
    "https://tenor.com/view/griffith-berserk-griffith-good-night-griffith-griffithlvr-berserk-gif-18377682904186629085",
    "https://tenor.com/view/griffith-berserk-good-night-chat-bye-chat-goodbye-chat-gif-4987401896551940413", 
    "https://tenor.com/view/osaka-azumanga-daioh-ayumu-kusaga-ayumu-good-night-gif-961306308588708616",

];

const kanye_messages = [
	"Kanye the goat", "I love Kanye", "Kanye will drop new album", "new kanye interview", "Like new Kanye album?", 
	"This aint cheddar this quiche", "I hang whit the vultures", "You like vultures also?", "I like vultures", "Vultures 2 is goated", 
	"I got all to hang whit the vultures", "https://tenor.com/view/kanye-west-vultures-everybody-new-gif-12847039774498163445", 
	"https://tenor.com/view/ye-kanye-kanye-vultures-vultures-listening-party-vultures-lp-gif-14111380029791063141", 
	"https://tenor.com/view/kanye-west-gif-1846075065280866456", "https://tenor.com/view/kanye-west-kanye-ye-um-uhm-gif-1371611536126645899", 
	"https://tenor.com/view/kanye-west-my-reaction-to-that-information-my-honest-reaction-meme-gif-15000744814966995138",
    "Kanye Goat", "New Kanye song Is wild", "Danganropa Kanye west", "Kanye drop Cuck album", "Kanye music", "Free Diddy",
    "Diddy Is good rapper Also kanye", "Yeezy in fornite", "Osaka Bein Kanye fan Is canon", "Shhhhhhh i am listening preacherman",
    "https://youtu.be/m82Mu_tjkmw?si=zPgymePbLFk45o3I", "Tomoko whit a vultures shirt in fornite someday", "I am ye fan",
    "Nitrous really fucked whit my  brain", "She eat my kids like jared", "https://youtu.be/2RdI94t0FXQ?si=fD5upc9R4vYmNQsk",
    "Nitrous really fucked my head", "https://www.youtube.com/watch?v=S2Q8hVhoCKU", "https://www.youtube.com/watch?v=gZsX4hY_XxE",
    "Kanye plays 69D chess whit all",
];

const reagan_messages = [
	"Reagan was the best", "Reagan number 1", "Reagan number 1 president ever", "Reagan turn down the wall", "Trump and Reagan goats", 
	"Reagan and Trump best presidents ever", "Ronald pls", "https://tenor.com/view/republican-gif-24490147", 
	"https://tenor.com/view/ronald-reagan-reagan-republican-usa-president-gif-14605911613553531779",
    "https://youtu.be/4DmnuewuOws?si=vcc46az7vsRR8rLj", "Reagan wold say i win again couse i am the goat as president",
    "Thanks Reagan  now we have cat birds", "Catbirds are a thing because of Reagan you know?",
];

const nick_messages = [
	"nick fuentes is straight", "https://tenor.com/view/nick-fuentes-fuentes-nicholas-j-fuentes-is-for-me-me-gif-3856804053130586186",
	"https://tenor.com/view/fuentes-shooting-you-are-fun-gif-1701233573689015350",
];

const ksi_messages = [
	"ksi is based", "ksi is funny", "from the screen to the ring to the pen to the king", "https://youtu.be/At8v_Yc044Y",
	"https://tenor.com/view/from-the-screen-to-the-ring-the-the-pen-to-the-king-ksi-gif-12257927774644906851",
];

const mussolini_messages = [
    "Hail Mussolini", "You like Mussolini?", "https://tenor.com/view/benito-mussolini-gif-26264823",
    "https://tenor.com/view/benito-mussolini-keep-talking-talking-mad-gif-15512602", "Like Mussolini? Pog",
    "https://tenor.com/view/mussolini-chad-gif-1828092016728334367", "What why Mussolini Is the best", "harry Potter and mussolini vs random slav country",
    "https://tenor.com/view/mussolini-speech-gif-2561627433093724979", "https://tenor.com/view/mussolini-serious-who-cares-gif-5388395",
];

const tate_messages = [
    "Andrew tate", "I relate to Andrew tate", "Andrew Tate skin also", "Andrew Tate Is free", "Andrew Tate Is the best", "I support Andrew Tate",
    "He fucked because Andrew Tate say he Will never suicide", "Soros want kill Andrew tate",
    "https://tenor.com/view/andrew-tate-cigar-walking-smoking-andrew-tate-smoking-gif-8005378695551356263",
    "https://tenor.com/view/andrew-tate-top-g-cigar-smoking-andrew-tate-cigar-gif-26262606",
    "https://tenor.com/view/andrew-tate-gif-26316329",
];

const upset_fucker = [
    "https://tenor.com/view/cry-tear-sad-max-cry-sad-max-gif-8713574713734916", "Nonono", "<:depressed:1358517922938617883>",
    "<:umarucry:1358518905219584120>", "Bruh", "wtf", "stfu", "hater", "This hater", "Chill hater", "The envy", "You envy me",
    "You Envy me couse i am American", "i am a fascist you Envy me", "You Envy me because i am  a rightchad", "Cope harder",
    "Cope", "cope all", "cope more", "Shut up", "Shut up communist", "Shut up i am white", "https://tenor.com/view/venere-angry-mad-evil-laugh-gif-15340793",
    "Why you are a leftard", "Fake", "Average zoomer", "Not even clicking if Is playboi carti",
];

const SSSTierOpinions = [
    "Sabaton albums are top tier sss+",
    "Reagan Top Tier SSS+ president",
    "Reagan SSS+ president",
    "Kanye new music Is good\nCousins\nFree diddy\nCosby\nTop Tier SSS+ songs\nAlso nitrous",
    "i like is content of nickavocado eating takis and pizza <:tomoko_cup:1358095740299116614>\nmcdonalds content is SSS+ top tier too",
    "Boil crab\nSSS+ alabamian cousine",
    {
        content: 'Alabamian cousine',
        files: [new AttachmentBuilder(path.join(__dirname, './media/alabamachicken.jpg'))]
    },
    { 
        content: 'SSS+ burger from alabama\nAlso alabamian tomatoe',
        files: [new AttachmentBuilder(path.join(__dirname, './media/alabamaburger.jpg'))] 
    },
];

function getAge() {
    const birthDate = new Date(2002, 10, 19);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

module.exports = {
    emojis,
    possibleMessages,
    possibleMessages2,
    possibleMessages3,
    possibleMessages4,
    possibleMessages5,
    possibleMessages6,
    possibleMessages7,
    possibleMessages8,
    possibleMessages9,
    possibleMessages10,
    griffith_messages,
    kanye_messages,
    reagan_messages,
    nick_messages,
    ksi_messages,
    mussolini_messages,
    tate_messages,
    wakeytime,
    sleepytime,
    upset_fucker,
    SSSTierOpinions,
    getAge
};