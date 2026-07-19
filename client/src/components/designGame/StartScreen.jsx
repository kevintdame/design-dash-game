import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Check, HeartPulse, Clapperboard, GraduationCap, Wallet, UtensilsCrossed, Plane, Leaf, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

const DOMAINS = [
  { label: "Health & Wellness", icon: HeartPulse },
  { label: "Entertainment", icon: Clapperboard },
  { label: "Education", icon: GraduationCap },
  { label: "Finance", icon: Wallet },
  { label: "Food & Cooking", icon: UtensilsCrossed },
  { label: "Travel & Mobility", icon: Plane },
  { label: "Sustainability", icon: Leaf },
  { label: "Work & Productivity", icon: Briefcase }
];

function Chip({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-xs font-semibold rounded-lg px-3 py-2.5 transition-all ring-1 flex items-center gap-1.5 text-left w-full ${
        active
          ? "bg-cyan-400 text-[#20262e] ring-cyan-400 shadow-md"
          : "bg-white text-[#20262e] ring-black/10 hover:bg-slate-50"
      }`}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      <span className="leading-tight whitespace-nowrap truncate">{children}</span>
      {active && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5">
          <Check className="h-4 w-4 text-white bg-cyan-400 rounded-full p-0.5 ring-2 ring-[#1a1f26]" />
        </motion.span>
      )}
    </button>
  );
}

export default function StartScreen({ onStart, loading, onPortfolio }) {
  const [domain, setDomain] = useState(null);
  const ready = !!domain;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md mx-auto"
    >
      <motion.div
        animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#20262e] ring-2 ring-cyan-400 items-center justify-center mb-6 shadow-lg"
      >
        <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-400" />
      </motion.div>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 font-display text-white">
        Design Dash
      </h1>
      <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-sm mx-auto">
        Pick a domain, then meet a real-world challenge to solve for a customer.
      </p>

      <div className="text-left mb-6">
        <div className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Choose a domain
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DOMAINS.map((d, i) => (
            <motion.div key={d.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Chip active={domain === d.label} onClick={() => setDomain(d.label)} icon={d.icon}>
                {d.label}
              </Chip>
            </motion.div>
          ))}
        </div>
      </div>

      <Button
        onClick={() => ready && onStart(domain)}
        disabled={!ready || loading}
        size="lg"
        className="w-full bg-cyan-400 text-[#20262e] hover:bg-cyan-300 font-bold rounded-lg shadow-lg text-base h-14 disabled:opacity-40 disabled:hover:bg-cyan-400"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-[#20262e]/30 border-t-[#20262e] rounded-full animate-spin" />
            Generating challenge...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Start Playing <ArrowRight className="h-5 w-5" />
          </span>
        )}
      </Button>

      <button
        type="button"
        onClick={onPortfolio}
        className="mt-4 text-slate-400 hover:text-white text-xs font-medium underline-offset-2 hover:underline transition-colors"
      >
        View my portfolio →
      </button>
    </motion.div>
  );
}