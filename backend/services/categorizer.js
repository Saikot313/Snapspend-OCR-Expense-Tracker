/**
 * Rule-based expense categorizer.
 * Scans merchant name + raw OCR text for keyword matches and returns the
 * best-guess category. This keeps the project dependency-free (no paid
 * ML API) while still demonstrating an "intelligent" feature on the CV.
 */

const CATEGORY_KEYWORDS = {
  groceries: ['supermarket', 'grocery', 'mart', 'market', 'shwapno', 'meena bazar', 'agora', 'unimart'],
  dining: ['restaurant', 'cafe', 'coffee', 'food', 'kitchen', 'diner', 'pizza', 'burger', 'bakery', 'sweets'],
  transport: ['uber', 'pathao', 'taxi', 'fuel', 'petrol', 'gas station', 'cng', 'bus', 'train', 'fare', 'parking'],
  utilities: ['electricity', 'gas bill', 'water bill', 'internet', 'wifi', 'broadband', 'desco', 'wasa', 'telecom'],
  shopping: ['fashion', 'clothing', 'store', 'mall', 'electronics', 'shoes', 'apparel', 'boutique'],
  health: ['pharmacy', 'hospital', 'clinic', 'medicine', 'drug', 'diagnostic', 'doctor'],
  entertainment: ['cinema', 'movie', 'netflix', 'spotify', 'game', 'concert', 'amusement'],
  rent: ['rent', 'landlord', 'lease'],
};

const categorizeExpense = (text = '') => {
  const normalized = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category;
    }
  }
  return 'other';
};

/**
 * Attempts to pull a total amount out of raw receipt OCR text.
 * Looks for lines containing "total" and extracts the last number on that line;
 * falls back to the largest number found anywhere in the text.
 */
const extractAmount = (text = '') => {
  const lines = text.split('\n');
  const numberPattern = /(\d+[.,]?\d*)/g;

  const totalLine = lines.find((line) => /total|amount due|grand total/i.test(line));
  if (totalLine) {
    const matches = totalLine.match(numberPattern);
    if (matches && matches.length) {
      const value = parseFloat(matches[matches.length - 1].replace(',', ''));
      if (!isNaN(value)) return value;
    }
  }

  // Fallback: find the largest plausible number in the whole receipt
  const allMatches = text.match(numberPattern) || [];
  const numbers = allMatches.map((m) => parseFloat(m.replace(',', ''))).filter((n) => !isNaN(n) && n > 0);
  return numbers.length ? Math.max(...numbers) : null;
};

/**
 * Best-effort merchant name guess: first non-empty line of the receipt,
 * which is conventionally the store/business name.
 */
const extractMerchant = (text = '') => {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines[0] || null;
};

module.exports = { categorizeExpense, extractAmount, extractMerchant };
