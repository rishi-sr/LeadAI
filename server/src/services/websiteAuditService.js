const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Audits a given website URL and extracts technical, content, conversion, and social signals
 */
const auditWebsite = async (url) => {
  if (!url || url.trim() === '' || url === 'NOT FOUND') {
    return {
      status: 'NO WEBSITE',
      audit: {
        checked: true,
        checkedAt: new Date(),
        statusCode: 0,
        https: false,
        mobileResponsive: false,
        notes: 'No official website linked or registered'
      },
      discoveredSocial: {
        instagramUsername: 'NOT FOUND',
        instagramUrl: '',
        instagramStatus: 'NOT FOUND'
      }
    };
  }

  const startTime = Date.now();
  let html = '';
  let statusCode = 200;
  let isHttps = url.toLowerCase().startsWith('https');

  try {
    const response = await axios.get(url, {
      timeout: 7000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      maxRedirects: 4,
      validateStatus: (s) => s < 500
    });

    statusCode = response.status;
    html = typeof response.data === 'string' ? response.data : '';
    const finalUrl = response.request?.res?.responseUrl || url;
    isHttps = finalUrl.toLowerCase().startsWith('https');

    if (statusCode >= 400) {
      return {
        status: 'BROKEN',
        audit: {
          checked: true,
          checkedAt: new Date(),
          statusCode,
          responseTimeMs: Date.now() - startTime,
          https: isHttps,
          mobileResponsive: false,
          brokenLinksDetected: true,
          notes: `HTTP error status ${statusCode} returned`
        },
        discoveredSocial: {
          instagramUsername: 'NOT FOUND',
          instagramUrl: '',
          instagramStatus: 'NOT FOUND'
        }
      };
    }
  } catch (err) {
    return {
      status: 'BROKEN',
      audit: {
        checked: true,
        checkedAt: new Date(),
        statusCode: 0,
        responseTimeMs: Date.now() - startTime,
        https: isHttps,
        mobileResponsive: false,
        brokenLinksDetected: true,
        notes: `Connection failed or timed out: ${err.message}`
      },
      discoveredSocial: {
        instagramUsername: 'NOT FOUND',
        instagramUrl: '',
        instagramStatus: 'NOT FOUND'
      }
    };
  }

  const responseTimeMs = Date.now() - startTime;
  const $ = cheerio.load(html);

  // 1. Mobile Responsiveness signal
  const viewportMeta = $('meta[name="viewport"]').attr('content') || '';
  const mobileResponsive = viewportMeta.includes('width=device-width');

  // 2. SEO / Meta
  const pageTitle = ($('title').first().text() || '').trim();
  const metaDescription = ($('meta[name="description"]').attr('content') || '').trim();

  // 3. Contact & Conversions
  const bodyText = $('body').text().toLowerCase();
  const rawHtml = html.toLowerCase();

  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;
  const phoneDetected = phoneRegex.test(bodyText) || $('a[href^="tel:"]').length > 0;
  
  const whatsappDetected = rawHtml.includes('api.whatsapp.com') || 
                           rawHtml.includes('wa.me') || 
                           rawHtml.includes('whatsapp') || 
                           $('a[href*="whatsapp"]').length > 0;

  const addressDetected = bodyText.includes('address') || bodyText.includes('road') || bodyText.includes('sector') || bodyText.includes('floor') || bodyText.includes('complex') || bodyText.includes('street');
  const googleMapsDetected = rawHtml.includes('maps.google') || rawHtml.includes('google.com/maps') || $('iframe[src*="google.com/maps"]').length > 0;
  const openingHoursDetected = bodyText.includes('hours') || bodyText.includes('timings') || bodyText.includes('mon - ') || bodyText.includes('open:');

  // 4. Industry & Commercial CTAs
  const pricingDetected = bodyText.includes('price') || bodyText.includes('pricing') || bodyText.includes('₹') || bodyText.includes('inr') || bodyText.includes('per month') || bodyText.includes('package');
  const membershipPlansDetected = bodyText.includes('membership') || bodyText.includes('plan') || bodyText.includes('subscription') || bodyText.includes('enroll');
  
  const ctaDetected = $('button').length > 0 || $('a.btn, a.button, a[role="button"]').length > 0;
  const leadFormDetected = $('form').length > 0 || rawHtml.includes('contact-form') || rawHtml.includes('lead');
  const bookingDetected = bodyText.includes('book now') || bodyText.includes('book appointment') || bodyText.includes('free trial') || bodyText.includes('join now') || bodyText.includes('schedule a visit');

  const testimonialsDetected = bodyText.includes('testimonial') || bodyText.includes('what our clients say') || bodyText.includes('reviews') || rawHtml.includes('testimonial');
  const galleryDetected = $('img').length >= 4 || rawHtml.includes('gallery') || rawHtml.includes('portfolio') || rawHtml.includes('slider');
  const servicesDetected = bodyText.includes('service') || bodyText.includes('treatment') || bodyText.includes('menu') || bodyText.includes('classes') || bodyText.includes('programs');
  
  // 5. Social Links & Real Instagram Extraction
  let discoveredInstagramHandle = 'NOT FOUND';
  let discoveredInstagramUrl = '';
  let discoveredInstagramStatus = 'NOT FOUND';

  $('a[href*="instagram.com"]').each((i, el) => {
    const href = $(el).attr('href');
    if (href) {
      const match = href.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
      if (match && match[1]) {
        const handle = match[1].trim().replace(/\/$/, '').toLowerCase();
        if (!['p', 'explore', 'reel', 'reels', 'stories', 'about', 'developer', 'legal', 'tags', 'direct'].includes(handle)) {
          discoveredInstagramHandle = match[1].trim().replace(/\/$/, '');
          discoveredInstagramUrl = `https://www.instagram.com/${discoveredInstagramHandle}/`;
          discoveredInstagramStatus = 'ACTIVE';
          return false; // Found first real profile link
        }
      }
    }
  });

  const socialLinksDetected = discoveredInstagramStatus === 'ACTIVE' || 
                              $('a[href*="facebook.com"]').length > 0 || 
                              $('a[href*="linkedin.com"]').length > 0 || 
                              $('a[href*="youtube.com"]').length > 0;

  // Classify website: STRONG, GOOD, BASIC, OUTDATED, BROKEN, NO WEBSITE
  let scorePoints = 0;
  if (isHttps) scorePoints += 15;
  if (mobileResponsive) scorePoints += 20;
  if (pageTitle && pageTitle.length > 5) scorePoints += 10;
  if (metaDescription && metaDescription.length > 20) scorePoints += 10;
  if (whatsappDetected) scorePoints += 10;
  if (leadFormDetected || bookingDetected) scorePoints += 15;
  if (testimonialsDetected) scorePoints += 10;
  if (galleryDetected) scorePoints += 10;

  let classification = 'BASIC';
  if (scorePoints >= 75 && isHttps && mobileResponsive && (leadFormDetected || bookingDetected)) {
    classification = 'STRONG';
  } else if (scorePoints >= 50 && mobileResponsive) {
    classification = 'GOOD';
  } else if (!mobileResponsive || !isHttps) {
    classification = 'OUTDATED';
  } else {
    classification = 'BASIC';
  }

  return {
    status: classification,
    audit: {
      checked: true,
      checkedAt: new Date(),
      statusCode,
      responseTimeMs,
      https: isHttps,
      mobileResponsive,
      pageTitle: pageTitle.substring(0, 120),
      metaDescription: metaDescription.substring(0, 200),
      contactInfoDetected: phoneDetected || addressDetected,
      phoneDetected,
      whatsappDetected,
      addressDetected,
      googleMapsDetected,
      openingHoursDetected,
      pricingDetected,
      membershipPlansDetected,
      ctaDetected,
      leadFormDetected,
      bookingDetected,
      testimonialsDetected,
      galleryDetected,
      servicesDetected,
      socialLinksDetected,
      brokenLinksDetected: false,
      notes: `Audited ${classification} site. Detected ${scorePoints} quality index points.`
    },
    discoveredSocial: {
      instagramUsername: discoveredInstagramHandle,
      instagramUrl: discoveredInstagramUrl,
      instagramStatus: discoveredInstagramStatus
    }
  };
};

module.exports = {
  auditWebsite
};
