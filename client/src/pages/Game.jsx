import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProgressHeader, { STAGES } from "@/components/designGame/ProgressHeader";
import StartScreen from "@/components/designGame/StartScreen";
import ModeSelectScreen from "@/components/designGame/ModeSelectScreen";
import ChallengeScreen from "@/components/designGame/ChallengeScreen";
import InterviewScreen from "@/components/designGame/InterviewScreen";
import BrainstormScreen from "@/components/designGame/BrainstormScreen";
import FinalConceptScreen from "@/components/designGame/FinalConceptScreen";
import ResultsScreen from "@/components/designGame/ResultsScreen";
// removed base44 client import
import { generateChallenge, rateFinalConcept, synthesizeInsights, generateFeatureImages } from "@/lib/designGame";
import InsightWall from "@/components/designGame/InsightWall";

export default function Game() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("mode");
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

  const currentIndex = STAGES.findIndex((s) => s.key === stage);
  const showProgress = stage !== "mode" && stage !== "start";

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
    setStage("mode");
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
      const featuresWithImages = await generateFeatureImages(c.features, domain);
      const fullConcept = { ...c, features: featuresWithImages };
      const r = await rateFinalConcept(challenge, fullConcept);
      setConcept(fullConcept);
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
    <div className="h-[100dvh] w-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-amber-500 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        <div className="min-h-full flex flex-col px-4 pt-5 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-lg w-full mx-auto">
          {showProgress && (
            <div className="mb-6 shrink-0 flex items-center justify-between">
              <div className="flex-1">
                <ProgressHeader currentIndex={currentIndex < 0 ? 0 : currentIndex} />
              </div>
              <button 
                onClick={handleRestart}
                className="text-white/60 hover:text-white text-sm font-bold bg-white/10 hover:bg-white/20 rounded-full h-8 w-8 flex items-center justify-center transition ml-4 shrink-0 shadow-sm"
                title="Exit to Main Menu"
              >
                ✕
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
                <div className="h-10 w-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
                <p className="text-white font-semibold text-sm">Synthesizing your research...</p>
                <p className="text-white/70 text-xs mt-1">Pinning key insights to the board</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {stage === "mode" && (
                  <ModeSelectScreen 
                    key="mode" 
                    onSelectSingle={() => setStage("start")} 
                    onSelectMulti={() => navigate("/multiplayer")} 
                    onPortfolio={() => navigate("/portfolio")} 
                  />
                )}
                {stage === "start" && (
                  <StartScreen 
                    key="start" 
                    onStart={handleStart} 
                    loading={loadingChallenge} 
                    onBack={() => setStage("mode")} 
                  />
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