const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  try {
    const res = await axios.get('https://blackvigor.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });
    console.log('Status:', res.status);
    const $ = cheerio.load(res.data);
    console.log('Title:', $('title').text());
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && (href.includes('instagram') || href.includes('whatsapp') || href.includes('facebook') || href.includes('tel:'))) {
        console.log('Link:', href);
      }
    });
  } catch(e) {
    console.error('Error:', e.message);
  }
}
test();
