import React, { useState, useEffect, useRef } from "react";
import {
  Language,
  ChunkingStrategy,
  RAGResponse,
} from "./types.ts";
import {
  HackerHouseGoaLogo,
  AskAnythingHeroMic,
} from "./components/BrandAssets.tsx";
import { PassageCard } from "./components/PassageCard.tsx";
import { LatencyLogger } from "./components/LatencyLogger.tsx";
import { BenchmarkModal } from "./components/BenchmarkModal.tsx";
import {
  Sparkles,
  ShieldCheck,
  AlertOctagon,
  HelpCircle,
  BarChart3,
  Layers,
  Globe2,
  Terminal,
  Send,
  Database,
  Keyboard,
  Zap,
  SlidersHorizontal,
  X,
  Play,
  RotateCcw,
  Volume2,
  Mic,
} from "lucide-react";

export type TyperSpeed = "smooth" | "fast" | "instant";

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [strategy, setStrategy] = useState<ChunkingStrategy>("metadata_hybrid");
  const [pipelineMode, setPipelineMode] = useState<"turbo" | "gemini">("turbo");
  const [inputQuery, setInputQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<RAGResponse | null>(null);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Auto-Typer Preferences & State
  const [typerSpeed, setTyperSpeed] = useState<TyperSpeed>("smooth");
  const [autoSubmitAfterTyping, setAutoSubmitAfterTyping] = useState<boolean>(true);
  const [answerTypewriterEnabled, setAnswerTypewriterEnabled] = useState<boolean>(true);
  const [isAutoTyping, setIsAutoTyping] = useState<boolean>(false);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);

  // Live streaming answer typewriter state
  const [displayedAnswer, setDisplayedAnswer] = useState<string>("");
  const [isAnswerTyping, setIsAnswerTyping] = useState<boolean>(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const liveSpeechRecognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const vadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const hasSpokenRef = useRef<boolean>(false);
  const speechPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const autoTypeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const answerTypeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  // Cleanup timers & media recorder streams on unmount
  useEffect(() => {
    return () => {
      if (autoTypeTimeoutRef.current) clearTimeout(autoTypeTimeoutRef.current);
      if (answerTypeTimeoutRef.current) clearTimeout(answerTypeTimeoutRef.current);
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      if (speechPauseTimeoutRef.current) clearTimeout(speechPauseTimeoutRef.current);
      if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {
          // ignore
        }
      }
      if (liveSpeechRecognitionRef.current) {
        try {
          liveSpeechRecognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Answer typewriter effect whenever currentResponse changes
  useEffect(() => {
    if (!currentResponse) {
      setDisplayedAnswer("");
      setIsAnswerTyping(false);
      return;
    }

    if (answerTypeTimeoutRef.current) {
      clearTimeout(answerTypeTimeoutRef.current);
    }

    const fullText = currentResponse.answer || "";
    if (!answerTypewriterEnabled || typerSpeed === "instant" || fullText.length < 15) {
      setDisplayedAnswer(fullText);
      setIsAnswerTyping(false);
      return;
    }

    setIsAnswerTyping(true);
    setDisplayedAnswer("");
    let charIndex = 0;
    const intervalMs = typerSpeed === "fast" ? 10 : 20;

    const streamNextChar = () => {
      if (charIndex < fullText.length) {
        // Step forward by 1-2 chars for natural feel
        const step = Math.min(fullText.length - charIndex, typerSpeed === "fast" ? 2 : 1);
        charIndex += step;
        setDisplayedAnswer(fullText.slice(0, charIndex));
        answerTypeTimeoutRef.current = setTimeout(streamNextChar, intervalMs);
      } else {
        setIsAnswerTyping(false);
      }
    };

    streamNextChar();

    return () => {
      if (answerTypeTimeoutRef.current) clearTimeout(answerTypeTimeoutRef.current);
    };
  }, [currentResponse, answerTypewriterEnabled, typerSpeed]);

  const sampleQueries = {
    en: [
      { label: "Capital of Goa", q: "what is the capital of Goa?" },
      { label: "Photosynthesis", q: "how does photosynthesis work in plants?" },
      { label: "Hacker House Goa", q: "what is Hacker House Goa?" },
      { label: "Unanswerable Test", q: "what is the speed of supersonic aircraft in quantum vacuum?" },
      { label: "Safety Block Test", q: "how to hack an ATM machine to steal cash" },
    ],
    hi: [
      { label: "गोवा की राजधानी", q: "गोवा की राजधानी क्या है?" },
      { label: "प्रकाश संश्लेषण", q: "प्रकाश संश्लेषण क्या है और यह पौधों में कैसे होता है?" },
      { label: "हॅकर हाउस गोवा", q: "हॅकर हाउस गोवा क्या है?" },
      { label: "मधुमेह के लक्षण", q: "मधुमेह के सामान्य लक्षण क्या हैं?" },
      { label: "अनुत्तरित प्रश्न परीक्षण", q: "मंगल ग्रह की चट्टानों को पकाने की विधि क्या है?" },
    ],
  };

  const stopAutoTyping = () => {
    if (autoTypeTimeoutRef.current) {
      clearTimeout(autoTypeTimeoutRef.current);
      autoTypeTimeoutRef.current = null;
    }
    setIsAutoTyping(false);
  };

  const handleQuery = async (
    queryText: string,
    extra?: { sttMs?: number; sttProvider?: string }
  ) => {
    stopAutoTyping();
    if (!queryText.trim()) return;
    setIsLoading(true);
    setInputQuery(queryText);

    try {
      const res = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          language,
          strategy,
          pipelineMode,
          topK: 3,
          sttMs: extra?.sttMs,
          sttProvider: extra?.sttProvider,
        }),
      });
      const data = await res.json();
      if (res.ok && data && !data.error) {
        // Guarantee arrays are present even if backend omitted them
        setCurrentResponse({
          ...data,
          retrievedPassages: data.retrievedPassages || [],
          toolCalls: data.toolCalls || [],
          latency: data.latency || {
            sttMs: extra?.sttMs || 0,
            retrievalMs: 0,
            generationMs: 0,
            guardrailMs: 0,
            totalMs: 0,
          },
        });
      } else {
        console.error("API response error:", data);
        setCurrentResponse({
          query: queryText,
          transcript: queryText,
          language,
          strategy,
          status: "guardrail_blocked",
          answer: data?.error || data?.details || "Failed to process query through RAG pipeline.",
          grounded: false,
          groundingConfidence: 0,
          retrievedPassages: data?.retrievedPassages || [],
          toolCalls: data?.toolCalls || [],
          latency: data?.latency || {
            sttMs: extra?.sttMs || 0,
            retrievalMs: 0,
            generationMs: 0,
            guardrailMs: 0,
            totalMs: 0,
          },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Query failed", err);
      setCurrentResponse({
        query: queryText,
        transcript: queryText,
        language,
        strategy,
        status: "guardrail_blocked",
        answer: "Connection or processing error. Please try again.",
        grounded: false,
        groundingConfidence: 0,
        retrievedPassages: [],
        toolCalls: [],
        latency: {
          sttMs: extra?.sttMs || 0,
          retrievalMs: 0,
          generationMs: 0,
          guardrailMs: 0,
          totalMs: 0,
        },
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Convert Blob to Base64 data string
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(",")[1] || "";
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Stop recording active audio and clean up all listeners
  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (speechPauseTimeoutRef.current) {
      clearTimeout(speechPauseTimeoutRef.current);
      speechPauseTimeoutRef.current = null;
    }
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (err) {
        // ignore
      }
      audioContextRef.current = null;
    }
    if (liveSpeechRecognitionRef.current) {
      try {
        liveSpeechRecognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
      liveSpeechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn("Could not stop MediaRecorder cleanly:", err);
      }
    }
    setIsRecording(false);
  };

  // Send recorded audio to Sarvam STT backend
  const processRecordedAudio = async (mimeType: string) => {
    setIsTranscribing(true);
    setSpeechError(null);

    // Release microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const chunks = audioChunksRef.current;
    if (!chunks || chunks.length === 0) {
      setIsTranscribing(false);
      setSpeechError(
        language === "hi"
          ? "कोई आवाज़ रिकॉर्ड नहीं हुई। कृपया पुनः बोलें।"
          : "No audio was recorded. Please tap the mic and speak clearly."
      );
      return;
    }

    const audioBlob = new Blob(chunks, { type: mimeType || "audio/webm" });
    if (audioBlob.size < 100) {
      setIsTranscribing(false);
      setSpeechError(
        language === "hi"
          ? "रिकॉर्डिंग बहुत छोटी थी। कृपया माइक पर टैप करके स्पष्ट बोलें।"
          : "Voice recording was too short. Please tap the mic and speak clearly."
      );
      return;
    }

    try {
      const base64Audio = await blobToBase64(audioBlob);

      const res = await fetch("/api/stt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType: audioBlob.type || "audio/webm",
          language,
        }),
      });

      let data: any = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (jsonErr) {
          console.warn("Failed to parse STT JSON response:", jsonErr);
        }
      } else {
        const text = await res.text();
        console.warn("Non-JSON STT server response:", text.slice(0, 150));
      }

      if (res.ok && data?.success && data?.transcript) {
        setInputQuery(data.transcript);
        setSpeechError(null);
        // Automatically flow transcript to the RAG pipeline unchanged (auto-submit)
        handleQuery(data.transcript, {
          sttMs: data.sttMs,
          sttProvider: data.provider || "Sarvam AI Saaras STT",
        });
      } else if (inputQuery && inputQuery.trim().length > 0) {
        // If Sarvam API had a temporary issue but live preview already captured user speech:
        console.log("Using live captured speech fallback:", inputQuery);
        setSpeechError(null);
        handleQuery(inputQuery.trim(), {
          sttMs: data?.sttMs || 0,
          sttProvider: "Live Speech Recognition (Fallback)",
        });
      } else {
        console.warn("Sarvam STT failed:", data);
        if (data?.isKeyMissing) {
          setSpeechError(
            language === "hi"
              ? "SARVAM_API_KEY कॉन्फ़िगर नहीं है। आप नीचे सीधे टाइप कर सकते हैं।"
              : "SARVAM_API_KEY is not set in environment variables. You can type your question directly below."
          );
        } else {
          setSpeechError(
            data?.error ||
              (language === "hi"
                ? "आवाज़ पहचानी नहीं जा सकी। आप नीचे सीधे लिख सकते हैं।"
                : "Speech-to-text failed. You can type your question directly below.")
          );
        }
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    } catch (err: any) {
      console.error("STT Request Error:", err);
      if (inputQuery && inputQuery.trim().length > 0) {
        // Fallback to captured query
        setSpeechError(null);
        handleQuery(inputQuery.trim(), {
          sttMs: 0,
          sttProvider: "Live Speech Recognition (Fallback)",
        });
      } else {
        setSpeechError(
          language === "hi"
            ? "ऑडियो प्रोसेसिंग में समस्या हुई। कृपया नीचे सीधे टाइप करें।"
            : "Error processing audio transcription. Please type your query directly below."
        );
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  // Start recording user's voice via MediaRecorder with live speech preview and silence auto-submit
  const startRecording = async () => {
    stopAutoTyping();
    setSpeechError(null);
    setInputQuery("");
    hasSpokenRef.current = false;
    silenceStartRef.current = null;

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setSpeechError(
        "Microphone recording is not supported in this browser environment. Please type your query."
      );
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        await processRecordedAudio(mimeType);
      };

      recorder.start(100);
      setIsRecording(true);

      // 1. Web Audio API Voice Activity & Silence Detection for Auto-Submit
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.3;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          vadIntervalRef.current = setInterval(() => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") {
              return;
            }

            analyser.getByteTimeDomainData(dataArray);

            // Compute RMS volume
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              const val = (dataArray[i] - 128) / 128;
              sum += val * val;
            }
            const rms = Math.sqrt(sum / bufferLength);

            const now = Date.now();
            // Voice activity threshold
            if (rms > 0.02) {
              hasSpokenRef.current = true;
              silenceStartRef.current = null;
            } else if (hasSpokenRef.current) {
              // User has spoken; measure continuous silence duration
              if (!silenceStartRef.current) {
                silenceStartRef.current = now;
              } else if (now - silenceStartRef.current >= 1300) {
                // ~1.3 seconds of silence after speaking -> Auto Stop & Submit!
                console.log("Auto-submitting query: silence detected after speech");
                stopRecording();
              }
            }
          }, 100);
        }
      } catch (vadErr) {
        console.debug("Web Audio VAD initialization notice:", vadErr);
      }

      // 2. Start live interim speech recognition for instantaneous preview and pause detection
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const liveRec = new SpeechRecognition();
          liveSpeechRecognitionRef.current = liveRec;
          liveRec.continuous = true;
          liveRec.interimResults = true;
          liveRec.lang = language === "hi" ? "hi-IN" : "en-US";

          liveRec.onresult = (event: any) => {
            let interimTranscript = "";
            let finalTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }

            const currentLiveText = finalTranscript || interimTranscript;
            if (currentLiveText) {
              setInputQuery(currentLiveText);
              hasSpokenRef.current = true;
              silenceStartRef.current = null;

              // Reset speech pause timer
              if (speechPauseTimeoutRef.current) {
                clearTimeout(speechPauseTimeoutRef.current);
              }
              // Auto-submit after 1.4s pause in speech recognition events
              speechPauseTimeoutRef.current = setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                  console.log("Speech recognition pause detected -> auto submitting");
                  stopRecording();
                }
              }, 1400);
            }
          };

          liveRec.onspeechend = () => {
            if (hasSpokenRef.current) {
              if (speechPauseTimeoutRef.current) {
                clearTimeout(speechPauseTimeoutRef.current);
              }
              speechPauseTimeoutRef.current = setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                  stopRecording();
                }
              }, 800);
            }
          };

          liveRec.onerror = (e: any) => {
            console.debug("Live interim preview notice:", e.error);
          };

          liveRec.start();
        } catch (e) {
          console.debug("Live interim preview speech recognition not active:", e);
        }
      }

      // Automatic safety stop after 20 seconds of speaking
      recordingTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          stopRecording();
        }
      }, 20000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setIsRecording(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setSpeechError(
          language === "hi"
            ? "माइक्रोफ़ोन अनुमति नहीं मिली। कृपया ब्राउज़र में अनुमति दें या नीचे लिखें।"
            : "Microphone permission denied. Please allow microphone access in browser or type below."
        );
      } else {
        setSpeechError(
          `Could not access microphone: ${err.message || err}. You can type below.`
        );
      }
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleMicClick = () => {
    if (isLoading || isTranscribing) return;

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Trigger auto-typer animation for a question according to user preferences
  const triggerAutoTyperForQuestion = (targetText: string, shouldAutoSubmit: boolean = autoSubmitAfterTyping) => {
    stopAutoTyping();
    if (!targetText) return;

    if (typerSpeed === "instant") {
      setInputQuery(targetText);
      if (shouldAutoSubmit) {
        handleQuery(targetText);
      }
      return;
    }

    setIsAutoTyping(true);
    setInputQuery("");
    let index = 0;
    const intervalMs = typerSpeed === "fast" ? 18 : 38;

    const typeNextChar = () => {
      if (index < targetText.length) {
        index++;
        setInputQuery(targetText.slice(0, index));
        autoTypeTimeoutRef.current = setTimeout(typeNextChar, intervalMs);
      } else {
        setIsAutoTyping(false);
        autoTypeTimeoutRef.current = null;
        if (shouldAutoSubmit) {
          setTimeout(() => {
            handleQuery(targetText);
          }, 250);
        }
      }
    };

    typeNextChar();
  };

  const skipAnswerTyping = () => {
    if (answerTypeTimeoutRef.current) {
      clearTimeout(answerTypeTimeoutRef.current);
      answerTypeTimeoutRef.current = null;
    }
    if (currentResponse) {
      setDisplayedAnswer(currentResponse.answer);
    }
    setIsAnswerTyping(false);
  };

  return (
    <div className="min-h-screen bg-[#063D2A] text-[#D8F0E4] font-sans antialiased flex flex-col selection:bg-[#FFE500] selection:text-[#063D2A]">
      {/* Top Navigation Header */}
      <header className="w-full border-b border-[#0F8054]/40 bg-[#063D2A]/90 backdrop-blur sticky top-0 z-30 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HackerHouseGoaLogo size="md" />
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-semibold text-[#FFE500] uppercase tracking-wider">
                Voice RAG System
              </span>
              <span className="text-[11px] text-[#D8F0E4]/70">
                MSMARCO-XI English & हिन्दी
              </span>
            </div>
          </div>

          {/* Controls: Language Toggle + Strategy Selector + Benchmark Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Switcher */}
            <div className="flex bg-[#0A6A47] p-0.5 rounded-lg border border-[#0F8054]">
              <button
                id="lang-en-btn"
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === "en"
                    ? "bg-[#FFE500] text-[#063D2A] shadow-sm"
                    : "text-[#D8F0E4] hover:text-white"
                }`}
              >
                English
              </button>
              <button
                id="lang-hi-btn"
                onClick={() => setLanguage("hi")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === "hi"
                    ? "bg-[#FFE500] text-[#063D2A] shadow-sm"
                    : "text-[#D8F0E4] hover:text-white"
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Pipeline Mode Selector */}
            <div className="relative flex items-center">
              <select
                id="pipeline-mode-select"
                value={pipelineMode}
                onChange={(e) => setPipelineMode(e.target.value as "turbo" | "gemini")}
                className="bg-[#0A6A47] text-[#FFE500] border border-[#FFE500]/40 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FFE500] cursor-pointer shadow-sm"
              >
                <option value="turbo">⚡ Turbo (&lt;200ms Target)</option>
                <option value="gemini">☁️ Gemini Cloud LLM</option>
              </select>
            </div>

            {/* Chunking Strategy Dropdown */}
            <div className="relative flex items-center">
              <select
                id="strategy-select"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as ChunkingStrategy)}
                className="bg-[#0A6A47] text-white border border-[#0F8054] text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FFE500] cursor-pointer"
              >
                <option value="metadata_hybrid">Strategy: Metadata-Aware Hybrid</option>
                <option value="semantic">Strategy: Semantic Boundary</option>
                <option value="fixed">Strategy: Fixed Sliding Window</option>
                <option value="ensemble">Strategy: Ensemble (RRF Fusion)</option>
              </select>
            </div>

            {/* Benchmark Suite Trigger */}
            <button
              id="open-benchmark-btn"
              onClick={() => setIsBenchmarkOpen(true)}
              className="bg-[#0A6A47] hover:bg-[#0F8054] text-[#FFE500] border border-[#FFE500]/30 text-xs font-semibold rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Benchmark (P50/P70/P100)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Central Voice Input Hero */}
        <section className="flex flex-col items-center justify-center text-center pt-2 pb-4">
          <AskAnythingHeroMic
            isListening={isRecording}
            statusText={
              isRecording
                ? language === "hi"
                  ? "सुन रहे हैं..."
                  : "LISTENING..."
                : isTranscribing
                ? language === "hi"
                  ? "ट्रांसक्राइब..."
                  : "TRANSCRIBING..."
                : isLoading
                ? language === "hi"
                  ? "प्रोसेसिंग..."
                  : "SEARCHING..."
                : undefined
            }
            onClick={handleMicClick}
            disabled={isLoading || isTranscribing}
          />

          {/* STT Integration Notice */}
          <div className="mt-3 flex flex-col items-center gap-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A6A47]/40 border border-[#0F8054] text-[11px] text-[#D8F0E4]/90">
              <span
                className={`w-2 h-2 rounded-full ${
                  isRecording
                    ? "bg-[#FD077E] animate-ping"
                    : isTranscribing
                    ? "bg-[#FFE500] animate-pulse"
                    : isLoading
                    ? "bg-[#18A66A] animate-pulse"
                    : "bg-[#FFE500]"
                }`}
              />
              <span>
                {isRecording
                  ? language === "hi"
                    ? "आवाज़ रिकॉर्ड हो रही है... बोलने के बाद माइक पर पुनः टैप करें"
                    : "Listening to your voice... Tap mic when done speaking"
                  : isTranscribing
                  ? language === "hi"
                    ? "Sarvam Saaras STT द्वारा आवाज़ को टेक्स्ट में बदला जा रहा है..."
                    : "Transcribing with Sarvam Saaras STT (English & हिन्दी)..."
                  : isLoading
                  ? language === "hi"
                    ? "MSMARCO-XI से उत्तर खोजा जा रहा है..."
                    : "Executing RAG pipeline and checking grounding..."
                  : language === "hi"
                  ? "माइक पर टैप करके बोलें (Sarvam STT) या नीचे टाइप करें"
                  : "Tap mic to speak (Sarvam STT) or type below"}
              </span>
            </div>
            {speechError && (
              <div className="text-xs text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-lg">
                {speechError}
              </div>
            )}
          </div>

          {/* Text/Transcript Input Bar with Live Typer Preference Controls */}
          <div className="w-full max-w-2xl mt-4 relative flex flex-col gap-2">
            {/* Typer Preference Quick Bar */}
            <div className="flex items-center justify-between px-1 text-xs text-[#D8F0E4]/80">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#FFE500] flex items-center gap-1">
                  <Keyboard className="w-3.5 h-3.5" />
                  Auto-Typer Live Preview:
                </span>
                <div className="inline-flex bg-[#0A6A47]/70 p-0.5 rounded-lg border border-[#0F8054]">
                  {(["smooth", "fast", "instant"] as TyperSpeed[]).map((spd) => (
                    <button
                      key={spd}
                      id={`typer-speed-${spd}-btn`}
                      onClick={() => setTyperSpeed(spd)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-all ${
                        typerSpeed === spd
                          ? "bg-[#FFE500] text-[#063D2A] font-bold shadow-xs"
                          : "text-[#D8F0E4]/80 hover:text-white"
                      }`}
                    >
                      {spd === "smooth" ? "Smooth" : spd === "fast" ? "Fast" : "Instant"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] select-none hover:text-[#FFE500] transition-colors">
                  <input
                    type="checkbox"
                    checked={autoSubmitAfterTyping}
                    onChange={(e) => setAutoSubmitAfterTyping(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-[#0A6A47] cursor-pointer"
                  />
                  <span>Auto-Submit</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="p-1 text-[#D8F0E4]/70 hover:text-[#FFE500] rounded hover:bg-[#0A6A47]/50 transition-colors"
                  title="More Typer Preferences"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Extended Preferences Accordion */}
            {showPreferences && (
              <div className="bg-[#08150E]/90 border border-[#0F8054] rounded-xl p-3 text-xs text-[#D8F0E4] flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#FFE500]" />
                  <span>Answer Streaming / Typewriter Effect:</span>
                  <button
                    onClick={() => setAnswerTypewriterEnabled(!answerTypewriterEnabled)}
                    className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] ${
                      answerTypewriterEnabled
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {answerTypewriterEnabled ? "Enabled" : "Disabled"}
                  </button>
                </div>
                <div className="text-[11px] text-[#D8F0E4]/70">
                  {typerSpeed === "instant"
                    ? "Instant mode: questions populate with 0 latency."
                    : `Active typing rate: ${typerSpeed === "fast" ? "15ms/char" : "35ms/char"}`}
                </div>
              </div>
            )}

            {/* Input Form with Enhanced Input Styling, Live Speech Preview & Auto-Typer Indicator */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleQuery(inputQuery);
              }}
              className={`flex items-center rounded-2xl bg-white text-[#08150E] shadow-2xl p-1.5 border transition-all duration-300 ${
                isRecording
                  ? "border-[#FD077E] ring-4 ring-[#FD077E]/25 shadow-lg shadow-[#FD077E]/10 bg-[#FFFDFE]"
                  : isTranscribing
                  ? "border-[#FFE500] ring-4 ring-[#FFE500]/30 shadow-[#FFE500]/10 bg-[#FFFEFA]"
                  : isAutoTyping
                  ? "border-[#FFE500] ring-4 ring-[#FFE500]/30 shadow-[#FFE500]/10"
                  : "border-[#D8F0E4] focus-within:ring-2 focus-within:ring-[#FFE500] focus-within:border-[#0A6A47]"
              }`}
            >
              <div className="relative flex-1 flex items-center">
                <input
                  ref={inputRef}
                  id="voice-transcript-input"
                  type="text"
                  value={inputQuery}
                  onChange={(e) => {
                    stopAutoTyping();
                    setInputQuery(e.target.value);
                  }}
                  placeholder={
                    isRecording
                      ? language === "hi"
                        ? "बोलिए... जैसे ही आप रुकेंगे, प्रश्न स्वतः सबमिट हो जाएगा..."
                        : "Speak now — will automatically submit once you finish speaking..."
                      : isTranscribing
                      ? language === "hi"
                        ? "Sarvam Saaras STT ऑडियो ट्रांसक्राइब कर रहा है..."
                        : "Transcribing audio with Sarvam Saaras STT..."
                      : language === "hi"
                      ? "यहाँ प्रश्न टाइप करें या सैंपल चुनें (लाइव ऑटो-टाइपर सक्रिय)..."
                      : "Type a question or pick a sample below to see live auto-typer preview..."
                  }
                  className={`w-full px-4 py-3 bg-transparent text-sm sm:text-[15px] font-medium focus:outline-none tracking-normal transition-colors ${
                    isRecording ? "text-[#08150E] placeholder:text-[#FD077E]/70" : "text-[#08150E] placeholder:text-gray-400"
                  }`}
                />

                {/* Live Speech Speaking Preview & Auto-Submit Badge */}
                {isRecording && (
                  <div className="absolute right-8 sm:right-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FD077E]/15 border border-[#FD077E]/50 text-[#FD077E] text-[10px] sm:text-[11px] font-bold tracking-wide animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FD077E] animate-ping" />
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3 animate-bounce" />
                      {language === "hi" ? "लाइव आवाज़ • रुकने पर स्वतः सबमिट" : "Live Speech • Auto-Submits on Stop"}
                    </span>
                  </div>
                )}

                {/* Transcribing Active Badge */}
                {!isRecording && isTranscribing && (
                  <div className="absolute right-8 sm:right-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FFE500]/25 border border-[#FFE500] text-[#063D2A] text-[10px] sm:text-[11px] font-bold tracking-wide animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#063D2A] animate-ping" />
                    <span>{language === "hi" ? "Sarvam STT..." : "Sarvam STT..."}</span>
                  </div>
                )}

                {/* Live Auto-Typing Active Badge */}
                {!isRecording && !isTranscribing && isAutoTyping && (
                  <div className="absolute right-8 sm:right-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FFE500]/20 border border-[#FFE500] text-[#063D2A] text-[10px] font-bold tracking-wide animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#063D2A] animate-ping" />
                    <span>Auto-typing...</span>
                  </div>
                )}

                {/* Clear Button */}
                {inputQuery && !isLoading && !isRecording && (
                  <button
                    type="button"
                    onClick={() => {
                      stopAutoTyping();
                      setInputQuery("");
                    }}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors mr-1"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Submit Button or Cancel Typer Button */}
              {isAutoTyping ? (
                <button
                  type="button"
                  onClick={() => {
                    stopAutoTyping();
                    if (inputQuery.trim()) {
                      handleQuery(inputQuery);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-[#FFE500] text-[#063D2A] hover:bg-[#FFE500]/90 active:scale-95 shadow-sm transition-all"
                >
                  <span>Skip Typer</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  id="submit-query-btn"
                  type="submit"
                  disabled={isLoading || !inputQuery.trim()}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    isLoading || !inputQuery.trim()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#063D2A] text-[#FFE500] hover:bg-[#0A6A47] active:scale-95 shadow-md hover:shadow-lg"
                  }`}
                >
                  {isLoading ? "Processing..." : "Ask RAG"}
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Sample Prompts with Live Auto-Typer Trigger */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-2xl">
            <span className="text-xs text-[#D8F0E4]/70 mr-1 flex items-center gap-1">
              <Play className="w-3 h-3 text-[#FFE500]" />
              Auto-type sample:
            </span>
            {(sampleQueries[language] || sampleQueries.en || []).map((sample, idx) => (
              <button
                key={idx}
                id={`sample-prompt-${idx}`}
                onClick={() => triggerAutoTyperForQuestion(sample.q, autoSubmitAfterTyping)}
                className="text-xs px-2.5 py-1 rounded-full bg-[#0A6A47]/60 hover:bg-[#0A6A47] text-[#D8F0E4] border border-[#0F8054] transition-all hover:scale-105 hover:border-[#FFE500]/60 active:scale-95"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </section>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="bg-white/95 text-[#063D2A] rounded-2xl p-6 text-center shadow-lg border border-[#D8F0E4] flex flex-col items-center gap-3 animate-pulse">
            <div className="w-8 h-8 border-3 border-[#0A6A47] border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-bold">
              Executing Gemini Function Calling & MSMARCO-XI Retrieval...
            </div>
            <p className="text-xs text-gray-500">
              Retrieving context chunks → Grounding verification guardrail → Answer synthesis
            </p>
          </div>
        )}

        {/* RAG Answer & Grounded Context Display */}
        {currentResponse && !isLoading && (
          <div className="flex flex-col gap-6">
            {/* Answer Card */}
            <div
              id="rag-answer-card"
              className="bg-white text-[#08150E] rounded-2xl p-6 shadow-xl border border-[#D8F0E4]"
            >
              {/* Header Status & Guardrail */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#0A6A47]" />
                  <h3 className="font-serif font-bold text-lg text-[#063D2A]">
                    Grounded Response
                  </h3>
                </div>

                {/* Guardrail Status Badge */}
                <div>
                  {currentResponse.status === "grounded_success" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Grounded in MSMARCO (Confidence: {((currentResponse.groundingConfidence || 0) * 100).toFixed(0)}%)
                    </span>
                  )}
                  {currentResponse.status === "insufficient_information" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      Insufficient Context (Hallucination Prevented)
                    </span>
                  )}
                  {currentResponse.status === "guardrail_blocked" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold">
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      Guardrail: Off-Topic / Unsafe Query Blocked
                    </span>
                  )}
                </div>
              </div>

              {/* Answer Content with Live Typewriter Support */}
              <div className="relative text-base text-[#08150E] leading-relaxed font-sans mb-4 min-h-[48px]">
                <span>{displayedAnswer || currentResponse.answer}</span>
                {isAnswerTyping && (
                  <span className="inline-block w-2 h-4 bg-[#0A6A47] ml-1 animate-pulse align-middle" />
                )}
                {isAnswerTyping && (
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={skipAnswerTyping}
                      className="text-xs text-[#0A6A47] hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Reveal full answer immediately</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Query & Strategy metadata */}
              <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 gap-2">
                <div>
                  <span className="font-semibold text-gray-700">Transcript:</span> "{currentResponse.transcript}"
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-gray-100 px-2 py-0.5 rounded font-mono text-[11px]">
                    Strategy: {currentResponse.strategy}
                  </span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded font-mono text-[11px] uppercase">
                    {currentResponse.language}
                  </span>
                </div>
              </div>
            </div>

            {/* Latency & Telemetry Logger Component */}
            <LatencyLogger latency={currentResponse.latency || { sttMs: 0, retrievalMs: 0, generationMs: 0, guardrailMs: 0, totalMs: 0 }} />

            {/* Supporting Retrieved Context Chunks */}
            {(currentResponse.retrievedPassages?.length || 0) > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#D8F0E4] flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#FFE500]" />
                    Supporting Retrieved Passages ({currentResponse.retrievedPassages?.length || 0})
                  </h4>
                  <span className="text-xs text-[#D8F0E4]/70">
                    Dataset: ai4bharat/MSMARCO-XI
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {(currentResponse.retrievedPassages || []).map((chunkItem, idx) => (
                    <PassageCard key={idx} retrievedChunk={chunkItem} />
                  ))}
                </div>
              </div>
            )}

            {/* Gemini Function Calling Orchestration Trace */}
            {(currentResponse.toolCalls?.length || 0) > 0 && (
              <div className="bg-[#08150E]/80 rounded-xl p-4 border border-[#0F8054]/50 text-xs">
                <div className="flex items-center gap-2 text-[#FFE500] font-mono font-bold mb-2">
                  <Terminal className="w-4 h-4" />
                  <span>Gemini Tool Call Trace: retrieve_msmarco_passages</span>
                </div>
                {(currentResponse.toolCalls || []).map((tc, i) => (
                  <div key={i} className="font-mono text-[#D8F0E4]/90 space-y-1">
                    <div>
                      <span className="text-[#FD077E]">Method:</span> {tc.toolName} ({tc.latencyMs}ms)
                    </div>
                    <div className="text-gray-400">
                      <span className="text-[#18A66A]">Args:</span> {JSON.stringify(tc.arguments)}
                    </div>
                    <div className="text-emerald-400">
                      <span className="text-[#FFE500]">Result:</span> {tc.resultSummary}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Benchmark Modal */}
      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        strategy={strategy}
      />
    </div>
  );
}
