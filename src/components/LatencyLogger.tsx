import React from "react";
import { LatencyBreakdown } from "../types.ts";
import { Clock, Activity, Cpu, ShieldCheck, Mic, Zap, CheckCircle2, AlertCircle } from "lucide-react";

export const LatencyLogger: React.FC<{
  latency: LatencyBreakdown;
  className?: string;
}> = ({ latency, className = "" }) => {
  const { sttMs, retrievalMs, generationMs, guardrailMs, totalMs } = latency;

  const TARGET_BUDGET_MS = 200;
  const isWithinBudget = totalMs <= TARGET_BUDGET_MS;
  const budgetUsagePercent = Math.min(100, Math.round((totalMs / TARGET_BUDGET_MS) * 100));
  const headroomMs = Math.max(0, TARGET_BUDGET_MS - totalMs);

  const getPercent = (ms: number) => {
    if (totalMs <= 0) return 0;
    return Math.max(6, Math.min(100, Math.round((ms / totalMs) * 100)));
  };

  return (
    <div
      id="latency-logger-card"
      className={`bg-white/95 rounded-xl p-4 shadow-sm border border-[#D8F0E4] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0A6A47]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#063D2A]">
            Pipeline Latency & Telemetry
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {/* Latency Target SLA Indicator */}
          <div
            id="latency-target-badge"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-tight border transition-all ${
              isWithinBudget
                ? "bg-[#D8F0E4] text-[#063D2A] border-[#18A66A]/40"
                : "bg-amber-50 text-amber-900 border-amber-300"
            }`}
          >
            {isWithinBudget ? (
              <>
                <Zap className="w-3.5 h-3.5 text-[#18A66A] fill-current" />
                <span>Target: &lt;200ms</span>
                <span className="bg-[#0A6A47] text-[#FFE500] text-[10px] px-1.5 py-0.2 rounded-full ml-1">
                  MET
                </span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Target: &lt;200ms</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-[#063D2A] text-[#FFE500] px-3 py-1 rounded-full text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Total: {totalMs}ms</span>
          </div>
        </div>
      </div>

      {/* Target Budget Consumption Bar */}
      <div className="mb-3.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-gray-700 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#18A66A]" />
            200ms Target Budget
          </span>
          <span className="font-mono font-medium text-gray-600">
            {totalMs}ms / 200ms ({budgetUsagePercent}% consumed
            {isWithinBudget ? `, ${headroomMs}ms headroom` : ""})
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            style={{ width: `${budgetUsagePercent}%` }}
            className={`h-full transition-all duration-300 ${
              isWithinBudget ? "bg-[#18A66A]" : "bg-amber-500"
            }`}
          />
        </div>
      </div>

      {/* Progress Bar Breakdown */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex gap-0.5 mb-3">
        <div
          title={`Sarvam STT / Voice Ingestion: ${sttMs}ms`}
          style={{ width: `${getPercent(sttMs)}%` }}
          className="bg-amber-400 h-full transition-all duration-300"
        />
        <div
          title={`Retrieval: ${retrievalMs}ms`}
          style={{ width: `${getPercent(retrievalMs)}%` }}
          className="bg-[#18A66A] h-full transition-all duration-300"
        />
        <div
          title={`Generation: ${generationMs}ms`}
          style={{ width: `${getPercent(generationMs)}%` }}
          className="bg-[#0A6A47] h-full transition-all duration-300"
        />
        <div
          title={`Guardrails: ${guardrailMs}ms`}
          style={{ width: `${getPercent(guardrailMs)}%` }}
          className="bg-[#FD077E] h-full transition-all duration-300"
        />
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-gray-500 text-[11px]">
            <Mic className="w-3 h-3 text-amber-500" />
            <span>STT Ingestion</span>
          </div>
          <span className="text-sm font-semibold font-mono text-gray-900 mt-1">
            {sttMs}ms
          </span>
        </div>

        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-gray-500 text-[11px]">
            <Cpu className="w-3 h-3 text-[#18A66A]" />
            <span>Retrieval (Index)</span>
          </div>
          <span className="text-sm font-semibold font-mono text-gray-900 mt-1">
            {retrievalMs}ms
          </span>
        </div>

        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-gray-500 text-[11px]">
            <Activity className="w-3 h-3 text-[#0A6A47]" />
            <span>Generation</span>
          </div>
          <span className="text-sm font-semibold font-mono text-gray-900 mt-1">
            {generationMs}ms
          </span>
        </div>

        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-gray-500 text-[11px]">
            <ShieldCheck className="w-3 h-3 text-[#FD077E]" />
            <span>Guardrail Verification</span>
          </div>
          <span className="text-sm font-semibold font-mono text-gray-900 mt-1">
            {guardrailMs}ms
          </span>
        </div>
      </div>
    </div>
  );
};
