import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamic Google Fonts configuration mapping concept vibes to cohesive type styles
export const getFontsForVibe = (vibe) => {
  switch (vibe) {
    case "tech":
      return [
        { name: "Modern", family: "'Space Grotesk', sans-serif", className: "tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-400 font-bold uppercase text-3xl sm:text-4.5xl leading-none" },
        { name: "Elegant", family: "'Outfit', sans-serif", className: "tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-cyan-300 font-extrabold uppercase text-3xl sm:text-4.5xl leading-none" },
        { name: "Playful", family: "'Orbitron', sans-serif", className: "tracking-widest text-transparent bg-clip-text bg-gradient-to-tr from-white to-cyan-400 font-black uppercase text-2.5xl sm:text-3.5xl leading-none" },
        { name: "Classic", family: "'Outfit', sans-serif", className: "tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-cyan-400 font-medium uppercase text-2.5xl sm:text-3.5xl leading-none" }
      ];
    case "luxury":
      return [
        { name: "Modern", family: "'Outfit', sans-serif", className: "tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-400 font-black uppercase text-3xl sm:text-4.5xl leading-none" },
        { name: "Elegant", family: "'Prata', serif", className: "text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-cyan-300 font-normal capitalize text-3.5xl sm:text-5xl leading-none" },
        { name: "Playful", family: "'Cormorant Garamond', serif", className: "italic text-transparent bg-clip-text bg-gradient-to-tr from-white to-cyan-400 font-bold capitalize text-4xl sm:text-5xl leading-none" },
        { name: "Classic", family: "'Cinzel', serif", className: "tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-cyan-400 font-extrabold uppercase text-2.5xl sm:text-4xl leading-none" }
      ];
    case "playful":
      return [
        { name: "Modern", family: "'Fredoka', sans-serif", className: "text-transparent bg-clip-text bg-gradient-to-tr from-white to-cyan-400 font-extrabold lowercase text-3.5xl sm:text-5xl leading-none" },
        { name: "Elegant", family: "'Lilita One', sans-serif", className: "tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-cyan-300 font-normal uppercase text-3.5xl sm:text-5xl leading-none" },
        { name: "Playful", family: "'Rubik Bubbles', sans-serif", className: "text-transparent bg-clip-text bg-gradient-to-tr from-white to-cyan-400 font-normal text-3.5xl sm:text-5xl leading-none" },
        { name: "Classic", family: "'Nunito', sans-serif", className: "tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-cyan-400 font-black capitalize text-3.5xl sm:text-5xl leading-none" }
      ];
    case "organic":
    default:
      return [
        { name: "Modern", family: "'Outfit', sans-serif", className: "tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-400 font-black uppercase text-3xl sm:text-4.5xl leading-none" },
        { name: "Elegant", family: "'Playfair Display', serif", className: "italic text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-cyan-300 font-bold capitalize text-3.5xl sm:text-5xl leading-none" },
        { name: "Playful", family: "'Fredoka', sans-serif", className: "text-transparent bg-clip-text bg-gradient-to-tr from-white to-cyan-400 font-extrabold lowercase text-3.5xl sm:text-5xl leading-none" },
        { name: "Classic", family: "'Lora', serif", className: "italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-cyan-400 font-semibold capitalize text-3.5xl sm:text-5xl leading-none" }
      ];
  }
};

export default function FinalConceptScreen({ challenge, domain, onSubmit, loading }) {
  const [conceptName, setConceptName] = useState("");
  const [problem, setProblem] = useState("");
  const [solutionOverview, setSolutionOverview] = useState("");
  const [fontIdx, setFontIdx] = useState(0);
  const [vibe, setVibe] = useState("organic");
  const [features, setFeatures] = useState([
    { title: "", description: "" },
    { title: "", description: "" },
    { title: "", description: "" }
  ]);

  const completeFeatures = features.filter((f) => f.title.trim().length > 0);
  const ready = conceptName.trim().length > 0 && solutionOverview.trim().length > 0;

  // Debounced vibe classification endpoint fetcher
  useEffect(() => {
    if (conceptName.trim().length >= 3 && solutionOverview.trim().length >= 10) {
      const delayDebounceFn = setTimeout(async () => {
        try {
          const res = await fetch("/api/concept-vibe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conceptName, solutionOverview })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.vibe) {
              setVibe(data.vibe);
            }
          }
        } catch (err) {
          console.warn("Vibe classification fetch error:", err);
        }
      }, 800);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [conceptName, solutionOverview]);

  function updateFeature(i, field, val) {
    const next = [...features];
    next[i] = { ...next[i], [field]: val };
    setFeatures(next);
  }

  const activeFonts = getFontsForVibe(vibe);

  const handleFontCycle = () => {
    setFontIdx((prev) => (prev + 1) % activeFonts.length);
  };

  function submit() {
    if (!ready || loading) return;
    onSubmit({
      name: conceptName.trim(),
      problem: problem.trim(),
      solutionOverview: solutionOverview.trim(),
      image: null,
      fontIdx,
      vibe,
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
      <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.5 }} className="flex items-center gap-2 text-cyan-400 mb-2">
        <Rocket className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-widest">Final Concept</span>
      </motion.div>
      <p className="text-white text-sm mb-4">
        Shape your best idea into a structured concept to present to {challenge.customer_name.split(" ")[0]}.
      </p>

      <div className="space-y-4">
        <div className="bg-card rounded-2xl p-4 shadow-md ring-1 ring-black/5 ring-2 ring-cyan-400">
          <label className="text-[11px] font-bold uppercase tracking-wide text-cyan-500">Concept Name <span className="text-slate-400 normal-case font-medium">(required)</span></label>
          <input
            value={conceptName}
            onChange={(e) => setConceptName(e.target.value)}
            placeholder="Give your concept a name..."
            className="w-full mt-1 text-base sm:text-sm font-semibold text-card-foreground placeholder:text-slate-300 outline-none"
          />
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-md ring-1 ring-black/5">
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">User Problem <span className="text-slate-400 normal-case font-medium">(optional)</span></label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="The core problem your customer is facing..."
            rows={3}
            className="w-full mt-1 text-base sm:text-sm text-card-foreground placeholder:text-slate-300 outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-md ring-1 ring-black/5 ring-2 ring-cyan-400">
          <label className="text-[11px] font-bold uppercase tracking-wide text-cyan-500">Solution Overview <span className="text-slate-400 normal-case font-medium">(required)</span></label>
          <textarea
            value={solutionOverview}
            onChange={(e) => setSolutionOverview(e.target.value)}
            placeholder="A high-level description of your solution..."
            rows={5}
            className="w-full mt-1 text-base sm:text-sm text-card-foreground placeholder:text-slate-300 outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="text-cyan-400 text-xs font-semibold uppercase tracking-widest pt-1">Key Features <span className="text-slate-400 normal-case font-medium">(optional)</span></div>

        {features.map((f, i) => (
          <div key={i} className="bg-card rounded-2xl p-4 shadow-md ring-1 ring-black/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full bg-cyan-400 text-[#20262e] text-xs font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Feature {i + 1}</span>
            </div>
            <input
              value={f.title}
              onChange={(e) => updateFeature(i, "title", e.target.value)}
              placeholder={`Feature ${i + 1} name`}
              className="w-full text-base sm:text-sm font-semibold text-card-foreground placeholder:text-slate-300 outline-none"
            />
            <textarea
              value={f.description}
              onChange={(e) => updateFeature(i, "description", e.target.value)}
              placeholder="Describe how this feature works..."
              rows={2}
              className="w-full mt-2 text-base sm:text-sm text-card-foreground placeholder:text-slate-300 outline-none resize-none leading-relaxed"
            />
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-md ring-1 ring-black/5 ring-2 ring-cyan-400 mt-4 space-y-4">
        <label className="text-[11px] font-bold uppercase tracking-wide text-cyan-500 block">Brand Showcase Card</label>
        
        {/* Dynamic CSS Brand Logo Card */}
        <div className="bg-[#2B303A] rounded-2xl p-8 flex flex-col items-center justify-center min-h-[180px] shadow-xl border border-white/5 relative select-none">
          <div className="text-center px-4 w-full">
            <div 
              style={{ fontFamily: activeFonts[fontIdx].family }}
              className={`${activeFonts[fontIdx].className} drop-shadow-lg`}
            >
              {conceptName || "Concept Name"}
            </div>
          </div>

          {/* Cycle Font Button */}
          <button
            type="button"
            onClick={handleFontCycle}
            className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-[#20262e]/80 text-[10px] font-bold text-cyan-400 flex items-center gap-1 hover:bg-[#20262e] transition-colors z-10 uppercase tracking-wider"
            title="Cycle Font Style"
          >
            Font: {activeFonts[fontIdx].name}
          </button>
        </div>

        {/* Cohesive Features Summary Board inside the Brand System */}
        {completeFeatures.length > 0 && (
          <div className="bg-[#1C2028] rounded-xl p-5 shadow-inner border border-white/5 space-y-4">
            <h3 
              style={{ fontFamily: activeFonts[fontIdx].family }}
              className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2"
            >
              Core Brand Features
            </h3>
            <div className="space-y-4">
              {completeFeatures.map((f, i) => (
                <div key={i} className="border-l border-cyan-400/30 pl-4 py-0.5">
                  <h4 
                    style={{ fontFamily: activeFonts[fontIdx].family }}
                    className="text-white font-semibold text-sm capitalize"
                  >
                    {f.title}
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={submit}
        disabled={!ready || loading}
        className="w-full bg-cyan-400 text-[#20262e] hover:bg-cyan-300 font-bold rounded-lg h-14 mt-5 shadow-lg disabled:opacity-40"
      >
        {loading ? (
          <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Synthesizing final concept...</span>
        ) : (
          <span className="flex items-center gap-2">Present final concept <ArrowRight className="h-5 w-5" /></span>
        )}
      </Button>
    </motion.div>
  );
}