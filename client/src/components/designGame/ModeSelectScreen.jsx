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
      <div className="flex flex-col items-center space-y-4">
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex h-16 w-16 rounded-3xl bg-white items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.05)] ring-1 ring-slate-100"
        >
          <Sparkles className="h-8 w-8 text-[#de573a]" />
        </motion.div>
        <div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter bg-gradient-to-r from-[#c93c76] via-[#de573a] to-[#f09c35] bg-clip-text text-transparent font-sans">
            Design Dash
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
            Solve real-world design challenges and pitch your ideas to virtual customers.
          </p>
        </div>
      </div>

      {/* Mode Selection Cards */}
      <div className="w-full flex flex-col space-y-4">
        {/* Single Player Card */}
        <Card 
          onClick={onSelectSingle}
          className="bg-white border-0 text-slate-800 cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-2xl shadow-[0_12px_40px_rgba(0,0,0,0.05)] rounded-[32px] overflow-hidden"
        >
          <CardContent className="p-5 flex items-start space-x-4">
            <div className="h-14 w-14 rounded-2xl bg-[#f5eef1] text-[#c93c76] flex items-center justify-center shrink-0 shadow-sm">
              <User className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-extrabold text-base flex items-center justify-between text-slate-900">
                <span>Single Player Sprint</span>
                <ArrowRight className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                Take on a design sprint solo and pitch your final solution to a virtual customer.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Multiplayer Card */}
        <Card 
          onClick={onSelectMulti}
          className="bg-white border-0 text-slate-800 cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-2xl shadow-[0_12px_40px_rgba(0,0,0,0.05)] rounded-[32px] overflow-hidden"
        >
          <CardContent className="p-5 flex items-start space-x-4">
            <div className="h-14 w-14 rounded-2xl bg-[#eef3f5] text-slate-700 flex items-center justify-center shrink-0 shadow-sm">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-extrabold text-base flex items-center justify-between text-slate-900">
                <span>Multiplayer Battle Arena</span>
                <ArrowRight className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
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
        className="text-slate-400 hover:text-slate-900 text-xs font-bold underline-offset-4 hover:underline transition mt-2 animate-fade-in"
      >
        View My Design Portfolio →
      </button>
    </motion.div>
  );
}
