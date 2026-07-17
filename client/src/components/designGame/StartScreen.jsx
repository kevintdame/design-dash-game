import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
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

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-xs font-extrabold rounded-2xl px-4 py-3 transition-all border ${
        active
          ? "bg-[#ffc83b] text-[#0b0c16] border-[#ffc83b] shadow-md font-black"
          : "bg-[#282d5a] text-[#d1d5f5] hover:bg-[#343a75] border-[#3c4285]"
      }`}
    >
      {children}
      {active && <Check className="absolute -top-1 -right-1 h-3.5 w-3.5 text-[#0b0c16] bg-[#ffc83b] rounded-full p-0.5" />}
    </button>
  );
}

export default function StartScreen({ onStart, loading, onBack }) {
  const [domain, setDomain] = useState(null);

  function handleStartSingle() {
    if (!domain) return;
    onStart(domain);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-md mx-auto flex flex-col items-center space-y-6 font-sans"
    >
      {/* Header */}
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="text-[10px] uppercase font-extrabold text-white/80 tracking-widest">Step 2 of 3</div>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white font-sans drop-shadow-md">
          Choose a Domain 🎯
        </h2>
        <p className="text-[#a5b4fc] text-xs font-extrabold">Pick the focus area for your design challenge.</p>
      </div>

      {/* Domain Selection */}
      <div className="text-left w-full bg-[#191d3d] border border-[#2e3366] rounded-[32px] p-6 shadow-2xl">
        <div className="flex flex-wrap justify-center gap-2.5">
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
          className="w-full bg-[#ffc83b] hover:bg-[#e0ae2b] text-[#0b0c16] font-black rounded-2xl shadow-lg h-14 text-sm disabled:opacity-50 transition-transform active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 border-2 border-[#0b0c16]/30 border-t-[#0b0c16] rounded-full animate-spin" />
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
          className="w-full flex items-center justify-center space-x-1.5 text-[#ffc83b] hover:text-white text-xs font-black py-2 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Go Back</span>
        </button>
      </div>
    </motion.div>
  );
}