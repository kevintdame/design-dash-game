import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { RotateCcw, FolderOpen, Loader2, Check, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConceptCarousel from "@/components/designGame/ConceptCarousel";

export default function ResultsScreen({ challenge, concept, ratings, onSave, saving, saved, onRestart, onGoPortfolio }) {
  const overall = Math.round((ratings.value + ratings.creativity + ratings.uniqueness) / 3);
  const tier = overall >= 85 ? "Design Mastermind" : overall >= 70 ? "Certified Genius" : overall >= 50 ? "Adequate" : "Back to the drawing board";
  const tierEmoji = overall >= 85 ? "👑" : overall >= 70 ? "🧠" : overall >= 50 ? "👌" : "✍️";
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const count = overall >= 80 ? 180 : overall >= 60 ? 100 : 40;
    const colors = ["#a855f7", "#ff5c8a", "#fbbf24", "#ffffff", "#f472b6"];
    confetti({ particleCount: count, spread: 110, origin: { y: 0.5 }, colors, scalar: 1.1 });
  }, [overall]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 12 }}
          className="inline-flex items-center gap-1.5 text-yellow-300 mb-2"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-extrabold uppercase tracking-widest">Final Score</span>
          <Sparkles className="h-4 w-4" />
        </motion.div>
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 150, damping: 11 }}
            className="text-7xl font-extrabold font-display leading-none text-gradient"
          >
            {overall}
          </motion.div>
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent text-primary-foreground font-extrabold text-sm px-4 py-1.5 rounded-full shadow-md shadow-primary/30"
          >
            <span>{tierEmoji}</span> {tier}
          </motion.div>
        </div>
      </div>

      <ConceptCarousel challenge={challenge} concept={concept} ratings={ratings} />

      <div className="mt-5 space-y-2">
        {!saved ? (
          <Button
            onClick={onSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-bold rounded-2xl h-12 shadow-xl shadow-primary/30 disabled:opacity-40"
          >
            {saving ? (
              <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span>
            ) : (
              "💾 Save to portfolio"
            )}
          </Button>
        ) : (
          <Button
            onClick={onGoPortfolio}
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-bold rounded-2xl h-12 shadow-xl shadow-primary/30"
          >
            <span className="flex items-center gap-2"><FolderOpen className="h-4 w-4" /> View portfolio</span>
          </Button>
        )}
        {saved && (
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold">
            <Check className="h-3.5 w-3.5" /> Saved to your portfolio
          </div>
        )}
        <Button
          onClick={onRestart}
          className="w-full bg-card/90 backdrop-blur text-card-foreground hover:bg-muted ring-1 ring-border font-bold rounded-2xl h-12"
        >
          <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Play again</span>
        </Button>
      </div>
    </motion.div>
  );
}