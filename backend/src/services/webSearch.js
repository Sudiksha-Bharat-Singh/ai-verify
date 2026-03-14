const axios = require('axios');
const { logger } = require('../utils/logger');

const SERPAPI_KEY = process.env.SERPAPI_KEY;

const searchCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

async function searchWeb(query, count = 5) {
  const cacheKey = query.toLowerCase().trim();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.results;
  }

  if (!SERPAPI_KEY) {
    logger.warn('SERPAPI_KEY not set — using mock results');
    return getMockResults(query);
  }

  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        q: `"${query.slice(0, 150)}"`,
        api_key: SERPAPI_KEY,
        engine: 'google',
        num: count,
      },
      timeout: 10000,
    });

    const results = (response.data?.organic_results || []).map(item => ({
      url: item.link,
      title: item.title,
      snippet: item.snippet || '',
    }));

    searchCache.set(cacheKey, { results, timestamp: Date.now() });

    if (searchCache.size > 1000) {
      const oldestKey = searchCache.keys().next().value;
      searchCache.delete(oldestKey);
    }

    return results;
  } catch (err) {
    logger.error(`SerpApi search error: ${err.message}`);
    return [];
  }
}

function getMockResults(query) {
  return [
    {
      url: 'https://example.com/article-1',
      title: 'Example Article',
      snippet: query.slice(0, 100) + '... [mock result]',
    },
  ];
}

module.exports = { searchWeb };