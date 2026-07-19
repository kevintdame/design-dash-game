import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, Loader2, ImageIcon, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateConceptImage, getConceptAspectRatioClass } from "@/lib/designGame";

export const fonts = [
  { name: "Modern", family: "'Outfit', sans-serif", className: "tracking-wider text-cyan-400 font-extrabold uppercase text-xl leading-none" },
  { name: "Elegant", family: "'Playfair Display', serif", className: "italic text-white font-medium capitalize text-2xl leading-none" },
  { name: "Playful", family: "'Fredoka', sans-serif", className: "text-cyan-400 font-extrabold lowercase text-2xl leading-none" },
  { name: "Classic", family: "'Cinzel', serif", className: "tracking-widest text-white font-bold uppercase text-lg leading-none" }
];

export default function FinalConceptScreen({ challenge, domain, onSubmit, loading }) {
  const [conceptName, setConceptName] = useState("");
  const [problem, setProblem] = useState("");
  const [solutionOverview, setSolutionOverview] = useState("");
  const [image, setImage] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [fontIdx, setFontIdx] = useState(0);
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
    setImageLoadError(false);
    setGeneratingImage(true);
    try {
      const url = await generateConceptImage(solutionOverview, domain, conceptName, completeFeatures);
      setImage(url);
    } catch (err) {
      console.error("Concept image generation failed:", err);
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
      image,
      fontIdx,
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

      <div className="bg-card rounded-2xl p-4 shadow-md ring-1 ring-black/5 ring-2 ring-cyan-400 mt-4">
        <label className="text-[11px] font-bold uppercase tracking-wide text-cyan-500 block mb-2">Concept Visual Mockup</label>
        {image && !imageLoadError ? (
          <div className="relative rounded-xl overflow-hidden ring-1 ring-black/5 bg-[#2B303A] flex flex-col items-center justify-center p-8 aspect-square select-none">
            <div className="w-1/2 aspect-square flex items-center justify-center mb-6">
              <img 
                src={image} 
                alt="Concept visual" 
                className="w-full h-full object-contain animate-fade-in" 
                onError={() => setImageLoadError(true)}
              />
            </div>
            
            <div className="w-full text-center min-h-[40px] flex items-center justify-center">
              <div 
                style={{ fontFamily: fonts[fontIdx].family }}
                className={fonts[fontIdx].className}
              >
                {conceptName || "Concept Name"}
              </div>
            </div>

            {generatingImage && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center backdrop-blur-[1px] rounded-xl">
                <Loader2 className="h-7 w-7 text-cyan-400 animate-spin" />
              </div>
            )}

            {/* Cycle Font Button */}
            <button
              type="button"
              onClick={() => setFontIdx((p) => (p + 1) % fonts.length)}
              className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-[#20262e]/80 text-[10px] font-bold text-cyan-400 flex items-center gap-1 hover:bg-[#20262e] transition-colors z-10 uppercase tracking-wider"
              title="Change Font Style"
            >
              Font: {fonts[fontIdx].name}
            </button>

            {/* Regenerate Button */}
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={generatingImage}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-[#20262e]/80 text-cyan-400 flex items-center justify-center hover:bg-[#20262e] transition-colors z-10"
              title="Regenerate image"
            >
              {generatingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </button>
          </div>
        ) : image && imageLoadError ? (
          <div className={`relative rounded-xl overflow-hidden ring-1 ring-black/5 ${getConceptAspectRatioClass(solutionOverview, conceptName)} bg-card border border-cyan-400/20 flex flex-col items-center justify-center p-6 text-center`}>
            <AlertCircle className="h-8 w-8 text-cyan-400 mb-2" />
            <div className="text-white font-bold text-xs">Image Generation Overloaded</div>
            <div className="text-slate-400 text-[10px] mt-1 max-w-[240px] leading-relaxed">
              The free image generation server is currently busy. Please wait a moment and click retry.
            </div>
            <Button
              type="button"
              onClick={handleGenerateImage}
              disabled={generatingImage}
              className="mt-3 bg-cyan-400 text-[#20262e] hover:bg-cyan-300 text-xs font-bold px-4 py-1.5 h-8 rounded-lg"
            >
              {generatingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <RefreshCw className="h-3.5 w-3.5 mr-1" />}
              Retry generation
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            onClick={handleGenerateImage}
            disabled={!canGenerateImage || generatingImage}
            variant="outline"
            className="w-full border-cyan-400/40 text-cyan-500 hover:bg-cyan-400/10 hover:text-cyan-600 font-semibold rounded-lg h-11 disabled:opacity-40"
          >
            {generatingImage ? (
              <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Generating image...</span>
            ) : (
              <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Generate concept image</span>
            )}
          </Button>
        )}
        {!canGenerateImage && !image && (
          <p className="text-slate-400 text-[10px] mt-1.5 text-center">Write at least a sentence of your solution to enable image generation.</p>
        )}
      </div>

      <Button
        onClick={submit}
        disabled={!ready || loading}
        className="w-full bg-cyan-400 text-[#20262e] hover:bg-cyan-300 font-bold rounded-lg h-14 mt-5 shadow-lg disabled:opacity-40"
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