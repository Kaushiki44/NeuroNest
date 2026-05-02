const calculateQualityScore = (content) => {
  // Text preprocessing
  const cleanContent = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  
  const words = cleanContent.split(' ').filter(w => w.length > 0);
  const wordCount = words.length;

  let score = 50;
  const feedback = [];

  // Word count
  if (wordCount < 200) {
    score -= 20;
    feedback.push("Your post is quite short. Consider expanding it for more detail (-20 pts).");
  } else if (wordCount >= 200 && wordCount <= 500) {
    score += 10;
    feedback.push("Good word count. Your post is a decent length (+10 pts).");
  } else {
    score += 20;
    feedback.push("Excellent word count. Detailed posts perform well (+20 pts).");
  }

  // Headings
  if (/<h[123][^>]*>/.test(content)) {
    score += 15;
    feedback.push("Great use of headings to structure your content (+15 pts).");
  } else {
    score -= 10;
    feedback.push("No headings found. Use headings (H1, H2, H3) to break up your text (-10 pts).");
  }

  // Paragraph length
  const paragraphs = content.split('</p>');
  let longParagraph = false;
  for (const p of paragraphs) {
    const pText = p.replace(/<[^>]*>/g, ' ').trim();
    const pWords = pText.split(/\s+/).filter(w => w.length > 0);
    if (pWords.length > 150) {
      longParagraph = true;
      break;
    }
  }
  
  if (longParagraph) {
    score -= 10;
    feedback.push("One or more paragraphs are too long (>150 words). Break them up for better readability (-10 pts).");
  } else {
    feedback.push("Good paragraph lengths. Makes it easy to read.");
  }

  // Keyword quality
  const stopWords = new Set(['the', 'is', 'in', 'at', 'of', 'on', 'and', 'a', 'to', 'for', 'with', 'it', 'as', 'by', 'this', 'that', 'are', 'was', 'be', 'or', 'an', 'you']);
  const wordFreq = {};
  for (const w of words) {
    // Only count meaningful words length > 3
    if (!stopWords.has(w) && w.length > 3) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  }
  
  let repeatedWordsCount = 0;
  for (const count of Object.values(wordFreq)) {
    if (count >= 3) {
      repeatedWordsCount++;
    }
  }
  
  if (repeatedWordsCount >= 2) {
    score += 10;
    feedback.push("Good use of repeated keywords, establishing a clear topic (+10 pts).");
  } else {
    feedback.push("Try emphasizing your main topics by repeating key terms a few times.");
  }

  // Edge rule
  if (wordCount < 100) {
    score = Math.min(score, 40);
    feedback.push("Post is very brief (<100 words). Score capped at 40.");
  }

  // Clamp between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return { score, feedback };
};

module.exports = { calculateQualityScore };
