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
      {/* Header */}
      <div className="flex flex-col items-center space-y-3">
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex h-16 w-16 rounded-3xl bg-white/15 backdrop-blur items-center justify-center shadow-lg ring-1 ring-white/30"
        >
          <Sparkles className="h-8 w-8 text-white" />
        </motion.div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            Design Dash
          </h1>
          <p className="text-white/80 text-xs sm:text-sm mt-1">
            Solve real-world design challenges and pitch your ideas to virtual customers.
          </p>
        </div>
      </div>

      {/* Mode Selection Cards */}
      <div className="w-full flex flex-col space-y-4">
        {/* Single Player Card */}
        <Card 
          onClick={onSelectSingle}
          className="bg-white/10 border-white/20 hover:border-white/40 text-white backdrop-blur-md cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-2xl text-left"
        >
          <CardContent className="p-5 flex items-start space-x-4">
            <div className="h-12 w-12 rounded-2xl bg-white text-purple-700 flex items-center justify-center shrink-0 shadow-md">
              <User className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-extrabold text-base flex items-center justify-between">
                <span>Single Player Sprint</span>
                <ArrowRight className="h-4 w-4 opacity-70" />
              </div>
              <p className="text-white/70 text-xs leading-relaxed">
                Take on a design sprint solo and pitch your final solution to a virtual customer.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Multiplayer Card */}
        <Card 
          onClick={onSelectMulti}
          className="bg-black/25 border-amber-500/20 hover:border-amber-500/40 text-white backdrop-blur-md cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-2xl text-left"
        >
          <CardContent className="p-5 flex items-start space-x-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-extrabold text-base text-amber-300 flex items-center justify-between">
                <span>Multiplayer Battle Arena</span>
                <ArrowRight className="h-4 w-4 opacity-70" />
              </div>
              <p className="text-white/70 text-xs leading-relaxed">
                Create a room or join friends to compete on the same challenge side-by-side.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Footer */}
      <button
        type="button"
        onClick={onPortfolio}
        className="text-white/60 hover:text-white text-xs font-semibold underline-offset-4 hover:underline transition mt-2"
      >
        📂 View My Design Portfolio →
      </button>
    </motion.div>
  );
}
