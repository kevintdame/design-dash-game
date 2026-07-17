import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, ImageIcon } from "lucide-react";

function ScoreBar({ label, score, color }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] font-semibold text-white/80 mb-1">
        <span className="uppercase tracking-wide">{label}</span>
        <span>{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-white/15 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}

export default function ConceptCarousel({ challenge, concept, ratings }) {
  const features = concept?.features || [];
  const total = 1 + features.length + (ratings ? 1 : 0);
  const [idx, setIdx] = useState(0);
  const go = (d) => setIdx((p) => Math.max(0, Math.min(total - 1, p + d)));

  const overall = ratings ? Math.round((ratings.value + ratings.creativity + ratings.uniqueness) / 3) : null;
  const tier = overall >= 85 ? "Design Mastermind" : overall >= 70 ? "Design Thinker" : overall >= 50 ? "Rising Designer" : "Keep Iterating";

  function renderSlide() {
    if (idx === 0) {
      return (
        <div className="w-full p-5 text-left overflow-y-auto max-h-[360px] [-webkit-overflow-scrolling:touch]">
          <div className="text-white/60 text-[10px] uppercase tracking-wider font-bold mb-1">The Challenge</div>
          <p className="text-white/90 text-xs mb-4 leading-relaxed">{challenge?.title}</p>
          <div className="text-white/60 text-[10px] uppercase tracking-wider font-bold mb-1">User Problem</div>
          <p className="text-white text-sm mb-4 leading-relaxed">{concept.problem}</p>
          <div className="text-white/60 text-[10px] uppercase tracking-wider font-bold mb-1">Solution Overview</div>
          <p className="text-white text-sm leading-relaxed">{concept.solutionOverview}</p>
        </div>
      );
    }
    if (idx <= features.length) {
      const f = features[idx - 1];
      return (
        <div className="w-full text-left">
          <div className="aspect-[4/3] bg-white/10 flex items-center justify-center">
            {f.image_url ? (
              <img src={f.image_url} alt={f.title} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="h-10 w-10 text-white/30" />
            )}
          </div>
          <div className="p-5">
            <div className="text-white/60 text-[10px] uppercase tracking-wider font-bold mb-1">Feature {idx}</div>
            <h3 className="text-white font-bold text-base mb-1.5">{f.title}</h3>
            <p className="text-white/85 text-sm leading-relaxed">{f.description}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full p-5 text-center">
        <div className="text-white/60 text-[10px] uppercase tracking-wider font-bold mb-1">{challenge?.customer_name}'s Verdict</div>
        <div className="text-5xl font-extrabold text-white font-display mb-0.5">{overall}</div>
        <div className="text-amber-200 font-bold text-xs mb-4">{tier}</div>
        <div className="space-y-2.5 text-left mb-4">
          <ScoreBar label="Value" score={ratings.value} color="bg-emerald-400" />
          <ScoreBar label="Creativity" score={ratings.creativity} color="bg-fuchsia-400" />
          <ScoreBar label="Uniqueness" score={ratings.uniqueness} color="bg-violet-400" />
        </div>
        <div className="bg-white/10 ring-1 ring-white/20 rounded-2xl p-3 text-left">
          <Quote className="h-4 w-4 text-amber-200 mb-1" />
          <p className="text-white/90 text-xs leading-relaxed italic">{ratings.review}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative bg-white/10 backdrop-blur ring-1 ring-white/25 rounded-3xl overflow-hidden">
        <div className="min-h-[360px] flex items-stretch">
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
          <button onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 text-purple-700 flex items-center justify-center shadow-md hover:bg-white">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {idx < total - 1 && (
          <button onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 text-purple-700 flex items-center justify-center shadow-md hover:bg-white">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex justify-center gap-1.5 mt-3">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}