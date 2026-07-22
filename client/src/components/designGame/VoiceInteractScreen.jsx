import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhotoTalkingAvatar from "./PhotoTalkingAvatar";

export default function VoiceInteractScreen({ challenge, qa, setQa, onContinue, onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusMsg, setStatusMsg] = useState(""); // Transient non-cluttered status

  // Cancel any speech when unmounting
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const [mouthOpen, setMouthOpen] = useState(0);

  // Dynamic mouth motion animation when customer speaks
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0);
      return;
    }
    const interval = setInterval(() => {
      setMouthOpen(Math.random() * 0.7 + 0.3);
    }, 110);
    return () => {
      clearInterval(interval);
      setMouthOpen(0);
    };
  }, [isSpeaking]);

  function getBestDeviceVoice(gender) {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const isFemale = gender?.toLowerCase() === "female";
    const englishVoices = voices.filter(v => v.lang.startsWith("en"));

    // Prioritize natural, neural, enhanced, and Siri voices installed on device
    const premiumVoices = englishVoices.filter(v => 
      /enhanced|premium|natural|siri|google/i.test(v.name)
    );

    const pool = premiumVoices.length > 0 ? premiumVoices : englishVoices;

    if (isFemale) {
      return pool.find(v => /female|samantha|ava|victoria|karen|zira|siri/i.test(v.name)) || pool[0];
    } else {
      return pool.find(v => /male|alex|daniel|fred|george|david|siri/i.test(v.name)) || pool[0];
    }
  }

  const audioRef = useRef(null);

  async function speakCustomerAnswer(text) {
    setStatusMsg("Customer speaking...");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          gender: challenge?.customer_gender
        })
      });

      const data = await res.json();
      if (data.audio) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(data.audio);
        audioRef.current = audio;
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          setStatusMsg("");
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setStatusMsg("");
          fallbackDeviceSpeech(text);
        };
        await audio.play();
        return;
      }
    } catch (e) {
      console.warn("Google Cloud TTS endpoint fetch failed, falling back to device speech:", e);
    }

    fallbackDeviceSpeech(text);
  }

  function fallbackDeviceSpeech(text) {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = challenge?.customer_gender?.toLowerCase() === "female" ? 1.15 : 0.9;

      const bestVoice = getBestDeviceVoice(challenge?.customer_gender);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setStatusMsg("Customer speaking...");
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setStatusMsg("");
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setStatusMsg("");
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Device speech fallback failed:", err);
      setIsSpeaking(false);
    }
  }

  async function processSpokenQuestion(questionText) {
    if (!questionText.trim()) return;
    setIsThinking(true);
    setStatusMsg("Customer thinking...");
    try {
      const { answerAsCustomer } = await import("@/lib/designGame");
      const answer = await answerAsCustomer(challenge, questionText, qa);
      setQa((prev) => [...prev, { question: questionText, answer }]);
      setIsThinking(false);
      speakCustomerAnswer(answer);
    } catch (err) {
      const fallback = "Hmm, I didn't quite catch that — could you say that again?";
      setQa((prev) => [...prev, { question: questionText, answer: fallback }]);
      setIsThinking(false);
      speakCustomerAnswer(fallback);
    }
  }

  function handleMicClick() {
    // If currently speaking, stop voice narration
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setStatusMsg("");
      return;
    }

    // If thinking, do nothing
    if (isThinking) return;

    // Check browser speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported on this browser version.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMsg("Listening...");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (e) => {
        console.warn("Recognition error:", e);
        setIsListening(false);
        setStatusMsg("");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          processSpokenQuestion(transcript);
        }
      };

      recognition.start();
    } catch (e) {
      console.warn("Speech recognition failed:", e);
      setIsListening(false);
      setStatusMsg("");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden"
    >
      {/* Full-Screen Photo Takeover with 2D Canvas Talking Face Animation */}
      {challenge?.customer_image ? (
        <PhotoTalkingAvatar
          src={challenge.customer_image}
          isSpeaking={isSpeaking}
          altName={challenge.customer_name}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-950 flex items-center justify-center">
          <span className="text-9xl font-black text-white/20 font-display">
            {challenge?.customer_name?.charAt(0) || "C"}
          </span>
        </div>
      )}

      {/* Subtle Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none" />

      {/* Top Header Control (Discreet Close & Move Forward Actions) */}
      <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between">
        <button
          onClick={onClose}
          className="bg-black/40 backdrop-blur text-white/80 hover:text-white p-2.5 rounded-full border border-white/10 shadow-lg"
          title="Exit Voice Mode"
        >
          <X className="h-5 w-5" />
        </button>

        {qa.length > 0 && (
          <button
            onClick={onContinue}
            className="bg-accent/90 backdrop-blur text-accent-foreground font-black text-xs uppercase tracking-wider px-4 py-2 rounded-full border border-accent/40 shadow-lg flex items-center gap-1.5"
          >
            <span>Brainstorm</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Center Speech Aura / Pulse Effect when Customer Speaks */}
      {isSpeaking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-72 h-72 rounded-full bg-accent/20 filter blur-3xl"
          />
        </div>
      )}

      {/* Bottom Floating Control Bar (Single Microphone Button) */}
      <div className="relative z-10 pb-12 flex flex-col items-center justify-center gap-3">
        {/* Simple Floating Mic Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleMicClick}
          className={`h-20 w-20 rounded-full flex items-center justify-center shadow-2xl transition-all border ${
            isListening
              ? "bg-red-500 border-red-400 text-white ring-4 ring-red-500/40 animate-pulse"
              : isThinking
              ? "bg-amber-500 border-amber-400 text-white"
              : isSpeaking
              ? "bg-accent border-accent/50 text-accent-foreground ring-4 ring-accent/30"
              : "bg-white/20 backdrop-blur border-white/30 text-white hover:bg-white/30"
          }`}
        >
          {isThinking ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : isSpeaking ? (
            <MicOff className="h-8 w-8 text-white" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
