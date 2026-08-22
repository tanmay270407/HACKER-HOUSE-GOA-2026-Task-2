import { GuardrailStatus, Language, RetrievedChunk } from "../types.ts";
import { tokenizeText, getContentTerms, normalizeStem } from "./retrievalEngine.ts";

/**
 * List of prohibited safety / malicious intent keywords & patterns
 */
const UNSAFE_KEYWORDS = [
  "hack into",
  "how to hack",
  "hacking",
  "hack an",
  "hack a",
  "hack",
  "exploit",
  "steal",
  "bomb",
  "weapon",
  "poison",
  "suicide",
  "bypass authentication",
  "atm machine",
  "carding",
  "malware",
  "ddos",
  "ransomware",
  "हैकिंग",
  "चोरी",
  "हथियार",
  "जहर",
  "धोखाधड़ी",
];

/**
 * Checks query safety and off-topic domain guardrails
 */
export function checkQuerySafetyAndOffTopic(
  query: string,
  language: Language
): GuardrailStatus {
  const lower = query.toLowerCase();

  // Strip safe, benign community terms (e.g. "Hacker House Goa", "hackathon", "builder residency")
  // so they are not flagged by the "hack" substring check
  const sanitizedForSafety = lower
    .replace(/\bhacker\s+house\s*(goa)?\b/gi, "community_hub")
    .replace(/\bhackerhouse\b/gi, "community_hub")
    .replace(/\bhackathons?\b/gi, "community_event")
    .replace(/\bhackers?\s+residency\b/gi, "community_residency");

  // 1. Safety check
  for (const badWord of UNSAFE_KEYWORDS) {
    if (sanitizedForSafety.includes(badWord)) {
      return {
        isPassed: false,
        isOffTopic: false,
        isHarmful: true,
        isGrounded: false,
        groundingConfidence: 0,
        safetyCategory: "harmful_content_policy",
        reason:
          language === "hi"
            ? "यह प्रश्न सुरक्षा नीतियों का उल्लंघन करता है। हानिकारक या अनैतिक गतिविधियों पर जानकारी प्रदान नहीं की जा सकती।"
            : "Query declined: This request violates safety policies regarding harmful or illicit activities.",
        actionTaken: "blocked_off_topic",
      };
    }
  }

  // 2. Pure Gibberish / Extreme Off-Topic non-sense filter
  if (query.trim().length < 3) {
    return {
      isPassed: false,
      isOffTopic: true,
      isHarmful: false,
      isGrounded: false,
      groundingConfidence: 0,
      safetyCategory: "invalid_input",
      reason:
        language === "hi"
          ? "कृपया एक वैध प्रश्न दर्ज करें या बोलें।"
          : "Please provide a valid question or query.",
      actionTaken: "blocked_off_topic",
    };
  }

  return {
    isPassed: true,
    isOffTopic: false,
    isHarmful: false,
    isGrounded: true,
    groundingConfidence: 1.0,
    actionTaken: "proceed",
  };
}

/**
 * Guardrail verification: Evaluates if generated answer is factually grounded in retrieved passages
 * and if retrieved passages actually answer the user's query intent.
 */
export function verifyAnswerGrounding(
  query: string,
  answer: string,
  retrievedChunks: RetrievedChunk[],
  language: Language
): GuardrailStatus {
  if (!retrievedChunks || retrievedChunks.length === 0) {
    return {
      isPassed: false,
      isOffTopic: false,
      isHarmful: false,
      isGrounded: false,
      groundingConfidence: 0,
      reason:
        language === "hi"
          ? "कोई प्रासंगिक MSMARCO संदर्भ नहीं मिला।"
          : "No relevant MSMARCO passages retrieved.",
      actionTaken: "insufficient_information_fallback",
    };
  }

  // Insufficient information check
  const lowerAnswer = answer.toLowerCase();
  if (
    lowerAnswer.includes("insufficient information") ||
    lowerAnswer.includes("not enough information") ||
    lowerAnswer.includes("पर्याप्त जानकारी नहीं")
  ) {
    return {
      isPassed: true,
      isOffTopic: false,
      isHarmful: false,
      isGrounded: false,
      groundingConfidence: 0.05,
      reason: "Correctly recognized lack of sufficient context in dataset.",
      actionTaken: "insufficient_information_fallback",
    };
  }

  const combinedPassageText = retrievedChunks
    .map((c) => c.chunk.text)
    .join(" ")
    .toLowerCase();
  const combinedTokens = tokenizeText(combinedPassageText);
  const combinedTokenSet = new Set(combinedTokens);

  // 1. Query-to-Passage Topical Alignment
  const queryContentTerms = getContentTerms(query);
  const combinedStemSet = new Set(combinedTokens.map(normalizeStem));
  let queryTermsMatched = 0;

  if (queryContentTerms.length > 0) {
    for (const term of queryContentTerms) {
      if (combinedTokenSet.has(term)) {
        queryTermsMatched++;
      } else if (combinedStemSet.has(normalizeStem(term))) {
        queryTermsMatched += 0.95;
      } else {
        // Partial match
        let partial = false;
        for (const pt of combinedTokenSet) {
          if (pt.startsWith(term) || term.startsWith(pt)) {
            partial = true;
            break;
          }
        }
        if (partial) queryTermsMatched += 0.8;
      }
    }
  }

  const queryCoverage =
    queryContentTerms.length > 0
      ? queryTermsMatched / queryContentTerms.length
      : 1.0;

  const topPassageScore = retrievedChunks.length > 0 ? retrievedChunks[0].score : 0;

  // If query specifies key entities that are missing from retrieved passages
  // (e.g. asking about "Rajasthan" but context is only about "Goa")
  if (
    (queryContentTerms.length >= 2 && queryCoverage < 0.5) ||
    topPassageScore < 0.25 ||
    queryCoverage === 0
  ) {
    return {
      isPassed: false,
      isOffTopic: false,
      isHarmful: false,
      isGrounded: false,
      groundingConfidence: Math.round(Math.min(0.2, topPassageScore * queryCoverage) * 100) / 100,
      reason:
        language === "hi"
          ? "पुनर्प्राप्त MSMARCO संदर्भ में पूछे गए प्रश्न के मुख्य विषय पर कोई प्रासंगिक जानकारी नहीं है।"
          : "Retrieved MSMARCO context lacks required topics/entities for this query.",
      actionTaken: "insufficient_information_fallback",
    };
  }

  // 2. Answer-to-Passage Support Check
  const answerContentTerms = getContentTerms(answer).filter((t) => t.length > 2);
  let supportedTokens = 0;

  if (answerContentTerms.length > 0) {
    for (const token of answerContentTerms) {
      if (combinedTokenSet.has(token) || combinedStemSet.has(normalizeStem(token)) || combinedPassageText.includes(token)) {
        supportedTokens++;
      }
    }
  }

  const answerSupport =
    answerContentTerms.length > 0
      ? supportedTokens / answerContentTerms.length
      : 0.8;

  // If less than 40% of meaningful answer tokens exist in retrieved passages, flag as ungrounded hallucination
  if (answerSupport < 0.4) {
    return {
      isPassed: false,
      isOffTopic: false,
      isHarmful: false,
      isGrounded: false,
      groundingConfidence: Math.round(answerSupport * 100) / 100,
      reason:
        language === "hi"
          ? "उत्तर पुनर्प्राप्त दस्तावेजों द्वारा पर्याप्त रूप से प्रमाणित नहीं है।"
          : "Generated answer contains statements not grounded in retrieved MSMARCO passages.",
      actionTaken: "insufficient_information_fallback",
    };
  }

  // 3. Genuine Combined Grounding Confidence Score
  // Confidence combines passage retrieval relevance, query topical alignment, and answer support
  const rawConfidence =
    topPassageScore * 0.4 + queryCoverage * 0.35 + answerSupport * 0.25;
  const groundingConfidence = Math.round(Math.min(0.98, Math.max(0.35, rawConfidence)) * 100) / 100;

  return {
    isPassed: true,
    isOffTopic: false,
    isHarmful: false,
    isGrounded: true,
    groundingConfidence,
    reason: "Answer is verified grounded in topically relevant MSMARCO-XI passages.",
    actionTaken: "proceed",
  };
}
