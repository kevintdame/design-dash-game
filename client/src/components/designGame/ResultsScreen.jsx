import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { RotateCcw, FolderOpen, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConceptCarousel from "@/components/designGame/ConceptCarousel";

export default function ResultsScreen({ challenge, concept, ratings, onSave, saving, saved, onRestart, onGoPortfolio }) {
  const overall = Math.round((ratings.value + ratings.creativity + ratings.uniqueness) / 3);
  const tier = overall >= 85 ? "Design Mastermind 🏆" : overall >= 70 ? "Design Thinker 🌟" : overall >= 50 ? "Rising Designer 📈" : "Keep Iterating ✍️";
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const count = overall >= 80 ? 180 : overall >= 60 ? 100 : 40;
    const colors = ["#de573a", "#c93c76", "#f09c35", "#a78bfa"];
    confetti({ particleCount: count, spread: 100, origin: { y: 0.5 }, colors, scalar: 1.1 });
  }, [overall]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto font-sans"
    >
      <div className="text-center mb-5">
        <div className="text-white/90 text-xs font-extrabold uppercase tracking-widest">Final Score</div>
        <div className="text-7xl font-black text-white font-sans my-1 drop-shadow-md">
          {overall}
        </div>
        <div className="text-white/95 font-black text-sm tracking-wide mt-1">{tier}</div>
      </div>

      <ConceptCarousel challenge={challenge} concept={concept} ratings={ratings} />

      <div className="mt-6 space-y-3">
        {!saved ? (
          <Button
            onClick={onSave}
            disabled={saving}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl h-14 shadow-lg disabled:opacity-50 transition-transform active:scale-95"
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
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl h-14 shadow-lg transition-transform active:scale-95"
          >
            <span className="flex items-center gap-2"><FolderOpen className="h-4 w-4" /> View portfolio</span>
          </Button>
        )}
        {saved && (
          <div className="flex items-center justify-center gap-1.5 text-white text-xs font-black">
            <Check className="h-3.5 w-3.5 text-slate-900 bg-white rounded-full p-0.5" /> Saved to your portfolio
          </div>
        )}
        <Button
          onClick={onRestart}
          className="w-full bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 font-extrabold rounded-2xl h-14 shadow-sm transition-transform active:scale-95"
        >
          <span className="flex items-center justify-center gap-2">
            <RotateCcw className="h-4 w-4" /> Play again
          </span>
        </Button>
      </div>
    </motion.div>
  );
}