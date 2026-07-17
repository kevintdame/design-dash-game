import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
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

export default function StartScreen({ onStart, loading, onBack }) {
  const [domain, setDomain] = useState(null);

  function handleStartSingle() {
    if (!domain) return;
    const randomConstraint = CONSTRAINTS[Math.floor(Math.random() * CONSTRAINTS.length)];
    onStart(domain, randomConstraint);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-md mx-auto flex flex-col items-center space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Step 2 of 3</div>
        <h2 className="text-2xl font-extrabold text-white font-display">Choose a Domain</h2>
        <p className="text-white/80 text-xs">Pick the focus area for your design challenge.</p>
      </div>

      {/* Domain Selection */}
      <div className="text-left w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-5 shadow-inner">
        <div className="flex flex-wrap justify-center gap-2">
          {DOMAINS.map((d) => (
            <Chip key={d} active={domain === d} onClick={() => setDomain(d)}>
              {d}
            </Chip>
          ))}
        </div>
      </div>

      {/* Actions */}
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
              Start Design Sprint <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>

        <button
          type="button"
          onClick={onBack}
          className="w-full flex items-center justify-center space-x-1.5 text-white/70 hover:text-white text-xs font-semibold py-2 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Go Back</span>
        </button>
      </div>
    </motion.div>
  );
}