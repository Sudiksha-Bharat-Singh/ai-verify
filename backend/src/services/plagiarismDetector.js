/**
 * Plagiarism Detector Service
 * 
 * Algorithm:
 * 1. Split text into sentences
 * 2. For each sentence, search Bing for matching content
 * 3. Compare similarity using the Python AI engine (cosine similarity)
 * 4. Mark sentences above threshold as plagiarized
 * 5. Aggregate sources and calculate overall score
 */

const axios = require('axios');
const { logger } = require('../utils/logger');
const { searchWeb } = require('./webSearch');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';
const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD || '0.70');
const MIN_SENTENCE_LENGTH = 20; // chars — skip very short sentences
const MAX_SENTENCES_TO_CHECK = 10; // rate limit / cost control

/**
 * Main plagiarism detection function
 * @param {string} text - Full text to check
 * @param {string} reportId - For logging
 * @returns {Promise<{overallScore: number, sentences: Array, sources: Array}>}
 */
async function detectPlagiarism(text, reportId) {
  // Step 1: Split into sentences
  const rawSentences = splitIntoSentences(text);
  logger.info(`[${reportId}] Split into ${rawSentences.length} sentences`);

  // Step 2: Filter sentences worth checking
  const checkable = rawSentences.filter(s => s.length >= MIN_SENTENCE_LENGTH);
  const toCheck = checkable.slice(0, MAX_SENTENCES_TO_CHECK);

  if (toCheck.length === 0) {
    return { overallScore: 0, sentences: [], sources: [] };
  }

  // Step 3: Process sentences (with controlled concurrency)
  const sourcesMap = new Map(); // url -> source info
  const sentenceResults = [];

  // Process in batches of 5 to avoid rate limits
  const BATCH_SIZE = 2;
  for (let i = 0; i < toCheck.length; i += BATCH_SIZE) {
    const batch = toCheck.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(sentence => checkSentence(sentence, sourcesMap, reportId))
    );
    sentenceResults.push(...batchResults);

    // Throttle between batches
    if (i + BATCH_SIZE < toCheck.length) {
      await sleep(1000);
    }
  }

  // Step 4: Add unchecked sentences as non-plagiarized
  const allSentences = rawSentences.map(sentence => {
    const result = sentenceResults.find(r => r.text === sentence);
    if (result) return result;
    return {
      text: sentence,
      isPlagiarized: false,
      similarityScore: 0,
      matchedSource: null,
    };
  });

  // Step 5: Calculate overall plagiarism percentage
  const plagiarizedCount = allSentences.filter(s => s.isPlagiarized).length;
  const checkedCount = Math.max(sentenceResults.length, 1);
  const overallScore = Math.round((plagiarizedCount / checkedCount) * 100 * 10) / 10;

  // Step 6: Build sorted sources list
  const sources = Array.from(sourcesMap.values())
    .sort((a, b) => b.matchCount - a.matchCount);

  return {
    overallScore,
    sentences: allSentences,
    sources,
  };
}

/**
 * Check a single sentence for plagiarism
 */
async function checkSentence(sentence, sourcesMap, reportId) {
  try {
    // Search web for this sentence
    const searchResults = await searchWeb(sentence);

    if (!searchResults || searchResults.length === 0) {
      return { text: sentence, isPlagiarized: false, similarityScore: 0, matchedSource: null };
    }

    // Get similarity scores from AI engine
    const candidates = searchResults.map(r => r.snippet).filter(Boolean);

    let maxSimilarity = 0;
    let bestMatch = null;

    if (candidates.length > 0) {
      try {
        const simResponse = await axios.post(
          `${AI_ENGINE_URL}/similarity`,
          { query: sentence, candidates },
          { timeout: 10000 }
        );

        const scores = simResponse.data.scores || [];
        scores.forEach((score, idx) => {
          if (score > maxSimilarity) {
            maxSimilarity = score;
            bestMatch = searchResults[idx];
          }
        });
      } catch (simErr) {
        logger.warn(`[${reportId}] AI similarity check failed, using keyword fallback`);
        // Fallback: simple keyword overlap
        maxSimilarity = keywordSimilarity(sentence, candidates[0] || '');
        bestMatch = searchResults[0];
      }
    }

    const isPlagiarized = maxSimilarity >= SIMILARITY_THRESHOLD;

    // Track source
    if (isPlagiarized && bestMatch) {
      const url = bestMatch.url;
      if (sourcesMap.has(url)) {
        sourcesMap.get(url).matchCount++;
        sourcesMap.get(url).matchedSentences.push(sentence);
      } else {
        sourcesMap.set(url, {
          url,
          title: bestMatch.title || url,
          snippet: bestMatch.snippet || '',
          matchCount: 1,
          matchedSentences: [sentence],
        });
      }
    }

    return {
      text: sentence,
      isPlagiarized,
      similarityScore: Math.round(maxSimilarity * 100) / 100,
      matchedSource: isPlagiarized && bestMatch
        ? { url: bestMatch.url, title: bestMatch.title }
        : null,
    };
  } catch (err) {
    logger.error(`Error checking sentence: ${err.message}`);
    return { text: sentence, isPlagiarized: false, similarityScore: 0, matchedSource: null };
  }
}

/**
 * Split text into sentences using basic NLP rules
 */
function splitIntoSentences(text) {
  // Handle abbreviations and edge cases before splitting
  return text
    .replace(/([.!?])\s+(?=[A-Z])/g, '$1\n')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Simple keyword overlap similarity (fallback)
 */
function keywordSimilarity(a, b) {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  if (wordsA.size === 0) return 0;
  const intersection = [...wordsA].filter(w => wordsB.has(w));
  return intersection.length / wordsA.size;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = { detectPlagiarism };
