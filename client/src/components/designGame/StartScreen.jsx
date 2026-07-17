import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Check } from "lucide-react";
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

const CONSTRAINTS = [
  { key: "app", label: "Mobile App", desc: "A digital product" },
  { key: "product", label: "Physical Product", desc: "A tangible thing" },
  { key: "service", label: "Service", desc: "A human-delivered service" },
  { key: "event", label: "Event / Experience", desc: "A live experience" }
];

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-sm font-semibold rounded-2xl px-3.5 py-2.5 transition-all ring-1 ${
        active
          ? "bg-white text-purple-700 ring-white shadow-md"
          : "bg-white/10 text-white ring-white/25 hover:bg-white/20"
      }`}
    >
      {children}
      {active && <Check className="absolute -top-1.5 -right-1.5 h-4 w-4 text-purple-700 bg-white rounded-full p-0.5" />}
    </button>
  );
}

export default function StartScreen({ onStart, loading, onPortfolio }) {
  const [domain, setDomain] = useState(null);
  const [constraint, setConstraint] = useState(null);
  const ready = domain && constraint;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md mx-auto"
    >
      <motion.div
        animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-white/15 backdrop-blur items-center justify-center mb-4 shadow-lg ring-1 ring-white/30"
      >
        <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
      </motion.div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 font-display">
        Design Sprint
      </h1>
      <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-6">
        Pick your domain and constraint, then meet a real-world challenge to solve for a customer.
      </p>

      <div className="text-left mb-5">
        <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-2.5">
          1 · Choose a domain
        </div>
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map((d) => (
            <Chip key={d} active={domain === d} onClick={() => setDomain(d)}>
              {d}
            </Chip>
          ))}
        </div>
      </div>

      <div className="text-left mb-6">
        <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-2.5">
          2 · Choose a constraint
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CONSTRAINTS.map((c) => {
            const active = constraint === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setConstraint(c.key)}
                className={`relative text-left rounded-2xl px-3.5 py-3 transition-all ring-1 ${
                  active
                    ? "bg-white text-purple-700 ring-white shadow-md"
                    : "bg-white/10 text-white ring-white/25 hover:bg-white/20"
                }`}
              >
                <div className="text-sm font-bold leading-tight">{c.label}</div>
                <div className={`text-[11px] mt-0.5 ${active ? "text-purple-500" : "text-white/60"}`}>{c.desc}</div>
                {active && <Check className="absolute top-2 right-2 h-3.5 w-3.5 text-purple-700" />}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={() => ready && onStart(domain, constraint)}
        disabled={!ready || loading}
        size="lg"
        className="w-full bg-white text-purple-700 hover:bg-white/90 font-bold rounded-2xl shadow-xl text-base h-14 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-purple-700/30 border-t-purple-700 rounded-full animate-spin" />
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
        className="mt-3 text-white/70 hover:text-white text-xs font-medium underline-offset-2 hover:underline"
      >
        View my portfolio →
      </button>
    </motion.div>
  );
}