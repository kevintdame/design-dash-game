import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FinalConceptScreen({ challenge, onSubmit, loading }) {
  const [problem, setProblem] = useState("");
  const [solutionOverview, setSolutionOverview] = useState("");
  const [features, setFeatures] = useState([
    { title: "", description: "" },
    { title: "", description: "" },
    { title: "", description: "" }
  ]);

  const ready =
    problem.trim().length > 0 &&
    solutionOverview.trim().length > 0 &&
    features.every((f) => f.title.trim().length > 0 && f.description.trim().length > 0);

  function updateFeature(i, field, val) {
    const next = [...features];
    next[i] = { ...next[i], [field]: val };
    setFeatures(next);
  }

  function submit() {
    if (!ready || loading) return;
    onSubmit({
      problem: problem.trim(),
      solutionOverview: solutionOverview.trim(),
      features: features.map((f) => ({ title: f.title.trim(), description: f.description.trim() }))
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="max-w-md mx-auto"
    >
      <div className="flex items-center gap-2 text-white/80 mb-2">
        <Rocket className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Final Concept</span>
      </div>
      <p className="text-white text-sm mb-4">
        Shape your best idea into a structured concept to present to {challenge.customer_name.split(" ")[0]}.
      </p>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <label className="text-[11px] font-bold uppercase tracking-wide text-purple-600">User Problem</label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="The core problem your customer is facing..."
            rows={2}
            className="w-full mt-1 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <label className="text-[11px] font-bold uppercase tracking-wide text-purple-600">Solution Overview</label>
          <textarea
            value={solutionOverview}
            onChange={(e) => setSolutionOverview(e.target.value)}
            placeholder="A high-level description of your solution..."
            rows={3}
            className="w-full mt-1 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="text-white/80 text-xs font-semibold uppercase tracking-wider pt-1">3 Key Features</div>

        {features.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Feature {i + 1}</span>
            </div>
            <input
              value={f.title}
              onChange={(e) => updateFeature(i, "title", e.target.value)}
              placeholder={`Feature ${i + 1} name`}
              className="w-full text-base sm:text-sm font-semibold text-slate-900 placeholder:text-slate-300 outline-none"
            />
            <textarea
              value={f.description}
              onChange={(e) => updateFeature(i, "description", e.target.value)}
              placeholder="Describe how this feature works..."
              rows={2}
              className="w-full mt-2 text-base sm:text-sm text-slate-900 placeholder:text-slate-300 outline-none resize-none leading-relaxed"
            />
          </div>
        ))}
      </div>

      <Button
        onClick={submit}
        disabled={!ready || loading}
        className="w-full bg-white text-purple-700 hover:bg-white/90 font-bold rounded-2xl h-14 mt-5 shadow-xl disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Generating your concept...</span>
        ) : (
          <span className="flex items-center gap-2">Present final concept <ArrowRight className="h-5 w-5" /></span>
        )}
      </Button>
    </motion.div>
  );
}