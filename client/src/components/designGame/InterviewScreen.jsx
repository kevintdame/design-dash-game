import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, ArrowRight, Loader2, Sparkles } from "lucide-react";
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
      <div className="text-center mb-3">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 12 }}
          className="inline-flex items-center gap-1.5 text-yellow-300"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-extrabold uppercase tracking-widest">
            Interview · {questionsLeft} {questionsLeft === 1 ? "question" : "questions"} left
          </span>
        </motion.div>
      </div>
      <h2 className="text-4xl sm:text-5xl font-extrabold font-display uppercase leading-none mb-2 text-center">
        <span className="text-foreground">Ask</span>{" "}
        <span className="text-accent">{challenge.customer_name.split(" ")[0]}</span>
      </h2>
      <div className="bg-orange-950/20 border border-orange-500/30 rounded-2xl p-3 mb-4 text-center shadow-lg shadow-orange-500/5 backdrop-blur-sm">
        <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-widest block mb-0.5">Design Challenge</span>
        <h4 className="text-xs font-black text-orange-200 uppercase tracking-wide mb-1">{challenge.title}</h4>
        <p className="text-orange-100/90 text-[11px] leading-relaxed max-w-sm mx-auto">
          {challenge.scenario}
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1 mb-3 min-h-[200px] sm:min-h-[280px]">
        {qa.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center py-10 gap-2">
            <span className="text-4xl">🎤</span>
            <p className="text-foreground/60 text-sm max-w-[15rem] font-medium">
              Start the conversation — ask about their frustrations, daily routine, or what they wish existed.
            </p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {qa.map((item, i) => (
            <div key={i}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%] shadow-md shadow-primary/20">
                  <p className="text-sm font-medium">{item.question}</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mt-2"
              >
                <div className="bg-card/90 backdrop-blur text-card-foreground rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%] ring-1 ring-border shadow-sm">
                  <p className="text-sm leading-relaxed">{item.answer}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card/90 backdrop-blur text-card-foreground rounded-2xl rounded-bl-md px-4 py-3 ring-1 ring-border shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
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
              className="flex-1 bg-card/90 backdrop-blur text-card-foreground rounded-2xl px-4 py-3 text-base sm:text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent shadow-sm ring-1 ring-border"
            />
            <Button
              onClick={handleAsk}
              disabled={!canAsk}
              className="bg-gradient-to-br from-primary to-accent text-primary-foreground hover:opacity-90 rounded-2xl h-12 w-12 p-0 shadow-md shadow-primary/20"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        <Button
          onClick={onContinue}
          disabled={loading}
          className="w-full bg-card/90 backdrop-blur text-card-foreground hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-primary-foreground hover:ring-accent ring-1 ring-border font-bold rounded-2xl h-12 transition-all"
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