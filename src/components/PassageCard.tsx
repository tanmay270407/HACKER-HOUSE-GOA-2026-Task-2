import React from "react";
import { RetrievedChunk } from "../types.ts";
import { ExternalLink, CheckCircle2, FileText, Database } from "lucide-react";

export const PassageCard: React.FC<{
  retrievedChunk: RetrievedChunk;
}> = ({ retrievedChunk }) => {
  const { chunk, score, rank, matchType } = retrievedChunk;
  const isPositiveGroundTruth = chunk.isSelectedGroundTruth;

  return (
    <div
      id={`passage-card-${chunk.chunkId}`}
      className="bg-white/95 text-[#08150E] rounded-xl p-4 shadow-sm border border-[#D8F0E4] hover:shadow-md transition-all duration-200"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#063D2A] text-[#FFE500] text-xs font-bold font-serif">
            #{rank}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#0A6A47]/10 text-[#0A6A47]">
            {matchType}
          </span>
          {isPositiveGroundTruth && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#18A66A]/20 text-[#0A6A47] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#18A66A]" />
              MSMARCO Ground Truth
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
            Score: {(score * 100).toFixed(1)}%
          </span>
          {chunk.metadata.topic && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-gray-50 text-gray-600">
              {chunk.metadata.topic}
            </span>
          )}
        </div>
      </div>

      {/* Passage text */}
      <p className="text-sm leading-relaxed text-[#08150E] font-sans whitespace-pre-line mb-3">
        {chunk.text}
      </p>

      {/* Metadata footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">
            Doc ID: {chunk.docId} | Tokens: {chunk.tokenCount}
          </span>
          {chunk.metadata.passageType === "relevant" ? (
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
              Selected Passage
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 bg-slate-50 px-1.5 py-0.2 rounded">
              Context Candidate
            </span>
          )}
        </div>

        {chunk.metadata.url && (
          <a
            href={chunk.metadata.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#0A6A47] hover:text-[#063D2A] hover:underline font-medium"
          >
            Source <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};
