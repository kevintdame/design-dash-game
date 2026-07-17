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

  const ready = solutionOverview.trim().length > 0;

  function updateFeature(i, field, val) {
    const next = [...features];
    next[i] = { ...next[i], [field]: val };
    setFeatures(next);
  }

  function submit() {
    if (!ready || loading) return;
    const activeFeatures = features
      .filter((f) => f.title.trim().length > 0)
      .map((f) => ({ title: f.title.trim(), description: f.description.trim() }));

    onSubmit({
      problem: problem.trim(),
      solutionOverview: solutionOverview.trim(),
      features: activeFeatures
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="max-w-md mx-auto font-sans"
    >
      <div className="flex items-center gap-2 text-white mb-2 font-extrabold">
        <Rocket className="h-4 w-4" />
        <span className="text-xs uppercase tracking-widest">Final Concept 🚀</span>
      </div>
      <p className="text-white/95 text-sm font-bold mb-4">
        Shape your best idea into a structured concept to present to {challenge.customer_name.split(" ")[0]}.
      </p>

      <div className="space-y-4">
        <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#f74872]">User Problem ⚡</label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="The core problem your customer is facing..."
            rows={2}
            className="w-full mt-2 text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none resize-none leading-relaxed bg-transparent"
          />
        </div>

        <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#f74872]">Solution Overview 💡</label>
          <textarea
            value={solutionOverview}
            onChange={(e) => setSolutionOverview(e.target.value)}
            placeholder="A high-level description of your solution..."
            rows={3}
            className="w-full mt-2 text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none resize-none leading-relaxed bg-transparent"
          />
        </div>

        <div className="text-white text-xs font-extrabold uppercase tracking-widest pt-2">3 Key Features 🌟</div>

        {features.map((f, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                {i + 1}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feature {i + 1} 🌟</span>
            </div>
            <input
              value={f.title}
              onChange={(e) => updateFeature(i, "title", e.target.value)}
              placeholder={`Feature ${i + 1} name`}
              className="w-full text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none bg-transparent pb-2 border-b border-slate-100"
            />
            <textarea
              value={f.description}
              onChange={(e) => updateFeature(i, "description", e.target.value)}
              placeholder="Describe how this feature works..."
              rows={2}
              className="w-full mt-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-450 outline-none resize-none leading-relaxed bg-transparent"
            />
          </div>
        ))}
      </div>

      <Button
        onClick={submit}
        disabled={!ready || loading}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl h-14 mt-5 shadow-lg disabled:opacity-50 transition-transform active:scale-95"
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