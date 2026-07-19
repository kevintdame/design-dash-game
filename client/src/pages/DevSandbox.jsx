import { useState } from "react";
import FinalConceptScreen from "../components/designGame/FinalConceptScreen";
import ConceptCarousel from "../components/designGame/ConceptCarousel";
import { FolderOpen } from "lucide-react";

export default function DevSandbox() {
  const [concept, setConcept] = useState({
    name: "Meditation Mastery",
    solutionOverview: "A peaceful app that helps users meditate with custom ambient music, guided paths, and breathing exercises.",
    fontIdx: 0,
    features: [
      { title: "Ambient Music", description: "Procedurally generated soundscapes based on user's heart rate." },
      { title: "Guided Paths", description: "Narrated meditation journeys from world-class experts." },
      { title: "Breathing Coach", description: "Visual guide to slow down breathing and reduce stress levels." }
    ]
  });

  const [ratings, setRatings] = useState({
    value: 88,
    creativity: 92,
    uniqueness: 76,
    review: "The customer absolutely loves the idea of heart-rate synchronized music. It matches their need for a deeply personal escape."
  });

  const challenge = {
    title: "Ambient Escape",
    customer_name: "Sarah Miller",
    customer_role: "Yoga Instructor",
    scenario: "Sarah wants a mobile tool to help her students ground themselves between classes."
  };

  const handleConceptSubmit = (submitted) => {
    console.log("Concept submitted to sandbox:", submitted);
    setConcept(submitted);
  };

  return (
    <div className="min-h-screen bg-[#121820] text-white p-8">
      <header className="max-w-6xl mx-auto mb-10 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-6 w-6 text-cyan-400" />
          <h1 className="text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Developer UI Sandbox
          </h1>
        </div>
        <p className="text-slate-400 text-xs mt-1">
          Visual validation sandbox. Use this page to verify typography spacing, SVG donut charts, and carousel layouts without playing the game.
        </p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Final Concept Editing Screen */}
        <section className="bg-[#1C2028]/60 p-6 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-base font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-3">
            1. Concept Editing & Brand Setup
          </h2>
          <FinalConceptScreen 
            challenge={challenge}
            domain="Health & Wellness"
            onSubmit={handleConceptSubmit}
            loading={false}
          />
        </section>

        {/* Right Column: Carousel Results Screen */}
        <section className="bg-[#1C2028]/60 p-6 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-base font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-3">
            2. Slideshow Results Preview
          </h2>
          <ConceptCarousel 
            challenge={challenge}
            concept={concept}
            ratings={ratings}
          />
          <div className="mt-6 p-4 bg-[#20262e] rounded-xl border border-white/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sandbox Controls</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => setRatings({ value: 92, creativity: 95, uniqueness: 90, review: "Spectacular concept!" })}
                className="px-3 py-1.5 bg-cyan-400/10 text-cyan-400 text-xs font-semibold rounded-lg hover:bg-cyan-400/20"
              >
                {"High Scores (>90)"}
              </button>
              <button 
                onClick={() => setRatings({ value: 55, creativity: 60, uniqueness: 50, review: "It is an okay concept." })}
                className="px-3 py-1.5 bg-cyan-400/10 text-cyan-400 text-xs font-semibold rounded-lg hover:bg-cyan-400/20"
              >
                Mid Scores (50-70)
              </button>
              <button 
                onClick={() => setRatings({ value: 30, creativity: 25, uniqueness: 40, review: "Extremely disappointing." })}
                className="px-3 py-1.5 bg-cyan-400/10 text-cyan-400 text-xs font-semibold rounded-lg hover:bg-cyan-400/20"
              >
                {"Low Scores (<50)"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
