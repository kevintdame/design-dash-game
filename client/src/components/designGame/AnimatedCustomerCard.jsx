import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

export default function AnimatedCustomerCard({ customerName, isSpeaking, gender = "male" }) {
  const [blink, setBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0); // 0 (closed) to 1 (wide open)

  // Random natural blinking animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3200 + Math.random() * 2500);
    return () => clearInterval(interval);
  }, []);

  // Dynamic real-time mouth morphing animation when customer is speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0);
      return;
    }

    const interval = setInterval(() => {
      setMouthOpen(Math.random() * 0.75 + 0.25);
    }, 110);

    return () => {
      clearInterval(interval);
      setMouthOpen(0);
    };
  }, [isSpeaking]);

  const isFemale = gender?.toLowerCase() === "female";

  return (
    <div className="bg-card/90 backdrop-blur border border-white/10 rounded-3xl p-4 shadow-xl text-center max-w-sm mx-auto my-3 relative overflow-hidden">
      {/* Subtle background aura glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-accent/10 pointer-events-none" />

      {/* 2D Vector Character Canvas with smooth floating idle posture */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-36 h-36 sm:w-40 sm:h-40 mx-auto relative flex items-center justify-center"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* Background Ring */}
          <circle cx="100" cy="100" r="90" fill="url(#avatarGrad)" opacity="0.25" />

          {/* Character Shirt / Torso */}
          <path
            d="M 35 185 C 35 135, 165 135, 165 185 Z"
            fill={isFemale ? "#EC4899" : "#3B82F6"}
          />

          {/* Neck */}
          <rect x="88" y="115" width="24" height="25" fill="#F59E0B" rx="6" />

          {/* Head */}
          <circle cx="100" cy="85" r="45" fill="url(#skinGrad)" />

          {/* Hair Styling */}
          {isFemale ? (
            <path
              d="M 50 85 C 45 35, 155 35, 150 85 C 150 110, 140 120, 135 120 C 130 90, 70 90, 65 120 C 60 120, 50 110, 50 85 Z"
              fill="#4C1D95"
            />
          ) : (
            <path
              d="M 52 75 C 50 38, 150 38, 148 75 C 135 55, 65 55, 52 75 Z"
              fill="#1E1B4B"
            />
          )}

          {/* Eyes & Pupils */}
          {blink ? (
            <>
              <line x1="75" y1="80" x2="89" y2="80" stroke="#1E1B4B" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="111" y1="80" x2="125" y2="80" stroke="#1E1B4B" strokeWidth="3.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="82" cy="80" r="5" fill="#1E1B4B" />
              <circle cx="118" cy="80" r="5" fill="#1E1B4B" />
              <circle cx="84" cy="78" r="1.8" fill="#FFFFFF" />
              <circle cx="120" cy="78" r="1.8" fill="#FFFFFF" />
            </>
          )}

          {/* Eyebrows */}
          <path d="M 74 71 Q 82 67 90 71" stroke="#1E1B4B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 110 71 Q 118 67 126 71" stroke="#1E1B4B" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Nose */}
          <path d="M 100 84 L 97 93 L 103 93" stroke="#D97706" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Dynamic Viseme Mouth (Morphs real-time when speaking) */}
          <path
            d={`M 78 106 Q 100 ${106 + mouthOpen * 22} 122 106 Q 100 ${106 + mouthOpen * 8} 78 106`}
            fill={mouthOpen > 0.1 ? "#991B1B" : "#B91C1C"}
            stroke="#B91C1C"
            strokeWidth="2"
          />
          {mouthOpen > 0.25 && (
            <rect
              x="88"
              y="106"
              width="24"
              height={mouthOpen * 5.5}
              fill="#FFFFFF"
              rx="1"
            />
          )}
        </svg>
      </motion.div>

      {/* Customer Name & Voice Indicator Status */}
      <div className="mt-2">
        <h4 className="text-base sm:text-lg font-black uppercase text-foreground tracking-wide">
          {customerName}
        </h4>
        <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-bold">
          {isSpeaking ? (
            <>
              <Volume2 className="h-3.5 w-3.5 animate-pulse text-amber-300" />
              <span>Customer Speaking...</span>
            </>
          ) : (
            <>
              <VolumeX className="h-3.5 w-3.5 opacity-60" />
              <span>Listening for questions</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
