/**
 * Global Express Error Handling Middleware
 * Ensures consistent { success: false, message } JSON responses
 * and strictly prevents stack trace or raw internal API leakage in production.
 */

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.originalUrl}`
  });
};

const errorHandler = (err, req, res, next) => {
  // Determine HTTP status code
  let statusCode = err.statusCode || err.status;
  if (!statusCode || statusCode < 400 || statusCode > 599) {
    statusCode = res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;
  }

  // Server-side logging of real internal error details
  console.error(`[Error Handler] ${req.method} ${req.originalUrl} [${statusCode}]:`, err);

  let message = err.message || 'Internal server error';
  const lowerMsg = (message + ' ' + (err.stack || '')).toLowerCase();

  // Map Gemini and provider failures to friendly, safe messages
  if (
    lowerMsg.includes('429') ||
    lowerMsg.includes('quota') ||
    lowerMsg.includes('resource_exhausted') ||
    lowerMsg.includes('too many requests')
  ) {
    statusCode = 429;
    message = 'The AI service is busy, try again in a minute';
  } else if (
    lowerMsg.includes('503') ||
    lowerMsg.includes('service unavailable')
  ) {
    statusCode = 503;
    message = 'The AI service is busy, try again in a minute';
  } else if (
    lowerMsg.includes('api_key_invalid') ||
    lowerMsg.includes('api key not valid') ||
    lowerMsg.includes('invalid api key') ||
    lowerMsg.includes('permission_denied')
  ) {
    statusCode = 503;
    message = 'Analysis unavailable';
  } else if (
    lowerMsg.includes('generativelanguage.googleapis.com') ||
    lowerMsg.includes('google-generative-ai') ||
    lowerMsg.includes('googlegenerativeai')
  ) {
    statusCode = 500;
    message = 'Analysis unavailable';
  } else if (
    lowerMsg.includes('scanned_pdf_no_text') ||
    lowerMsg.includes('scanned image')
  ) {
    statusCode = 400;
    message = 'This PDF appears to be a scanned image. Please upload a text-based PDF.';
  }

  const responseBody = {
    success: false,
    message
  };

  // Stack traces strictly omitted in production
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};

module.exports = { notFound, errorHandler };
