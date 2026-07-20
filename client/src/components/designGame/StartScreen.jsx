import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const DOMAINS = [
  { label: "Health & Wellness", grad: "from-emerald-400 to-teal-600", ring: "ring-emerald-300", glow: "rgba(16,185,129,0.5)" },
  { label: "Entertainment", grad: "from-fuchsia-500 to-purple-600", ring: "ring-fuchsia-300", glow: "rgba(217,70,239,0.5)" },
  { label: "Education", grad: "from-sky-400 to-indigo-600", ring: "ring-sky-300", glow: "rgba(56,189,248,0.5)" },
  { label: "Finance", grad: "from-lime-400 to-green-600", ring: "ring-lime-300", glow: "rgba(132,204,22,0.5)" },
  { label: "Food & Cooking", grad: "from-orange-400 to-rose-600", ring: "ring-orange-300", glow: "rgba(251,146,60,0.5)" },
  { label: "Travel & Mobility", grad: "from-cyan-400 to-blue-600", ring: "ring-cyan-300", glow: "rgba(34,211,238,0.5)" },
  { label: "Sustainability", grad: "from-green-400 to-emerald-600", ring: "ring-green-300", glow: "rgba(34,197,94,0.5)" },
  { label: "Work & Productivity", grad: "from-amber-400 to-pink-500", ring: "ring-amber-300", glow: "rgba(251,191,36,0.5)" }
];

function Chip({ active, onClick, grad, ring, glow, children }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05, rotate: active ? 0 : -2 }}
      whileTap={{ scale: 0.95 }}
      className={`relative text-sm font-bold rounded-3xl px-4 py-5 transition-all ring-2 flex items-center justify-center text-center w-full bg-gradient-to-br ${grad} text-white ${
        active ? `${ring} ring-offset-2 ring-offset-background shadow-2xl` : "ring-black/10 shadow-lg"
      }`}
      style={active ? { boxShadow: `0 10px 30px -8px ${glow}` } : undefined}
    >
      <span className="leading-tight font-display uppercase tracking-wide drop-shadow text-base">{children}</span>
      {active && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5">
          <Check className="h-5 w-5 text-white bg-black/40 rounded-full p-0.5 ring-2 ring-background" />
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
      className="text-center max-w-md mx-auto"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 12 }}
        className="inline-flex items-center gap-1.5 mb-3 text-yellow-300"
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-extrabold uppercase tracking-widest">Design thinking game</span>
        <Sparkles className="h-4 w-4" />
      </motion.div>

      <h2 className="text-5xl sm:text-6xl font-extrabold font-display uppercase leading-none mb-2">
        <span className="text-foreground">Pick your</span>{" "}
        <span className="text-accent">challenge</span>
      </h2>
      <p className="text-foreground/70 text-sm sm:text-base mb-8">Choose a domain to tackle.</p>

      <div className="mb-6">
        <div className="grid grid-cols-2 gap-3">
          {DOMAINS.map((d, i) => (
            <motion.div key={d.label} initial={{ opacity: 0, y: 12, rotate: i % 2 ? 2 : -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 14 }}>
              <Chip active={domain === d.label} onClick={() => setDomain(d.label)} grad={d.grad} ring={d.ring} glow={d.glow}>
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
        className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-bold rounded-2xl shadow-xl shadow-primary/30 text-base h-14 disabled:opacity-40"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
        className="mt-4 text-foreground/60 hover:text-foreground text-xs font-bold underline-offset-2 hover:underline transition-colors"
      >
        View my portfolio →
      </button>
    </motion.div>
  );
}