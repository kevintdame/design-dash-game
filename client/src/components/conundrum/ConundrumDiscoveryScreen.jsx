import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2, Package, ArrowRight, HelpCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConundrumDiscoveryScreen({ scenario, onGoToPlan, onBack }) {
  const [qa, setQa] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [heroImage, setHeroImage] = useState(scenario.heroFallback);
  const [loadingHero, setLoadingHero] = useState(false);
  const [inventory, setInventory] = useState(scenario.initialItems || []);
  const scrollRef = useRef(null);

  const MAX_QUESTIONS = 4;
  const questionsLeft = MAX_QUESTIONS - qa.length;

  // Load Intro Pixar 3D Visual Hero Card
  useEffect(() => {
    async function loadHero() {
      try {
        const res = await fetch("/api/conundrum/card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: scenario.heroPrompt })
        });
        const data = await res.json();
        if (data.imageUrl) {
          setHeroImage(data.imageUrl);
        }
      } catch (err) {
        console.warn("Failed to load hero card:", err);
      }
    }
    loadHero();
  }, [scenario]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [qa, loading]);

  async function handleAsk() {
    if (!input.trim() || loading || questionsLeft <= 0) return;
    const question = input.trim();
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/conundrum/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          question,
          previousQa: qa,
          inventory
        })
      });
      const data = await res.json();

      setQa((prev) => [...prev, { question, answer: data.answer || "You investigate the room further." }]);

      // Add newly discovered item to visual inventory grid
      if (data.newItem && data.newItem.name) {
        setInventory((prev) => {
          const exists = prev.some((item) => item.name.toLowerCase() === data.newItem.name.toLowerCase());
          return exists ? prev : [...prev, data.newItem];
        });
      }
    } catch (err) {
      setQa((prev) => [...prev, { question, answer: "You look around the room carefully." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="max-w-2xl mx-auto py-2 px-2 flex flex-col min-h-[85vh]"
    >
      {/* Scenario Header Card with Pixar 3D Hero Visual */}
      <div className="bg-gradient-to-br from-card to-card/90 border border-border/80 rounded-3xl overflow-hidden shadow-xl mb-4">
        {/* Pixar 3D Scenario Card */}
        <div className="relative h-48 sm:h-64 bg-slate-950 flex items-center justify-center overflow-hidden">
          {heroImage ? (
            <img
              src={heroImage}
              alt={scenario.title}
              onError={(e) => {
                if (e.target.src !== scenario.heroFallback) {
                  e.target.src = scenario.heroFallback;
                }
              }}
              className="w-full h-full object-cover filter contrast-105"
            />
          ) : (
            <div className="text-6xl">{scenario.emoji}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

          {/* Scenario Floating Tags */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/20 border border-accent/40 px-2.5 py-0.5 rounded-full backdrop-blur">
                {scenario.characterType}
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white uppercase leading-tight mt-1">
                {scenario.title}
              </h2>
            </div>

            {/* Question Counter */}
            <div className="bg-black/60 backdrop-blur border border-white/20 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shrink-0">
              <HelpCircle className="h-4 w-4 text-accent" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                {questionsLeft} Qs Left
              </span>
            </div>
          </div>
        </div>

        {/* Goal Description */}
        <div className="p-4 bg-card/60">
          <p className="text-sm font-medium text-foreground/90 leading-relaxed">
            🎯 <strong className="text-foreground">Goal:</strong> {scenario.goal}
          </p>
        </div>
      </div>

      {/* Discovered Clues & Items Inventory Grid */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Package className="h-4 w-4 text-accent" />
          <h4 className="text-xs font-black uppercase tracking-widest text-foreground/75">
            Discovered Environment Clues ({inventory.length})
          </h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {inventory.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card/90 border border-border/80 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-sm"
            >
              <span className="text-2xl shrink-0">{item.icon || "📦"}</span>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Q&A Investigation Chat Stream */}
      <div
        ref={scrollRef}
        className="flex-1 bg-card/40 border border-border/60 rounded-3xl p-4 overflow-y-auto space-y-3 mb-4 min-h-[180px] max-h-[300px]"
      >
        {qa.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center py-6 text-muted-foreground">
            <HelpCircle className="h-8 w-8 text-accent/60 mb-2" />
            <p className="text-xs font-medium max-w-xs">
              Ask your 1st question about the room, obstacles, nearby items, or character abilities!
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {qa.map((item, i) => (
            <div key={i} className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-xs sm:text-sm rounded-2xl rounded-br-xs px-3.5 py-2 max-w-[85%] shadow-sm">
                  {item.question}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-card text-card-foreground border border-border/80 font-medium text-xs sm:text-sm rounded-2xl rounded-bl-xs px-3.5 py-2 max-w-[85%] shadow-sm leading-relaxed">
                  {item.answer}
                </div>
              </motion.div>
            </div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border/80 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
              <span>Investigating environment...</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="space-y-2 mt-auto">
        {questionsLeft > 0 && (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask an environment question..."
              className="flex-1 bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent shadow-sm"
            />
            <Button
              onClick={handleAsk}
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-2xl h-12 w-12 p-0 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Button
          onClick={() => onGoToPlan(qa, inventory)}
          disabled={loading}
          className="w-full bg-gradient-to-r from-accent to-primary text-primary-foreground font-black text-sm uppercase tracking-wider rounded-2xl h-12 shadow-lg hover:opacity-95 flex items-center justify-center gap-2"
        >
          <span>Submit Master Solution Plan</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
