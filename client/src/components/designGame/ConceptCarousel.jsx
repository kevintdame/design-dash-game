import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { fontPool } from "./FinalConceptScreen";

// Humorous score tier describer
const getHumorousTier = (score) => {
  if (score >= 85) return "Design demigod (The customer is weeping tears of joy)";
  if (score >= 70) return "Certified Genius (Almost as smart as the designer)";
  if (score >= 50) return "Adequate (It won't catch fire, probably)";
  return "Back to the drawing board (Even their mom wouldn't buy this)";
};

// Pure, responsive SVG Donut Chart showing score inside a radial progress track
function DonutChart({ label, score }) {
  const radius = 18;
  const circ = 2 * Math.PI * radius; // ~113.1
  const strokeOffset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center flex-1">
      <div className="relative h-20 w-20 flex items-center justify-center">
        <svg className="h-full w-full transform -rotate-90" viewBox="0 0 40 40">
          {/* Base Track */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="transparent"
            stroke="#ffffff10"
            strokeWidth="3.5"
          />
          {/* Progress Indicator */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="transparent"
            stroke="#00d4ff"
            strokeWidth="3.5"
            strokeDasharray={circ}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Score Value Text overlay */}
        <div className="absolute text-white font-extrabold text-sm">
          {score}
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2 text-center">{label}</span>
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

  const overall = ratings ? Math.round((ratings.value + ratings.creativity + ratings.uniqueness) / 3) : null;
  const tier = ratings ? getHumorousTier(overall) : "";

  function renderSlide() {
    if (idx === 0) {
      return (
        <div className="w-full text-left">
          {/* Dynamic Brand Logo & Solution Card (Unified Charcoal layout) */}
          <div className="relative w-full aspect-square bg-[#2B303A] flex flex-col items-center justify-center p-8 select-none">
            <div className="text-center px-4 w-full mb-6">
              <div 
                style={{ fontFamily: fontStyle.family }}
                className={`${fontStyle.className} drop-shadow-md text-4xl sm:text-5xl md:text-6xl break-words leading-tight`}
              >
                {concept.name || "Concept Name"}
              </div>
            </div>
            
            {/* Solution Summary placed directly below the logo in white font */}
            <p className="text-white text-xs sm:text-sm text-center max-w-sm leading-relaxed opacity-90 mt-6 border-t border-white/10 pt-4 w-full">
              {concept.solutionOverview}
            </p>
          </div>
        </div>
      );
    }

    if (idx === 1) {
      return (
        <div className="w-full text-left">
          {/* Features Card - styled identical in size and border alignment as the logo slide */}
          <div className="w-full aspect-square bg-[#1C2028] p-8 flex flex-col justify-center select-none border-b border-white/5">
            <div className="max-h-[380px] overflow-y-auto pr-2 space-y-5 [-webkit-overflow-scrolling:touch]">
              <h3 
                style={{ fontFamily: fontStyle.family }}
                className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-2"
              >
                Core Brand Features
              </h3>
              <div className="space-y-4">
                {features.map((f, i) => (
                  <div key={i} className="border-l border-cyan-400/30 pl-4 py-0.5">
                    <h4 
                      style={{ fontFamily: fontStyle.family }}
                      className="text-white font-semibold text-sm capitalize animate-fade-in"
                    >
                      {f.title}
                    </h4>
                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                ))}
                {features.length === 0 && (
                  <p className="text-slate-400 text-xs italic">No key features defined for this concept.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Slide 2: Ratings Scoreboard
    return (
      <div className="w-full p-6 text-center select-none flex flex-col justify-between min-h-[440px]">
        {/* Header summary */}
        <div className="text-left border-b border-slate-800 pb-4">
          <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Customer Verdict</div>
          <h3 className="text-white font-extrabold text-xl capitalize leading-none">{challenge.customer_name}</h3>
          <p className="text-cyan-400 text-xs font-semibold mt-1.5 leading-snug">{tier}</p>
        </div>

        {/* 3 Donut charts in a responsive horizontal grid */}
        <div className="flex justify-around items-center gap-4 my-6">
          <DonutChart label="Value" score={ratings.value} />
          <DonutChart label="Creativity" score={ratings.creativity} />
          <DonutChart label="Uniqueness" score={ratings.uniqueness} />
        </div>

        {/* Customer review quote */}
        <div className="bg-[#1C2028] border border-white/5 rounded-2xl p-4 text-left shadow-inner">
          <Quote className="h-4 w-4 text-cyan-400 mb-2" />
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
            {ratings.review}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative bg-card ring-1 ring-black/5 rounded-2xl overflow-hidden shadow-lg">
        {/* Expanded slide wrapper height to prevent scrolling within slide bounds */}
        <div className="min-h-[440px] flex items-stretch">
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