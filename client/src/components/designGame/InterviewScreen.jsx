import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InterviewScreen({ challenge, qa, setQa, onContinue }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const MAX_Q = 5;
  const questionsLeft = MAX_Q - qa.length;
  const canAsk = input.trim() && !loading && questionsLeft > 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [qa, loading]);

  async function handleAsk() {
    if (!canAsk) return;
    const question = input.trim();
    setInput("");
    setLoading(true);
    try {
      const { answerAsCustomer } = await import("@/lib/designGame");
      const answer = await answerAsCustomer(challenge, question, qa);
      setQa([...qa, { question, answer }]);
    } catch (e) {
      setQa([...qa, { question, answer: "Hmm, I didn't quite catch that — could you rephrase?" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="max-w-md mx-auto flex flex-col h-full font-sans"
    >
      <div className="flex items-center gap-2 text-white/95 mb-2 font-extrabold">
        <MessageCircle className="h-4 w-4" />
        <span className="text-xs uppercase tracking-widest">
          Interview · {questionsLeft} {questionsLeft === 1 ? "question" : "questions"} left 💬
        </span>
      </div>
      <p className="text-white/95 text-sm font-bold mb-4">
        Ask {challenge.customer_name.split(" ")[0]} anything to understand their needs.
      </p>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1 mb-4 min-h-[200px] sm:min-h-[280px]">
        {qa.length === 0 && !loading && (
          <div className="h-full flex items-center justify-center text-center py-10">
            <p className="text-white/90 text-xs font-bold max-w-[15rem] leading-relaxed">
              Start the conversation — ask about their frustrations, daily routine, or what they wish existed.
            </p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {qa.map((item, i) => (
            <div key={i} className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <div className="bg-slate-900 text-white rounded-3xl rounded-tr-sm px-4.5 py-3 max-w-[85%] shadow-sm">
                  <p className="text-xs leading-relaxed font-bold">{item.question}</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mt-2"
              >
                <div className="bg-white border border-slate-100 text-slate-800 rounded-3xl rounded-tl-sm px-4.5 py-3 max-w-[85%] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <p className="text-xs leading-relaxed font-bold">{item.answer}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 text-slate-400 rounded-3xl rounded-tl-sm px-5 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {questionsLeft > 0 ? (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Type your question..."
              className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 shadow-sm"
            />
            <Button
              onClick={handleAsk}
              disabled={!canAsk}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 w-12 p-0 shadow-md transition-transform active:scale-95"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        <Button
          onClick={onContinue}
          disabled={loading}
          className="w-full bg-slate-950 hover:bg-slate-800 text-white font-extrabold rounded-2xl h-14 shadow-lg"
        >
          {qa.length === 0 ? (
            "Skip to brainstorm →"
          ) : questionsLeft > 0 ? (
            <span className="flex items-center gap-2">Done interviewing — brainstorm <ArrowRight className="h-4 w-4" /></span>
          ) : (
            <span className="flex items-center gap-2">Move to brainstorm <ArrowRight className="h-4 w-4" /></span>
          )}
        </Button>
      </div>
    </motion.div>
  );
}