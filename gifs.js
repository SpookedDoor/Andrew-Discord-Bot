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
    ["griffith", ["griffith"]],
    ["kanye", ["kanye"]],
]);

async function aiGif(responseText = "", probability = 0.5) {
    const lowerText = responseText.toLowerCase();

    for (const [k, v] of triggers) {
        if (Math.random() >= probability) continue;
        if (lowerText.includes(k)) {
            const query = v[Math.floor(Math.random() * v.length)];
            const res = await searchGifs(query);

            if (res.result === true) {
                const gifs = res.data.data;
                const gif = gifs[Math.floor(Math.random() * gifs.length)];
                return gif.file.hd.gif.url;
            } else {
                return null;
            }
        }
    }

    return null;
}

module.exports = { aiGif };
