/**
 * Brand Guard — validates every post before it touches any API.
 * No override mechanism. Hardcoded rules.
 */

const BANNED_WORDS = [
  'dating', 'date', 'singles', 'hookup', 'swipe', 'match', 'romance', 'romantic',
  'sexy', 'hot', 'attractive', 'looking for love', 'find love', 'meet singles',
  'urgent', 'limited time', 'act now', "don't miss", 'last chance', 'fomo',
  'buy now', 'discount', 'sale', 'offer', 'deal', 'promo', 'subscribe now',
  '100% guaranteed', 'risk-free', 'no obligation',
];

// Phrases that use banned words in a safe/negating context
const SAFE_PHRASES = [
  "not a dating app", "isn't a dating app", "not dating", "no dating",
  "not a date", "isn't a date",
  "no sales", "not a sale", "not a deal", "not a promo",
  "no romance", "not romance", "not romantic",
];

// Match URLs but exclude rebloomsa.co.za
const URL_REGEX = /https?:\/\/[^\s)]+/gi;
const REBLOOM_URL_REGEX = /^https?:\/\/(www\.)?rebloomsa\.co\.za/i;

// More than 2 consecutive ALL-CAPS words (3+ letters each)
const CAPS_RUN_REGEX = /\b[A-Z]{3,}\s+[A-Z]{3,}\s+[A-Z]{3,}\b/;

/**
 * Validate a post object before publishing.
 * @param {object} post - { content, content_x?, platforms? }
 * @returns {{ valid: boolean, reasons: string[] }}
 */
function validatePost(post) {
  const reasons = [];
  const text = post.content || '';
  const fullText = text + ' ' + (post.content_x || '');

  // Required: link to rebloomsa.co.za
  if (!/rebloomsa\.co\.za/i.test(fullText)) {
    reasons.push('Missing link to rebloomsa.co.za');
  }

  // Required: blossom emoji
  if (!fullText.includes('\u{1F338}')) {
    reasons.push('Missing blossom emoji \u{1F338}');
  }

  // Required: #RebloomSA hashtag
  if (!/#RebloomSA/i.test(fullText)) {
    reasons.push('Missing #RebloomSA hashtag');
  }

  // Banned words check (case-insensitive, word-boundary aware for single words)
  // First, strip safe phrases so negations like "not a dating app" don't trigger
  const lowerText = fullText.toLowerCase();
  let textToCheck = lowerText;
  for (const safe of SAFE_PHRASES) {
    textToCheck = textToCheck.split(safe).join('');
  }

  for (const word of BANNED_WORDS) {
    if (word.includes(' ')) {
      // Multi-word phrase: simple includes check
      if (textToCheck.includes(word)) {
        reasons.push(`Banned phrase detected: "${word}"`);
      }
    } else {
      // Single word: word boundary check
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(textToCheck)) {
        reasons.push(`Banned word detected: "${word}"`);
      }
    }
  }

  // Banned pattern: ALL CAPS runs (>2 consecutive caps words)
  if (CAPS_RUN_REGEX.test(text)) {
    reasons.push('ALL CAPS run detected (more than 2 consecutive caps words)');
  }

  // Banned pattern: more than 3 exclamation marks total
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    reasons.push(`Too many exclamation marks (${exclamationCount}, max 3)`);
  }

  // Banned pattern: non-rebloomsa URLs
  const urls = fullText.match(URL_REGEX) || [];
  for (const url of urls) {
    if (!REBLOOM_URL_REGEX.test(url)) {
      reasons.push(`Non-Rebloom URL detected: ${url}`);
    }
  }

  return {
    valid: reasons.length === 0,
    reasons,
  };
}

module.exports = { validatePost, BANNED_WORDS };
