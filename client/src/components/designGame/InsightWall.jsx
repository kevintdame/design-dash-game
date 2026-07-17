import { motion } from "framer-motion";
import { StickyNote, Quote } from "lucide-react";

const STYLES = {
  insight: {
    bg: "bg-amber-200",
    text: "text-amber-950",
    label: "Insight",
    labelColor: "text-amber-700/70",
    rotate: "-3deg"
  },
  pain_point: {
    bg: "bg-rose-200",
    text: "text-rose-950",
    label: "Pain point",
    labelColor: "text-rose-700/70",
    rotate: "2deg"
  },
  need: {
    bg: "bg-sky-200",
    text: "text-sky-950",
    label: "Need",
    labelColor: "text-sky-700/70",
    rotate: "-1.5deg"
  }
};

export default function InsightWall({ insights }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 text-white/80 mb-3">
        <StickyNote className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Research Wall</span>
        <span className="text-white/50 text-xs">· from your interview</span>
      </div>
      <div className="flex flex-wrap gap-2.5 justify-center">
        {insights.map((note, i) => {
          const s = STYLES[note.type] || STYLES.insight;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14, rotate: 0, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, rotate: s.rotate, scale: 1 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 220, damping: 16 }}
              whileHover={{ scale: 1.06, rotate: 0, zIndex: 10 }}
              className={`${s.bg} ${s.text} w-[calc(50%-0.4rem)] sm:w-40 rounded-sm px-3 pt-4 pb-3 shadow-lg relative`}
              style={{ minHeight: "5.5rem" }}
            >
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-white/40 shadow-sm" />
              <Quote className="h-3 w-3 mb-1 opacity-50" />
              <p className="text-xs font-semibold leading-snug">{note.text}</p>
              <p className={`text-[9px] uppercase tracking-wide font-bold mt-2 ${s.labelColor}`}>{s.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}