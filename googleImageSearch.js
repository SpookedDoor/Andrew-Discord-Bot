const axios = require('axios');

async function googleImageSearch(query) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  const url = 'https://www.googleapis.com/customsearch/v1';

  try {
        const res = await axios.get(url, {
            params: {
                key: apiKey,
                cx: cx,
                q: query,
                searchType: 'image',
                num: 10,
                safe: 'off'
            }
        });

        const images = res.data.items?.map((item, i) => `🖼️ Image ${i + 1}: ${item.link}`);
        return images?.join('\n') || 'No images found.';
    } catch (error) {
        console.error('Google Image Search Error:', error.response?.data || error.message);
        return 'Something went wrong with Google Image Search.';
    }
}

module.exports = { googleImageSearch };