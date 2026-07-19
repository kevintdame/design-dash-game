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
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      type="button"
      onClick={onClick}
      className={`relative text-sm sm:text-base font-bold rounded-xl px-4 py-3 sm:py-3.5 transition-all ring-1 flex items-center gap-2.5 text-left w-full ${
        active
          ? "bg-cyan-400 text-[#20262e] ring-cyan-400 shadow-md"
          : "bg-white text-[#20262e] ring-black/10 hover:bg-slate-50"
      }`}
    >
      {Icon && <Icon className={`h-[18px] w-[18px] sm:h-5 sm:w-5 shrink-0 transition-colors ${active ? 'text-[#20262e]' : 'text-cyan-400'}`} />}
      <span className="leading-tight whitespace-nowrap truncate">{children}</span>
      {active && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5">
          <Check className="h-4 w-4 text-white bg-cyan-400 rounded-full p-0.5 ring-2 ring-[#1a1f26]" />
        </motion.span>
      )}
    </motion.button>
  );
}

export default function StartScreen({ onStart, loading, onPortfolio }) {
  const [domain, setDomain] = useState(null);
  const ready = !!domain;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md mx-auto pt-4"
    >
      <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6 max-w-sm mx-auto">
        Pick a domain, then meet a real-world challenge to solve for a customer.
      </p>

      <div className="text-left mb-6">
        <div className="text-cyan-400 text-xs font-display font-extrabold uppercase tracking-widest mb-3.5">
          Select Game Domain
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {DOMAINS.map((d, i) => (
            <motion.div key={d.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Chip active={domain === d.label} onClick={() => setDomain(d.label)} icon={d.icon}>
                {d.label}
              </Chip>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        whileHover={ready && !loading ? { scale: 1.02, y: -1 } : {}}
        whileTap={ready && !loading ? { scale: 0.98 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="w-full"
      >
        <Button
          onClick={() => ready && onStart(domain)}
          disabled={!ready || loading}
          size="lg"
          className="w-full bg-cyan-400 text-[#20262e] hover:bg-cyan-300 font-display font-bold tracking-wider uppercase rounded-lg shadow-lg text-sm sm:text-base h-14 disabled:opacity-40 disabled:hover:bg-cyan-400"
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
      </motion.div>

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