const axios = require('axios');
require('dotenv').config();

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Check if image URL is valid (responds with status 200 and content-type image/*)
async function isValidImage(url) {
  try {
    const res = await axios.head(url, { timeout: 3000 });
    return res.status === 200 && res.headers['content-type']?.startsWith('image/');
  } catch (err) {
    return false;
  }
}

async function braveImageSearch(query) {
  const url = `https://api.search.brave.com/res/v1/images/search`;

  try {
    const res = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': process.env.BRAVE_API_KEY
      },
      params: {
        q: query,
        count: 30,
        search_lang: 'en',
        country: 'us',
        spellcheck: 1,
        safesearch: 'off',
      }
    });

    const results = res.data.results || [];
    if (results.length === 0) return 'No images found.';

    const shuffledResults = shuffleArray(results);
    const pickedImages = shuffledResults.slice(0, 20); // validate more, then trim

    const validatedImages = [];
    for (const img of pickedImages) {
      const imageUrl = img.properties?.url || img.thumbnail?.src;
      if (imageUrl && await isValidImage(imageUrl)) {
        validatedImages.push(imageUrl);
      }
      if (validatedImages.length === 10) break;
    }

    if (validatedImages.length === 0) return 'No valid images found.';

    return validatedImages
      .map((url, i) => `🖼️ Image ${i + 1}: ${url}`)
      .join('\n');

  } catch (error) {
    console.error('Brave Image Search Error:', error.response?.data || error.message);
    return 'Something went wrong with Brave Image Search.';
  }
}

module.exports = { braveImageSearch };
