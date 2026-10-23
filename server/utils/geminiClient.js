const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL ? process.env.GEMINI_FALLBACK_MODEL.trim() : null;
const DEFAULT_TOTAL_TIMEOUT_MS = 55000;
const TOTAL_TIMEOUT_MS = parseInt(process.env.GEMINI_TOTAL_TIMEOUT_MS || process.env.GEMINI_TIMEOUT_MS, 10) || DEFAULT_TOTAL_TIMEOUT_MS;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const createTimeoutError = () => {
  const timeoutError = new Error('The AI analysis timed out. The service took too long to respond, please try again.');
  timeoutError.statusCode = 504;
  timeoutError.status = 504;
  timeoutError.code = 'GATEWAY_TIMEOUT';
  timeoutError.isTimeout = true;
  return timeoutError;
};

const getOutcome = (err) => {
  if (!err) return 'success';
  const msg = (err?.message || '').toLowerCase();
  if (
    err?.isTimeout ||
    err?.status === 504 ||
    err?.statusCode === 504 ||
    err?.code === 'GATEWAY_TIMEOUT' ||
    err?.code === 'ETIMEDOUT' ||
    err?.name === 'GoogleGenerativeAIAbortError' ||
    err?.name === 'AbortError' ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('aborted')
  ) {
    return 'timeout';
  }
  if (
    err?.status === 429 ||
    err?.statusCode === 429 ||
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('too many requests')
  ) {
    return '429';
  }
  if (
    err?.status === 503 ||
    err?.statusCode === 503 ||
    msg.includes('503') ||
    msg.includes('service unavailable')
  ) {
    return '503';
  }
  if (
    err?.status === 404 ||
    err?.statusCode === 404 ||
    msg.includes('404') ||
    msg.includes('not found') ||
    msg.includes('no longer available') ||
    msg.includes('is not found')
  ) {
    return '404';
  }
  return String(err?.status || err?.statusCode || 'error');
};

const handleGeminiError = (err, modelName) => {
  const msg = (err?.message || '').toLowerCase();
  console.error(`[Gemini API Error on ${modelName}]:`, err?.message || err);

  if (
    err?.isTimeout ||
    err?.status === 504 ||
    err?.statusCode === 504 ||
    err?.code === 'GATEWAY_TIMEOUT' ||
    err?.name === 'GoogleGenerativeAIAbortError' ||
    err?.name === 'AbortError' ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('aborted')
  ) {
    return createTimeoutError();
  }

  if (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('too many requests') ||
    err?.status === 429 ||
    err?.statusCode === 429
  ) {
    const quotaError = new Error('The AI service is busy, try again in a minute');
    quotaError.statusCode = 429;
    quotaError.status = 429;
    quotaError.code = 'QUOTA_EXCEEDED';
    return quotaError;
  }

  if (
    msg.includes('503') ||
    msg.includes('service unavailable') ||
    err?.status === 503 ||
    err?.statusCode === 503
  ) {
    const serviceError = new Error('The AI service is busy, try again in a minute');
    serviceError.statusCode = 503;
    serviceError.status = 503;
    serviceError.code = 'SERVICE_UNAVAILABLE';
    return serviceError;
  }

  if (
    msg.includes('api_key') ||
    msg.includes('api key') ||
    msg.includes('invalid api key') ||
    msg.includes('permission_denied') ||
    msg.includes('unauthorized') ||
    err?.status === 401 ||
    err?.status === 403
  ) {
    const authError = new Error('Analysis unavailable');
    authError.statusCode = 503;
    authError.status = 503;
    authError.code = 'GEMINI_AUTH_ERROR';
    return authError;
  }

  // Catch any other provider error leaking internal Google URLs
  if (msg.includes('generativelanguage.googleapis.com') || msg.includes('google-generative-ai') || msg.includes('googlegenerativeai')) {
    const genericAiError = new Error('Analysis unavailable');
    genericAiError.statusCode = 500;
    genericAiError.status = 500;
    return genericAiError;
  }

  return err;
};

const getModel = (modelName, customGenConfig = {}) => {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      thinkingConfig: {
        thinkingLevel: "low"
      },
      responseMimeType: "application/json",
      ...customGenConfig
    }
  });
};

const executeAttempt = async (modelName, prompt, attemptNumber, timeoutMs, options = {}) => {
  if (timeoutMs <= 0) {
    const err = createTimeoutError();
    console.log(`[Gemini API] Model: ${modelName} | Attempt: ${attemptNumber} | Timeout hit before attempt (remaining: ${timeoutMs}ms) | Outcome: timeout`);
    return { success: false, error: err, duration: 0, outcome: 'timeout' };
  }

  const model = getModel(modelName, options.generationConfig);
  const startTime = Date.now();
  const controller = new AbortController();
  let timer;

  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      try {
        controller.abort();
      } catch (abortErr) {
        // ignore
      }
      reject(createTimeoutError());
    }, timeoutMs);
  });

  try {
    const response = await Promise.race([
      model.generateContent(prompt, { timeout: timeoutMs, signal: controller.signal }),
      timeoutPromise
    ]);
    const duration = Date.now() - startTime;
    console.log(`[Gemini API] Model: ${modelName} | Attempt: ${attemptNumber} | Duration: ${duration}ms (timeout: ${timeoutMs}ms) | Outcome: success`);
    return { success: true, response, duration, outcome: 'success' };
  } catch (err) {
    const duration = Date.now() - startTime;
    const outcome = getOutcome(err);
    console.log(`[Gemini API] Model: ${modelName} | Attempt: ${attemptNumber} | Duration: ${duration}ms (timeout: ${timeoutMs}ms) | Outcome: ${outcome}`);
    return { success: false, error: err, duration, outcome };
  } finally {
    clearTimeout(timer);
  }
};

const modelWrapper = {
  generateContent: async (prompt, options = {}) => {
    const deadline = options.deadline || (Date.now() + TOTAL_TIMEOUT_MS);
    const getRemainingMs = () => deadline - Date.now();

    // Check deadline before Attempt 1
    let remainingMs = getRemainingMs();
    if (remainingMs <= 0) {
      throw createTimeoutError();
    }

    // Attempt 1: Primary Model
    const res1 = await executeAttempt(PRIMARY_MODEL, prompt, 1, remainingMs, options);
    if (res1.success) {
      return res1.response;
    }

    const outcome1 = res1.outcome;

    // Fail immediately on quota (429) or timeout
    if (outcome1 === '429' || outcome1 === 'timeout') {
      throw handleGeminiError(res1.error, PRIMARY_MODEL);
    }

    // Handle 503 / Service Unavailable: wait 1.5s, retry primary model once
    if (outcome1 === '503') {
      remainingMs = getRemainingMs();
      if (remainingMs <= 1500) {
        console.warn(`[Gemini API] Insufficient time (${remainingMs}ms) for 503 backoff before overall deadline. Timing out.`);
        throw createTimeoutError();
      }

      console.warn(`[Gemini API] Primary model ${PRIMARY_MODEL} encountered 503. Waiting 1.5s before attempt 2...`);
      await wait(1500);

      remainingMs = getRemainingMs();
      if (remainingMs <= 0) {
        throw createTimeoutError();
      }

      const res2 = await executeAttempt(PRIMARY_MODEL, prompt, 2, remainingMs, options);
      if (res2.success) {
        return res2.response;
      }

      if (res2.outcome === '429' || res2.outcome === 'timeout') {
        throw handleGeminiError(res2.error, PRIMARY_MODEL);
      }

      // If retry on primary failed and fallback model is configured, try fallback model
      if (FALLBACK_MODEL) {
        remainingMs = getRemainingMs();
        if (remainingMs <= 0) {
          throw createTimeoutError();
        }

        console.warn(`[Gemini API] Primary model ${PRIMARY_MODEL} failed on retry. Attempting fallback model: ${FALLBACK_MODEL} (${remainingMs}ms remaining)`);
        const resFallback = await executeAttempt(FALLBACK_MODEL, prompt, 3, remainingMs, options);
        if (resFallback.success) {
          return resFallback.response;
        }
        throw handleGeminiError(resFallback.error, FALLBACK_MODEL);
      } else {
        throw handleGeminiError(res2.error, PRIMARY_MODEL);
      }
    }

    // Handle 404 / Not Found / Deprecated
    if (outcome1 === '404') {
      if (FALLBACK_MODEL) {
        remainingMs = getRemainingMs();
        if (remainingMs <= 0) {
          throw createTimeoutError();
        }

        console.warn(`[Gemini API] Primary model ${PRIMARY_MODEL} not found / deprecated. Attempting fallback model: ${FALLBACK_MODEL} (${remainingMs}ms remaining)`);
        const resFallback = await executeAttempt(FALLBACK_MODEL, prompt, 2, remainingMs, options);
        if (resFallback.success) {
          return resFallback.response;
        }
        throw handleGeminiError(resFallback.error, FALLBACK_MODEL);
      } else {
        throw handleGeminiError(res1.error, PRIMARY_MODEL);
      }
    }

    // Any other error
    throw handleGeminiError(res1.error, PRIMARY_MODEL);
  },
  createTimeoutError,
  TOTAL_TIMEOUT_MS
};

module.exports = modelWrapper;
