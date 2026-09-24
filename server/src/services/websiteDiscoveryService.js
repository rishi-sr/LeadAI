const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Validates domain and calculates match confidence based on multiple verification signals
 */
const verifyCandidateWebsite = async (candidateUrl, business) => {
  if (!candidateUrl || !candidateUrl.startsWith('http')) {
    return { isValid: false, confidence: 'NONE', signals: [] };
  }

  if (candidateUrl.includes('.test') || candidateUrl.includes('broken-preview') || candidateUrl.includes('example.com')) {
    return { isValid: false, confidence: 'NONE', signals: ['Rejected non-production / placeholder domain'] };
  }

  const signals = [];
  let score = 0;
  const bNameLower = (business.businessName || '').toLowerCase();
  const bCityLower = (business.city || business.location || '').toLowerCase();
  const phoneClean = (business.phone || '').replace(/[^0-9]/g, '');

  let isLive = false;

  try {
    const parsed = new URL(candidateUrl);
    const domain = parsed.hostname.toLowerCase();

    // Signal 1: Domain relevance
    const nameTokens = bNameLower.split(/\s+/).filter(t => t.length > 3);
    const domainMatchesName = nameTokens.some(token => domain.includes(token));
    if (domainMatchesName) {
      score += 35;
      signals.push('Domain matches business name');
    }

    // Attempt light HTTP GET check with 5s timeout
    const response = await axios.get(candidateUrl, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      maxRedirects: 3
    });

    if (response.status >= 200 && response.status < 400) {
      isLive = true;
      score += 20;
      signals.push('Website returns HTTP 200 OK');

      const html = typeof response.data === 'string' ? response.data : '';
      const $ = cheerio.load(html);
      const pageText = $('body').text().toLowerCase();
      const pageTitle = ($('title').text() || '').toLowerCase();

      // Signal 2: Content or title contains business name
      const nameWords = bNameLower.split(/\s+/).filter(w => w.length > 2);
      const titleMatches = nameWords.filter(w => pageTitle.includes(w)).length;
      if (titleMatches >= 2 || pageTitle.includes(bNameLower)) {
        score += 30;
        signals.push('Page title matches business name');
      }

      if (pageText.includes(bNameLower)) {
        score += 20;
        signals.push('Page body includes exact business name');
      }

      // Signal 3: Content contains city/location
      if (bCityLower && pageText.includes(bCityLower)) {
        score += 15;
        signals.push('Page body includes city location');
      }

      // Signal 4: Content contains phone number
      if (phoneClean && phoneClean.length >= 8) {
        const last8Digits = phoneClean.slice(-8);
        if (pageText.replace(/[^0-9]/g, '').includes(last8Digits)) {
          score += 25;
          signals.push('Page content contains contact phone number');
        }
      }
    }
  } catch (err) {
    // If connection timed out or failed, domain is not accessible
    signals.push(`Verification fetch failed: ${err.message}`);
    return {
      isValid: false,
      confidence: 'NONE',
      signals,
      score: 0
    };
  }

  if (!isLive) {
    return {
      isValid: false,
      confidence: 'NONE',
      signals,
      score: 0
    };
  }

  let confidence = 'LOW';
  if (score >= 65) confidence = 'HIGH';
  else if (score >= 45) confidence = 'MEDIUM';
  else confidence = 'LOW';

  return {
    isValid: score >= 45,
    confidence,
    signals,
    score
  };
};

/**
 * Discovers website using Priority 1 -> Priority 2 -> Priority 3
 */
const discoverWebsite = async (business) => {
  // Priority 1: Website returned by Google Places
  if (business.website && business.website.trim() !== '') {
    const rawUrl = business.website.trim();
    const formattedUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    
    // Quick verification check
    const verification = await verifyCandidateWebsite(formattedUrl, business);
    return {
      website: formattedUrl,
      websiteConfidence: verification.confidence === 'NONE' ? 'HIGH' : verification.confidence,
      websiteSource: 'GOOGLE_PLACES',
      signals: verification.signals
    };
  }

  // Priority 2: Publicly available official website linked from permitted social profile
  if (business.instagramBio && business.instagramBio.includes('http')) {
    const match = business.instagramBio.match(/https?:\/\/[^\s]+/);
    if (match && match[0]) {
      const candidate = match[0];
      const verification = await verifyCandidateWebsite(candidate, business);
      return {
        website: candidate,
        websiteConfidence: verification.confidence,
        websiteSource: 'SOCIAL_PROFILE',
        signals: verification.signals
      };
    }
  }

  // Priority 3: Automated Domain Candidate Resolution & Verification
  if (business.businessName) {
    const clean = (business.businessName || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const words = clean.split(/\s+/).filter(w => !['the', 'and', '&'].includes(w));
    
    if (words.length > 0) {
      const candidates = new Set();
      const tlds = ['.com', '.in', '.co.in', '.fitness', '.org', '.net'];

      const fullSlug = words.join('');
      const nonGeneric = words.filter(w => !['gym', 'club', 'fitness', 'center', 'centre', 'hospital', 'clinic', 'restaurant', 'cafe', 'dhaba'].includes(w));
      const coreSlug = nonGeneric.join('');

      for (const tld of tlds) {
        if (fullSlug) candidates.add(`https://${fullSlug}${tld}`);
        if (coreSlug && coreSlug !== fullSlug && coreSlug.length >= 4) {
          candidates.add(`https://${coreSlug}${tld}`);
        }
      }

      if (nonGeneric.length === 2) {
        candidates.add(`https://${nonGeneric.join('-')}.com`);
        candidates.add(`https://${nonGeneric.join('-')}.in`);
      }

      for (const candidateUrl of candidates) {
        const verification = await verifyCandidateWebsite(candidateUrl, business);
        if (verification.isValid && (verification.confidence === 'HIGH' || verification.confidence === 'MEDIUM')) {
          return {
            website: candidateUrl,
            websiteConfidence: verification.confidence,
            websiteSource: 'AUTOMATED_DOMAIN_RESOLUTION',
            signals: verification.signals
          };
        }
      }
    }
  }

  // Priority 4: Permitted web search candidate formulation fallback
  return {
    website: '',
    websiteConfidence: 'NONE',
    websiteSource: 'NONE',
    signals: ['No verified website discovered across permitted sources']
  };
};

module.exports = {
  discoverWebsite,
  verifyCandidateWebsite
};
