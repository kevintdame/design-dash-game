import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Categorized pools to ensure 100% variety across different visual vibes
export const techPool = [
  { family: "'Orbitron', sans-serif", className: "tracking-widest text-transparent bg-clip-text bg-gradient-to-tr from-white to-cyan-400 font-black uppercase" },
  { family: "'Space Grotesk', sans-serif", className: "tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-400 font-bold uppercase" },
  { family: "'Space Mono', monospace", className: "tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400 font-bold uppercase" },
  { family: "'Outfit', sans-serif", className: "tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-400 font-black uppercase" }
];

export const luxuryPool = [
  { family: "'Cinzel', serif", className: "tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-cyan-400 font-extrabold uppercase" },
  { family: "'Prata', serif", className: "text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-cyan-300 font-normal capitalize" },
  { family: "'Lora', serif", className: "italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-cyan-400 font-semibold capitalize" },
  { family: "'Cormorant Garamond', serif", className: "italic text-transparent bg-clip-text bg-gradient-to-tr from-white to-cyan-400 font-bold capitalize" }
];

export const playfulPool = [
  { family: "'Fredoka', sans-serif", className: "text-transparent bg-clip-text bg-gradient-to-tr from-white to-cyan-400 font-extrabold lowercase" },
  { family: "'Lilita One', sans-serif", className: "tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-cyan-300 font-normal uppercase" },
  { family: "'Rubik Bubbles', sans-serif", className: "text-transparent bg-clip-text bg-gradient-to-tr from-white to-cyan-400 font-normal" },
  { family: "'Nunito', sans-serif", className: "tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-cyan-400 font-black capitalize" }
];

export const creativePool = [
  { family: "'Pacifico', cursive", className: "text-transparent bg-clip-text bg-gradient-to-tr from-white to-cyan-300 font-normal capitalize" },
  { family: "'Sacramento', cursive", className: "text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-400 font-normal" },
  { family: "'Righteous', sans-serif", className: "tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-400 font-normal uppercase" },
  { family: "'Playfair Display', serif", className: "italic text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-cyan-300 font-bold capitalize" }
];

export const fontPool = [...techPool, ...luxuryPool, ...playfulPool, ...creativePool];

export default function FinalConceptScreen({ challenge, domain, onSubmit, loading }) {
  const [conceptName, setConceptName] = useState("");
  const [problem, setProblem] = useState("");
  const [solutionOverview, setSolutionOverview] = useState("");
  const [fontIdx, setFontIdx] = useState(0);

  // Pick exactly one distinct font from each of the 4 categories for absolute variety
  const [activeFonts] = useState(() => {
    const tech = techPool[Math.floor(Math.random() * techPool.length)];
    const luxury = luxuryPool[Math.floor(Math.random() * luxuryPool.length)];
    const playful = playfulPool[Math.floor(Math.random() * playfulPool.length)];
    const creative = creativePool[Math.floor(Math.random() * creativePool.length)];
    return [
      { ...tech, name: "Modern" },
      { ...luxury, name: "Elegant" },
      { ...playful, name: "Playful" },
      { ...creative, name: "Classic" }
    ];
  });

  const [features, setFeatures] = useState([
    { title: "", description: "" },
    { title: "", description: "" },
    { title: "", description: "" }
  ]);

  const completeFeatures = features.filter((f) => f.title.trim().length > 0);
  const ready = conceptName.trim().length > 0 && solutionOverview.trim().length > 0;

  function updateFeature(i, field, val) {
    const next = [...features];
    next[i] = { ...next[i], [field]: val };
    setFeatures(next);
  }

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
      fontPool: activeFonts, // Save the selected 4 font list to the database
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
            placeholder="A description of your solution..."
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

      <div className="mt-6 space-y-4">
        <label className="text-[11px] font-bold uppercase tracking-wide text-cyan-500 block -mb-2">Brand Showcase Preview</label>
        
        {/* Dynamic CSS Brand Logo Card - Split Layout */}
        <div className="rounded-2xl shadow-xl border border-white/5 overflow-hidden w-full flex flex-col min-h-[300px]">
          {/* Top Half: Charcoal Logo */}
          <div className="bg-[#2B303A] p-8 flex flex-col items-center justify-center flex-1 relative select-none min-h-[180px]">
            <div className="text-center px-4 w-full">
              <div 
                style={{ fontFamily: activeFonts[fontIdx].family }}
                className={`${activeFonts[fontIdx].className} drop-shadow-lg text-4xl sm:text-5xl md:text-6xl break-words leading-tight`}
              >
                {conceptName || "Concept Name"}
              </div>
            </div>

            {/* Cycle Font Button */}
            <button
              type="button"
              onClick={handleFontCycle}
              className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-[#20262e]/80 text-[10px] font-bold text-cyan-400 flex items-center gap-1 hover:bg-[#20262e] transition-colors z-10 uppercase tracking-wider"
              title="Cycle Font Style"
            >
              Font: {activeFonts[fontIdx].name}
            </button>
          </div>

          {/* Bottom Half: White Solution Summary */}
          <div className="bg-white p-6 flex items-center justify-center min-h-[120px] border-t border-slate-100">
            <p className="text-slate-800 text-sm text-center max-w-sm leading-relaxed font-semibold">
              {solutionOverview || "Your solution summary will appear here..."}
            </p>
          </div>
        </div>

        {/* Cohesive Features Summary Board (identical size to logo card) */}
        {completeFeatures.length > 0 && (
          <div className="bg-[#1C2028] rounded-2xl p-8 shadow-inner border border-white/5 space-y-5 w-full">
            <h3 
              style={{ fontFamily: activeFonts[fontIdx].family }}
              className="text-cyan-400 text-base font-extrabold uppercase tracking-wider mb-2 border-b border-white/10 pb-2"
            >
              Core Brand Features
            </h3>
            <div className="space-y-5">
              {completeFeatures.map((f, i) => (
                <div key={i} className="border-l-2 border-cyan-400/40 pl-4 py-0.5">
                  <h4 
                    style={{ fontFamily: activeFonts[fontIdx].family }}
                    className="text-white font-extrabold text-base sm:text-lg capitalize animate-fade-in"
                  >
                    {f.title}
                  </h4>
                  <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed animate-fade-in">
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
        className="w-full bg-cyan-400 text-[#20262e] hover:bg-cyan-300 font-bold rounded-lg h-14 mt-6 shadow-lg disabled:opacity-40"
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