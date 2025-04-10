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
				count: 5 // You can tweak this
			}
		});

		const results = res.data.results || [];
		if (results.length === 0) return 'No images found.';

		// Return just image URLs for now (could expand later)
		return results.map(img => img.url || img.original_image_url || img.thumbnail).join('\n');
	} catch (error) {
		console.error('Brave Image Search Error:', error.response?.data || error.message);
		return 'Something went wrong with Brave Image Search.';
	}
}

module.exports = { braveImageSearch };