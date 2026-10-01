const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODEL = "gemini-2.5-flash";

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
        // If it's a different error (e.g., authentication), re-throw immediately
        throw error;
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
          throw fallbackError;
        }
      }
    }
  }
};

module.exports = modelWrapper;
