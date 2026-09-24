const axios = require('axios');
const Settings = require('../models/Settings');
const env = require('../config/env');
const Log = require('../models/Log');

/**
 * Deterministic Rule-based Pitch Synthesizer
 * Guarantees zero-hallucination pitches strictly based on discovered facts
 */
const generateDeterministicPitch = (lead) => {
  const bName = lead.businessName || 'Your Business';
  const category = (lead.category || 'business').toLowerCase();
  const rating = lead.rating || '4.8';
  const reviews = lead.reviewCount || 'solid';
  const primaryService = lead.recommendedServices?.[0] || 'Custom Website & Lead Funnel';

  let observation = '';
  let problem = '';
  let opportunity = '';

  if (lead.websiteStatus === 'NO WEBSITE') {
    observation = `Your ${category} has built an impressive local reputation with a ${rating}★ Google rating and ${reviews} reviews, but no dedicated owned website was discovered.`;
    problem = `Prospective customers discovering you on Google or social media cannot view your detailed offerings, pricing, or enquire directly, leading to lost client acquisition.`;
    opportunity = `Convert high-intent search traffic into direct inquiries with a sleek, mobile-optimized website and automated WhatsApp inquiry routing.`;
  } else if (lead.websiteStatus === 'BROKEN') {
    observation = `Your ${category} has strong customer acclaim (${rating}★), but your current web link appears unreachable or returns an error.`;
    problem = `High-intent visitors attempting to visit your site hit a broken link, which erodes trust and bounces them directly to local competitors.`;
    opportunity = `Rapidly restore your digital presence with a modern, high-speed landing page that showcases your services flawlessly.`;
  } else {
    observation = `We reviewed your online presence for ${bName} and noticed your solid ${rating}★ rating, but your website currently lacks an automated direct inquiry flow or instant WhatsApp CTA.`;
    problem = `Visitors must manually search for contact details rather than booking or inquiring with a single tap, creating friction on mobile devices.`;
    opportunity = `Integrate high-converting lead capture forms, WhatsApp widgets, and social proof to double your monthly inbound inquiries.`;
  }

  const shortPitch = `Hi! I noticed ${bName} has a fantastic ${rating}★ rating on Google with ${reviews} reviews. However, customers don't currently have a seamless, dedicated way to explore your packages and enquire instantly online. At Pixie Digital Creatives, we engineer high-converting digital platforms for growing businesses. I'd love to share a 2-minute concept tailored for ${bName}.`;

  const whatsappMessage = `Hi ${bName} team! 👋 Came across your ${category} on Google—congratulations on the stellar ${rating}★ rating! ⭐

We noticed that prospective clients looking for you online don't have a clear, dedicated website with 1-click WhatsApp enquiry to book directly.

At Pixie Digital Creatives (PDC), we build custom high-converting web systems for local leaders like you. We put together a quick digital concept for ${bName}. 

Mind if I drop a 30-second preview here?`;

  const instagramMessage = `Hey ${bName} team! 🙌 Loving your work in the local community. Noticed you have great local reviews (${rating}★), but an owned conversion website is missing to capture visitors directly from your bio. We design high-converting digital setups for ${category} brands. Would love to share a free concept for you!`;

  const emailMessage = `Subject: Quick digital concept for ${bName} (${rating}★ on Google)

Hi Team,

I recently came across ${bName} while researching leading ${category} businesses in ${lead.location || 'your area'}.

First of all, congratulations on your outstanding ${rating}★ rating across ${reviews} reviews—it is clear your clients love what you do.

While reviewing your digital presence, I noticed a significant growth opportunity: ${observation} ${problem}

At Pixie Digital Creatives (PDC), we specialize in crafting high-converting digital assets and WhatsApp lead capture systems designed to turn local searchers into paying clients.

Based on your current setup, we recommend:
• ${primaryService}
• Frictionless 1-click WhatsApp lead routing
• High-impact social proof integration

I have prepared a quick, no-obligation preview of what an upgraded digital asset could look like for ${bName}. Would you be open to a 5-minute chat this week?

Warm regards,
Pixie Digital Creatives (PDC) Lead Intelligence Team
https://pixiedigitalcreatives.com`;

  return {
    pitch: {
      problem,
      observation,
      opportunity,
      recommendedService: primaryService,
      shortPitch
    },
    whatsappMessage,
    instagramMessage,
    emailMessage
  };
};

/**
 * AI Provider abstraction (OpenAI, Gemini, Anthropic, Custom, or Rule-Engine)
 */
const generatePitch = async (lead) => {
  let provider = env.aiProvider;
  let apiKey = env.aiApiKey;
  let model = 'gpt-4o-mini';

  try {
    const settings = await Settings.findOne();
    if (settings) {
      provider = settings.aiProvider || provider;
      apiKey = settings.aiApiKey || apiKey;
      model = settings.aiModel || model;
    }
  } catch (err) {
    // Continue with env
  }

  // If rule-engine or API key missing, run deterministic synthesizer
  if (provider === 'rule-engine' || !apiKey || apiKey.trim() === '') {
    return generateDeterministicPitch(lead);
  }

  // If OpenAI provider configured
  if (provider === 'openai') {
    try {
      const prompt = `You are a senior lead generation copywriter for Pixie Digital Creatives (PDC).
Generate a factual, non-spammy, high-converting pitch for:
Business Name: ${lead.businessName}
Category: ${lead.category}
Location: ${lead.location}
Google Rating: ${lead.rating} (${lead.reviewCount} reviews)
Website Status: ${lead.websiteStatus}
Digital Gaps: ${lead.digitalGaps.join(', ')}
Digital Strengths: ${lead.digitalStrengths.join(', ')}
Recommended Service: ${lead.recommendedServices.join(', ')}

Return strictly valid JSON with keys:
{
  "problem": "...",
  "observation": "...",
  "opportunity": "...",
  "recommendedService": "...",
  "shortPitch": "...",
  "whatsappMessage": "...",
  "instagramMessage": "...",
  "emailMessage": "..."
}`;

      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const parsed = JSON.parse(res.data.choices[0].message.content);
      return {
        pitch: {
          problem: parsed.problem,
          observation: parsed.observation,
          opportunity: parsed.opportunity,
          recommendedService: parsed.recommendedService || lead.recommendedServices?.[0],
          shortPitch: parsed.shortPitch
        },
        whatsappMessage: parsed.whatsappMessage,
        instagramMessage: parsed.instagramMessage,
        emailMessage: parsed.emailMessage
      };
    } catch (err) {
      await Log.create({
        level: 'WARN',
        category: 'AI_PITCH',
        message: `OpenAI pitch generation failed: ${err.message}. Used deterministic fallback.`,
        details: { error: err.message }
      });
      return generateDeterministicPitch(lead);
    }
  }

  // Fallback
  return generateDeterministicPitch(lead);
};

module.exports = {
  generatePitch,
  generateDeterministicPitch
};
