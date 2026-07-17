import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ArrowRight, Loader2, ThumbsUp, ThumbsDown, Meh } from "lucide-react";
import { Button } from "@/components/ui/button";
import InsightWall from "@/components/designGame/InsightWall";
import CustomerAvatar from "@/components/designGame/CustomerAvatar";

const ENTHU = {
  excited: { icon: ThumbsUp, color: "text-emerald-400", emoji: "🔥", bg: "bg-emerald-950/30" },
  interested: { icon: ThumbsUp, color: "text-blue-400", emoji: "👍", bg: "bg-blue-950/30" },
  neutral: { icon: Meh, color: "text-amber-400", emoji: "😐", bg: "bg-amber-950/30" },
  skeptical: { icon: ThumbsDown, color: "text-rose-400", emoji: "🤔", bg: "bg-rose-950/30" }
};

export default function BrainstormScreen({ challenge, qa, ideas, setIdeas, feedbacks, setFeedbacks, insights, onContinue }) {
  const [loading, setLoading] = useState(false);

  const hasAtLeastOne = ideas.some((i) => i.trim().length > 0);

  async function handleGetFeedback() {
    if (!hasAtLeastOne) return;
    setLoading(true);
    try {
      const { getIdeaFeedback } = await import("@/lib/designGame");
      const activeIdeas = ideas.filter(i => i.trim().length > 0);
      const res = await getIdeaFeedback(challenge, activeIdeas);
      
      const mappedFeedbacks = ideas.map((idea) => {
        if (!idea.trim()) return null;
        const activeIdx = activeIdeas.findIndex(ai => ai === idea);
        return res[activeIdx] || { feedback: "No feedback available.", enthusiasm: "neutral" };
      });
      setFeedbacks(mappedFeedbacks);
    } catch (e) {
      setFeedbacks(ideas.map(idea => idea.trim() ? { feedback: "Connection error: Could not retrieve feedback from customer. Please try again.", error: true } : null));
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
      className="max-w-md mx-auto font-sans"
    >
      <div className="flex items-center gap-2 text-white mb-2 font-extrabold">
        <Lightbulb className="h-4 w-4" />
        <span className="text-xs uppercase tracking-widest">Brainstorm</span>
      </div>
      <p className="text-white/95 text-sm font-bold mb-4">
        Based on your research, write your <strong>3 best ideas</strong> for {challenge.customer_name.split(" ")[0]}.
      </p>

      <InsightWall insights={insights} />

      <div className="space-y-3 mb-5">
        {ideas.map((idea, i) => {
          const fb = feedbacks[i];
          const enthu = fb ? ENTHU[fb.enthusiasm] || ENTHU.neutral : null;
          return (
            <div key={i} className="bg-[#191d3d] border border-[#2e3366] rounded-[28px] p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-full bg-[#ffc83b] text-[#0b0c16] text-xs font-black flex items-center justify-center">
                  {i + 1}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Idea {i + 1} 💡</span>
                {enthu && (
                  <span className={`ml-auto flex items-center gap-1 text-[10px] font-black uppercase ${enthu.color}`}>
                    {enthu.emoji} {fb.enthusiasm}
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
                className="w-full text-xs font-bold text-white placeholder:text-slate-500 outline-none resize-none bg-transparent"
              />
              <AnimatePresence>
                {fb && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-[#2e3366] flex items-start gap-2.5"
                  >
                    <CustomerAvatar name={challenge.customer_name} className="h-8 w-8 border border-[#2e3366] shrink-0" />
                    <div className={`flex-1 ${fb.error ? 'bg-rose-950/40 text-rose-350 border border-rose-900/30' : 'bg-[#24174d]/80 text-[#d1d5f5] border border-[#3b2885]'} rounded-2xl px-3.5 py-2.5`}>
                      {fb.error ? (
                        <p className="text-xs font-bold leading-relaxed">{fb.feedback}</p>
                      ) : (
                        <p className="text-xs font-semibold leading-relaxed italic">
                          "{fb.feedback}"
                        </p>
                      )}
                    </div>
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
          disabled={!hasAtLeastOne || loading}
          className="w-full bg-[#ffc83b] hover:bg-[#e0ae2b] text-[#0b0c16] font-black rounded-2xl h-14 shadow-lg disabled:opacity-50 transition-transform active:scale-95"
        >
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-[#0b0c16]" /> Getting feedback...</span>
          ) : (
            "Share ideas with customer"
          )}
        </Button>
      ) : (
        <Button
          onClick={onContinue}
          className="w-full bg-[#ffc83b] hover:bg-[#e0ae2b] text-[#0b0c16] font-black rounded-2xl h-14 shadow-lg transition-transform active:scale-95"
        >
          <span className="flex items-center justify-center gap-2">Iterate into final concept <ArrowRight className="h-5 w-5" /></span>
        </Button>
      )}
    </motion.div>
  );
}