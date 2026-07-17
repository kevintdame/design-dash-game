import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ArrowRight, Loader2, ThumbsUp, ThumbsDown, Meh } from "lucide-react";
import { Button } from "@/components/ui/button";
import InsightWall from "@/components/designGame/InsightWall";

const ENTHU = {
  excited: { icon: ThumbsUp, color: "text-emerald-300", ring: "ring-emerald-300/40", bg: "bg-emerald-400/15" },
  interested: { icon: ThumbsUp, color: "text-sky-300", ring: "ring-sky-300/40", bg: "bg-sky-400/15" },
  neutral: { icon: Meh, color: "text-amber-200", ring: "ring-amber-200/40", bg: "bg-amber-400/15" },
  skeptical: { icon: ThumbsDown, color: "text-rose-300", ring: "ring-rose-300/40", bg: "bg-rose-400/15" }
};

export default function BrainstormScreen({ challenge, qa, ideas, setIdeas, feedbacks, setFeedbacks, insights, onContinue }) {
  const [loading, setLoading] = useState(false);

  const allFilled = ideas.every((i) => i.trim().length > 0);

  async function handleGetFeedback() {
    if (!allFilled) return;
    setLoading(true);
    try {
      const { getIdeaFeedback } = await import("@/lib/designGame");
      const res = await getIdeaFeedback(challenge, ideas);
      setFeedbacks(res);
    } catch (e) {
      setFeedbacks([
        { feedback: "I couldn't process that — try refining your ideas and submit again.", enthusiasm: "neutral" },
        { feedback: "I couldn't process that — try refining your ideas and submit again.", enthusiasm: "neutral" },
        { feedback: "I couldn't process that — try refining your ideas and submit again.", enthusiasm: "neutral" }
      ]);
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
      <div className="flex items-center gap-2 text-white/80 mb-2">
        <Lightbulb className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Brainstorm</span>
      </div>
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
            <div key={i} className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
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
                className="w-full text-base sm:text-sm text-slate-900 placeholder:text-slate-300 outline-none resize-none bg-transparent"
              />
              <AnimatePresence>
                {fb && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mt-2 pt-2 border-t border-slate-100 ${enthu.bg} rounded-xl px-3 py-2`}
                  >
                    <p className="text-xs text-slate-700 leading-relaxed italic">"{challenge.customer_name.split(" ")[0]}: {fb.feedback}"</p>
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
          disabled={!allFilled || loading}
          className="w-full bg-white text-purple-700 hover:bg-white/90 font-bold rounded-2xl h-12 shadow-md disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Getting feedback...</span>
          ) : (
            "Share ideas with customer"
          )}
        </Button>
      ) : (
        <Button
          onClick={onContinue}
          className="w-full bg-white text-purple-700 hover:bg-white/90 font-bold rounded-2xl h-12 shadow-md"
        >
          <span className="flex items-center justify-center gap-2">Iterate into final concept <ArrowRight className="h-5 w-5" /></span>
        </Button>
      )}
    </motion.div>
  );
}