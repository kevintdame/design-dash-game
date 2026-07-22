import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function DuolingoVectorAvatar({ customerName, isSpeaking, gender = "male" }) {
  const [blink, setBlink] = useState(false);
  const [visemeState, setVisemeState] = useState(0); // 0: closed, 1: AA, 2: OO, 3: EE

  // Random eye blinking
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3200 + Math.random() * 2500);
    return () => clearInterval(interval);
  }, []);

  // 60 FPS Liquid 2D Vector Mouth Viseme Morphing when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setVisemeState(0);
      return;
    }

    const interval = setInterval(() => {
      const states = [1, 2, 3, 1, 0, 2];
      const nextViseme = states[Math.floor(Math.random() * states.length)];
      setVisemeState(nextViseme);
    }, 110);

    return () => {
      clearInterval(interval);
      setVisemeState(0);
    };
  }, [isSpeaking]);

  const isFemale = gender?.toLowerCase() === "female";

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 overflow-hidden pointer-events-none">
      {/* Background Soft Aura Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-transparent to-black/80 pointer-events-none" />

      {/* 2D Vector Character Body & Head Rig */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: isSpeaking ? [0, -1, 1, 0] : 0 }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-full max-w-md h-[65vh] relative flex items-center justify-center drop-shadow-2xl"
      >
        <svg viewBox="0 0 300 400" className="w-full h-full">
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isFemale ? "#F43F5E" : "#3B82F6"} />
              <stop offset="100%" stopColor={isFemale ? "#BE185D" : "#1D4ED8"} />
            </linearGradient>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isFemale ? "#7C3AED" : "#1E1B4B"} />
              <stop offset="100%" stopColor={isFemale ? "#4C1D95" : "#0F172A"} />
            </linearGradient>
          </defs>

          {/* 1. Torso / Outfit */}
          <path
            d="M 50 380 C 50 280, 250 280, 250 380 Z"
            fill="url(#bodyGrad)"
          />
          <path
            d="M 120 280 L 150 320 L 180 280 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />

          {/* 2. Neck */}
          <rect x="130" y="225" width="40" height="60" fill="#F59E0B" rx="10" />

          {/* 3. Ears */}
          <circle cx="85" cy="170" r="14" fill="#F59E0B" />
          <circle cx="215" cy="170" r="14" fill="#F59E0B" />

          {/* 4. Head */}
          <rect x="90" y="90" width="120" height="150" rx="60" fill="url(#skinGrad)" />

          {/* 5. Hair Styling */}
          {isFemale ? (
            <path
              d="M 75 140 C 65 40, 235 40, 225 140 C 225 190, 210 210, 200 210 C 190 150, 110 150, 100 210 C 90 210, 75 190, 75 140 Z"
              fill="url(#hairGrad)"
            />
          ) : (
            <path
              d="M 85 120 C 80 50, 220 50, 215 120 C 195 90, 105 90, 85 120 Z"
              fill="url(#hairGrad)"
            />
          )}

          {/* 6. Eyebrows */}
          <path
            d={isSpeaking ? "M 110 135 Q 125 125 140 135" : "M 110 140 Q 125 133 140 140"}
            stroke="#1E1B4B"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={isSpeaking ? "M 160 135 Q 175 125 190 135" : "M 160 140 Q 175 133 190 140"}
            stroke="#1E1B4B"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />

          {/* 7. Eyes (Blinking & Expression) */}
          {blink ? (
            <>
              <line x1="112" y1="155" x2="138" y2="155" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" />
              <line x1="162" y1="155" x2="188" y2="155" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="125" cy="155" r="9" fill="#1E1B4B" />
              <circle cx="175" cy="155" r="9" fill="#1E1B4B" />
              <circle cx="128" cy="152" r="3.5" fill="#FFFFFF" />
              <circle cx="178" cy="152" r="3.5" fill="#FFFFFF" />
            </>
          )}

          {/* 8. Nose */}
          <path d="M 150 160 L 144 175 L 156 175" stroke="#D97706" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* 9. Duolingo-Style 2D Vector Mouth Visemes */}
          {/* Viseme 0: Closed Smile */}
          {visemeState === 0 && (
            <path d="M 125 198 Q 150 215 175 198" stroke="#B91C1C" strokeWidth="4" fill="none" strokeLinecap="round" />
          )}

          {/* Viseme 1: Wide Open 'AA' */}
          {visemeState === 1 && (
            <g>
              <path d="M 122 194 Q 150 230 178 194 Z" fill="#991B1B" stroke="#B91C1C" strokeWidth="3" />
              {/* Teeth */}
              <rect x="134" y="194" width="32" height="6" fill="#FFFFFF" rx="2" />
              {/* Tongue */}
              <path d="M 135 214 Q 150 205 165 214 Z" fill="#F43F5E" />
            </g>
          )}

          {/* Viseme 2: Rounded 'OO' */}
          {visemeState === 2 && (
            <g>
              <ellipse cx="150" cy="202" rx="14" ry="18" fill="#991B1B" stroke="#B91C1C" strokeWidth="3" />
              <ellipse cx="150" cy="196" rx="8" ry="4" fill="#FFFFFF" opacity="0.9" />
            </g>
          )}

          {/* Viseme 3: Wide 'EE' */}
          {visemeState === 3 && (
            <g>
              <path d="M 120 196 Q 150 218 180 196 C 180 206, 120 206, 120 196 Z" fill="#991B1B" stroke="#B91C1C" strokeWidth="3" />
              <rect x="128" y="196" width="44" height="5" fill="#FFFFFF" rx="1.5" />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
