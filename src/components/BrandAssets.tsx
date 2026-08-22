import React from "react";

/**
 * Brand Kit Exact Hex Values:
 * Primary Dark Green: #063D2A
 * Primary Green: #0A6A47
 * Secondary Green: #0F8054
 * Teal: #18A66A
 * Yellow: #FFE500
 * Pink: #FD077E
 * Text / Mint White: #D8F0E4
 * Black: #08150E
 */

export const HackerHouseGoaLogo: React.FC<{
  className?: string;
  size?: "sm" | "md" | "lg";
}> = ({ className = "", size = "md" }) => {
  const heightClass =
    size === "sm" ? "h-9" : size === "lg" ? "h-16" : "h-12";

  return (
    <div
      id="hh-goa-brand-logo"
      className={`relative inline-flex items-center select-none justify-center px-4 py-1.5 rounded-lg bg-[#063D2A] border border-[#0F8054]/40 shadow-sm ${heightClass} ${className}`}
      title="Hacker House Goa"
    >
      <div className="relative flex flex-col items-center justify-center font-serif leading-none tracking-tight">
        {/* Top Word: HACKER */}
        <span
          className="text-[#FFE500] font-black uppercase tracking-wider text-base sm:text-lg font-serif"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.12em" }}
        >
          HACKER
        </span>
        {/* Bottom Word: HOUSE */}
        <span
          className="text-[#FFE500] font-black uppercase tracking-widest text-base sm:text-lg font-serif mt-[-2px]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.18em" }}
        >
          HOUSE
        </span>

        {/* Pink "गोवा" Overlay Badge */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: "rotate(-6deg) translateY(-1px)" }}
        >
          <span
            className="text-[#FD077E] font-extrabold text-2xl sm:text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] font-sans"
            style={{
              textShadow: "0 0 10px rgba(253, 7, 126, 0.4)",
              letterSpacing: "-0.02em",
            }}
          >
            गोवा
          </span>
        </div>
      </div>
    </div>
  );
};

export const AskAnythingHeroMic: React.FC<{
  isListening?: boolean;
  statusText?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ isListening = false, statusText, onClick, disabled = false }) => {
  return (
    <div
      id="ask-anything-hero-container"
      className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-105 active:scale-95"
      onClick={!disabled ? onClick : undefined}
    >
      {/* Outer Cream/Mint Base Card background */}
      <div className="absolute inset-0 rounded-3xl bg-[#D8F0E4]/90 shadow-xl border border-[#D8F0E4] p-3 flex items-center justify-center">
        {/* Top-Right Yellow Accent Mic Badge */}
        <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#FFE500] shadow-md flex items-center justify-center border border-[#FFE500]/60 z-20">
          <svg
            className="w-5 h-5 text-[#063D2A]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </div>

        {/* Circular Pink Dashed Ring with Pulse animation when listening */}
        <div
          className={`relative w-44 h-44 sm:w-48 sm:h-48 rounded-full flex items-center justify-center border-4 border-dashed border-[#FD077E] p-2 ${
            isListening ? "animate-pulse ring-4 ring-[#FD077E]/40" : ""
          }`}
          style={{ animationDuration: "1.8s" }}
        >
          {/* Inner Dark Green Solid Circle */}
          <div className="w-full h-full rounded-full bg-[#063D2A] flex items-center justify-center shadow-inner relative group">
            {/* Center Mic Icon in Mint White */}
            <svg
              className={`w-16 h-16 text-[#D8F0E4] transition-all duration-300 ${
                isListening ? "scale-110 text-[#FFE500]" : "group-hover:scale-105"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
              <line x1="8" x2="16" y1="22" y2="22" />
            </svg>

            {/* Ripple Wave when active */}
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FD077E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#FD077E]"></span>
              </span>
            )}
          </div>
        </div>

        {/* Bottom Left "ASK ANYTHING" Badge with Audio Waveforms */}
        <div
          id="ask-anything-badge"
          className="absolute -bottom-2 left-2 bg-white rounded-xl px-3.5 py-2 shadow-lg border border-gray-100 flex flex-col gap-1 z-20"
          style={{ transform: "rotate(-3deg)" }}
        >
          {/* Audio wave bars */}
          <div className="flex items-end gap-1 h-3">
            <span
              className={`w-1 bg-[#0A6A47] rounded-full transition-all duration-300 ${
                isListening ? "h-3.5 animate-bounce" : "h-2"
              }`}
            />
            <span
              className={`w-1 bg-[#0A6A47] rounded-full transition-all duration-300 ${
                isListening ? "h-4 animate-bounce delay-100" : "h-3"
              }`}
            />
            <span
              className={`w-1 bg-[#0A6A47] rounded-full transition-all duration-300 ${
                isListening ? "h-2.5 animate-bounce delay-150" : "h-1.5"
              }`}
            />
            <span
              className={`w-1 bg-[#0A6A47] rounded-full transition-all duration-300 ${
                isListening ? "h-4 animate-bounce delay-75" : "h-3"
              }`}
            />
            <span
              className={`w-1 bg-[#0A6A47] rounded-full transition-all duration-300 ${
                isListening ? "h-2 animate-bounce delay-200" : "h-1"
              }`}
            />
          </div>
          <span
            className="text-[10px] font-black uppercase tracking-wider text-[#FD077E]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {statusText || (isListening ? "LISTENING..." : "ASK ANYTHING")}
          </span>
        </div>
      </div>
    </div>
  );
};
