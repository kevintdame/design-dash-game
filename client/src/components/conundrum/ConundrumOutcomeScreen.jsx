import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles, Loader2, RefreshCw, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConundrumOutcomeScreen({ evaluation, scenario, onReplay, onNextScenario }) {
  const [outcomeImage, setOutcomeImage] = useState(null);
  const [loadingCard, setLoadingCard] = useState(true);

  useEffect(() => {
    async function loadOutcomeCard() {
      if (!evaluation?.imagePrompt) {
        setLoadingCard(false);
        return;
      }
      try {
        const res = await fetch("/api/conundrum/card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: evaluation.imagePrompt })
        });
        const data = await res.json();
        if (data.imageUrl) {
          setOutcomeImage(data.imageUrl);
        }
      } catch (err) {
        console.warn("Failed to load outcome card:", err);
      } finally {
        setLoadingCard(false);
      }
    }
    loadOutcomeCard();
  }, [evaluation]);

  const isSuccess = evaluation?.success ?? true;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-2xl mx-auto py-4 px-2 space-y-4"
    >
      {/* Victory / Defeat Header Card */}
      <div
        className={`rounded-3xl p-5 border text-center shadow-xl ${
          isSuccess
            ? "bg-gradient-to-br from-emerald-950/80 via-card to-card border-emerald-500/40 text-emerald-300"
            : "bg-gradient-to-br from-red-950/80 via-card to-card border-red-500/40 text-red-300"
        }`}
      >
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-white/10 mb-2">
          {isSuccess ? <Trophy className="h-6 w-6 text-amber-300" /> : <XCircle className="h-6 w-6 text-red-400" />}
        </div>
        <h2 className="text-3xl font-black font-display uppercase tracking-tight text-white">
          {isSuccess ? "CONUNDRUM SOLVED!" : "PLAN FAILED!"}
        </h2>
        <p className="text-xs sm:text-sm font-bold opacity-90 mt-1">
          {isSuccess ? `Success Rate: ${evaluation.successRate}%` : "The plan backfired hilariously!"}
        </p>
      </div>

      {/* Pixar 3D Outcome Visual Card */}
      <div className="bg-slate-950 border border-border/80 rounded-3xl overflow-hidden shadow-xl min-h-[220px] flex items-center justify-center relative">
        {loadingCard ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-accent animate-spin mb-2" />
            <p className="text-xs font-bold text-slate-300">Rendering Pixar 3D Outcome Visual Card...</p>
          </div>
        ) : outcomeImage ? (
          <img
            src={outcomeImage}
            alt="Outcome Visual"
            className="w-full h-72 sm:h-80 object-cover filter contrast-105"
          />
        ) : (
          <div className="p-8 text-center text-4xl">{isSuccess ? "🎉" : "💥"}</div>
        )}
      </div>

      {/* 3 Score Breakdown Metric Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card/80 border border-border/80 rounded-2xl p-3 text-center shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
            Strategy
          </span>
          <span className="text-xl sm:text-2xl font-black font-display text-accent mt-0.5 block">
            {evaluation.strategyScore || 90}+
          </span>
        </div>

        <div className="bg-card/80 border border-border/80 rounded-2xl p-3 text-center shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
            Creativity
          </span>
          <span className="text-xl sm:text-2xl font-black font-display text-primary mt-0.5 block">
            {evaluation.creativityScore || 92}+
          </span>
        </div>

        <div className="bg-card/80 border border-border/80 rounded-2xl p-3 text-center shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
            Hilarity
          </span>
          <span className="text-xl sm:text-2xl font-black font-display text-yellow-400 mt-0.5 block">
            {evaluation.hilarityScore || 95}+
          </span>
        </div>
      </div>

      {/* Narrative Simulation Story */}
      <div className="bg-card/80 border border-border/80 rounded-3xl p-5 shadow-lg space-y-2">
        <h4 className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" />
          Narrative Simulation Execution
        </h4>
        <p className="text-sm leading-relaxed text-foreground/90 font-medium whitespace-pre-line">
          {evaluation.narrative}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onReplay}
          className="w-full sm:w-1/2 rounded-2xl h-12 font-bold flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Play Again</span>
        </Button>

        <Button
          onClick={onNextScenario}
          className="w-full sm:w-1/2 bg-gradient-to-r from-primary to-accent text-primary-foreground font-black text-sm uppercase tracking-wider rounded-2xl h-12 shadow-xl hover:opacity-95 flex items-center justify-center gap-2"
        >
          <span>Next Conundrum</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
