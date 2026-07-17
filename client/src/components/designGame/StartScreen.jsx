import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const DOMAINS = [
  "Health & Wellness",
  "Entertainment",
  "Education",
  "Finance",
  "Food & Cooking",
  "Travel & Mobility",
  "Sustainability",
  "Work & Productivity"
];

const CONSTRAINTS = ["app", "product", "service", "event"];

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-sm font-semibold rounded-2xl px-4 py-2.5 transition-all ring-1 ${
        active
          ? "bg-white text-purple-700 ring-white shadow-md"
          : "bg-white/10 text-white ring-white/25 hover:bg-white/20"
      }`}
    >
      {children}
      {active && <Check className="absolute -top-1 -right-1 h-3.5 w-3.5 text-purple-700 bg-white rounded-full p-0.5" />}
    </button>
  );
}

export default function StartScreen({ onStart, loading, onPortfolio }) {
  const [domain, setDomain] = useState(null);

  function handleStartSingle() {
    if (!domain) return;
    const randomConstraint = CONSTRAINTS[Math.floor(Math.random() * CONSTRAINTS.length)];
    onStart(domain, randomConstraint);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto flex flex-col items-center text-center space-y-6"
    >
      {/* Icon & Title */}
      <div className="flex flex-col items-center space-y-3">
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex h-16 w-16 rounded-3xl bg-white/15 backdrop-blur items-center justify-center shadow-lg ring-1 ring-white/30"
        >
          <Sparkles className="h-8 w-8 text-white" />
        </motion.div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            Design Dash
          </h1>
          <p className="text-white/80 text-xs sm:text-sm mt-1">
            Solve real-world design challenges and pitch your ideas to virtual customers.
          </p>
        </div>
      </div>

      {/* Domain Selection */}
      <div className="text-left w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-5 shadow-inner">
        <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">
          Select a Domain to Begin
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {DOMAINS.map((d) => (
            <Chip key={d} active={domain === d} onClick={() => setDomain(d)}>
              {d}
            </Chip>
          ))}
        </div>
      </div>

      {/* Mode Actions */}
      <div className="w-full flex flex-col space-y-3 pt-2">
        <Button
          onClick={handleStartSingle}
          disabled={!domain || loading}
          size="lg"
          className="w-full bg-white text-purple-700 hover:bg-white/95 font-extrabold rounded-2xl shadow-xl h-14 text-sm disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 border-2 border-purple-700/30 border-t-purple-700 rounded-full animate-spin" />
              Generating Challenge...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🚀 Play Single Player <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>

        <button
          type="button"
          onClick={() => {
            if (domain) {
              window.location.href = `/multiplayer?domain=${encodeURIComponent(domain)}`;
            } else {
              window.location.href = '/multiplayer';
            }
          }}
          className={`w-full flex items-center justify-center space-x-2 text-amber-300 hover:text-amber-200 text-sm font-extrabold bg-black/25 hover:bg-black/40 rounded-2xl py-4 transition shadow-lg border border-amber-500/25 ${
            !domain ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!domain}
        >
          <Users className="h-4 w-4" />
          <span>👥 Play Multiplayer Battle</span>
        </button>
      </div>

      {/* Portfolio Link */}
      <button
        type="button"
        onClick={onPortfolio}
        className="text-white/60 hover:text-white text-xs font-semibold underline-offset-4 hover:underline transition mt-2"
      >
        📂 View My Design Portfolio →
      </button>
    </motion.div>
  );
}