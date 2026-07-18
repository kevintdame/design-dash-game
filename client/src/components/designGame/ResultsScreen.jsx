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
    const colors = ["#00d4ff", "#66e8ff", "#5767ff", "#a855f7", "#ffffff"];
    confetti({ particleCount: count, spread: 100, origin: { y: 0.5 }, colors, scalar: 1.1 });
  }, [overall]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-4">
        <div className="text-cyan-400 text-xs font-semibold uppercase tracking-widest">Final Score</div>
        <div className="text-5xl font-extrabold font-display leading-none text-white">{overall}</div>
        <div className="text-cyan-400 font-bold text-sm mt-1">{tier}</div>
      </div>

      <ConceptCarousel challenge={challenge} concept={concept} ratings={ratings} />

      <div className="mt-5 space-y-2">
        {!saved ? (
          <Button
            onClick={onSave}
            disabled={saving}
            className="w-full bg-cyan-400 text-[#20262e] hover:bg-cyan-300 font-bold rounded-lg h-12 shadow-md disabled:opacity-40"
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
            className="w-full bg-cyan-400 text-[#20262e] hover:bg-cyan-300 font-bold rounded-lg h-12 shadow-md"
          >
            <span className="flex items-center gap-2"><FolderOpen className="h-4 w-4" /> View portfolio</span>
          </Button>
        )}
        {saved && (
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <Check className="h-3.5 w-3.5" /> Saved to your portfolio
          </div>
        )}
        <Button
          onClick={onRestart}
          className="w-full bg-card text-card-foreground hover:bg-white ring-1 ring-black/10 font-bold rounded-lg h-12"
        >
          <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Play again</span>
        </Button>
      </div>
    </motion.div>
  );
}