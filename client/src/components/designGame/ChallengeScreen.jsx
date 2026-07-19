import { motion } from "framer-motion";
import { Target, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerAvatar from "./CustomerAvatar";

export default function ChallengeScreen({ challenge, onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="max-w-md mx-auto w-full"
    >
      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }} className="flex items-center gap-2 text-cyan-400 mb-2">
        <Target className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-widest">Your Challenge</span>
      </motion.div>

      <div className="bg-card rounded-2xl p-4 shadow-lg ring-1 ring-black/5 mb-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-card-foreground font-display leading-tight">
          {challenge.title}
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed mt-1">{challenge.scenario}</p>
      </div>

      <div className="text-center mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Meet your customer</p>
      </div>

      <div className="flex flex-col items-center mb-4">
        <CustomerAvatar
          name={challenge.customer_name}
          image={challenge.customer_image}
          className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl shadow-2xl ring-2 ring-cyan-400"
        />
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-4 text-center leading-tight">
          {challenge.customer_name}
        </h3>
        <p className="text-slate-400 text-sm font-medium mt-0.5">{challenge.customer_role}</p>
      </div>

      <div className="bg-card ring-1 ring-black/5 rounded-2xl p-5 shadow-md mb-4">
        <p className="text-slate-600 text-sm leading-relaxed">{challenge.customer_persona}</p>
      </div>

      <div className="flex flex-col items-center text-slate-500 mb-3">
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </div>

      <Button
        onClick={onContinue}
        size="lg"
        className="w-full bg-cyan-400 text-[#20262e] hover:bg-cyan-300 font-bold rounded-lg shadow-lg h-12"
      >
        <span className="flex items-center gap-2">Interview {challenge.customer_name.split(" ")[0]} <ArrowRight className="h-5 w-5" /></span>
      </Button>
    </motion.div>
  );
}