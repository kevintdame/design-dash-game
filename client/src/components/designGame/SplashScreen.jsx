import { motion } from "framer-motion";
import { ArrowRight, Lightbulb } from "lucide-react";

export default function SplashScreen({ onEnter }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex flex-col items-center justify-center text-center max-w-md mx-auto w-full overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, hsl(var(--primary)/0.35), transparent 60%), radial-gradient(90% 70% at 50% 100%, hsl(var(--accent)/0.18), transparent 65%), linear-gradient(180deg, hsl(var(--background)), hsl(var(--secondary)))",
        }}
      />
      <motion.div
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative inline-flex items-center justify-center mb-6"
      >
        <Lightbulb className="h-12 w-12 sm:h-14 sm:w-14 text-yellow-300 drop-shadow-[0_0_14px_rgba(253,224,71,0.55)]" />
      </motion.div>

      <motion.h1
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 140, damping: 12 }}
        className="relative text-6xl sm:text-8xl leading-none tracking-tight font-display uppercase"
      >
        <motion.span
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block text-foreground"
        >
          Concept
        </motion.span>{" "}
        <motion.span
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="inline-block text-accent"
        >
          Jam
        </motion.span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-foreground/70 text-sm sm:text-base leading-relaxed mt-4 max-w-xs"
      >
        A fast-paced design thinking game. Solve a real-world challenge in minutes.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onEnter}
        className="relative mt-8 inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold rounded-lg px-8 h-12 shadow-lg hover:bg-primary/90 transition-colors text-base overflow-hidden"
      >
        <motion.span
          aria-hidden
          animate={{ x: ["-120%", "220%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          className="absolute inset-y-0 w-1/3 bg-white/20 blur-md"
        />
        <span className="relative">Begin</span>
        <motion.span
          aria-hidden
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <ArrowRight className="h-5 w-5" />
        </motion.span>
      </motion.button>
    </motion.div>
  );
}