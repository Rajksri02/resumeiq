const fs = require('fs');
const pdf = require('pdf-parse');

const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  
  try {
    const data = await pdf(dataBuffer);
    const text = data.text.trim();

    // If the PDF is empty or mostly whitespace (likely a scanned image)
    if (!text || text.length < 50) {
      throw new Error('SCANNED_PDF_NO_TEXT');
    }

    return text;
  } catch (error) {
    if (error.message === 'SCANNED_PDF_NO_TEXT') {
      const scannedErr = new Error('This PDF appears to be a scanned image. Please upload a text-based PDF.');
      scannedErr.statusCode = 400;
      scannedErr.status = 400;
      throw scannedErr;
    }
    const parseErr = new Error('Failed to parse PDF file. Please ensure it is a valid, uncorrupted PDF.');
    parseErr.statusCode = 400;
    parseErr.status = 400;
    throw parseErr;
  }
};

module.exports = {
  extractTextFromPDF,
};
