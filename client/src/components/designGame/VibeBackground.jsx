import { motion } from "framer-motion";

export default function VibeBackground() {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, hsl(var(--primary)/0.38), transparent 60%), radial-gradient(90% 70% at 50% 100%, hsl(var(--accent)/0.24), transparent 65%), linear-gradient(180deg, hsl(var(--background)), hsl(var(--secondary)))",
      }}
    />
  );
}