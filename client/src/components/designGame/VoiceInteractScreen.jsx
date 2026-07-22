import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Loader2, X, ArrowRight } from "lucide-react";
import DuolingoCharacterRig from "./DuolingoCharacterRig";

export default function VoiceInteractScreen({ challenge, qa, setQa, onContinue, onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function speakCustomerAnswer(text) {
    // 1. Try Free Neural TTS API (/api/tts-free) with StreamElements & Google Translate fallback
    try {
      const res = await fetch("/api/tts-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          gender: challenge?.customer_gender
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          playAudio(data.audio, text);
          return;
        }
      }
    } catch (e) {
      console.warn("Free Neural TTS fetch failed, trying device fallback:", e);
    }

    fallbackDeviceSpeech(text);
  }

  function playAudio(audioSrc, rawText) {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.onplay = () => setIsSpeaking(true);
    audio.onended = () => setIsSpeaking(false);
    audio.onerror = () => {
      setIsSpeaking(false);
      fallbackDeviceSpeech(rawText);
    };
    audio.play().catch(() => fallbackDeviceSpeech(rawText));
  }

  function fallbackDeviceSpeech(text) {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = challenge?.customer_gender?.toLowerCase() === "female" ? 1.15 : 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Device speech fallback failed:", err);
      setIsSpeaking(false);
    }
  }

  async function processSpokenQuestion(questionText) {
    if (!questionText.trim()) return;
    setIsThinking(true);
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
    if (isSpeaking) {
      if (audioRef.current) audioRef.current.pause();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (isThinking) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported on this browser version.");
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
          processSpokenQuestion(transcript);
        }
      };

      recognition.start();
    } catch (e) {
      console.warn("Speech recognition error:", e);
      setIsListening(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#160728] flex flex-col justify-between overflow-hidden"
    >
      {/* Exact Duolingo 2D Vector Character Presentation */}
      <DuolingoCharacterRig isSpeaking={isSpeaking} />

      {/* Top Header Control (Discreet Close & Brainstorm Actions) */}
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

      {/* Bottom Floating Control Sheet (Single Mic Button) */}
      <div className="relative z-10 pb-10 pt-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col items-center justify-center">
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
