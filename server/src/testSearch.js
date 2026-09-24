const cheerio = require('cheerio');

async function testSearch() {
  const query = 'gyms in Greater Noida address phone';
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];
    $('.result').each((i, el) => {
      const title = $(el).find('.result__title a').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const link = $(el).find('.result__url').text().trim();
      if (title) results.push({ title, snippet, link });
    });
    console.log('RESULTS FOUND:', results.length);
    results.slice(0, 5).forEach(r => console.log('-', r.title, 'URL:', r.link));
  } catch (e) {
    console.error('SEARCH ERROR:', e.message);
  }
}

testSearch();
