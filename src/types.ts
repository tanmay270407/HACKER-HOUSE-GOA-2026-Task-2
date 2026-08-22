export type Language = 'en' | 'hi';

export type ChunkingStrategy = 'fixed' | 'semantic' | 'metadata_hybrid' | 'ensemble';

export interface MSMARCOPassage {
  is_selected: number; // 1 = relevant positive passage, 0 = distractor
  url?: string;
  passage_text: string;
}

export interface MSMARCORow {
  id: string;
  query: string;
  passages: MSMARCOPassage[];
  answers: string[];
  language: Language;
  topic?: string;
  query_type?: 'standard' | 'unanswerable' | 'off_topic';
}

export interface Chunk {
  chunkId: string;
  docId: string;
  passageIndex: number;
  text: string;
  language: Language;
  strategy: 'fixed' | 'semantic' | 'metadata_hybrid';
  tokenCount: number;
  isSelectedGroundTruth: boolean;
  metadata: {
    url?: string;
    topic?: string;
    passageType: 'relevant' | 'distractor';
    startChar?: number;
    endChar?: number;
    sentenceCount?: number;
    keywords?: string[];
  };
  embedding?: number[];
}

export interface RetrievedChunk {
  chunk: Chunk;
  score: number;
  rank: number;
  matchType: string;
  vectorScore: number;
  lexicalScore: number;
}

export interface GuardrailStatus {
  isPassed: boolean;
  isOffTopic: boolean;
  isHarmful: boolean;
  isGrounded: boolean;
  groundingConfidence: number;
  reason?: string;
  safetyCategory?: string;
  actionTaken: 'proceed' | 'blocked_off_topic' | 'insufficient_information_fallback';
}

export interface LatencyBreakdown {
  sttMs: number;
  retrievalMs: number;
  generationMs: number;
  guardrailMs: number;
  totalMs: number;
}

export interface ToolCallTrace {
  toolName: string;
  arguments: Record<string, any>;
  resultSummary: string;
  chunkCount: number;
  latencyMs: number;
}

export type PipelineMode = 'turbo' | 'gemini';

export interface RAGResponse {
  query: string;
  transcript: string;
  language: Language;
  strategy: ChunkingStrategy;
  pipelineMode?: PipelineMode;
  status: 'grounded_success' | 'insufficient_information' | 'guardrail_blocked' | 'error';
  answer: string;
  grounded: boolean;
  groundingConfidence: number;
  guardrailDetails: GuardrailStatus;
  retrievedPassages: RetrievedChunk[];
  toolCalls: ToolCallTrace[];
  latency: LatencyBreakdown;
  timestamp: string;
  sttProvider: string; // e.g. "Sarvam AI Saaras STT"
}

export interface BenchmarkQueryItem {
  id: string;
  query: string;
  language: Language;
  type: 'standard' | 'unanswerable' | 'off_topic' | 'hindi';
  expectedGrounding: boolean;
  expectedStatus: 'grounded_success' | 'insufficient_information' | 'guardrail_blocked';
}

export interface BenchmarkResultItem {
  id: string;
  query: string;
  language: Language;
  type: string;
  latencyTotalMs: number;
  latencyBreakdown: LatencyBreakdown;
  status: string;
  grounded: boolean;
  groundingConfidence: number;
  retrievedCount: number;
  matchesExpectation: boolean;
}

export interface BatchBenchmarkReport {
  totalQueries: number;
  completedQueries: number;
  successful: number;
  groundedCount: number;
  insufficientInfoCount: number;
  offTopicBlockedCount: number;
  p50: number;
  p70: number;
  p100: number;
  avgLatencyMs: number;
  avgRetrievalMs: number;
  avgGenerationMs: number;
  avgGuardrailMs: number;
  accuracyRate: number;
  results: BenchmarkResultItem[];
  timestamp: string;
}
