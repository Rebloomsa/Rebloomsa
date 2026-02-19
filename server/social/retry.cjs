/**
 * Generic async retry wrapper with exponential backoff.
 */

// Default backoff delays in ms: 2 minutes, 10 minutes
const DEFAULT_DELAYS = [2 * 60 * 1000, 10 * 60 * 1000];

// HTTP status codes that should NOT be retried (auth failures)
const NON_RETRYABLE = new Set([401, 403]);

/**
 * Execute an async function with retry logic.
 * @param {Function} fn - Async function to execute
 * @param {object} [options]
 * @param {number} [options.maxAttempts=3] - Total attempts (including first)
 * @param {number[]} [options.delays] - Backoff delays in ms between retries
 * @returns {Promise<{ success: boolean, result?: any, attempts: number, lastError?: Error }>}
 */
async function withRetry(fn, options = {}) {
  const maxAttempts = options.maxAttempts || 3;
  const delays = options.delays || DEFAULT_DELAYS;

  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn(attempt);
      return { success: true, result, attempts: attempt };
    } catch (err) {
      lastError = err;
      const statusCode = err.statusCode || err.status || err.code;

      // Non-retryable errors: fail immediately
      if (NON_RETRYABLE.has(statusCode)) {
        return { success: false, attempts: attempt, lastError: err };
      }

      // Last attempt — don't wait, just fail
      if (attempt >= maxAttempts) {
        break;
      }

      // 429 rate limit — respect Retry-After header if available
      if (statusCode === 429 && err.retryAfter) {
        const waitMs = err.retryAfter * 1000;
        await sleep(waitMs);
        continue;
      }

      // Exponential backoff using configured delays
      const delayIndex = Math.min(attempt - 1, delays.length - 1);
      await sleep(delays[delayIndex]);
    }
  }

  return { success: false, attempts: maxAttempts, lastError };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { withRetry, sleep };
