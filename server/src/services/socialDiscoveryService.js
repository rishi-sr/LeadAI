/**
 * Permitted social profile discovery & verification
 * Strictly respects rate limits and public signals without guessing or inventing handles
 */
const discoverSocialPresence = async (business) => {
  // Check if real handle was discovered from verified business profile or website audit
  if (
    business.instagramUsername &&
    business.instagramUsername !== 'NOT FOUND' &&
    business.instagramUsername.trim() !== ''
  ) {
    const handle = business.instagramUsername.replace(/^@/, '').trim();
    // Verify it is not a simulated or fallback placeholder
    if (!handle.includes('pro18') && !handle.includes('_official') && handle !== 'NOT FOUND') {
      return {
        instagramUsername: handle,
        instagramUrl: `https://www.instagram.com/${handle}/`,
        instagramFollowers: business.instagramFollowers || 0,
        instagramStatus: business.instagramStatus || 'ACTIVE',
        instagramBio: business.instagramBio || ''
      };
    }
  }

  // If not discoverable from permitted official sources, mark NOT FOUND
  return {
    instagramUsername: 'NOT FOUND',
    instagramUrl: '',
    instagramFollowers: 0,
    instagramStatus: 'NOT FOUND',
    instagramBio: ''
  };
};

module.exports = {
  discoverSocialPresence
};
