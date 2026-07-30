const Tesseract = require('tesseract.js');

/**
 * Runs OCR on a receipt image and returns the raw extracted text.
 * NOTE: Tesseract.js downloads its English trained-data file on first run
 * (cached afterwards). This requires internet access the first time it runs.
 */
const extractTextFromImage = async (imagePath) => {
  const {
    data: { text },
  } = await Tesseract.recognize(imagePath, 'eng', {
    logger: () => {}, // silence per-tile progress logs; flip to console.log for debugging
  });

  return text;
};

module.exports = { extractTextFromImage };
