/**
 * Rule-based sentiment analyzer
 * 
 * Expected behavior examples:
 * - "very good" → Positive
 * - "not very good" → Negative
 * - "not bad" → Positive
 * - "good but confusing" → Negative (ties bias to negative)
 */
const getSentiment = (text) => {
  if (!text || typeof text !== 'string') return 'Neutral';

  // 1. Preprocessing
  const cleanText = text.replace(/<[^>]*>/g, ' ');
  const words = cleanText.toLowerCase().match(/\b\w+\b/g) || [];

  if (words.length === 0) return 'Neutral';

  // 2. Word Sets
  const positiveWords = new Set([
    'good', 'great', 'awesome', 'helpful', 'nice',
    'amazing', 'excellent', 'useful', 'love', 'clear'
  ]);

  const negativeWords = new Set([
    'bad', 'worst', 'poor', 'useless', 'boring',
    'terrible', 'awful', 'confusing', 'hate', 'slow'
  ]);

  const negators = new Set(['not', 'no', 'never']);
  const intensifiers = new Set(['very', 'extremely', 'really', 'too']);

  // 3. Counting Logic
  let positiveCount = 0;
  let negativeCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Check for intensifier directly preceding the word
    let weight = 1;
    if (i > 0 && intensifiers.has(words[i - 1])) {
      weight = 2;
    }

    // Detect negation in a 2-word window
    const isNegated = (i > 0 && negators.has(words[i - 1])) || (i > 1 && negators.has(words[i - 2]));

    if (positiveWords.has(word)) {
      if (isNegated) {
        negativeCount += weight;
      } else {
        positiveCount += weight;
      }
    } else if (negativeWords.has(word)) {
      if (isNegated) {
        positiveCount += weight;
      } else {
        negativeCount += weight;
      }
    }
  }

  // 5. Optional Emphasis: add 0.5 to dominant side
  if (text.includes('!')) {
    if (positiveCount > negativeCount) {
      positiveCount += 0.5;
    } else if (negativeCount > positiveCount) {
      negativeCount += 0.5;
    } else if (negativeCount > 0) {
      // If tied but negative words are present, it leans negative
      negativeCount += 0.5;
    }
  }

  // 4. Tie Handling
  if (positiveCount > negativeCount) return 'Positive';
  if (negativeCount > positiveCount) return 'Negative';
  
  if (negativeCount > 0) return 'Negative';
  
  return 'Neutral';
};

module.exports = { getSentiment };
