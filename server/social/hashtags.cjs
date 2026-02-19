/**
 * Hashtag rotation — 5 sets (A–E), #RebloomSA anchored in every set.
 * Day-of-year rotation: dayOfYear % 5
 */

const SETS = {
  A: ['#RebloomSA', '#GriefSupport', '#HealingJourney', '#WidowStrong', '#SouthAfrica'],
  B: ['#RebloomSA', '#WidowCommunity', '#FindConnection', '#YouAreNotAlone', '#MzansiCommunity'],
  C: ['#RebloomSA', '#AfterLossLifeBloomsAgain', '#HopeAfterLoss', '#NewBeginnings', '#LifeAfterLoss'],
  D: ['#RebloomSA', '#SouthAfrica', '#Mzansi', '#ProudlySouthAfrican', '#CommunityMatters'],
  E: ['#RebloomSA', '#WidowsOfSouthAfrica', '#ShareToHelp', '#EndLoneliness', '#SupportEachOther'],
};

const SET_KEYS = ['A', 'B', 'C', 'D', 'E'];

/**
 * Get the day of year (1-366).
 */
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
}

/**
 * Get today's set key based on day-of-year rotation.
 */
function getTodaysSetKey(date) {
  const dayOfYear = getDayOfYear(date || new Date());
  return SET_KEYS[dayOfYear % 5];
}

/**
 * Get formatted hashtags for a platform.
 * @param {'instagram'|'facebook'|'twitter'} platform
 * @param {string} [setOverride] - Force a specific set (A–E)
 * @returns {string} Formatted hashtag string
 */
function getHashtags(platform, setOverride) {
  const setKey = setOverride || getTodaysSetKey(new Date());
  const tags = SETS[setKey] || SETS.A;

  switch (platform) {
    case 'instagram': {
      // All 5 hashtags, newline-separated at end of caption
      return '\n\n' + tags.join('\n');
    }
    case 'facebook': {
      // Top 3-5 inline at end of post
      const count = Math.min(tags.length, 5);
      return tags.slice(0, count).join(' ');
    }
    case 'twitter': {
      // Only #RebloomSA + 1 contextual tag
      const contextual = tags.find(t => t !== '#RebloomSA') || '';
      return '#RebloomSA' + (contextual ? ' ' + contextual : '');
    }
    default:
      return tags.join(' ');
  }
}

module.exports = { getHashtags, getTodaysSetKey, getDayOfYear, SETS, SET_KEYS };
