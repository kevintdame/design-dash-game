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
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-5 mb-4 shadow-xl shadow-orange-500/20 border border-white/10 text-white">
        {/* Top line with category / questions counter */}
        <div className="flex items-center justify-between mb-3 border-b border-white/20 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-100 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-200 animate-pulse" />
            Design Challenge
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full text-white">
            {questionsLeft} {questionsLeft === 1 ? "Q" : "Qs"} left
          </span>
        </div>
        
        {/* Main Header / Challenge Title */}
        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wide mb-1 text-white leading-tight">
          {challenge.title}
        </h3>
        
        {/* Scenario description */}
        <p className="text-orange-50 text-sm leading-relaxed mb-4">
          "{challenge.scenario}"
        </p>

        {/* Action Title integrated at the bottom of the card */}
        <div className="bg-black/10 rounded-2xl p-3 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-200 block">Interviewing</span>
            <span className="text-base sm:text-lg font-black uppercase text-white">
              Ask {challenge.customer_name.split(" ")[0]}
            </span>
          </div>
          <span className="text-2xl">🎤</span>
        </div>
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