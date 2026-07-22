import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Lightbulb, Compass, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import conundrums from "@/data/conundrums.json";

export default function ConundrumStartScreen({ onSelectScenario, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto py-4 px-2"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent font-black text-xs uppercase tracking-widest mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Deductive AI Puzzle Game</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display uppercase tracking-tight text-foreground">
          CONUNDRUM
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-2 max-w-md mx-auto">
          Investigate the room, discover clues, and invent a master plan for the AI to simulate and score!
        </p>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid gap-4 mb-8">
        {conundrums.map((c, idx) => (
          <motion.div
            key={c.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectScenario(c)}
            className="bg-card/80 backdrop-blur border border-border/80 hover:border-accent rounded-3xl p-5 shadow-lg transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center text-3xl shrink-0">
                {c.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                    {c.difficulty}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    {c.characterType}
                  </span>
                </div>
                <h3 className="text-xl font-black font-display text-foreground group-hover:text-accent transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                  {c.description}
                </p>
              </div>
            </div>

            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground font-black rounded-2xl px-5 h-11 shrink-0 flex items-center justify-center gap-2 group-hover:shadow-md group-hover:shadow-primary/30"
            >
              <span>Accept</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </div>

      {onBack && (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider"
          >
            ← Return to Main Menu
          </Button>
        </div>
      )}
    </motion.div>
  );
}
