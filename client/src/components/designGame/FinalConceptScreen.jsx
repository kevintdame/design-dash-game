import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, ImageIcon, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateConceptImage } from "@/lib/designGame";

export default function FinalConceptScreen({ challenge, domain, onSubmit, loading }) {
  const [conceptName, setConceptName] = useState("");
  const [problem, setProblem] = useState("");
  const [solutionOverview, setSolutionOverview] = useState("");
  const [image, setImage] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [features, setFeatures] = useState([
    { title: "", description: "" },
    { title: "", description: "" },
    { title: "", description: "" }
  ]);

  const completeFeatures = features.filter((f) => f.title.trim().length > 2 && f.description.trim().length > 10);
  const ready = conceptName.trim().length > 0 && solutionOverview.trim().length > 0;
  const canGenerateImage = solutionOverview.trim().length >= 10;

  function updateFeature(i, field, val) {
    const next = [...features];
    next[i] = { ...next[i], [field]: val };
    setFeatures(next);
  }

  async function handleGenerateImage() {
    if (!canGenerateImage || generatingImage) return;
    setGeneratingImage(true);
    try {
      const url = await generateConceptImage(solutionOverview, domain);
      setImage(url);
    } catch {
      setImage(null);
    } finally {
      setGeneratingImage(false);
    }
  }

  function submit() {
    if (!ready || loading) return;
    onSubmit({
      name: conceptName.trim(),
      problem: problem.trim(),
      solutionOverview: solutionOverview.trim(),
      image: null,
      features: completeFeatures.map((f) => ({ title: f.title.trim(), description: f.description.trim() }))
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-3">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 12 }}
          className="inline-flex items-center gap-1.5 text-yellow-300"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-extrabold uppercase tracking-widest">Final Concept</span>
          <Sparkles className="h-4 w-4" />
        </motion.div>
      </div>
      <h2 className="text-4xl sm:text-5xl font-extrabold font-display uppercase leading-none mb-2 text-center">
        <span className="text-foreground">Shape your</span>{" "}
        <span className="text-accent">concept</span>
      </h2>
      <p className="text-foreground/70 text-sm mb-5 text-center">
        Turn your best idea into a structured concept to present to {challenge.customer_name.split(" ")[0]}.
      </p>

      <div className="space-y-4">
        <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-4 shadow-lg shadow-primary/30">
          <label className="text-[11px] font-extrabold uppercase tracking-wide text-primary-foreground">Concept Name <span className="text-primary-foreground/60 normal-case font-medium">(required)</span></label>
          <input
            value={conceptName}
            onChange={(e) => setConceptName(e.target.value)}
            placeholder="Give your concept a name..."
            className="w-full mt-2 bg-transparent rounded-2xl px-3 py-2 text-base sm:text-sm font-bold text-primary-foreground placeholder:text-primary-foreground/50 outline-none focus:ring-2 focus:ring-white/60 transition-all"
          />
        </div>

        <div className="bg-gradient-to-br from-accent to-primary rounded-3xl p-4 shadow-lg shadow-accent/30">
          <label className="text-[11px] font-extrabold uppercase tracking-wide text-primary-foreground">User Problem <span className="text-primary-foreground/60 normal-case font-medium">(optional)</span></label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="The core problem your customer is facing..."
            rows={2}
            className="w-full mt-2 bg-transparent rounded-2xl px-3 py-2 text-base sm:text-sm text-primary-foreground placeholder:text-primary-foreground/50 outline-none focus:ring-2 focus:ring-white/60 transition-all resize-none leading-relaxed"
          />
        </div>

        <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-4 shadow-lg shadow-primary/30">
          <label className="text-[11px] font-extrabold uppercase tracking-wide text-primary-foreground">Solution Overview <span className="text-primary-foreground/60 normal-case font-medium">(required)</span></label>
          <textarea
            value={solutionOverview}
            onChange={(e) => setSolutionOverview(e.target.value)}
            placeholder="A high-level description of your solution..."
            rows={3}
            className="w-full mt-2 bg-transparent rounded-2xl px-3 py-2 text-base sm:text-sm text-primary-foreground placeholder:text-primary-foreground/50 outline-none focus:ring-2 focus:ring-white/60 transition-all resize-none leading-relaxed"
          />
        </div>

        <div className="text-accent text-xs font-extrabold uppercase tracking-widest pt-1 text-center">Key Features <span className="text-foreground/60 normal-case font-medium">(optional)</span></div>

        {features.map((f, i) => (
          <div key={i} className={`bg-gradient-to-br rounded-3xl p-4 shadow-lg shadow-primary/30 ${i % 2 ? "from-accent to-primary" : "from-primary to-accent"}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-white/25 text-primary-foreground text-xs font-extrabold flex items-center justify-center shadow-sm">
                {i + 1}
              </div>
              <span className="text-xs font-bold text-primary-foreground/80 uppercase">Feature {i + 1}</span>
            </div>
            <input
              value={f.title}
              onChange={(e) => updateFeature(i, "title", e.target.value)}
              placeholder={`Feature ${i + 1} name`}
              className="w-full bg-transparent rounded-2xl px-3 py-2 text-base sm:text-sm font-bold text-primary-foreground placeholder:text-primary-foreground/50 outline-none focus:ring-2 focus:ring-white/60 transition-all"
            />
            <textarea
              value={f.description}
              onChange={(e) => updateFeature(i, "description", e.target.value)}
              placeholder="Describe how this feature works..."
              rows={2}
              className="w-full mt-2 bg-transparent rounded-2xl px-3 py-2 text-base sm:text-sm text-primary-foreground placeholder:text-primary-foreground/50 outline-none focus:ring-2 focus:ring-white/60 transition-all resize-none leading-relaxed"
            />
          </div>
        ))}
      </div>

      <Button
        onClick={submit}
        disabled={!ready || loading}
        className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-bold rounded-2xl h-14 mt-5 shadow-xl shadow-primary/30 disabled:opacity-40"
      >
        {loading ? (
          <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Generating your concept...</span>
        ) : (
          <span className="flex items-center gap-2">🚀 Present final concept <ArrowRight className="h-5 w-5" /></span>
        )}
      </Button>
    </motion.div>
  );
}