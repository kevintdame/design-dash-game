import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, ImageIcon } from "lucide-react";
import CustomerAvatar from "@/components/designGame/CustomerAvatar";

function ScoreBar({ label, score, color }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] font-extrabold text-[#d1d5f5] mb-1">
        <span className="uppercase tracking-widest">{label}</span>
        <span>{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
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
  const tier = overall >= 85 ? "Design Mastermind 🏆" : overall >= 70 ? "Design Thinker 🌟" : overall >= 50 ? "Rising Designer 📈" : "Keep Iterating ✍️";

  function renderSlide() {
    if (idx === 0) {
      return (
        <div className="w-full p-6 text-left overflow-y-auto max-h-[360px] [-webkit-overflow-scrolling:touch] space-y-4">
          <div>
            <div className="text-[#a5b4fc] text-[10px] uppercase tracking-widest font-extrabold mb-1.5">The Challenge</div>
            <p className="text-white text-xs font-semibold leading-relaxed">{challenge?.title}</p>
          </div>
          <div>
            <div className="text-[#a5b4fc] text-[10px] uppercase tracking-widest font-extrabold mb-1.5">User Problem</div>
            <p className="text-[#d1d5f5] text-xs font-semibold leading-relaxed">{concept.problem}</p>
          </div>
          <div>
            <div className="text-[#a5b4fc] text-[10px] uppercase tracking-widest font-extrabold mb-1.5">Solution Overview</div>
            <p className="text-[#d1d5f5] text-xs font-semibold leading-relaxed">{concept.solutionOverview}</p>
          </div>
        </div>
      );
    }
    if (idx <= features.length) {
      const f = features[idx - 1];
      return (
        <div className="w-full text-left">
          <div className="aspect-[4/3] bg-[#242953] border-b border-[#2e3366] flex items-center justify-center">
            {f.image_url ? (
              <img src={f.image_url} alt={f.title} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="h-10 w-10 text-white/20 animate-pulse" />
            )}
          </div>
          <div className="p-6">
            <div className="text-[#a5b4fc] text-[10px] uppercase tracking-widest font-extrabold mb-1.5">Feature {idx}</div>
            <h3 className="text-white font-extrabold text-base mb-1.5">{f.title}</h3>
            <p className="text-[#d1d5f5] text-xs font-semibold leading-relaxed">{f.description}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full p-6 text-center">
        <div className="text-[#a5b4fc] text-[10px] uppercase tracking-widest font-extrabold mb-2">{challenge?.customer_name}'s Verdict</div>
        <div className="text-6xl font-black text-white font-sans mb-1 drop-shadow-sm">{overall}</div>
        <div className="text-[#ffc83b] font-black text-xs mb-4">{tier}</div>
        
        <div className="space-y-3 text-left mb-5">
          <ScoreBar label="Value" score={ratings.value} color="bg-emerald-400" />
          <ScoreBar label="Creativity" score={ratings.creativity} color="bg-fuchsia-400" />
          <ScoreBar label="Uniqueness" score={ratings.uniqueness} color="bg-violet-400" />
        </div>
        
        <div className="bg-[#24174d]/85 border border-[#3b2885] rounded-2xl p-4 text-left flex items-start gap-3">
          <CustomerAvatar name={challenge?.customer_name} className="h-9 w-9 border border-[#2e3366] shrink-0" />
          <div className="flex-1">
            <Quote className="h-4 w-4 text-[#ffc83b] mb-1" />
            <p className="text-[#d1d5f5] text-xs font-semibold leading-relaxed italic">"{ratings.review}"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative font-sans">
      <div className="relative bg-[#191d3d] border border-[#2e3366] rounded-[32px] overflow-hidden shadow-2xl">
        <div className="min-h-[360px] flex items-stretch">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col justify-center"
            >
              {renderSlide()}
            </motion.div>
          </AnimatePresence>
        </div>

        {idx > 0 && (
          <button 
            onClick={() => go(-1)} 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#ffc83b] text-[#0b0c16] flex items-center justify-center shadow-md hover:bg-[#e0ae2b] transition active:scale-90"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {idx < total - 1 && (
          <button 
            onClick={() => go(1)} 
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#ffc83b] text-[#0b0c16] flex items-center justify-center shadow-md hover:bg-[#e0ae2b] transition active:scale-90"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-[#ffc83b]" : "w-1.5 bg-white/20"}`}
          />
        ))}
      </div>
    </div>
  );
}