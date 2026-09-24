const axios = require('axios');
const cheerio = require('cheerio');

async function testDDG() {
  try {
    const q = 'Black Vigor Gym Gaur City Noida website';
    const res = await axios.get('https://html.duckduckgo.com/html/', {
      params: { q },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      timeout: 8000
    });
    const $ = cheerio.load(res.data);
    const results = [];
    $('.result__snippet, .result__url').each((i, el) => {
      results.push($(el).text().trim());
    });
    console.log('Results found:', results.slice(0, 10));
  } catch (err) {
    console.error('DDG Error:', err.message);
  }
}
testDDG();
