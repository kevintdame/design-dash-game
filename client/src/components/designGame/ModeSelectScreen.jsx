import { motion } from "framer-motion";
import { Sparkles, ArrowRight, User, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ModeSelectScreen({ onSelectSingle, onSelectMulti, onPortfolio }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto flex flex-col items-center text-center space-y-6"
    >
      <div className="flex flex-col items-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none mb-6 font-display flex flex-col items-center uppercase select-none mt-4">
          <span className="text-white drop-shadow-md">Concept</span>
          <span className="text-cyan-400 drop-shadow-md">Jam</span>
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
          Solve real-world design challenges and pitch your ideas to virtual customers.
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="w-full flex flex-col space-y-4">
        {/* Single Player Card */}
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Card 
            onClick={onSelectSingle}
            className="bg-card text-card-foreground border border-slate-200/5 cursor-pointer transition-all rounded-2xl overflow-hidden ring-1 ring-black/5 hover:ring-cyan-400/30"
          >
            <CardContent className="p-5 flex items-start space-x-4">
              <div className="h-12 w-12 rounded-xl bg-[#20262e] ring-1 ring-cyan-400/25 text-cyan-400 flex items-center justify-center shrink-0 shadow-md">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <div className="font-display font-extrabold tracking-wider uppercase text-sm sm:text-base flex items-center justify-between text-card-foreground">
                  <span>Single Player Jam</span>
                  <ArrowRight className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  Take on a concept jam solo and pitch your final solution to a virtual customer.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Multiplayer Card */}
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Card 
            onClick={onSelectMulti}
            className="bg-card text-card-foreground border border-slate-200/5 cursor-pointer transition-all rounded-2xl overflow-hidden ring-1 ring-black/5 hover:ring-cyan-400/30"
          >
            <CardContent className="p-5 flex items-start space-x-4">
              <div className="h-12 w-12 rounded-xl bg-[#20262e] ring-1 ring-cyan-400/25 text-cyan-400 flex items-center justify-center shrink-0 shadow-md">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <div className="font-display font-extrabold tracking-wider uppercase text-sm sm:text-base flex items-center justify-between text-card-foreground">
                  <span>Multiplayer Battle</span>
                  <ArrowRight className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  Create a room or join friends to compete on the same challenge side-by-side.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Portfolio Footer */}
      <button
        type="button"
        onClick={onPortfolio}
        className="mt-2 text-slate-400 hover:text-white text-xs font-medium underline-offset-2 hover:underline transition-colors"
      >
        View My Design Portfolio →
      </button>
    </motion.div>
  );
}
