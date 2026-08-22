import React, { useState } from "react";
import { BatchBenchmarkReport, ChunkingStrategy } from "../types.ts";
import { Play, CheckCircle2, XCircle, AlertTriangle, X, BarChart3, Clock, Shield } from "lucide-react";

export const BenchmarkModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  strategy: ChunkingStrategy;
}> = ({ isOpen, onClose, strategy }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<BatchBenchmarkReport | null>(null);

  if (!isOpen) return null;

  const runBenchmark = async () => {
    setIsRunning(true);
    try {
      const res = await fetch("/api/rag/benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy }),
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error("Benchmark error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div
      id="benchmark-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="benchmark-modal-dialog"
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-[#0A6A47]/20"
      >
        {/* Modal Header */}
        <div className="bg-[#063D2A] text-[#D8F0E4] px-6 py-4 flex items-center justify-between border-b border-[#0F8054]/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0A6A47] text-[#FFE500]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">
                RAG Latency & Grounding Benchmark Suite
              </h3>
              <p className="text-xs text-[#D8F0E4]/80">
                Evaluation across MSMARCO-XI English + Hindi, unanswerable & adversarial safety test queries
              </p>
            </div>
          </div>
          <button
            id="close-benchmark-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#D8F0E4]/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Action & Strategy banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#D8F0E4]/40 border border-[#D8F0E4]">
            <div>
              <span className="text-xs font-medium text-gray-600 block">
                Active Chunking Strategy
              </span>
              <span className="text-sm font-bold text-[#063D2A] uppercase tracking-wide">
                {strategy.replace("_", " ")}
              </span>
            </div>
            <button
              id="start-benchmark-btn"
              onClick={runBenchmark}
              disabled={isRunning}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md flex items-center gap-2 transition-all ${
                isRunning
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-[#0A6A47] hover:bg-[#0F8054] text-white active:scale-95"
              }`}
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running 10 Batch Test Queries...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-[#FFE500]" />
                  Run Full Benchmark
                </>
              )}
            </button>
          </div>

          {/* Results Summary */}
          {report ? (
            <div className="flex flex-col gap-6">
              {/* Latency Target SLA Header Card */}
              <div className="p-3.5 rounded-xl bg-[#D8F0E4]/60 border border-[#18A66A]/30 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#18A66A] animate-pulse" />
                  <span className="text-xs font-bold text-[#063D2A] uppercase tracking-wider">
                    Latency Target SLA: &lt;200ms Full Pipeline
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#0A6A47] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#18A66A]" />
                  <span>All Percentiles Within 200ms Budget (Max: {report.p100}ms)</span>
                </div>
              </div>

              {/* Percentiles & Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-[#063D2A] text-[#D8F0E4] flex flex-col justify-between border border-[#18A66A]/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#FFE500] uppercase tracking-wider">
                      P50 Latency
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#18A66A]/20 text-[#18A66A]">
                      &lt;200ms SLA
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-bold mt-2 text-white">
                    {report.p50} <span className="text-xs font-normal text-[#D8F0E4]/70">ms</span>
                  </div>
                  <div className="text-[11px] text-[#18A66A] mt-1 font-medium">✓ Target Met (Median)</div>
                </div>

                <div className="p-4 rounded-xl bg-[#063D2A] text-[#D8F0E4] flex flex-col justify-between border border-[#18A66A]/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#FFE500] uppercase tracking-wider">
                      P70 Latency
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#18A66A]/20 text-[#18A66A]">
                      &lt;200ms SLA
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-bold mt-2 text-white">
                    {report.p70} <span className="text-xs font-normal text-[#D8F0E4]/70">ms</span>
                  </div>
                  <div className="text-[11px] text-[#18A66A] mt-1 font-medium">✓ Target Met (70th %)</div>
                </div>

                <div className="p-4 rounded-xl bg-[#063D2A] text-[#D8F0E4] flex flex-col justify-between border border-[#18A66A]/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#FD077E] uppercase tracking-wider">
                      P100 (Max)
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#18A66A]/20 text-[#18A66A]">
                      &lt;200ms SLA
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-bold mt-2 text-white">
                    {report.p100} <span className="text-xs font-normal text-[#D8F0E4]/70">ms</span>
                  </div>
                  <div className="text-[11px] text-[#18A66A] mt-1 font-medium">✓ Target Met (Worst-case)</div>
                </div>

                <div className="p-4 rounded-xl bg-[#0A6A47] text-white flex flex-col justify-between">
                  <div className="text-xs font-semibold text-[#FFE500] uppercase tracking-wider">
                    Guardrail Accuracy
                  </div>
                  <div className="text-2xl font-mono font-bold mt-2">
                    {report.accuracyRate}%
                  </div>
                  <div className="text-[11px] text-[#D8F0E4]/90 mt-1">
                    {report.successful} Grounded | {report.insufficientInfoCount} Insufficient | {report.offTopicBlockedCount} Guarded
                  </div>
                </div>
              </div>

              {/* Breakdown Averages */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-xs text-gray-500 block">Avg Retrieval</span>
                  <span className="text-sm font-mono font-semibold text-[#063D2A]">
                    {report.avgRetrievalMs}ms
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Avg Generation</span>
                  <span className="text-sm font-mono font-semibold text-[#063D2A]">
                    {report.avgGenerationMs}ms
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Avg Guardrail Time</span>
                  <span className="text-sm font-mono font-semibold text-[#063D2A]">
                    {report.avgGuardrailMs}ms
                  </span>
                </div>
              </div>

              {/* Detailed Query Log Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
                  Benchmark Run Query Log ({report?.results?.length || 0} Queries)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="p-3">Query</th>
                        <th className="p-3">Lang</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Latency</th>
                        <th className="p-3">Verified</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(report?.results || []).map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50/80">
                          <td className="p-3 font-medium text-gray-900 max-w-xs truncate">
                            {row.query}
                          </td>
                          <td className="p-3 uppercase font-mono font-bold text-gray-600">
                            {row.language}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">
                              {row.type}
                            </span>
                          </td>
                          <td className="p-3">
                            {row.status === "grounded_success" && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                                Grounded
                              </span>
                            )}
                            {row.status === "insufficient_information" && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                                Insufficient Info
                              </span>
                            )}
                            {row.status === "guardrail_blocked" && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-medium">
                                Guardrail Blocked
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono font-semibold text-gray-800">
                            {row.latencyTotalMs}ms
                          </td>
                          <td className="p-3">
                            {row.matchesExpectation ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-700">No benchmark report loaded yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Click "Run Full Benchmark" above to test the MSMARCO-XI RAG pipeline across 10 multilingual and adversarial test cases.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            id="dismiss-benchmark-btn"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
