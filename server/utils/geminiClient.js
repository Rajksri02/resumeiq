const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODEL = "gemini-2.5-flash";

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const handleGeminiError = (err, modelName) => {
  const msg = (err?.message || '').toLowerCase();
  console.error(`[Gemini API Error on ${modelName}]:`, err);

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

const modelWrapper = {
  generateContent: async (prompt) => {
    let currentModelName = PRIMARY_MODEL;
    let model = genAI.getGenerativeModel({ model: currentModelName });
    
    try {
      const response = await model.generateContent(prompt);
      console.log(`[Gemini API] Successfully served request on first try using model: ${currentModelName}`);
      return response;
    } catch (error) {
      const errorMessage = error.message.toLowerCase();
      
      let shouldFallback = false;

      // Specific handling for Gemini 429 (quota / rate limit)
      if (
        errorMessage.includes('429') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('resource_exhausted') ||
        errorMessage.includes('too many requests')
      ) {
        console.error(`[Gemini API] Quota / rate limit exceeded (429) on model ${currentModelName}:`, error.message);
        throw handleGeminiError(error, currentModelName);
      }

      // Check for 503 / Service Unavailable errors
      if (errorMessage.includes('503') || errorMessage.includes('service unavailable')) {
        console.warn(`[Gemini API] Primary model ${PRIMARY_MODEL} encountered 503 Service Unavailable. Waiting 1.5s before retrying...`);
        await wait(1500);
        
        try {
          const retryResponse = await model.generateContent(prompt);
          console.log(`[Gemini API] Successfully served request after 503 retry using model: ${currentModelName}`);
          return retryResponse;
        } catch (retryError) {
          console.warn(`[Gemini API] Primary model ${PRIMARY_MODEL} failed on retry:`, retryError.message);
          shouldFallback = true;
        }
      } 
      // Check for deprecation/not found errors
      else if (
        errorMessage.includes('404') || 
        errorMessage.includes('is not found') || 
        errorMessage.includes('no longer available')
      ) {
        console.warn(`[Gemini API] Primary model ${PRIMARY_MODEL} failed (Not Found/Deprecated).`);
        shouldFallback = true;
      } else {
        // If it's a different error (e.g., authentication, invalid key), sanitize and re-throw
        throw handleGeminiError(error, currentModelName);
      }
      
      if (shouldFallback) {
        console.warn(`[Gemini API] Retrying with fallback model: ${FALLBACK_MODEL}`);
        
        currentModelName = FALLBACK_MODEL;
        model = genAI.getGenerativeModel({ model: currentModelName });
        
        try {
          const fallbackResponse = await model.generateContent(prompt);
          console.log(`[Gemini API] Successfully served request via fallback model: ${currentModelName}`);
          return fallbackResponse;
        } catch (fallbackError) {
          console.error(`[Gemini API] Fallback model ${FALLBACK_MODEL} also failed:`, fallbackError.message);
          throw handleGeminiError(fallbackError, currentModelName);
        }
      }
    }
  }
};

module.exports = modelWrapper;
