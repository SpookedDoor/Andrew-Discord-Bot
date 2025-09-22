const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/**
 * Searches an image on SauceNAO and returns the top N results
 * @param {string} imageUrl - The URL of the image to search
 * @param {number} maxResults - How many top results to return (default 2)
 * @returns {Promise<Array>} - Array of top match info objects
 */
async function searchSauceNAO(imageUrl, maxResults = 2) {
    try {
        const url = `https://saucenao.com/search.php?output_type=2&api_key=${process.env.SAUCENAO_API_KEY}&url=${encodeURIComponent(imageUrl)}`;
        console.log(`Searching SauceNAO: ${url}`);
        const res = await fetch(url);
        const data = await res.json();

        if (!data.results || data.results.length === 0) return [];

        const results = data.results.slice(0, maxResults).map(result => ({
            similarity: result.header.similarity,
            title: result.data.title || result.data.material || "Unknown",
            author: result.data.author_name || result.data.creator || result.data.member_name || "Unknown",
            characters: result.data.characters || "Unknown",
            source: result.data.ext_urls?.[0] || result.data.source || "No link",
        }));

        return results;
    } catch (err) {
        console.error('Error searching SauceNAO:', err);
        return [];
    }
}

module.exports = { searchSauceNAO };