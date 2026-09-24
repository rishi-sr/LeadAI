const axios = require('axios');
const cheerio = require('cheerio');

const generateCandidates = (businessName, city = '') => {
  const clean = businessName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(w => !['the', 'and', '&'].includes(w));
  
  const candidates = new Set();
  const tlds = ['.com', '.in', '.co.in', '.fitness', '.org', '.net'];

  // Pattern 1: All words joined (e.g. blackvigorgym)
  const fullSlug = words.join('');
  // Pattern 2: Without generic words like gym, club, clinic, restaurant if >= 2 words
  const nonGeneric = words.filter(w => !['gym', 'club', 'fitness', 'center', 'centre', 'hospital', 'clinic', 'restaurant', 'cafe', 'dhaba'].includes(w));
  const coreSlug = nonGeneric.join('');

  for (const tld of tlds) {
    if (fullSlug) candidates.add(`https://${fullSlug}${tld}`);
    if (coreSlug && coreSlug !== fullSlug && coreSlug.length >= 4) {
      candidates.add(`https://${coreSlug}${tld}`);
    }
  }

  // Also try with hyphen (e.g. black-vigor.com)
  if (nonGeneric.length === 2) {
    candidates.add(`https://${nonGeneric.join('-')}.com`);
  }

  return Array.from(candidates);
};

async function testBusiness(name) {
  console.log('\n--- Testing candidate generation for:', name);
  const candidates = generateCandidates(name);
  console.log('Candidates generated:', candidates.slice(0, 6));

  for (const url of candidates) {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        timeout: 4000,
        maxRedirects: 3,
        validateStatus: s => s < 400
      });

      const $ = cheerio.load(res.data);
      const title = ($('title').text() || '').trim().toLowerCase();
      const body = $('body').text().toLowerCase();
      const words = name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      
      const titleMatches = words.filter(w => title.includes(w)).length;
      const bodyMatches = words.filter(w => body.includes(w)).length;

      console.log(`[CHECK] ${url} -> Status ${res.status}, Title: "${title.slice(0, 40)}", Matches: title=${titleMatches}, body=${bodyMatches}`);
      
      if (titleMatches >= 2 || (titleMatches >= 1 && bodyMatches >= 2)) {
        console.log(`>>> VERIFIED MATCH: ${url} for ${name}`);
        return url;
      }
    } catch (e) {
      // Failed or timeout
    }
  }
  return null;
}

async function run() {
  await testBusiness('Black Vigor Gym');
  await testBusiness('Fitbee Fitness Club');
}

run();
