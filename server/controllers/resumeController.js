const fs = require('fs');
const { extractTextFromPDF } = require('../utils/pdfParser');

// @desc    Upload resume and extract text
// @route   POST /api/resume/upload
// @access  Private
const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded or invalid file format' });
  }

  const filePath = req.file.path;

  try {
    const extractedText = await extractTextFromPDF(filePath);

    // TODO: In the next section, we will pass `extractedText` to the AI logic.
    // For now, return a preview to verify it works.

    res.status(200).json({
      message: 'Resume uploaded and parsed successfully',
      textLength: extractedText.length,
      preview: extractedText.substring(0, 300) + (extractedText.length > 300 ? '...' : ''),
    });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    res.status(400).json({ message: error.message || 'Error processing the uploaded resume' });
  } finally {
    // Always clean up the temporary file, regardless of success or failure
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

module.exports = {
  uploadResume,
};
