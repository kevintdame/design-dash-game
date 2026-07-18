import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ArrowRight, Loader2, ThumbsUp, ThumbsDown, Meh } from "lucide-react";
import { Button } from "@/components/ui/button";
import InsightWall from "@/components/designGame/InsightWall";

const ENTHU = {
  excited: { icon: ThumbsUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  interested: { icon: ThumbsUp, color: "text-sky-400", bg: "bg-sky-500/10" },
  neutral: { icon: Meh, color: "text-amber-400", bg: "bg-amber-500/10" },
  skeptical: { icon: ThumbsDown, color: "text-rose-400", bg: "bg-rose-500/10" }
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
      <motion.div animate={{ rotate: [0, -12, 12, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.5 }} className="flex items-center gap-2 text-cyan-400 mb-2">
        <Lightbulb className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-widest">Brainstorm</span>
      </motion.div>
      <p className="text-white text-sm mb-4">
        Based on your research, write your <strong>3 best ideas</strong> for {challenge.customer_name.split(" ")[0]}.
      </p>

      <InsightWall insights={insights} />

      <div className="space-y-3 mb-5">
        {ideas.map((idea, i) => {
          const fb = feedbacks[i];
          const enthu = fb ? ENTHU[fb.enthusiasm] || ENTHU.neutral : null;
          const Icon = enthu?.icon;
          return (
            <div key={i} className="bg-card rounded-2xl p-4 shadow-md ring-1 ring-black/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-cyan-400 text-[#20262e] text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Idea {i + 1}</span>
                {Icon && (
                  <span className={`ml-auto flex items-center gap-1 text-[10px] font-bold uppercase ${enthu.color}`}>
                    <Icon className="h-3.5 w-3.5" /> {fb.enthusiasm}
                  </span>
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
                className="w-full text-base sm:text-sm text-card-foreground placeholder:text-slate-300 outline-none resize-none bg-transparent"
              />
              <AnimatePresence>
                {fb && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`mt-2 pt-2 border-t border-black/5 ${enthu.bg} rounded-xl px-3 py-2`}
                  >
                    <p className="text-sm text-slate-900 leading-relaxed font-medium">"{challenge.customer_name.split(" ")[0]}: {fb.feedback}"</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {!hasFeedback ? (
        <Button
          onClick={handleGetFeedback}
          disabled={!atLeastOne || loading}
          className="w-full bg-cyan-400 text-[#20262e] hover:bg-cyan-300 font-bold rounded-lg h-12 shadow-md disabled:opacity-40"
        >
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Getting feedback...</span>
          ) : (
            "Share ideas with customer"
          )}
        </Button>
      ) : (
        <div className="space-y-2">
          <Button
            onClick={onContinue}
            className="w-full bg-cyan-400 text-[#20262e] hover:bg-cyan-300 font-bold rounded-lg h-12 shadow-md"
          >
            <span className="flex items-center justify-center gap-2">Iterate into final concept <ArrowRight className="h-5 w-5" /></span>
          </Button>
          <Button
            onClick={() => setFeedbacks([])}
            variant="ghost"
            className="w-full text-slate-400 hover:text-white hover:bg-white/5 font-medium rounded-lg h-10"
          >
            Revise ideas & get new feedback
          </Button>
        </div>
      )}
    </motion.div>
  );
}