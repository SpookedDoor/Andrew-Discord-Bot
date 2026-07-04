const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
};

const apiKey = process.env.KLIPY_API_KEY;

async function searchGifs(query = "", page = 1, perPage = 50, contentFilter = "off") {
    try {
        const res = await fetch(
            `https://api.klipy.com/api/v1/${apiKey}/gifs/search?page=${page}&per_page=${perPage}&q=${query}&content_filter=${contentFilter}`,
            requestOptions,
        );
        return await res.json();
    } catch (error) {
        return error;
    }
}

const triggers = new Map([
    ["tomoko", ["tomoko", "watamote"]],
    ["watamote", ["tomoko", "watamote"]],
    ["griffith", ["griffith"]],
    ["kanye", ["kanye west"]],
    ["shuckle", ["shuckle"]],
    ["shadow bonnie", ["shadow bonnie"]],
    ["reagan", ["ronald reagan"]],
    ["trump", ["donald trump"]],
    ["mussolini", ["mussolini"]],
    ["fuentes", ["nick fuentes"]],
    ["miku", ["miku", "hatsune miku"]],
    ["ksi", ["ksi", "thick of it", "lunchly", "prime drink"]],
    ["cirno", ["cirno"]],
    ["sonic.exe", ["sonic.exe", "sonic exe"]],
    ["sonic exe", ["sonic.exe", "sonic exe"]],
    ["metal sonic", ["metal sonic"]],
    ["neco arc", ["neco arc"]],
    ["fnaf", ["fnaf"]],
    ["lain", ["lain"]],
    ["andrew tate", ["andrew tate"]],
    ["the boys", ["the boys"]],
]);

async function aiGif(responseText = "", probability = 0.5) {
    const lowerText = responseText.toLowerCase();
    const matches = [];

    for (const [k, v] of triggers) {
        const index = lowerText.indexOf(k);
        if (index !== -1) matches.push({ index, queries: v });
    }

    matches.sort((a, b) => a.index - b.index);

    for (const match of matches) {
        if (Math.random() >= probability) continue;
        const query = match.queries[Math.floor(Math.random() * match.queries.length)];
        const res = await searchGifs(query);

        if (res.result === true) {
            const gifs = res.data.data;
            const gif = gifs[Math.floor(Math.random() * gifs.length)];
            return gif.file.hd.gif.url;
        }
    }

    return null;
}

module.exports = { aiGif };
