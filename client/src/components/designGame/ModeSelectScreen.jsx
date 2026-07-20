import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const MODES = [
  {
    key: "single",
    label: "Solo Jam",
    desc: "Take on a challenge all by yourself.",
    emoji: "🎯",
    grad: "from-fuchsia-500 to-purple-600",
    ring: "ring-fuchsia-400",
    glow: "rgba(217,70,239,0.5)",
  },
  {
    key: "multi",
    label: "Squad Jam",
    desc: "Rally your friends and jam together.",
    emoji: "🚀",
    grad: "from-amber-400 to-pink-500",
    ring: "ring-amber-300",
    glow: "rgba(251,191,36,0.5)",
  },
];

export default function ModeSelectScreen({ onSelect }) {
  const [mode, setMode] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="relative text-center max-w-md mx-auto w-full"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, hsl(var(--primary)/0.4), transparent 60%), radial-gradient(90% 70% at 50% 100%, hsl(var(--accent)/0.22), transparent 65%), linear-gradient(180deg, hsl(var(--background)), hsl(var(--secondary)))",
        }}
      />

      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 12 }}
        className="inline-flex items-center gap-1.5 mb-3 text-yellow-300"
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-xs font-extrabold uppercase tracking-widest">Let's play</span>
        <Sparkles className="h-5 w-5" />
      </motion.div>

      <motion.h2
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 150, damping: 13 }}
        className="text-5xl sm:text-6xl font-extrabold font-display uppercase leading-none mb-2"
      >
        <span className="text-foreground">Pick your</span>{" "}
        <span className="text-accent">vibe</span>
      </motion.h2>
      <p className="text-foreground/70 text-sm sm:text-base mb-8">Solo mission or a squad showdown?</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {MODES.map((m, i) => {
          const active = mode === m.key;
          return (
            <motion.button
              key={m.key}
              type="button"
              initial={{ opacity: 0, y: 14, rotate: i === 0 ? -3 : 3 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              whileHover={{ scale: 1.04, rotate: i === 0 ? -2 : 2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 14 }}
              onClick={() => setMode(m.key)}
              className={`relative text-left rounded-3xl p-5 ring-2 transition-all overflow-hidden bg-gradient-to-br ${m.grad} ${
                active ? `${m.ring} ring-offset-2 ring-offset-background shadow-2xl` : "ring-black/10 shadow-lg"
              }`}
              style={active ? { boxShadow: `0 10px 30px -8px ${m.glow}` } : undefined}
            >
              <div className="flex items-start justify-between">
                <motion.span
                  animate={active ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 1.2, repeat: active ? Infinity : 0 }}
                  className="text-4xl drop-shadow"
                >
                  {m.emoji}
                </motion.span>
                {active && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-white">
                    <Check className="h-5 w-5" />
                  </motion.span>
                )}
              </div>
              <span className="block font-display text-2xl text-white mt-3 uppercase tracking-wide drop-shadow">
                {m.label}
              </span>
              <span className="block text-white/85 text-sm leading-snug mt-0.5">{m.desc}</span>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        animate={mode ? { y: 0, opacity: 1 } : { y: 8, opacity: 0.6 }}
        className={mode ? "" : "pointer-events-none"}
      >
        <Button
          onClick={() => mode && onSelect(mode)}
          disabled={!mode}
          size="lg"
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold rounded-2xl shadow-xl text-base h-14 disabled:opacity-40"
        >
          <span className="flex items-center gap-2">
            Let's go <ArrowRight className="h-5 w-5" />
          </span>
        </Button>
      </motion.div>

      {/* Portfolio Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mt-6"
      >
        <button
          type="button"
          onClick={() => onSelect("portfolio")}
          className="text-xs font-black tracking-wider uppercase text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5 mx-auto py-2 px-4 rounded-xl hover:bg-white/5"
        >
          📂 View My Saved Concepts
        </button>
      </motion.div>
    </motion.div>
  );
}