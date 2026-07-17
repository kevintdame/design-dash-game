import { motion } from "framer-motion";
import { Sparkles, ArrowRight, User, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ModeSelectScreen({ onSelectSingle, onSelectMulti, onPortfolio }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto flex flex-col items-center text-center space-y-6 font-sans"
    >
      {/* Header */}
      <div className="flex flex-col items-center space-y-4">
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex h-16 w-16 rounded-3xl bg-[#1e234c] items-center justify-center shadow-lg ring-1 ring-white/10"
        >
          <Sparkles className="h-8 w-8 text-[#ffc83b]" />
        </motion.div>
        <div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white font-sans drop-shadow-md">
            Design Dash 🚀
          </h1>
          <p className="text-[#a5b4fc] text-xs sm:text-sm font-extrabold mt-1">
            Solve real-world design challenges and pitch your ideas to virtual customers.
          </p>
        </div>
      </div>

      {/* Mode Selection Cards */}
      <div className="w-full flex flex-col space-y-4">
        {/* Single Player Card */}
        <Card 
          onClick={onSelectSingle}
          className="bg-[#191d3d] border border-[#2e3366] text-white cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] rounded-[32px] overflow-hidden"
        >
          <CardContent className="p-6 flex items-start space-x-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#9333ea] to-[#db2777] text-white flex items-center justify-center shrink-0 shadow-md">
              <User className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-extrabold text-base flex items-center justify-between text-white">
                <span>Single Player Sprint ⚡</span>
                <ArrowRight className="h-5 w-5 text-[#a5b4fc]" />
              </div>
              <p className="text-[#d1d5f5] text-xs font-semibold leading-relaxed text-left">
                Take on a design sprint solo and pitch your final solution to a virtual customer.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Multiplayer Card */}
        <Card 
          onClick={onSelectMulti}
          className="bg-[#191d3d] border border-[#2e3366] text-white cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] rounded-[32px] overflow-hidden"
        >
          <CardContent className="p-6 flex items-start space-x-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#2563eb] to-[#0d9488] text-white flex items-center justify-center shrink-0 shadow-md">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-extrabold text-base flex items-center justify-between text-white">
                <span>Multiplayer Battle 💜</span>
                <ArrowRight className="h-5 w-5 text-[#a5b4fc]" />
              </div>
              <p className="text-[#d1d5f5] text-xs font-semibold leading-relaxed text-left">
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
        className="text-[#ffc83b] hover:text-white text-xs font-black underline-offset-4 hover:underline transition mt-2"
      >
        View My Design Portfolio →
      </button>
    </motion.div>
  );
}
