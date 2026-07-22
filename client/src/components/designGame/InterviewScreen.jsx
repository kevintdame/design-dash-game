import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowRight, Loader2, Sparkles, Mic, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedCustomerCard from "./AnimatedCustomerCard";

export default function InterviewScreen({ challenge, qa, setQa, onContinue }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(() => {
    return localStorage.getItem("designdash_voice_mode") === "true";
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);

  const MAX_Q = 5;
  const questionsLeft = MAX_Q - qa.length;
  const canAsk = input.trim() && !loading && questionsLeft > 0;

  useEffect(() => {
    localStorage.setItem("designdash_voice_mode", voiceMode);
    if (!voiceMode && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [voiceMode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [qa, loading]);

  function speakAnswer(text) {
    if (!voiceMode || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = challenge.customer_gender === "female" ? 1.15 : 0.9;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis failed:", e);
      setIsSpeaking(false);
    }
  }

  function startVoiceListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser version.");
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
      };

      recognition.start();
    } catch (e) {
      console.warn("Speech recognition error:", e);
      setIsListening(false);
    }
  }

  async function handleAsk() {
    if (!canAsk) return;
    const question = input.trim();
    setInput("");
    setLoading(true);
    try {
      const { answerAsCustomer } = await import("@/lib/designGame");
      const answer = await answerAsCustomer(challenge, question, qa);
      setQa([...qa, { question, answer }]);
      if (voiceMode) {
        speakAnswer(answer);
      }
    } catch (e) {
      const fallbackMsg = "Hmm, I didn't quite catch that — could you rephrase?";
      setQa([...qa, { question, answer: fallbackMsg }]);
      if (voiceMode) {
        speakAnswer(fallbackMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="max-w-md mx-auto flex flex-col h-full"
    >
      {/* Voice Mode Feature Toggle Header */}
      <div className="flex items-center justify-between mb-3 bg-card/60 backdrop-blur border border-white/10 rounded-2xl px-4 py-2">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          {voiceMode ? <Volume2 className="h-4 w-4 text-accent" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          2D Voice & Character Mode
        </span>
        <button
          onClick={() => setVoiceMode(!voiceMode)}
          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
            voiceMode
              ? "bg-accent text-accent-foreground shadow-accent/20 ring-2 ring-accent"
              : "bg-white/10 text-muted-foreground hover:text-foreground"
          }`}
        >
          {voiceMode ? "ON 🎙️" : "OFF"}
        </button>
      </div>

      {/* Challenge Card */}
      <div className="bg-gradient-to-br from-primary/90 to-accent/90 text-primary-foreground rounded-3xl p-5 mb-3 shadow-xl shadow-primary/30">
        {/* Top line with category / questions counter */}
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/75 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
            Design Challenge
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full text-white">
            {questionsLeft} {questionsLeft === 1 ? "Q" : "Qs"} left
          </span>
        </div>
        
        {/* Main Header / Challenge Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight uppercase">
          {challenge.title}
        </h2>
        
        {/* Scenario description */}
        <p className="text-primary-foreground/90 text-sm sm:text-base leading-relaxed mt-2">
          {challenge.scenario}
        </p>
      </div>

      {/* 2D Animated Customer Character (Rendered only when Voice Mode is ON) */}
      {voiceMode && (
        <AnimatedCustomerCard
          customerName={challenge.customer_name}
          isSpeaking={isSpeaking}
          gender={challenge.customer_gender}
        />
      )}

      {/* Q&A Chat Container */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1 mb-3 min-h-[200px] sm:min-h-[260px]">
        {qa.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center py-8 gap-2">
            <span className="text-4xl">🎤</span>
            <p className="text-foreground/60 text-sm max-w-[15rem] font-medium">
              Start the conversation — ask {challenge.customer_name.split(" ")[0]} about their frustrations, daily routine, or what they wish existed.
            </p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {qa.map((item, i) => (
            <div key={i}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%] shadow-md shadow-primary/20">
                  <p className="text-sm font-medium">{item.question}</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mt-2"
              >
                <div className="bg-card/90 backdrop-blur text-card-foreground rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%] ring-1 ring-border shadow-sm">
                  <p className="text-sm leading-relaxed">{item.answer}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card/90 backdrop-blur text-card-foreground rounded-2xl rounded-bl-md px-4 py-3 ring-1 ring-border shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
            </div>
          </div>
        )}
      </div>

      {/* Input Bar & Actions */}
      <div className="space-y-2">
        {questionsLeft > 0 ? (
          <div className="flex gap-2">
            {voiceMode && (
              <Button
                type="button"
                onClick={startVoiceListening}
                className={`rounded-2xl h-12 w-12 p-0 transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse ring-2 ring-red-400"
                    : "bg-card/90 border border-white/10 text-accent hover:bg-accent hover:text-accent-foreground"
                }`}
                title="Speak question into phone"
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder={isListening ? "Listening to your voice..." : "Type your question..."}
              className="flex-1 bg-card/90 backdrop-blur text-card-foreground rounded-2xl px-4 py-3 text-base sm:text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent shadow-sm ring-1 ring-border"
            />
            <Button
              onClick={handleAsk}
              disabled={!canAsk}
              className="bg-gradient-to-br from-primary to-accent text-primary-foreground hover:opacity-90 rounded-2xl h-12 w-12 p-0 shadow-md shadow-primary/20"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        <Button
          onClick={onContinue}
          disabled={loading}
          className="w-full bg-card/90 backdrop-blur text-card-foreground hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-primary-foreground hover:ring-accent ring-1 ring-border font-bold rounded-2xl h-12 transition-all"
        >
          {qa.length === 0 ? (
            "Skip to brainstorm →"
          ) : questionsLeft > 0 ? (
            <span className="flex items-center gap-2">Done interviewing — brainstorm <ArrowRight className="h-4 w-4" /></span>
          ) : (
            <span className="flex items-center gap-2">Move to brainstorm <ArrowRight className="h-4 w-4" /></span>
          )}
        </Button>
      </div>
    </motion.div>
  );
}