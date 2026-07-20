import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import InsightWall from "@/components/designGame/InsightWall";

const ENTHU = {
  excited: { color: "text-emerald-300", label: "Excited", grad: "from-emerald-400 to-teal-500", ring: "ring-emerald-300", glow: "rgba(16,185,129,0.55)", emoji: "🤩" },
  interested: { color: "text-sky-300", label: "Interested", grad: "from-sky-400 to-blue-500", ring: "ring-sky-300", glow: "rgba(56,189,248,0.55)", emoji: "🙂" },
  neutral: { color: "text-amber-300", label: "Neutral", grad: "from-amber-400 to-orange-500", ring: "ring-amber-300", glow: "rgba(251,191,36,0.55)", emoji: "😐" },
  skeptical: { color: "text-rose-300", label: "Skeptical", grad: "from-rose-400 to-pink-500", ring: "ring-rose-300", glow: "rgba(244,63,94,0.55)", emoji: "😒" }
};

export default function BrainstormScreen({ challenge, qa, ideas, setIdeas, feedbacks, setFeedbacks, insights, onContinue }) {
  const [loading, setLoading] = useState(false);

  const filledIndices = ideas.map((i, idx) => (i.trim().length > 0 ? idx : null)).filter((x) => x !== null);
  const atLeastOne = filledIndices.length > 0;

  async function handleGetFeedback() {
    if (!atLeastOne) return;
    setLoading(true);
    try {
      const { getIdeaFeedback } = await import("@/lib/designGame");
      const res = await getIdeaFeedback(challenge, filledIndices.map((idx) => ideas[idx]));
      const placed = new Array(ideas.length).fill(null);
      filledIndices.forEach((origIdx, j) => { placed[origIdx] = res[j]; });
      setFeedbacks(placed);
    } catch (e) {
      const placed = new Array(ideas.length).fill(null);
      filledIndices.forEach((origIdx) => {
        placed[origIdx] = { feedback: "I couldn't process that — try refining your ideas and submit again.", enthusiasm: "neutral" };
      });
      setFeedbacks(placed);
    } finally {
      setLoading(false);
    }
  }

  const hasFeedback = feedbacks.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-3">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 12 }}
          className="inline-flex items-center gap-1.5 text-yellow-300"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-extrabold uppercase tracking-widest">Brainstorm</span>
          <Sparkles className="h-4 w-4" />
        </motion.div>
      </div>
      <h2 className="text-4xl sm:text-5xl font-extrabold font-display uppercase leading-none mb-2 text-center">
        <span className="text-foreground">Got any</span>{" "}
        <span className="text-accent">bright ideas?</span>
      </h2>
      <p className="text-foreground/70 text-sm mb-5 text-center">
        Based on your research, write your <strong className="text-accent">3 best ideas</strong> for {challenge.customer_name.split(" ")[0]}.
      </p>

      <InsightWall insights={insights} />

      <div className="space-y-3 mb-5">
        {ideas.map((idea, i) => {
          const fb = feedbacks[i];
          const enthu = fb ? ENTHU[fb.enthusiasm] || ENTHU.neutral : null;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, rotate: i % 2 ? 1 : -1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 200, damping: 16 }}
              className={`bg-card/90 backdrop-blur rounded-3xl p-4 shadow-lg ring-1 ${fb ? `ring-2 ${enthu.ring}` : "ring-border"}`}
              style={fb ? { boxShadow: `0 12px 30px -10px ${enthu.glow}` } : undefined}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-extrabold flex items-center justify-center shadow-md ring-2 ring-background">
                  {i + 1}
                </div>
                <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wide">Idea {i + 1}</span>
                {enthu && (
                  <motion.span
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 12 }}
                    className={`ml-auto flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${enthu.grad} text-white text-xs font-extrabold uppercase tracking-wider shadow-lg`}
                  >
                    <span className="text-3xl leading-none">{enthu.emoji}</span> {enthu.label}
                  </motion.span>
                )}
              </div>
              <textarea
                value={idea}
                onChange={(e) => {
                  const next = [...ideas];
                  next[i] = e.target.value;
                  setIdeas(next);
                  if (hasFeedback) setFeedbacks([]);
                }}
                placeholder={`Describe idea ${i + 1}...`}
                rows={2}
                disabled={hasFeedback}
                className="w-full text-base sm:text-sm text-card-foreground placeholder:text-muted-foreground outline-none resize-none bg-transparent font-medium"
              />
              <AnimatePresence>
                {fb && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-3 pt-3 border-t border-border/60"
                  >
                    <p className="text-sm text-zinc-900 leading-relaxed font-semibold">
                      <span className="text-primary font-extrabold">{challenge.customer_name.split(" ")[0]}:</span> {fb.feedback}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {!hasFeedback ? (
        <Button
          onClick={handleGetFeedback}
          disabled={!atLeastOne || loading}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-bold rounded-2xl shadow-xl shadow-primary/30 h-14 text-base disabled:opacity-40"
        >
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Getting feedback...</span>
          ) : (
            <span className="flex items-center gap-2">💡 Share ideas with {challenge.customer_name.split(" ")[0]}</span>
          )}
        </Button>
      ) : (
        <div className="space-y-2">
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-bold rounded-2xl shadow-xl shadow-primary/30 h-14 text-base"
          >
            <span className="flex items-center justify-center gap-2">Iterate into final concept <ArrowRight className="h-5 w-5" /></span>
          </Button>
          <Button
            onClick={() => setFeedbacks([])}
            variant="ghost"
            className="w-full text-foreground/60 hover:text-foreground hover:bg-muted font-bold rounded-2xl h-10"
          >
            Revise ideas & get new feedback
          </Button>
        </div>
      )}
    </motion.div>
  );
}