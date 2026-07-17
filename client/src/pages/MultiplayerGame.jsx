import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ProgressHeader, { STAGES } from "@/components/designGame/ProgressHeader";
import ChallengeScreen from "@/components/designGame/ChallengeScreen";
import InterviewScreen from "@/components/designGame/InterviewScreen";
import BrainstormScreen from "@/components/designGame/BrainstormScreen";
import FinalConceptScreen from "@/components/designGame/FinalConceptScreen";
import { synthesizeInsights, generateFeatureImages } from "@/lib/designGame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function TimerBanner({ deadline, onTimeout }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!deadline) return;
    const target = new Date(deadline).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft("00:00");
        onTimeout();
      } else {
        const min = Math.floor(diff / 60000);
        const sec = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, onTimeout]);

  return (
    <div className="bg-amber-500 text-white font-bold text-center py-2 px-6 rounded-full shadow-md flex items-center justify-center space-x-2 animate-pulse mb-6">
      <span className="text-xl">⏱️</span>
      <span className="font-mono text-lg tracking-wider">Time Remaining: {timeLeft}</span>
    </div>
  );
}

export default function MultiplayerGame() {
  const navigate = useNavigate();
  
  // Game state controllers
  const [mode, setMode] = useState("setup"); // setup | lobby | playing | waiting | results
  const [room, setRoom] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  
  // Local game step states
  const [stage, setStage] = useState("challenge"); // challenge | interview | brainstorm | finalConcept
  const [qa, setQa] = useState([]);
  const [ideas, setIdeas] = useState(["", "", ""]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [localConcept, setLocalConcept] = useState({ problem: "", solutionOverview: "", features: [] });
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Setup form states
  const queryParams = new URLSearchParams(window.location.search);
  const [setupDomain, setSetupDomain] = useState(queryParams.get("domain") || "Education");
  const [setupTimer, setSetupTimer] = useState(480); // 8 mins

  // Poll room status when in lobby or waiting
  useEffect(() => {
    if (!room || mode === "setup" || mode === "results") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${room.id}`);
        if (!res.ok) throw new Error();
        const updatedRoom = await res.json();
        
        // Sync local room state
        setRoom(updatedRoom);

        // State machine transitions based on server status
        if (updatedRoom.status === "playing" && mode === "lobby") {
          setMode("playing");
          setStage("challenge");
        } else if (updatedRoom.status === "finished") {
          setMode("results");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Error polling room:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [room, mode]);

  // Create Room
  async function handleCreateRoom() {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorName: playerName.trim(),
          domain: setupDomain,
          timerDuration: setupTimer
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create room");
      }
      const data = await res.json();
      setRoom(data);
      setMode("lobby");
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  }

  // Join Room
  async function handleJoinRoom() {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!inputRoomId.trim()) {
      setError("Please enter a room code");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: inputRoomId.trim().toUpperCase(),
          playerName: playerName.trim()
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join room");
      }
      const data = await res.json();
      setRoom(data);
      setMode("lobby");
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  }

  // Start Game (Host only)
  async function handleStartGame() {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${room.id}/start`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to start game");
      const updated = await res.json();
      setRoom(updated);
      setMode("playing");
      setStage("challenge");
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  }

  // Handle local stage transitions
  async function handleInterviewDone() {
    if (!qa || qa.length === 0) {
      setInsights([]);
      setStage("brainstorm");
      return;
    }
    setInsightsLoading(true);
    setError(null);
    try {
      const result = await synthesizeInsights(room.challenge, qa);
      setInsights(result);
      setStage("brainstorm");
    } catch (e) {
      setInsights([]);
      setStage("brainstorm");
    } finally {
      setInsightsLoading(false);
    }
  }

  // Submit Final Concept (manual or timeout)
  async function submitConcept(conceptToSubmit) {
    setError(null);
    try {
      const featuresWithImages = await generateFeatureImages(
        conceptToSubmit.features || [],
        room.domain
      );
      
      const res = await fetch(`/api/rooms/${room.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: playerName.trim(),
          concept: { ...conceptToSubmit, features: featuresWithImages }
        })
      });
      if (!res.ok) throw new Error("Failed to submit concept");
      const updated = await res.json();
      setRoom(updated);
      setMode("waiting");
    } catch (e) {
      setError("Failed to submit concept. Retrying...");
      // Auto-fallback to waiting screen to prevent blocks
      setMode("waiting");
    }
  }

  // Triggered when timer runs out
  function handleTimeout() {
    submitConcept(localConcept);
  }

  // Render components
  return (
    <div className="h-[100dvh] w-full bg-[#eef3f0] overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] bg-gradient-to-tr from-[#ff8e6e] via-[#f74872] to-[#ffd269]">
        <div className="min-h-full flex flex-col px-4 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-w-lg w-full mx-auto justify-center">
          
          {error && (
            <div className="bg-rose-50 border border-rose-150 text-rose-600 text-sm text-center rounded-2xl px-4 py-2.5 mb-4 shadow-sm font-semibold">
              {error}
            </div>
          )}

          {/* SETUP SCREEN */}
          {mode === "setup" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col justify-center space-y-5"
            >
              <div className="text-center space-y-2 mb-4">
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter bg-gradient-to-r from-[#c93c76] via-[#de573a] to-[#f09c35] bg-clip-text text-transparent font-sans">Multiplayer Battle</h1>
                <p className="text-slate-500 text-xs sm:text-sm font-semibold">Compete head-to-head in a design thinking sprint!</p>
              </div>

              <Card className="bg-white/10 border-white/25 text-white backdrop-blur-md shadow-2xl rounded-3xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-white">1. Choose your Name</CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  <Input 
                    placeholder="Enter your name..."
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    className="bg-black/25 border-white/20 text-white placeholder:text-pink-100/60 focus:border-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl h-12 text-sm"
                  />
                </CardContent>
              </Card>

              <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-black/25 text-pink-100/60 rounded-2xl h-12 p-1.5 border border-white/5">
                  <TabsTrigger 
                    value="create" 
                    className="rounded-xl font-bold text-xs transition data-[state=active]:bg-white/20 data-[state=active]:text-white text-pink-100/70"
                  >
                    Create Room
                  </TabsTrigger>
                  <TabsTrigger 
                    value="join" 
                    className="rounded-xl font-bold text-xs transition data-[state=active]:bg-white/20 data-[state=active]:text-white text-pink-100/70"
                  >
                    Join Room
                  </TabsTrigger>
                </TabsList>

                {/* CREATE ROOM TAB */}
                <TabsContent value="create" className="mt-3">
                  <Card className="bg-white/10 border-white/25 text-white backdrop-blur-md shadow-2xl rounded-3xl">
                    <CardContent className="pt-5 pb-5">
                      <Button 
                        onClick={handleCreateRoom}
                        disabled={actionLoading}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold h-13 text-sm rounded-2xl shadow-lg transition-transform active:scale-[0.98]"
                      >
                        {actionLoading ? "Creating..." : "🚀 Create Lobby"}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* JOIN ROOM TAB */}
                <TabsContent value="join" className="mt-3">
                  <Card className="bg-white/10 border-white/25 text-white backdrop-blur-md shadow-2xl rounded-3xl">
                    <CardContent className="space-y-4 pt-5 pb-5">
                      <div className="space-y-1.5">
                        <label className="text-xs text-pink-100/80 uppercase font-bold tracking-wider">Room Code</label>
                        <Input 
                          placeholder="Enter 4-letter code..."
                          value={inputRoomId}
                          onChange={e => setInputRoomId(e.target.value)}
                          className="bg-black/25 border-white/20 text-white placeholder:text-pink-100/60 focus:border-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 uppercase tracking-widest text-center text-lg font-bold rounded-2xl h-12"
                          maxLength={4}
                        />
                      </div>
                      <Button 
                        onClick={handleJoinRoom}
                        disabled={actionLoading}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold h-13 text-sm rounded-2xl shadow-lg transition-transform active:scale-[0.98]"
                      >
                        {actionLoading ? "Joining..." : "Join Game"}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <button 
                type="button" 
                onClick={() => navigate("/")} 
                className="text-pink-100/80 hover:text-white text-xs font-semibold py-2 transition underline underline-offset-4"
              >
                ← Back to Single Player
              </button>
            </motion.div>
          )}

          {/* LOBBY SCREEN */}
          {mode === "lobby" && room && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col justify-center space-y-6"
            >
              <Card className="bg-white border border-slate-100 text-slate-800 rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.04)] text-center">
                <CardHeader className="pb-3">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#de573a]">Room Code</span>
                  <CardTitle className="text-5xl font-black tracking-widest select-all my-2 font-mono text-slate-900">{room.id}</CardTitle>
                  <p className="text-xs text-slate-500 font-semibold">Share this code with your friends (up to 5 players)!</p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="text-[10px] text-slate-400 uppercase font-extrabold mb-3 tracking-wider">Joined Players ({Object.keys(room.players).length}/5)</h3>
                    <div className="space-y-2">
                      {Object.keys(room.players).map(pid => (
                        <div key={pid} className="flex items-center space-x-2.5 bg-[#f0f4f2] px-4 py-2.5 rounded-2xl border border-slate-100">
                          <span className="text-lg">👤</span>
                          <span className="font-extrabold text-sm text-slate-850">{room.players[pid].name}</span>
                          {pid === "player_1" && (
                            <span className="ml-auto text-[9px] bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-extrabold border border-amber-200">HOST</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {playerName.trim() === room.creator_name ? (
                    <Button 
                      onClick={handleStartGame}
                      disabled={actionLoading}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-6 text-sm shadow-lg rounded-2xl transition-transform active:scale-95"
                    >
                      {actionLoading ? "Starting..." : "Start Game"}
                    </Button>
                  ) : (
                    <div className="bg-[#f0f4f2] text-slate-500 py-3 rounded-2xl border border-slate-100 animate-pulse text-xs font-bold">
                      Waiting for Host to start...
                    </div>
                  )}
                  <button 
                    type="button"
                    onClick={() => { setMode("setup"); setRoom(null); }} 
                    className="w-full text-slate-400 hover:text-slate-900 mt-2 text-xs font-bold transition underline underline-offset-4"
                  >
                    Leave Room & Exit
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* PLAYING STATE */}
          {mode === "playing" && room && (
            <div className="flex-1 flex flex-col">
              <TimerBanner deadline={room.deadline} onTimeout={handleTimeout} />
              
              <div className="shrink-0 mb-6 flex items-center justify-between">
                <div className="flex-1">
                  <ProgressHeader 
                    currentIndex={STAGES.findIndex(s => s.key === stage) || 0} 
                    stages={STAGES} 
                  />
                </div>
                 <button 
                  onClick={() => {
                    if (confirm("Exit game? This will remove you from the multiplayer room.")) {
                      setMode("setup");
                      setRoom(null);
                    }
                  }}
                  className="text-slate-500 hover:text-slate-900 text-sm font-extrabold bg-[#f0f4f2] hover:bg-slate-200 rounded-full h-8 w-8 flex items-center justify-center transition ml-4 shrink-0 shadow-sm"
                  title="Exit to Setup"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {stage === "challenge" && (
                  <ChallengeScreen 
                    challenge={room.challenge}
                    onContinue={() => setStage("interview")}
                  />
                )}

                {stage === "interview" && (
                  <InterviewScreen 
                    challenge={room.challenge}
                    qa={qa}
                    setQa={setQa}
                    onContinue={handleInterviewDone}
                  />
                )}

                {stage === "brainstorm" && (
                  <BrainstormScreen 
                    challenge={room.challenge}
                    insights={insights}
                    insightsLoading={insightsLoading}
                    ideas={ideas}
                    setIdeas={setIdeas}
                    feedbacks={feedbacks}
                    setFeedbacks={setFeedbacks}
                    onContinue={() => setStage("finalConcept")}
                  />
                )}

                {stage === "finalConcept" && (
                  <FinalConceptScreen 
                    challenge={room.challenge}
                    ideas={ideas}
                    onSubmit={(concept) => {
                      setLocalConcept(concept);
                      submitConcept(concept);
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* WAITING SCREEN */}
          {mode === "waiting" && room && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col justify-center space-y-6"
            >
              <Card className="bg-white border border-slate-100 text-slate-800 rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.04)] text-center">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-extrabold text-slate-900">Waiting for Designers...</CardTitle>
                  <p className="text-xs text-slate-500 font-semibold">The AI judge will evaluate once all designers submit or the timer ends.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TimerBanner deadline={room.deadline} onTimeout={handleTimeout} />
                  
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    {Object.keys(room.players).map(pid => (
                      <div key={pid} className="flex items-center justify-between bg-[#f0f4f2] px-4 py-2.5 rounded-2xl border border-slate-100">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-lg">👤</span>
                          <span className="font-extrabold text-sm text-slate-855">{room.players[pid].name}</span>
                        </div>
                        {room.players[pid].submitted ? (
                          <span className="text-emerald-600 font-extrabold text-xs">✅ Submitted</span>
                        ) : (
                          <span className="text-amber-600 font-extrabold text-xs flex items-center space-x-1 animate-pulse">
                            <span>✍️ Designing...</span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button"
                    onClick={() => { setMode("setup"); setRoom(null); }} 
                    className="w-full text-slate-400 hover:text-slate-900 mt-3 text-xs font-bold transition underline underline-offset-4"
                  >
                    Quit Game & Exit
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* BATTLE RESULTS / LEADERBOARD SCREEN */}
          {mode === "results" && room && room.results && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 mb-2">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white font-sans drop-shadow-md">🏆 Pitch Battle Results</h1>
                <p className="text-white/95 text-xs sm:text-sm font-bold">Evaluated by your customer, {room.challenge.customer_name}</p>
              </div>

              {/* RATING LEADERS */}
              <div className="space-y-3">
                {room.results.ranking.map((pid, rankIdx) => {
                  const p = room.players[pid];
                  const scores = room.results.scores.find(s => s.player_id === pid) || { value: 0, creativity: 0, uniqueness: 0 };
                  const avgScore = Math.round((scores.value + scores.creativity + scores.uniqueness) / 3);

                  return (
                    <Card key={pid} className={`border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-slate-800 rounded-[28px] overflow-hidden ${
                      rankIdx === 0 ? "bg-amber-50/90 border border-amber-200" : "bg-white"
                    }`}>
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl font-black text-amber-500 w-6">
                            {rankIdx === 0 ? "🥇" : rankIdx === 1 ? "🥈" : rankIdx === 2 ? "🥉" : `${rankIdx + 1}`}
                          </span>
                          <div>
                            <h3 className="font-extrabold text-base text-slate-900">{p.name}</h3>
                            <p className="text-xs text-slate-500 font-semibold truncate max-w-[200px]">
                              {p.concept ? p.concept.solutionOverview : "Failed to submit"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-[#de573a]">{avgScore}</span>
                          <span className="text-[9px] block text-slate-400 font-extrabold">AVG Rating</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* CUSTOMER JUDGEMENT */}
              <Card className="bg-white border border-slate-100 text-slate-850 shadow-[0_12px_40px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xs font-extrabold uppercase tracking-widest text-[#de573a]">
                    💬 Customer Feedback ({room.challenge.customer_name})
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs font-semibold leading-relaxed text-slate-700 italic">
                  "{room.results.review}"
                </CardContent>
              </Card>

              {/* SIDE-BY-SIDE CONCEPTS COMPARE */}
              <Card className="bg-white border border-slate-100 text-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-sm font-extrabold uppercase tracking-widest text-slate-900">Compare Submissions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.keys(room.players).map(pid => {
                    const p = room.players[pid];
                    const scores = room.results.scores.find(s => s.player_id === pid) || { value: 0, creativity: 0, uniqueness: 0 };
                    
                    return (
                      <div key={pid} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                        <h4 className="font-extrabold text-sm text-[#de573a]">{p.name}'s Concept</h4>
                        {p.concept ? (
                          <div className="mt-2 space-y-2.5 text-xs">
                            <p className="text-slate-650 font-semibold"><strong>Problem:</strong> {p.concept.problem}</p>
                            <p className="text-slate-650 font-semibold"><strong>Solution:</strong> {p.concept.solutionOverview}</p>
                            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[9px] uppercase font-extrabold text-slate-400">
                              <div className="bg-[#f0f4f2] p-1.5 rounded-xl border border-slate-100 text-slate-500">
                                <span className="block text-slate-900 font-black text-sm">{scores.value}</span> Value
                              </div>
                              <div className="bg-[#f0f4f2] p-1.5 rounded-xl border border-slate-100 text-slate-500">
                                <span className="block text-slate-900 font-black text-sm">{scores.creativity}</span> Unique
                              </div>
                              <div className="bg-[#f0f4f2] p-1.5 rounded-xl border border-slate-100 text-slate-500">
                                <span className="block text-slate-900 font-black text-sm">{scores.uniqueness}</span> Design
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-rose-500 text-xs italic mt-1 font-bold">Player did not finish in time.</p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="flex gap-4 pt-2">
                <Button 
                  onClick={() => { setMode("setup"); setRoom(null); }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold h-14 shadow-lg text-sm rounded-2xl transition-transform active:scale-95"
                >
                  🎮 Play Again
                </Button>
                <Button 
                  onClick={() => navigate("/")}
                  className="flex-1 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 font-extrabold h-14 shadow-sm text-sm rounded-2xl transition-transform active:scale-95"
                >
                  🏠 Single Player
                </Button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
