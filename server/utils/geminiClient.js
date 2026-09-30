const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODEL = "gemini-2.5-flash";

const modelWrapper = {
  generateContent: async (prompt) => {
    let currentModelName = PRIMARY_MODEL;
    let model = genAI.getGenerativeModel({ model: currentModelName });
    
    try {
      const response = await model.generateContent(prompt);
      console.log(`[Gemini API] Successfully served request using model: ${currentModelName}`);
      return response;
    } catch (error) {
      const errorMessage = error.message.toLowerCase();
      
      // Check for deprecation/not found errors
      if (
        errorMessage.includes('404') || 
        errorMessage.includes('is not found') || 
        errorMessage.includes('no longer available')
      ) {
        console.warn(`[Gemini API] Primary model ${PRIMARY_MODEL} failed (Not Found/Deprecated). Retrying with fallback: ${FALLBACK_MODEL}`);
        
        currentModelName = FALLBACK_MODEL;
        model = genAI.getGenerativeModel({ model: currentModelName });
        
        try {
          const fallbackResponse = await model.generateContent(prompt);
          console.log(`[Gemini API] Successfully served request using fallback model: ${currentModelName}`);
          return fallbackResponse;
        } catch (fallbackError) {
          console.error(`[Gemini API] Fallback model ${FALLBACK_MODEL} also failed:`, fallbackError.message);
          throw fallbackError;
        }
      }
      
      // If it's a different error (e.g., 503, authentication), re-throw immediately
      throw error;
    }
  }
};

module.exports = modelWrapper;
