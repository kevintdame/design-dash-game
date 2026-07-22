import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Loader2, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConundrumPlanScreen({ scenario, inventory, onSubmitPlan, onBack }) {
  const [plan, setPlan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!plan.trim() || submitting) return;
    setSubmitting(true);
    await onSubmitPlan(plan);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-2xl mx-auto py-4 px-2"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent font-black text-xs uppercase tracking-widest mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Final Step</span>
        </div>
        <h2 className="text-3xl font-black font-display uppercase text-foreground">
          Submit Master Plan
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Describe step-by-step how {scenario.character} will solve this conundrum!
        </p>
      </div>

      {/* Discovered Items Quick Reference */}
      <div className="bg-card/60 border border-border/80 rounded-2xl p-3 mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
          <Package className="h-3.5 w-3.5 text-accent" />
          Discovered Clues in Your Arsenal:
        </p>
        <div className="flex flex-wrap gap-2">
          {inventory.map((item, idx) => (
            <span
              key={idx}
              className="bg-card border border-border px-2.5 py-1 rounded-xl text-xs font-bold text-foreground flex items-center gap-1 shadow-xs"
            >
              <span>{item.icon || "📦"}</span>
              <span>{item.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Solution Plan Textarea */}
      <div className="space-y-3 mb-6">
        <textarea
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder={`Describe your step-by-step plan...\n\nExample: "Ask Cleo the cat to jump onto the counter, open the cabinet latch to get her salmon treats, and swat the peanut butter jar down to the floor!"`}
          rows={6}
          className="w-full bg-card border border-border text-foreground placeholder:text-muted-foreground/60 rounded-3xl p-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent shadow-md resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            disabled={submitting}
            className="w-full sm:w-auto rounded-2xl h-12 px-5 font-bold"
          >
            ← Back to Clues
          </Button>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!plan.trim() || submitting}
          className="w-full flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground font-black text-sm uppercase tracking-wider rounded-2xl h-12 shadow-xl hover:opacity-95 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Simulating Execution...</span>
            </>
          ) : (
            <>
              <span>Execute Solution Plan</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
