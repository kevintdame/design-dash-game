import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, ImageIcon } from "lucide-react";

function ScoreBar({ label, score }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-1">
        <span className="uppercase tracking-wide">{label}</span>
        <span>{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-black/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
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
        <div className="w-full text-left overflow-y-auto max-h-[360px] [-webkit-overflow-scrolling:touch]">
          {concept.image && (
            <div className="aspect-[4/3] bg-black/5">
              <img src={concept.image} alt={concept.name || "Concept"} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-5">
            {concept.name && (
              <h3 className="text-card-foreground font-bold text-lg mb-3">{concept.name}</h3>
            )}
            <p className="text-card-foreground text-sm leading-relaxed">{concept.solutionOverview}</p>
          </div>
        </div>
      );
    }
    if (idx <= features.length) {
      const f = features[idx - 1];
      return (
        <div className="w-full text-left">
          <div className="aspect-[4/3] bg-black/5 flex items-center justify-center">
            {f.image_url ? (
              <img src={f.image_url} alt={f.title} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="h-10 w-10 text-black/20" />
            )}
          </div>
          <div className="p-5">
            <div className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold mb-1">Feature {idx}</div>
            <h3 className="text-card-foreground font-bold text-base mb-1.5">{f.title}</h3>
            <p className="text-card-foreground text-sm leading-relaxed">{f.description}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full p-5 text-center overflow-y-auto max-h-[360px] [-webkit-overflow-scrolling:touch]">
        <div className="space-y-2.5 text-left mb-4">
          <ScoreBar label="Value" score={ratings.value} />
          <ScoreBar label="Creativity" score={ratings.creativity} />
          <ScoreBar label="Uniqueness" score={ratings.uniqueness} />
        </div>
        <div className="bg-black/5 rounded-2xl p-3 text-left">
          <Quote className="h-4 w-4 text-primary mb-1" />
          <p className="text-card-foreground text-sm leading-relaxed font-medium">{ratings.review}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative bg-card ring-1 ring-black/5 rounded-2xl overflow-hidden shadow-lg">
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
          <button onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-secondary text-primary flex items-center justify-center shadow-md hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {idx < total - 1 && (
          <button onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-secondary text-primary flex items-center justify-center shadow-md hover:bg-muted">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex justify-center gap-1.5 mt-3">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-primary" : "w-1.5 bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}