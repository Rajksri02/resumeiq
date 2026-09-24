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
      throw new Error('This PDF appears to be a scanned image. Please upload a text-based PDF.');
    }
    throw new Error('Failed to parse PDF file');
  }
};

module.exports = {
  extractTextFromPDF,
};
