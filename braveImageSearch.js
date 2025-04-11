const axios = require('axios');
require('dotenv').config();

function shuffleArray(array) {
	  for (let i = array.length - 1; i > 0; i--) {
		      const j = Math.floor(Math.random() * (i + 1));
		      [array[i], array[j]] = [array[j], array[i]];
		    }
	  return array;
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
		const pickedImages = shuffledResults.slice(0, 5); // or pick a few randomly

		// Grab the full image URL from `properties.url`
		return pickedImages
			.map((img, i) => {
				const imageUrl = img.properties?.url || img.thumbnail?.src;
				if (!imageUrl) return null;
				return `🖼️ Image ${i + 1}: ${imageUrl}`;
			})
			.filter(Boolean)
			.join('\n');

	} catch (error) {
		console.error('Brave Image Search Error:', error.response?.data || error.message);
		return 'Something went wrong with Brave Image Search.';
	}
}

module.exports = { braveImageSearch };
