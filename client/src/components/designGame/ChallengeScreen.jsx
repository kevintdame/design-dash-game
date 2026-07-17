import { motion } from "framer-motion";
import { Target, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChallengeScreen({ challenge, onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="max-w-md mx-auto"
    >
      <div className="flex items-center gap-2 text-slate-500 mb-3">
        <Target className="h-4 w-4" />
        <span className="text-xs font-extrabold uppercase tracking-widest">Your Challenge</span>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] mb-5">
        <h2 className="text-2xl font-black uppercase tracking-tighter bg-gradient-to-r from-[#c93c76] to-[#de573a] bg-clip-text text-transparent mb-3 font-sans leading-tight">
          {challenge.title}
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">{challenge.scenario}</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] mb-6">
        <div className="flex items-center gap-2 text-slate-400 mb-3">
          <User className="h-3.5 w-3.5" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest">Meet your customer</span>
        </div>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-amber-300 to-pink-400 flex items-center justify-center shrink-0 shadow-md">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-slate-900 font-extrabold text-sm">{challenge.customer_name}</div>
            <div className="text-slate-500 text-xs font-semibold">{challenge.customer_role}</div>
          </div>
        </div>
        <p className="text-slate-600 text-xs font-semibold leading-relaxed mt-3 pt-3 border-t border-slate-100">
          {challenge.customer_persona}
        </p>
      </div>

      <Button
        onClick={onContinue}
        size="lg"
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-lg h-14"
      >
        <span className="flex items-center gap-2">
          Interview {challenge.customer_name.split(" ")[0]} <ArrowRight className="h-4 w-4" />
        </span>
      </Button>
    </motion.div>
  );
}