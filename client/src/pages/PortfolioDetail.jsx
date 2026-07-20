import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import ConceptCarousel from "@/components/designGame/ConceptCarousel";
import { Button } from "@/components/ui/button";

export default function PortfolioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/portfolio/${id}`);
        if (!res.ok) throw new Error("API error");
        const s = await res.json();
        setSession(s);
      } catch {
        setNotFound(true);
      }
    })();
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-[100dvh] bg-transparent flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-white font-bold text-lg mb-2">Concept not found</p>
          <Button onClick={() => navigate("/portfolio")} className="bg-accent text-white hover:bg-accent/90 font-bold rounded-lg px-6">
            Back to portfolio
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[100dvh] bg-transparent flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-white/10 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const concept = {
    name: session.concept_name,
    image: session.concept_image,
    problem: session.problem,
    solutionOverview: session.solution_overview,
    features: session.features || []
  };
  const ratings = {
    value: session.value_score,
    creativity: session.creativity_score,
    uniqueness: session.uniqueness_score,
    review: session.review
  };
  const challenge = {
    title: session.challenge_title,
    customer_name: session.customer_name
  };
  const overall = Math.round((ratings.value + ratings.creativity + ratings.uniqueness) / 3);
  const tier = overall >= 85 ? "Design Mastermind" : overall >= 70 ? "Certified Genius" : overall >= 50 ? "Adequate" : "Back to the drawing board";
  const tierEmoji = overall >= 85 ? "👑" : overall >= 70 ? "🧠" : overall >= 50 ? "👌" : "✍️";

  return (
    <div className="min-h-[100dvh] bg-transparent">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/portfolio")} className="h-9 w-9 rounded-lg bg-accent text-white flex items-center justify-center hover:bg-accent/90 shadow-sm transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="text-accent text-[10px] uppercase tracking-wider font-extrabold">{session.domain}</div>
            <h1 className="text-white font-bold text-base leading-snug truncate">{session.challenge_title}</h1>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <div className="text-accent text-xs font-extrabold uppercase tracking-widest">Final Score</div>
          <div className="text-5xl font-extrabold font-display leading-none text-white my-1">{overall}</div>
          <div className="text-accent font-bold text-sm mt-1 flex items-center justify-center gap-1.5">
            <span>{tierEmoji}</span> {tier}
          </div>
        </motion.div>

        <ConceptCarousel challenge={challenge} concept={concept} ratings={ratings} />

        <Button
          onClick={() => navigate("/")}
          className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-bold rounded-2xl h-12 mt-5 shadow-xl shadow-primary/30"
        >
          <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Play a new game</span>
        </Button>
      </div>
    </div>
  );
}