import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProgressHeader, { STAGES } from "@/components/designGame/ProgressHeader";
import StartScreen from "@/components/designGame/StartScreen";
import ChallengeScreen from "@/components/designGame/ChallengeScreen";
import InterviewScreen from "@/components/designGame/InterviewScreen";
import BrainstormScreen from "@/components/designGame/BrainstormScreen";
import FinalConceptScreen from "@/components/designGame/FinalConceptScreen";
import ResultsScreen from "@/components/designGame/ResultsScreen";
import { generateChallenge, rateFinalConcept, synthesizeInsights, generateFeatureImages } from "@/lib/designGame";
import InsightWall from "@/components/designGame/InsightWall";
import { X } from "lucide-react";
import ModeSelectScreen from "@/components/designGame/ModeSelectScreen";

export default function Game() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("select");
  const [challenge, setChallenge] = useState(null);
  const [domain, setDomain] = useState(null);
  const [qa, setQa] = useState([]);
  const [ideas, setIdeas] = useState(["", "", ""]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [ratings, setRatings] = useState(null);
  const [concept, setConcept] = useState(null);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  const currentIndex = STAGES.findIndex((s) => s.key === stage);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [stage]);
  const showProgress = stage !== "select" && stage !== "start";

  async function handleStart(d) {
    setLoadingChallenge(true);
    setError(null);
    try {
      const ch = await generateChallenge(d);
      setDomain(d);
      setChallenge(ch);
      setStage("challenge");
    } catch (e) {
      setError("Couldn't generate a challenge. Please try again.");
    } finally {
      setLoadingChallenge(false);
    }
  }

  function handleRestart() {
    setStage("select");
    setChallenge(null);
    setDomain(null);
    setQa([]);
    setIdeas(["", "", ""]);
    setFeedbacks([]);
    setRatings(null);
    setConcept(null);
    setInsights([]);
    setSaved(false);
    setError(null);
  }

  async function handleInterviewDone() {
    if (!qa || qa.length === 0) {
      setInsights([]);
      setStage("brainstorm");
      return;
    }
    setInsightsLoading(true);
    setError(null);
    try {
      const result = await synthesizeInsights(challenge, qa);
      setInsights(result);
      setStage("brainstorm");
    } catch (e) {
      setInsights([]);
      setStage("brainstorm");
    } finally {
      setInsightsLoading(false);
    }
  }

  async function handleFinalSubmit(c) {
    setRatingLoading(true);
    setError(null);
    try {
      const r = await rateFinalConcept(challenge, c);
      setConcept(c);
      setRatings(r);
      setStage("results");
    } catch (e) {
      setError("The customer couldn't finish their review. Please try again.");
    } finally {
      setRatingLoading(false);
    }
  }

  async function handleSave() {
    if (!concept || !ratings || saved) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          challenge_title: challenge.title,
          challenge_scenario: challenge.scenario,
          customer_name: challenge.customer_name,
          customer_role: challenge.customer_role,
          concept_name: concept.name,
          concept_image: concept.image,
          concept_font_idx: concept.fontIdx !== undefined ? concept.fontIdx : 0,
          concept_font_pool: concept.fontPool,
          problem: concept.problem,
          solution_overview: concept.solutionOverview,
          features: concept.features,
          value_score: ratings.value,
          creativity_score: ratings.creativity,
          uniqueness_score: ratings.uniqueness,
          review: ratings.review
        })
      });
      if (!res.ok) throw new Error("Couldn't save to portfolio.");
      setSaved(true);
    } catch (e) {
      setError("Couldn't save to your portfolio. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative h-[100dvh] w-full bg-transparent overflow-hidden flex flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        <div className="min-h-full flex flex-col px-4 pt-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] max-w-lg w-full mx-auto">
          {showProgress && (
            <div className="flex items-center justify-between gap-4 mb-4 shrink-0">
              <div className="flex-1">
                <ProgressHeader currentIndex={currentIndex < 0 ? 0 : currentIndex} />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Exit this game and start a new one? Your current progress will be lost.")) {
                    handleRestart();
                  }
                }}
                className="h-9 w-9 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors shadow-md border border-slate-700/60 shrink-0"
                aria-label="Exit game"
                title="Exit game"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/90 text-white text-sm text-center rounded-2xl px-4 py-2.5 mb-4">
              {error}
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center">
            {insightsLoading ? (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <div className="h-10 w-10 border-4 border-black/10 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-foreground font-semibold text-sm">Synthesizing your research...</p>
                <p className="text-slate-400 text-xs mt-1">Pinning key insights to the board</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {stage === "select" && (
                  <ModeSelectScreen 
                    onSelectSingle={() => setStage("start")} 
                    onSelectMulti={() => navigate("/multiplayer")} 
                    onPortfolio={() => navigate("/portfolio")} 
                  />
                )}
                {stage === "start" && (
                  <div className="flex flex-col w-full">
                    <StartScreen key="start" onStart={handleStart} loading={loadingChallenge} onPortfolio={() => navigate("/portfolio")} />
                    <button
                      type="button"
                      onClick={() => setStage("select")}
                      className="mt-4 text-slate-500 hover:text-white text-xs font-semibold transition-colors"
                    >
                      ← Back to Mode Selection
                    </button>
                  </div>
                )}
                {stage === "challenge" && challenge && (
                  <ChallengeScreen key="challenge" challenge={challenge} onContinue={() => setStage("interview")} />
                )}
                {stage === "interview" && challenge && (
                  <InterviewScreen
                    key="interview"
                    challenge={challenge}
                    qa={qa}
                    setQa={setQa}
                    onContinue={handleInterviewDone}
                  />
                )}
                {stage === "brainstorm" && challenge && (
                  <BrainstormScreen
                    key="brainstorm"
                    challenge={challenge}
                    qa={qa}
                    ideas={ideas}
                    setIdeas={setIdeas}
                    feedbacks={feedbacks}
                    setFeedbacks={setFeedbacks}
                    insights={insights}
                    onContinue={() => setStage("final")}
                  />
                )}
                {stage === "final" && challenge && (
                  <FinalConceptScreen
                    key="final"
                    challenge={challenge}
                    domain={domain}
                    onSubmit={handleFinalSubmit}
                    loading={ratingLoading}
                  />
                )}
                {stage === "results" && ratings && concept && (
                  <ResultsScreen
                    key="results"
                    challenge={challenge}
                    concept={concept}
                    ratings={ratings}
                    onSave={handleSave}
                    saving={saving}
                    saved={saved}
                    onRestart={handleRestart}
                    onGoPortfolio={() => navigate("/portfolio")}
                  />
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}