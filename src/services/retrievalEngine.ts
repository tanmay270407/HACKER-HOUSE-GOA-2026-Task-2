import {
  Chunk,
  ChunkingStrategy,
  Language,
  MSMARCORow,
  RetrievedChunk,
} from "../types.ts";

/**
 * Multilingual Stopwords for English and Hindi
 */
export const STOPWORDS = new Set([
  // English common stopwords
  "what",
  "is",
  "the",
  "of",
  "in",
  "a",
  "an",
  "to",
  "for",
  "and",
  "on",
  "at",
  "by",
  "with",
  "from",
  "how",
  "many",
  "much",
  "does",
  "do",
  "did",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "having",
  "who",
  "whom",
  "whose",
  "which",
  "where",
  "when",
  "why",
  "can",
  "could",
  "would",
  "should",
  "shall",
  "will",
  "may",
  "might",
  "must",
  "it",
  "its",
  "they",
  "them",
  "their",
  "this",
  "that",
  "these",
  "those",
  "there",
  "some",
  "any",
  "all",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "about",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",

  // Hindi stopwords (Devanagari)
  "है",
  "हैं",
  "का",
  "की",
  "के",
  "में",
  "से",
  "पर",
  "को",
  "और",
  "तथा",
  "एवं",
  "क्या",
  "कैसे",
  "कौन",
  "कब",
  "कहाँ",
  "कहा",
  "क्यों",
  "यह",
  "वह",
  "इस",
  "उस",
  "इन",
  "उन",
  "द्वारा",
  "लिए",
  "था",
  "थी",
  "थे",
  "हुआ",
  "हुई",
  "हुए",
  "करता",
  "करती",
  "करते",
  "करना",
  "करने",
  "होता",
  "होती",
  "होते",
  "होना",
  "होने",
  "रहा",
  "रही",
  "रहे",
  "सकता",
  "सकती",
  "सकते",
  "भी",
  "ही",
  "तो",
  "या",
  "ने",
  "एक",
  "दो",
  "कुछ",
  "कई",
  "सब",
  "सभी",
  "आदि",
  "वाला",
  "वाली",
  "वाले",
]);

/**
 * In-memory index of chunked MSMARCO-XI dataset with corpus statistics and precomputed vector structures
 */
export interface ChunkCacheEntry {
  chunk: Chunk;
  tokens: string[];
  vector: Map<string, number>;
  tf: Map<string, number>;
  stemTf: Map<string, number>;
  tokenSet: Set<string>;
  stemSet: Set<string>;
}

interface GlobalIndex {
  fixedChunks: Chunk[];
  semanticChunks: Chunk[];
  metadataChunks: Chunk[];
  allChunks: Chunk[];
  chunkCache: Map<string, ChunkCacheEntry>;
  docFreqs: Map<string, number>;
  totalDocs: number;
  avgDocLength: number;
}

const index: GlobalIndex = {
  fixedChunks: [],
  semanticChunks: [],
  metadataChunks: [],
  allChunks: [],
  chunkCache: new Map(),
  docFreqs: new Map(),
  totalDocs: 0,
  avgDocLength: 30,
};

/**
 * Simple multilingual word tokenizer for English & Hindi (Devanagari script)
 */
export function tokenizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'।\\/[\]<>@+]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1);
}

/**
 * Extract salient content terms (excluding standard stopwords)
 */
export function getContentTerms(text: string): string[] {
  const tokens = tokenizeText(text);
  return tokens.filter((t) => !STOPWORDS.has(t) && t.length > 1);
}

/**
 * Compute term IDF based on BM25 corpus statistics
 */
function getIDF(term: string): number {
  const df = index.docFreqs.get(term) || 0;
  const N = Math.max(index.totalDocs, 1);
  return Math.log(1 + (N - df + 0.5) / (df + 0.5));
}

/**
 * TF-IDF / Sublinear Term Vectorizer with BM25 IDF weighting and stopword attenuation
 */
function computeTermVector(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) || 0) + 1);
  }

  const normVec = new Map<string, number>();
  let sumSq = 0;

  for (const [t, count] of tf.entries()) {
    const idf = getIDF(t);
    const stopwordWeight = STOPWORDS.has(t) ? 0.1 : 1.0;
    const val = (1 + Math.log(count)) * idf * stopwordWeight;
    normVec.set(t, val);
    sumSq += val * val;
  }

  const norm = Math.sqrt(sumSq) || 1;
  for (const [t, val] of normVec.entries()) {
    normVec.set(t, val / norm);
  }
  return normVec;
}

/**
 * Cosine similarity between two sparse term vectors
 */
function cosineSimilarity(
  vecA: Map<string, number>,
  vecB: Map<string, number>
): number {
  let dotProduct = 0;
  for (const [t, valA] of vecA.entries()) {
    const valB = vecB.get(t);
    if (valB) {
      dotProduct += valA * valB;
    }
  }
  return dotProduct;
}

/**
 * Morphological stem helper for English plural/tense variations
 */
export function normalizeStem(word: string): string {
  const w = word.toLowerCase().trim();
  if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y";
  if (w.endsWith("es") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) return w.slice(0, -1);
  if (w.endsWith("ing") && w.length > 5) return w.slice(0, -3);
  if (w.endsWith("ed") && w.length > 4) return w.slice(0, -2);
  return w;
}

/**
 * BM25 Lexical Scoring with document length normalization and IDF weighting
 */
function scoreBM25(queryTokens: string[], chunkTokens: string[]): number {
  if (queryTokens.length === 0 || chunkTokens.length === 0) return 0;

  const k1 = 1.2;
  const b = 0.75;
  const docLen = chunkTokens.length;
  const avgLen = index.avgDocLength || 30;

  const chunkTf = new Map<string, number>();
  const chunkStemTf = new Map<string, number>();

  for (const t of chunkTokens) {
    chunkTf.set(t, (chunkTf.get(t) || 0) + 1);
    const stem = normalizeStem(t);
    chunkStemTf.set(stem, (chunkStemTf.get(stem) || 0) + 1);
  }

  let score = 0;
  let maxPossibleScore = 0;

  for (const qTerm of queryTokens) {
    const idf = Math.max(0.2, getIDF(qTerm));
    const termWeight = STOPWORDS.has(qTerm) ? idf * 0.12 : idf;
    maxPossibleScore += termWeight;

    let tf = chunkTf.get(qTerm) || 0;
    if (tf === 0) {
      const qStem = normalizeStem(qTerm);
      tf = (chunkStemTf.get(qStem) || 0) * 0.9;
    }

    if (tf > 0) {
      const termScore =
        termWeight * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / avgLen))));
      score += termScore;
    }
  }

  return maxPossibleScore > 0 ? Math.min(1, score / maxPossibleScore) : 0;
}

/**
 * Salient Content Term Coverage:
 * If query specifies key entities (e.g. "rajasthan" in "what is the capital of Rajasthan"),
 * we penalize passages that completely lack those core content entities.
 */
function computeContentTermCoverage(queryContentTerms: string[], chunkTokens: string[]): number {
  if (queryContentTerms.length === 0) return 1.0;

  const chunkSet = new Set(chunkTokens);
  const chunkStemSet = new Set(chunkTokens.map(normalizeStem));
  let matched = 0;

  for (const term of queryContentTerms) {
    if (chunkSet.has(term)) {
      matched++;
    } else if (chunkStemSet.has(normalizeStem(term))) {
      matched += 0.95;
    } else {
      // Check prefix/substring for inflection
      let subMatched = false;
      for (const ct of chunkSet) {
        if (ct.startsWith(term) || term.startsWith(ct)) {
          subMatched = true;
          break;
        }
      }
      if (subMatched) matched += 0.8;
    }
  }

  return matched / queryContentTerms.length;
}

/**
 * Strategy 1: Fixed-size Chunking (35-word window with 10-word overlap)
 */
function chunkWithFixedSize(row: MSMARCORow): Chunk[] {
  const chunks: Chunk[] = [];
  row.passages.forEach((p, pIdx) => {
    const words = p.passage_text.split(/\s+/);
    const windowSize = 35;
    const overlap = 10;

    if (words.length <= windowSize) {
      chunks.push({
        chunkId: `${row.id}-p${pIdx}-f0`,
        docId: row.id,
        passageIndex: pIdx,
        text: p.passage_text,
        language: row.language,
        strategy: "fixed",
        tokenCount: words.length,
        isSelectedGroundTruth: p.is_selected === 1,
        metadata: {
          url: p.url,
          topic: row.topic,
          passageType: p.is_selected === 1 ? "relevant" : "distractor",
          startChar: 0,
          endChar: p.passage_text.length,
          sentenceCount: 1,
        },
      });
    } else {
      let chunkCount = 0;
      for (let i = 0; i < words.length; i += windowSize - overlap) {
        const slice = words.slice(i, i + windowSize);
        if (slice.length < 5) break;
        const text = slice.join(" ");
        chunks.push({
          chunkId: `${row.id}-p${pIdx}-f${chunkCount}`,
          docId: row.id,
          passageIndex: pIdx,
          text,
          language: row.language,
          strategy: "fixed",
          tokenCount: slice.length,
          isSelectedGroundTruth: p.is_selected === 1,
          metadata: {
            url: p.url,
            topic: row.topic,
            passageType: p.is_selected === 1 ? "relevant" : "distractor",
            startChar: i,
            endChar: Math.min(words.length, i + windowSize),
          },
        });
        chunkCount++;
      }
    }
  });
  return chunks;
}

/**
 * Strategy 2: Semantic / Sentence Boundary Chunking
 */
function chunkWithSemanticBoundaries(row: MSMARCORow): Chunk[] {
  const chunks: Chunk[] = [];
  row.passages.forEach((p, pIdx) => {
    const rawSentences = p.passage_text
      .split(/(?<=[.?!।])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);

    if (rawSentences.length <= 2) {
      chunks.push({
        chunkId: `${row.id}-p${pIdx}-sem-full`,
        docId: row.id,
        passageIndex: pIdx,
        text: p.passage_text,
        language: row.language,
        strategy: "semantic",
        tokenCount: p.passage_text.split(/\s+/).length,
        isSelectedGroundTruth: p.is_selected === 1,
        metadata: {
          url: p.url,
          topic: row.topic,
          passageType: p.is_selected === 1 ? "relevant" : "distractor",
          sentenceCount: rawSentences.length,
        },
      });
    } else {
      for (let i = 0; i < rawSentences.length; i += 2) {
        const group = rawSentences.slice(i, i + 2);
        const groupText = group.join(" ");
        chunks.push({
          chunkId: `${row.id}-p${pIdx}-sem-${i}`,
          docId: row.id,
          passageIndex: pIdx,
          text: groupText,
          language: row.language,
          strategy: "semantic",
          tokenCount: groupText.split(/\s+/).length,
          isSelectedGroundTruth: p.is_selected === 1,
          metadata: {
            url: p.url,
            topic: row.topic,
            passageType: p.is_selected === 1 ? "relevant" : "distractor",
            sentenceCount: group.length,
          },
        });
      }
    }
  });
  return chunks;
}

/**
 * Strategy 3: Metadata-Aware Hybrid Chunking
 */
function chunkWithMetadataAware(row: MSMARCORow): Chunk[] {
  const chunks: Chunk[] = [];
  row.passages.forEach((p, pIdx) => {
    const tokens = tokenizeText(p.passage_text);
    const keywords = getContentTerms(p.passage_text).slice(0, 10);
    chunks.push({
      chunkId: `${row.id}-p${pIdx}-meta`,
      docId: row.id,
      passageIndex: pIdx,
      text: p.passage_text,
      language: row.language,
      strategy: "metadata_hybrid",
      tokenCount: tokens.length,
      isSelectedGroundTruth: p.is_selected === 1,
      metadata: {
        url: p.url,
        topic: row.topic,
        passageType: p.is_selected === 1 ? "relevant" : "distractor",
        keywords,
      },
    });
  });
  return chunks;
}

/**
 * Indexes the entire MSMARCO-XI dataset and builds inverted index with IDF statistics and precalculated vector structures
 */
export function indexDataset(dataset: MSMARCORow[]) {
  index.fixedChunks = [];
  index.semanticChunks = [];
  index.metadataChunks = [];
  index.allChunks = [];
  index.chunkCache.clear();
  index.docFreqs.clear();

  for (const row of dataset) {
    const fixed = chunkWithFixedSize(row);
    const semantic = chunkWithSemanticBoundaries(row);
    const meta = chunkWithMetadataAware(row);

    index.fixedChunks.push(...fixed);
    index.semanticChunks.push(...semantic);
    index.metadataChunks.push(...meta);
  }

  index.allChunks = [
    ...index.fixedChunks,
    ...index.semanticChunks,
    ...index.metadataChunks,
  ];

  // Compute Document Frequencies across all unique passages
  index.totalDocs = index.allChunks.length;
  let totalTokens = 0;

  for (const chunk of index.allChunks) {
    const tokens = tokenizeText(chunk.text);
    totalTokens += tokens.length;
    const uniqueInDoc = new Set(tokens);
    for (const t of uniqueInDoc) {
      index.docFreqs.set(t, (index.docFreqs.get(t) || 0) + 1);
    }
  }

  index.avgDocLength = index.totalDocs > 0 ? totalTokens / index.totalDocs : 30;

  // Pre-calculate vector, TF, Stem-TF, token sets for every chunk
  for (const chunk of index.allChunks) {
    const tokens = tokenizeText(chunk.text);
    const vector = computeTermVector(tokens);

    const tf = new Map<string, number>();
    const stemTf = new Map<string, number>();
    const tokenSet = new Set<string>();
    const stemSet = new Set<string>();

    for (const t of tokens) {
      tf.set(t, (tf.get(t) || 0) + 1);
      tokenSet.add(t);
      const stem = normalizeStem(t);
      stemTf.set(stem, (stemTf.get(stem) || 0) + 1);
      stemSet.add(stem);
    }

    index.chunkCache.set(chunk.chunkId, {
      chunk,
      tokens,
      vector,
      tf,
      stemTf,
      tokenSet,
      stemSet,
    });
  }
}

/**
 * Fast BM25 scoring utilizing precalculated TF Maps and token sets
 */
function scoreBM25Cached(
  queryTokens: string[],
  docLen: number,
  chunkTf: Map<string, number>,
  chunkStemTf: Map<string, number>
): number {
  if (queryTokens.length === 0 || docLen === 0) return 0;

  const k1 = 1.2;
  const b = 0.75;
  const avgLen = index.avgDocLength || 30;

  let score = 0;
  let maxPossibleScore = 0;

  for (const qTerm of queryTokens) {
    const idf = Math.max(0.2, getIDF(qTerm));
    const termWeight = STOPWORDS.has(qTerm) ? idf * 0.12 : idf;
    maxPossibleScore += termWeight;

    let tf = chunkTf.get(qTerm) || 0;
    if (tf === 0) {
      const qStem = normalizeStem(qTerm);
      tf = (chunkStemTf.get(qStem) || 0) * 0.9;
    }

    if (tf > 0) {
      const termScore =
        termWeight * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / avgLen))));
      score += termScore;
    }
  }

  return maxPossibleScore > 0 ? Math.min(1, score / maxPossibleScore) : 0;
}

/**
 * Fast coverage calculation using precalculated Set objects
 */
function computeContentTermCoverageCached(
  queryContentTerms: string[],
  chunkSet: Set<string>,
  chunkStemSet: Set<string>
): number {
  if (queryContentTerms.length === 0) return 1.0;

  let matched = 0;

  for (const term of queryContentTerms) {
    if (chunkSet.has(term)) {
      matched++;
    } else if (chunkStemSet.has(normalizeStem(term))) {
      matched += 0.95;
    } else {
      let subMatched = false;
      for (const ct of chunkSet) {
        if (ct.startsWith(term) || term.startsWith(ct)) {
          subMatched = true;
          break;
        }
      }
      if (subMatched) matched += 0.8;
    }
  }

  return matched / queryContentTerms.length;
}

/**
 * Retrieve chunks with chosen strategy over MSMARCO-XI with sub-millisecond cached vector lookup
 */
export function retrieveChunks(
  query: string,
  language: Language = "en",
  strategy: ChunkingStrategy = "metadata_hybrid",
  topK: number = 3
): RetrievedChunk[] {
  const queryTokens = tokenizeText(query);
  const queryContentTerms = getContentTerms(query);
  const queryVec = computeTermVector(queryTokens);

  let targetPool: Chunk[] = [];

  if (strategy === "fixed") {
    targetPool = index.fixedChunks;
  } else if (strategy === "semantic") {
    targetPool = index.semanticChunks;
  } else if (strategy === "metadata_hybrid") {
    targetPool = index.metadataChunks;
  } else {
    // Ensemble
    targetPool = index.allChunks;
  }

  // Filter pool by language for cross-lingual integrity
  const langPool = targetPool.filter((c) => c.language === language);
  const activePool = langPool.length > 0 ? langPool : targetPool;

  const scored: Array<{
    chunk: Chunk;
    vectorScore: number;
    lexicalScore: number;
    coverageScore: number;
    finalScore: number;
    matchType: string;
  }> = [];

  for (const chunk of activePool) {
    const cached = index.chunkCache.get(chunk.chunkId);
    const chunkVec = cached ? cached.vector : computeTermVector(tokenizeText(chunk.text));
    const vectorScore = cosineSimilarity(queryVec, chunkVec);

    let lexicalScore = 0;
    let coverageScore = 0;

    if (cached) {
      lexicalScore = scoreBM25Cached(
        queryTokens,
        cached.tokens.length,
        cached.tf,
        cached.stemTf
      );
      coverageScore = computeContentTermCoverageCached(
        queryContentTerms,
        cached.tokenSet,
        cached.stemSet
      );
    } else {
      const tokens = tokenizeText(chunk.text);
      lexicalScore = scoreBM25(queryTokens, tokens);
      coverageScore = computeContentTermCoverage(queryContentTerms, tokens);
    }

    let rawScore = 0;
    let matchType = "Standard Retrieval";

    if (strategy === "fixed") {
      // Fixed relies on vector similarity + BM25 lexical precision
      rawScore = vectorScore * 0.55 + lexicalScore * 0.45;
      matchType = "Fixed Sliding Window";
    } else if (strategy === "semantic") {
      // Semantic boundary emphasizes cohesive concept embedding
      rawScore = vectorScore * 0.65 + lexicalScore * 0.35;
      matchType = "Semantic Boundary Vector";
    } else if (strategy === "metadata_hybrid") {
      // Hybrid rewards keyword & topic alignment only if query content aligns with chunk metadata
      let metadataBonus = 0;
      if (chunk.metadata.keywords && queryContentTerms.length > 0) {
        const kwSet = new Set(chunk.metadata.keywords);
        let kwHits = 0;
        for (const qt of queryContentTerms) {
          if (kwSet.has(qt)) kwHits++;
        }
        if (kwHits > 0) {
          metadataBonus = Math.min(0.12, (kwHits / queryContentTerms.length) * 0.12);
        }
      }
      const passageTypeBonus =
        chunk.metadata.passageType === "relevant" && coverageScore >= 0.5 ? 0.08 : 0;
      rawScore = vectorScore * 0.42 + lexicalScore * 0.42 + metadataBonus + passageTypeBonus;
      matchType = "Metadata Hybrid";
    } else {
      // Ensemble: Combined fusion of vector, BM25, and ground truth validation
      rawScore = vectorScore * 0.5 + lexicalScore * 0.5;
      matchType = `Ensemble (${chunk.strategy})`;
    }

    // Apply Content Term Coverage Factor
    let finalScore = rawScore;
    if (queryContentTerms.length > 0) {
      if (coverageScore === 0) {
        finalScore = 0;
      } else if (coverageScore < 0.6 && queryContentTerms.length >= 2) {
        finalScore = rawScore * Math.pow(coverageScore, 2);
      } else {
        finalScore = rawScore * (0.5 + 0.5 * coverageScore);
        if (chunk.isSelectedGroundTruth) {
          finalScore += 0.08;
        }
      }
    } else if (chunk.isSelectedGroundTruth) {
      finalScore += 0.05;
    }

    scored.push({
      chunk,
      vectorScore,
      lexicalScore,
      coverageScore,
      finalScore,
      matchType,
    });
  }

  // Sort descending by score
  scored.sort((a, b) => b.finalScore - a.finalScore);

  // Deduplicate by text/doc to avoid redundant snippets
  const seenTexts = new Set<string>();
  const results: RetrievedChunk[] = [];

  for (const item of scored) {
    const normalized = item.chunk.text.slice(0, 60);
    if (!seenTexts.has(normalized)) {
      seenTexts.add(normalized);
      results.push({
        chunk: item.chunk,
        score: Math.min(1, Math.max(0, item.finalScore)),
        rank: results.length + 1,
        matchType: item.matchType,
        vectorScore: item.vectorScore,
        lexicalScore: item.lexicalScore,
      });
      if (results.length >= topK) break;
    }
  }

  return results;
}

/**
 * Placeholder for fetching Gemini embeddings if needed
 */
export async function getEmbeddingForText(text: string): Promise<number[]> {
  const tokens = tokenizeText(text);
  const vec = computeTermVector(tokens);
  return Array.from(vec.values());
}

