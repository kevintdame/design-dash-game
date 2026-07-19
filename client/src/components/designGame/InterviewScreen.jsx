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
      className="max-w-md mx-auto flex flex-col h-full"
    >
      <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }} className="flex items-center gap-2 text-cyan-400 mb-2">
        <MessageCircle className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-widest">
          Interview · {questionsLeft} {questionsLeft === 1 ? "question" : "questions"} left
        </span>
      </motion.div>
      <p className="text-white text-sm mb-3">
        Ask {challenge.customer_name.split(" ")[0]} anything to understand their needs.
      </p>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1 mb-3 min-h-[200px] sm:min-h-[280px]">
        {qa.length === 0 && !loading && (
          <div className="h-full flex items-center justify-center text-center py-10">
            <p className="text-slate-400 text-sm max-w-[15rem]">
              Start the conversation — ask about their frustrations, daily routine, or what they wish existed.
            </p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {qa.map((item, i) => (
            <div key={i}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 26 }}
                className="flex justify-end"
              >
                <div className="bg-cyan-400 text-[#20262e] rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%] shadow-md">
                  <p className="text-sm font-medium">{item.question}</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 26, delay: 0.05 }}
                className="flex justify-start mt-2"
              >
                <div className="bg-card text-card-foreground rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%] ring-1 ring-black/5 shadow-sm">
                  <p className="text-sm leading-relaxed">{item.answer}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card text-card-foreground rounded-2xl rounded-bl-md px-4 py-3 ring-1 ring-black/5 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {questionsLeft > 0 ? (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Type your question..."
              className="flex-1 bg-card text-card-foreground rounded-2xl px-4 py-3 text-base sm:text-sm placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-cyan-400 shadow-sm ring-1 ring-black/5"
            />
            <Button
              onClick={handleAsk}
              disabled={!canAsk}
              className="bg-cyan-400 text-[#20262e] hover:bg-cyan-300 rounded-2xl h-12 w-12 p-0 shadow-md"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        <Button
          onClick={onContinue}
          disabled={loading}
          className="w-full bg-card text-card-foreground hover:bg-white ring-1 ring-black/10 font-bold rounded-lg h-12"
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