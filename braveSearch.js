const axios = require('axios');
require('dotenv').config();

async function braveSearch(query) {
	const url = `https://api.search.brave.com/res/v1/web/search`;
	try {
		const res = await axios.get(url, {
			headers: {
				'Accept': 'application/json',
				'X-Subscription-Token': process.env.BRAVE_API_KEY
			},
			params: {
				q: query,
				count: 10,
				safesearch: 'off',
			}
		});

		const results = res.data.web?.results || [];
		if (results.length === 0) return 'No results found.';

		return results.map(r => `🔗 **${r.title}**\n${r.url}`).join('\n\n');
	} catch (error) {
		console.error('Brave Search Error:', error.response?.data || error.message);
		return 'Something went wrong with Brave Search.';
	}
}

module.exports = { braveSearch };
