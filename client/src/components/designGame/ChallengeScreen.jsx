import { motion } from "framer-motion";
import { Target, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerAvatar from "@/components/designGame/CustomerAvatar";

export default function ChallengeScreen({ challenge, onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="max-w-md mx-auto font-sans"
    >
      <div className="flex items-center gap-2 text-white mb-3 font-extrabold">
        <Target className="h-4 w-4" />
        <span className="text-xs uppercase tracking-widest">Your Challenge ⚡</span>
      </div>

      <div className="bg-[#191d3d] border border-[#2e3366] rounded-[32px] p-6 shadow-2xl mb-5">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-3 leading-tight font-sans">
          {challenge.title}
        </h2>
        <p className="text-[#d1d5f5] text-xs font-semibold leading-relaxed">{challenge.scenario}</p>
      </div>

      <div className="bg-[#191d3d] border border-[#2e3366] rounded-[32px] p-6 shadow-2xl mb-6">
        <div className="flex items-center gap-2 text-[#a5b4fc] mb-4 font-extrabold">
          <User className="h-3.5 w-3.5" />
          <span className="text-[10px] uppercase tracking-widest">Meet your customer 👤</span>
        </div>
        <div className="flex items-center gap-4 mb-1">
          <CustomerAvatar name={challenge.customer_name} className="h-16 w-16" />
          <div>
            <div className="text-white font-black text-base">{challenge.customer_name}</div>
            <div className="text-[#a5b4fc] text-xs font-bold">{challenge.customer_role}</div>
          </div>
        </div>
        <p className="text-[#d1d5f5] text-xs font-semibold leading-relaxed mt-3 pt-3 border-t border-[#2e3366]">
          {challenge.customer_persona}
        </p>
      </div>

      <Button
        onClick={onContinue}
        size="lg"
        className="w-full bg-[#ffc83b] hover:bg-[#e0ae2b] text-[#0b0c16] font-black rounded-2xl shadow-lg h-14"
      >
        <span className="flex items-center gap-2">
          Interview {challenge.customer_name.split(" ")[0]} <ArrowRight className="h-4 w-4" />
        </span>
      </Button>
    </motion.div>
  );
}