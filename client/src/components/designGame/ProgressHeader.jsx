import { motion } from "framer-motion";
import { Lightbulb, MessageCircle, Brain, Rocket, Trophy, Check } from "lucide-react";

export const STAGES = [
  { key: "challenge", label: "Challenge", Icon: Lightbulb },
  { key: "interview", label: "Interview", Icon: MessageCircle },
  { key: "brainstorm", label: "Ideate", Icon: Brain },
  { key: "final", label: "Final", Icon: Rocket },
  { key: "results", label: "Score", Icon: Trophy }
];

export default function ProgressHeader({ currentIndex }) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full max-w-md mx-auto">
      {STAGES.map((stage, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const { Icon } = stage;
        return (
          <div key={stage.key} className="flex items-center gap-1.5 sm:gap-2 flex-1">
            <motion.div
              initial={false}
              animate={{
                scale: active ? 1.2 : 1,
              }}
              className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                done || active
                  ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-accent/30"
                  : "bg-secondary/60 text-foreground/50"
              }`}
            >
              {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" />}
            </motion.div>
            {i < STAGES.length - 1 && (
              <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: done ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                  className="h-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}