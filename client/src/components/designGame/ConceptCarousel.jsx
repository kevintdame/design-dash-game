import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { getFontsForVibe } from "./FinalConceptScreen";

function ScoreBar({ label, score }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
        <span className="uppercase tracking-wide">{label}</span>
        <span>{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-black/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-600"
        />
      </div>
    </div>
  );
}

export default function ConceptCarousel({ challenge, concept, ratings }) {
  const features = concept?.features || [];
  const vibe = concept?.vibe || "organic";
  const activeFonts = getFontsForVibe(vibe);
  const fontIdx = concept.fontIdx !== undefined ? concept.fontIdx : 0;
  
  // Slide 0: Brand Logo, Slide 1: Features Summary, Slide 2: Ratings (if present)
  const total = 2 + (ratings ? 1 : 0);
  const [idx, setIdx] = useState(0);
  const go = (d) => setIdx((p) => Math.max(0, Math.min(total - 1, p + d)));

  const overall = ratings ? Math.round((ratings.value + ratings.creativity + ratings.uniqueness) / 3) : null;
  const tier = overall >= 85 ? "Design Mastermind" : overall >= 70 ? "Design Thinker" : overall >= 50 ? "Rising Designer" : "Keep Iterating";

  function renderSlide() {
    if (idx === 0) {
      return (
        <div className="w-full text-left overflow-y-auto max-h-[480px] [-webkit-overflow-scrolling:touch]">
          {/* Dynamic Brand Logo Card */}
          <div className="relative w-full aspect-square bg-[#2B303A] flex flex-col items-center justify-center p-8 select-none">
            <div className="text-center px-4 w-full">
              <div 
                style={{ fontFamily: activeFonts[fontIdx].family }}
                className={`${activeFonts[fontIdx].className} drop-shadow-md`}
              >
                {concept.name || "Concept Name"}
              </div>
            </div>
            <span className="text-[9px] uppercase font-bold text-slate-500 mt-6 tracking-widest bg-[#20262e] px-2.5 py-1 rounded-full">
              Style: {activeFonts[fontIdx].name} ({vibe})
            </span>
          </div>

          <div className="p-5">
            <p className="text-card-foreground text-sm leading-relaxed">{concept.solutionOverview}</p>
          </div>
        </div>
      );
    }

    if (idx === 1) {
      return (
        <div className="w-full text-left p-5 overflow-y-auto max-h-[480px] [-webkit-overflow-scrolling:touch]">
          <div className="bg-[#1C2028] rounded-2xl p-6 shadow-inner border border-white/5 space-y-5">
            <h3 
              style={{ fontFamily: activeFonts[fontIdx].family }}
              className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-2"
            >
              Core Brand Features
            </h3>
            <div className="space-y-4">
              {features.map((f, i) => (
                <div key={i} className="border-l border-cyan-400/30 pl-4 py-0.5">
                  <h4 
                    style={{ fontFamily: activeFonts[fontIdx].family }}
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
      );
    }

    // Slide 2: Customer Rating feedback
    return (
      <div className="w-full p-5 text-center overflow-y-auto max-h-[480px] [-webkit-overflow-scrolling:touch]">
        <div className="text-left mb-6 border-b border-slate-800 pb-4">
          <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Customer Verdict</div>
          <h3 className="text-white font-extrabold text-xl capitalize">{challenge.customer_name}</h3>
          <p className="text-cyan-400 text-xs font-semibold mt-0.5">{tier} ({overall}/100)</p>
        </div>

        <div className="space-y-2.5 text-left mb-4">
          <ScoreBar label="Value Fit" score={ratings.value} />
          <ScoreBar label="Creativity" score={ratings.creativity} />
          <ScoreBar label="Uniqueness" score={ratings.uniqueness} />
        </div>
        <div className="bg-[#1C2028] border border-white/5 rounded-2xl p-4 text-left">
          <Quote className="h-4 w-4 text-cyan-400 mb-2" />
          <p className="text-slate-300 text-sm leading-relaxed font-medium">{ratings.review}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative bg-card ring-1 ring-black/5 rounded-2xl overflow-hidden shadow-lg">
        <div className="min-h-[440px] flex items-stretch">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col"
            >
              {renderSlide()}
            </motion.div>
          </AnimatePresence>
        </div>

        {idx > 0 && (
          <button onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#20262e] text-cyan-400 flex items-center justify-center shadow-md hover:bg-[#2c343d]">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {idx < total - 1 && (
          <button onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#20262e] text-cyan-400 flex items-center justify-center shadow-md hover:bg-[#2c343d]">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex justify-center gap-1.5 mt-3">
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