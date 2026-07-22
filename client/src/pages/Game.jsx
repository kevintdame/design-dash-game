import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProgressHeader, { STAGES } from "@/components/designGame/ProgressHeader";
import StartScreen from "@/components/designGame/StartScreen";
import SplashScreen from "@/components/designGame/SplashScreen";
import ModeSelectScreen from "@/components/designGame/ModeSelectScreen";
import ChallengeScreen from "@/components/designGame/ChallengeScreen";
import InterviewScreen from "@/components/designGame/InterviewScreen";
import VoiceInteractScreen from "@/components/designGame/VoiceInteractScreen";
import BrainstormScreen from "@/components/designGame/BrainstormScreen";
import FinalConceptScreen from "@/components/designGame/FinalConceptScreen";
import ResultsScreen from "@/components/designGame/ResultsScreen";
import { generateChallenge, rateFinalConcept, synthesizeInsights, generateFeatureImages } from "@/lib/designGame";
import VibeBackground from "@/components/designGame/VibeBackground";
import { X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function Game() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [playerName, setPlayerName] = useState(() => localStorage.getItem("designdash_player_name") || "");
  const [stage, setStage] = useState("splash");
  const [challenge, setChallenge] = useState(null);
  const [domain, setDomain] = useState(null);
  const [mode, setMode] = useState(null);
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
  const showProgress = !["start", "splash", "mode"].includes(stage);

  async function handleStart(d, nameInput) {
    setPlayerName(nameInput);
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
    setStage("start");
    setChallenge(null);
    setDomain(null);
    setMode(null);
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
          user_id: userId,
          player_name: playerName || "Anonymous Designer",
          domain,
          challenge_title: challenge.title,
          challenge_scenario: challenge.scenario,
          customer_name: challenge.customer_name,
          customer_role: challenge.customer_role,
          concept_name: concept.name,
          concept_image: concept.image,
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
      <VibeBackground />
      {showProgress && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Exit this game and start a new one? Your current progress will be lost.")) {
              handleRestart();
            }
          }}
          className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 ring-1 ring-black/5 flex items-center justify-center transition-colors shadow-md"
          aria-label="Exit game"
          title="Exit game"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        <div className="min-h-full flex flex-col px-4 pt-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] max-w-lg w-full mx-auto">
          {showProgress && (
            <div className="mb-4 shrink-0">
              <ProgressHeader currentIndex={currentIndex < 0 ? 0 : currentIndex} />
            </div>
          )}

          {error && (
            <div className="bg-rose-500/90 text-white text-sm text-center rounded-2xl px-4 py-2.5 mb-4">
              {error}
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-0">
           <div className="my-auto w-full">
            {insightsLoading ? (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <div className="h-10 w-10 border-4 border-black/10 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-foreground font-semibold text-sm">Synthesizing your research...</p>
                <p className="text-slate-400 text-xs mt-1">Pinning key insights to the board</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {stage === "splash" && (
                  <SplashScreen key="splash" onEnter={() => setStage("mode")} />
                )}
                {stage === "mode" && (
                  <ModeSelectScreen key="mode" onSelect={(m) => {
                    if (m === "multi") {
                      navigate("/multiplayer");
                    } else if (m === "portfolio") {
                      navigate("/portfolio");
                    } else if (m === "leaderboard") {
                      navigate("/leaderboard");
                    } else if (m === "conundrum") {
                      navigate("/conundrum");
                    } else {
                      setMode(m);
                      setStage("start");
                    }
                  }} />
                )}
                {stage === "start" && (
                  <StartScreen key="start" onStart={handleStart} loading={loadingChallenge} onPortfolio={() => navigate("/portfolio")} />
                )}
                {stage === "challenge" && challenge && (
                  <ChallengeScreen key="challenge" challenge={challenge} onContinue={() => setStage(mode === "voice" ? "voice_interview" : "interview")} />
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
                {stage === "voice_interview" && challenge && (
                  <VoiceInteractScreen
                    key="voice_interview"
                    challenge={challenge}
                    qa={qa}
                    setQa={setQa}
                    onContinue={handleInterviewDone}
                    onClose={() => setStage("mode")}
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
    </div>
  );
}