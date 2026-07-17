import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export const STAGES = [
  { key: "challenge", label: "Challenge", icon: Lightbulb },
  { key: "interview", label: "Interview" },
  { key: "brainstorm", label: "Ideate" },
  { key: "final", label: "Final" },
  { key: "results", label: "Score" }
];

export default function ProgressHeader({ currentIndex }) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full max-w-md mx-auto">
      {STAGES.map((stage, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={stage.key} className="flex items-center gap-1.5 sm:gap-2 flex-1">
            <motion.div
              initial={false}
              animate={{
                scale: active ? 1.15 : 1,
                backgroundColor: active 
                  ? "#ffc83b" 
                  : done 
                  ? "#a855f7" 
                  : "rgba(255, 255, 255, 0.12)",
                color: active 
                  ? "#0b0c16" 
                  : done 
                  ? "#ffffff" 
                  : "rgba(255, 255, 255, 0.4)"
              }}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 shadow-sm"
            >
              {done ? "✓" : i + 1}
            </motion.div>
            {i < STAGES.length - 1 && (
              <div className="flex-1 h-0.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: done ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                  className="h-full bg-[#ffc83b]"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}