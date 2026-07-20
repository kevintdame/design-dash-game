import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, User } from "lucide-react";
import VibeBackground from "@/components/designGame/VibeBackground";

function getRankBadgeStyles(rank) {
  if (rank === 1) {
    return {
      grad: "from-amber-400 to-pink-500",
      ring: "ring-amber-300",
      emoji: "🥇",
      shadow: "rgba(251,191,36,0.5)",
      textAccent: "text-[#ff5c8a]"
    };
  }
  if (rank === 2) {
    return {
      grad: "from-slate-400 to-slate-600",
      ring: "ring-slate-350",
      emoji: "🥈",
      shadow: "rgba(148,163,184,0.3)",
      textAccent: "text-slate-600"
    };
  }
  if (rank === 3) {
    return {
      grad: "from-amber-600 to-amber-800",
      ring: "ring-amber-500",
      emoji: "🥉",
      shadow: "rgba(217,119,6,0.3)",
      textAccent: "text-amber-700"
    };
  }
  return {
    grad: "from-purple-500 to-indigo-650",
    ring: "ring-purple-400",
    emoji: `${rank}`,
    shadow: "rgba(168,85,247,0.3)",
    textAccent: "text-purple-600"
  };
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/leaderboard");
        if (!res.ok) throw new Error("API error");
        const list = await res.json();
        setLeaders(list);
      } catch (err) {
        console.error(err);
        setLeaders([]);
      }
    })();
  }, []);

  return (
    <div className="relative min-h-[100dvh] w-full bg-transparent overflow-y-auto flex flex-col items-center">
      <VibeBackground />
      
      <div className="max-w-lg w-full px-4 py-6 z-10">
        {/* HEADER BAR */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate("/")} 
            className="h-9 w-9 rounded-lg bg-accent text-white flex items-center justify-center hover:bg-accent/90 shadow-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-2xl font-extrabold font-display text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400 animate-bounce" /> Hall of Fame
          </h1>
        </div>

        {/* LOADING INDICATOR */}
        {leaders === null ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-4 border-white/10 border-t-accent rounded-full animate-spin" />
          </div>
        ) : leaders.length === 0 ? (
          /* EMPTY LOBBY */
          <div className="text-center py-16 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <Trophy className="h-12 w-12 text-slate-500 mx-auto mb-3 opacity-40" />
            <p className="text-slate-400 text-sm font-semibold">No high scores recorded yet.</p>
            <p className="text-slate-500 text-xs mt-1">Be the first to save a high-scoring concept!</p>
          </div>
        ) : (
          /* LEADERBOARD LIST */
          <div className="space-y-4">
            {leaders.map((s, idx) => {
              const rank = idx + 1;
              const styles = getRankBadgeStyles(rank);
              const isExpanded = expandedId === s.id;
              const overallScore = s.overall_score || Math.round(((s.value_score || 0) + (s.creativity_score || 0) + (s.uniqueness_score || 0)) / 3);

              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  whileHover={{ scale: 1.01 }}
                  className={`cursor-pointer rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br ${
                    isExpanded ? styles.grad : "from-slate-900/80 to-slate-950/80 hover:border-white/20"
                  } p-5 transition-all shadow-xl`}
                  style={{ boxShadow: isExpanded ? `0 8px 24px -6px ${styles.shadow}` : undefined }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3.5">
                      {/* Rank Indicator */}
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center font-display font-black text-sm ${
                        isExpanded ? "bg-white text-slate-900" : `bg-gradient-to-br ${styles.grad} text-white`
                      }`}>
                        {styles.emoji}
                      </span>
                      
                      <div className="space-y-1">
                        <h3 className={`font-display font-extrabold text-base uppercase tracking-wide leading-tight ${
                          isExpanded ? "text-white" : "text-white"
                        }`}>
                          {s.concept_name || "Concept Name"}
                        </h3>
                        
                        <p className={`text-xs font-semibold flex items-center gap-1 ${
                          isExpanded ? "text-white/85" : "text-slate-400"
                        }`}>
                          <User className="h-3 w-3" />
                          <span>Designed by <strong className={isExpanded ? "text-white" : "text-slate-200"}>{s.player_name || "Anonymous Designer"}</strong></span>
                        </p>
                        
                        <p className={`text-[10px] uppercase font-bold tracking-widest ${
                          isExpanded ? "text-white/70" : "text-slate-500"
                        }`}>
                          {s.domain} • For {s.customer_name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-display font-black text-sm px-3.5 py-1 rounded-full shadow-md ${
                        isExpanded ? `bg-white ${styles.textAccent}` : "bg-gradient-to-r from-primary to-accent text-white"
                      }`}>
                        {overallScore} pts
                      </span>
                    </div>
                  </div>

                  {/* Summary & Breakdown details (expandable) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="w-full border-t border-white/20 mt-4 pt-4 text-xs text-white space-y-3.5 overflow-hidden"
                      >
                        <p className="font-semibold leading-relaxed">
                          <strong className="text-white/95 block text-[10px] uppercase tracking-wider mb-0.5">Solution Overview</strong>
                          {s.solution_overview}
                        </p>

                        <div className="bg-black/15 border border-white/10 rounded-2xl p-3.5 space-y-1">
                          <strong className="text-white/95 block text-[9px] uppercase tracking-wider">💭 Customer Feedback</strong>
                          <p className="italic font-semibold text-white/95 leading-relaxed">
                            "{s.review || "A fantastic response to the challenge."}"
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px] uppercase font-bold text-white/80">
                          <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                            <span className="block text-white font-black text-base leading-none mb-1">{s.value_score}</span> Value
                          </div>
                          <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                            <span className="block text-white font-black text-base leading-none mb-1">{s.creativity_score}</span> Unique
                          </div>
                          <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                            <span className="block text-white font-black text-base leading-none mb-1">{s.uniqueness_score}</span> Design
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
