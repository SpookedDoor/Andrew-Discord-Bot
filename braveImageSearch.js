const axios = require('axios');
require('dotenv').config();

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
				count: 5,
				search_lang: 'en',
				country: 'us',
				spellcheck: 1,
				safesearch: 'strict',
			}
		});

		const results = res.data.results || [];
		if (results.length === 0) return 'No images found.';

		// Grab the full image URL from `properties.url`
		return results
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