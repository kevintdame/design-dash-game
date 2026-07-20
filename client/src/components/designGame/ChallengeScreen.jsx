import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChallengeScreen({ challenge, onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="max-w-md mx-auto w-full"
    >
      <div className="text-center mb-3">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 12 }}
          className="inline-flex items-center gap-1.5 text-yellow-300"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-extrabold uppercase tracking-widest">Your challenge</span>
        </motion.div>
      </div>

      <div className="bg-gradient-to-br from-primary/90 to-accent/90 text-primary-foreground rounded-3xl p-5 shadow-xl shadow-primary/30 mb-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight uppercase">
          {challenge.title}
        </h2>
        <p className="text-primary-foreground/90 text-sm leading-relaxed mt-2">{challenge.scenario}</p>
      </div>

      <div className="text-center mb-3">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-accent">Meet your customer</p>
      </div>

      <div className="flex flex-col items-center mb-4">
        {challenge.customer_image ? (
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 160, damping: 12 }}
            src={challenge.customer_image}
            alt={challenge.customer_name}
            className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl object-cover shadow-2xl ring-4 ring-accent"
          />
        ) : (
          <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-br from-primary to-accent ring-4 ring-accent flex items-center justify-center shadow-2xl">
            <span className="text-6xl font-extrabold text-primary-foreground font-display">
              {challenge.customer_name.charAt(0)}
            </span>
          </div>
        )}
        <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground font-display mt-4 text-center leading-tight uppercase">
          {challenge.customer_name}
        </h3>
        <p className="text-accent text-sm font-bold mt-0.5">{challenge.customer_role}</p>
      </div>

      <div className="bg-card/80 backdrop-blur ring-1 ring-border rounded-3xl p-5 shadow-md mb-4">
        <p className="text-card-foreground text-sm leading-relaxed">{challenge.customer_persona}</p>
      </div>

      <div className="flex flex-col items-center text-foreground/40 mb-3">
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </div>

      <Button
        onClick={onContinue}
        size="lg"
        className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-bold rounded-2xl shadow-xl shadow-primary/30 h-14"
      >
        <span className="flex items-center gap-2">Interview {challenge.customer_name.split(" ")[0]} <ArrowRight className="h-5 w-5" /></span>
      </Button>
    </motion.div>
  );
}