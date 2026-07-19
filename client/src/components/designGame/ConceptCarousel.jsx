import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fontPool } from "./FinalConceptScreen";

// Humorous score tier describer - shortened
export const getHumorousTier = (score) => {
  if (score >= 85) return "Design demigod";
  if (score >= 70) return "Certified Genius";
  if (score >= 50) return "Adequate";
  return "Back to the drawing board";
};

// Pure, responsive SVG Donut Chart showing score inside a radial progress track
function DonutChart({ label, score }) {
  const radius = 18;
  const circ = 2 * Math.PI * radius; // ~113.1
  const strokeOffset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center flex-1">
      <div className="relative h-20 w-20 flex items-center justify-center select-none">
        <svg className="h-full w-full transform -rotate-90" viewBox="0 0 40 40">
          {/* Base Background Track Donut - visible and thick */}
          <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#334155" strokeWidth="4.5" />
          {/* Progress Indicator Donut - bright cyan and thick */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="transparent"
            stroke="#00d4ff"
            strokeWidth="4.5"
            strokeDasharray={circ}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Score Value Text - centered, large, and bright white */}
        <div className="absolute text-white font-black text-sm drop-shadow-sm">
          {score}
        </div>
      </div>
      {/* Label is now bright white as requested */}
      <span className="text-[10px] font-black uppercase tracking-wider text-white mt-2.5 text-center">{label}</span>
    </div>
  );
}

export default function ConceptCarousel({ challenge, concept, ratings }) {
  const features = concept?.features || [];
  
  // Use saved font pool from concept data or fallback to standard font pool
  const activeFonts = concept?.fontPool || fontPool;
  const fontIdx = concept.fontIdx !== undefined ? concept.fontIdx : 0;
  const fontStyle = activeFonts[fontIdx] || activeFonts[0];
  
  // Slide 0: Brand Logo + Summary, Slide 1: Features summary, Slide 2: Rating Scoreboard
  const total = 2 + (ratings ? 1 : 0);
  const [idx, setIdx] = useState(0);
  const go = (d) => setIdx((p) => Math.max(0, Math.min(total - 1, p + d)));

  function renderSlide() {
    if (idx === 0) {
      return (
        <div className="w-full h-full flex flex-col justify-stretch">
          {/* Dynamic Brand Logo & Solution Card (Split Charcoal & White layout) */}
          <div className="rounded-2xl overflow-hidden w-full flex flex-col min-h-[440px] flex-1 border border-white/5 shadow-inner">
            {/* Top Half: Charcoal Logo */}
            <div className="bg-[#2B303A] flex flex-col items-center justify-center p-8 flex-1 select-none min-h-[240px]">
              <div className="text-center px-4 w-full">
                <div 
                  style={{ fontFamily: fontStyle.family }}
                  className={`${fontStyle.className} drop-shadow-md text-4xl sm:text-5xl md:text-6xl break-words leading-tight`}
                >
                  {concept.name || "Concept Name"}
                </div>
              </div>
            </div>
            
            {/* Bottom Half: White Solution Summary */}
            <div className="bg-white p-8 flex items-center justify-center min-h-[160px] border-t border-slate-100">
              <p className="text-slate-800 text-sm sm:text-base text-center max-w-sm leading-relaxed font-semibold">
                {concept.solutionOverview}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (idx === 1) {
      return (
        <div className="w-full h-full flex flex-col justify-stretch">
          {/* Features Card - Split Charcoal & White layout */}
          <div className="rounded-2xl overflow-hidden w-full flex flex-col min-h-[440px] flex-1 border border-white/5 shadow-inner">
            {/* Top Half: Charcoal Header */}
            <div className="bg-[#2B303A] py-6 px-8 flex flex-col justify-center select-none min-h-[100px]">
              <h3 
                style={{ fontFamily: fontStyle.family }}
                className="text-cyan-400 text-base font-extrabold uppercase tracking-wider"
              >
                Core Brand Features
              </h3>
            </div>
            
            {/* Bottom Half: White Features List */}
            <div className="bg-white p-8 flex-1 flex flex-col justify-center space-y-5 border-t border-slate-100 min-h-[300px]">
              {features.map((f, i) => (
                <div key={i} className="border-l-2 border-slate-300 pl-4 py-0.5">
                  <h4 
                    style={{ fontFamily: fontStyle.family }}
                    className="text-slate-800 font-extrabold text-sm sm:text-base capitalize"
                  >
                    {f.title}
                  </h4>
                  <p className="text-slate-600 text-xs sm:text-sm mt-0.5 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              ))}
              {features.length === 0 && (
                <p className="text-slate-400 text-sm italic">No key features defined for this concept.</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Slide 2: Ratings Scoreboard - Split Charcoal & White layout
    return (
      <div className="w-full h-full flex flex-col justify-stretch">
        <div className="rounded-2xl overflow-hidden w-full flex flex-col min-h-[440px] flex-1 border border-slate-800 shadow-inner">
          {/* Top Half: Charcoal containing Donuts (decreased height as requested) */}
          <div className="bg-[#2B303A] p-6 flex items-center justify-around gap-4 min-h-[160px] select-none">
            <DonutChart label="Value" score={ratings.value} />
            <DonutChart label="Creativity" score={ratings.creativity} />
            <DonutChart label="Uniqueness" score={ratings.uniqueness} />
          </div>

          {/* Bottom Half: White containing Customer review (increased height, no quotation icon, larger font) */}
          <div className="bg-white p-10 flex flex-col justify-center border-t border-slate-100 min-h-[280px] flex-1">
            <p className="text-slate-800 text-sm sm:text-base md:text-lg leading-relaxed font-bold text-center max-w-md mx-auto">
              "{ratings.review}"
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative rounded-2xl overflow-hidden">
        {/* Expanded slide wrapper height to prevent scrolling within slide bounds */}
        <div className="min-h-[440px] flex items-stretch w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col justify-between"
            >
              {renderSlide()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation toggles */}
        {idx > 0 && (
          <button onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#20262e]/90 text-cyan-400 flex items-center justify-center shadow-md hover:bg-[#2c343d] transition-colors z-20">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {idx < total - 1 && (
          <button onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#20262e]/90 text-cyan-400 flex items-center justify-center shadow-md hover:bg-[#2c343d] transition-colors z-20">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex justify-center gap-1.5 mt-3.5">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-cyan-400" : "w-1.5 bg-white/20"}`}
          />
        ))}
      </div>
    </div>
  );
}