import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { RotateCcw, FolderOpen, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConceptCarousel from "@/components/designGame/ConceptCarousel";

export default function ResultsScreen({ challenge, concept, ratings, onSave, saving, saved, onRestart, onGoPortfolio }) {
  const overall = Math.round((ratings.value + ratings.creativity + ratings.uniqueness) / 3);
  const tier = overall >= 85 ? "Design Mastermind" : overall >= 70 ? "Design Thinker" : overall >= 50 ? "Rising Designer" : "Keep Iterating";
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const count = overall >= 80 ? 180 : overall >= 60 ? 100 : 40;
    const colors = ["#fde047", "#f0abfc", "#a78bfa", "#fb7185"];
    confetti({ particleCount: count, spread: 100, origin: { y: 0.5 }, colors, scalar: 1.1 });
  }, [overall]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-4">
        <div className="text-white/70 text-xs font-semibold uppercase tracking-wider">Final Score</div>
        <div className="text-5xl font-extrabold text-white font-display leading-none">{overall}</div>
        <div className="text-amber-200 font-bold text-sm mt-1">{tier}</div>
      </div>

      <ConceptCarousel challenge={challenge} concept={concept} ratings={ratings} />

      <div className="mt-5 space-y-2">
        {!saved ? (
          <Button
            onClick={onSave}
            disabled={saving}
            className="w-full bg-white text-purple-700 hover:bg-white/90 font-bold rounded-2xl h-12 shadow-md disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span>
            ) : (
              "Save to portfolio"
            )}
          </Button>
        ) : (
          <Button
            onClick={onGoPortfolio}
            className="w-full bg-white text-purple-700 hover:bg-white/90 font-bold rounded-2xl h-12 shadow-md"
          >
            <span className="flex items-center gap-2"><FolderOpen className="h-4 w-4" /> View portfolio</span>
          </Button>
        )}
        {saved && (
          <div className="flex items-center justify-center gap-1.5 text-emerald-200 text-xs font-semibold">
            <Check className="h-3.5 w-3.5" /> Saved to your portfolio
          </div>
        )}
        <Button
          onClick={onRestart}
          className="w-full bg-white/15 backdrop-blur text-white hover:bg-white/25 ring-1 ring-white/30 font-bold rounded-2xl h-12"
        >
          <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Play again</span>
        </Button>
      </div>
    </motion.div>
  );
}