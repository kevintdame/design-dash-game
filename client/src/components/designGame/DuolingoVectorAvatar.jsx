import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function DuolingoVectorAvatar({ customerName, isSpeaking, gender = "female" }) {
  const [blink, setBlink] = useState(false);
  const [visemeState, setVisemeState] = useState(0); // 0: smile, 1: AA, 2: OO, 3: EE

  // Random eye blinking
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3400 + Math.random() * 2000);
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
      setVisemeState(states[Math.floor(Math.random() * states.length)]);
    }, 115);

    return () => {
      clearInterval(interval);
      setVisemeState(0);
    };
  }, [isSpeaking]);

  const isFemale = gender?.toLowerCase() === "female";

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden pointer-events-none">
      {/* Studio Ambient Neon Glow */}
      <div className="absolute w-96 h-96 rounded-full bg-accent/20 filter blur-3xl animate-pulse pointer-events-none" />

      {/* 3D-Styled Vector Character Rig */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: isSpeaking ? [-1, 1, -1] : 0 }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-full max-w-lg h-[70vh] relative flex items-center justify-center filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.65)]"
      >
        <svg viewBox="0 0 400 500" className="w-full h-full">
          <defs>
            {/* Rich 3D Skin Gradient */}
            <radialGradient id="skin3D" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>

            {/* Female Hair Gradient */}
            <linearGradient id="hairFemale3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#4C1D95" />
            </linearGradient>

            {/* Male Hair Gradient */}
            <linearGradient id="hairMale3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="60%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* Outfit Jacket Gradient */}
            <linearGradient id="jacket3D" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isFemale ? "#10B981" : "#8B5CF6"} />
              <stop offset="100%" stopColor={isFemale ? "#047857" : "#5B21B6"} />
            </linearGradient>

            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* 1. Torso / 3D Outfit */}
          <path
            d="M 60 490 C 60 360, 340 360, 340 490 Z"
            fill="url(#jacket3D)"
            filter="url(#softShadow)"
          />
          {/* Inner Shirt Collar */}
          <path d="M 160 370 L 200 420 L 240 370 Z" fill="#FFFFFF" opacity="0.9" />

          {/* 2. Neck */}
          <rect x="170" y="290" width="60" height="90" fill="url(#skin3D)" rx="15" />
          {/* Neck Shadow */}
          <path d="M 170 340 L 230 340 L 200 370 Z" fill="#B45309" opacity="0.4" />

          {/* 3. Ears */}
          <circle cx="115" cy="220" r="18" fill="url(#skin3D)" />
          <circle cx="285" cy="220" r="18" fill="url(#skin3D)" />
          <circle cx="117" cy="220" r="9" fill="#D97706" opacity="0.3" />
          <circle cx="283" cy="220" r="9" fill="#D97706" opacity="0.3" />

          {/* 4. Head / Face */}
          <rect x="120" y="110" width="160" height="200" rx="80" fill="url(#skin3D)" filter="url(#softShadow)" />

          {/* 5. 3D Hair Styling */}
          {isFemale ? (
            <g filter="url(#softShadow)">
              <path
                d="M 100 180 C 80 50, 320 50, 300 180 C 310 260, 290 320, 280 320 C 265 240, 135 240, 120 320 C 110 320, 90 260, 100 180 Z"
                fill="url(#hairFemale3D)"
              />
              <path
                d="M 120 120 Q 200 60 280 120 C 260 90 140 90 120 120 Z"
                fill="#F472B6"
                opacity="0.6"
              />
            </g>
          ) : (
            <g filter="url(#softShadow)">
              <path
                d="M 110 150 C 100 60, 300 60, 290 150 C 265 110, 135 110, 110 150 Z"
                fill="url(#hairMale3D)"
              />
              <path
                d="M 140 100 Q 200 70 260 100 Q 200 85 140 100 Z"
                fill="#60A5FA"
                opacity="0.6"
              />
            </g>
          )}

          {/* 6. Eyebrows */}
          <path
            d={isSpeaking ? "M 145 175 Q 170 160 190 175" : "M 145 180 Q 170 170 190 180"}
            stroke="#1E1B4B"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={isSpeaking ? "M 210 175 Q 230 160 255 175" : "M 210 180 Q 230 170 255 180"}
            stroke="#1E1B4B"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />

          {/* 7. Eyes */}
          {blink ? (
            <>
              <line x1="148" y1="200" x2="182" y2="200" stroke="#1E1B4B" strokeWidth="6" strokeLinecap="round" />
              <line x1="218" y1="200" x2="252" y2="200" stroke="#1E1B4B" strokeWidth="6" strokeLinecap="round" />
            </>
          ) : (
            <g>
              <ellipse cx="165" cy="200" rx="16" ry="18" fill="#FFFFFF" />
              <ellipse cx="235" cy="200" rx="16" ry="18" fill="#FFFFFF" />
              <circle cx="165" cy="200" r="10" fill="#1E3A8A" />
              <circle cx="235" cy="200" r="10" fill="#1E3A8A" />
              <circle cx="165" cy="200" r="5" fill="#0F172A" />
              <circle cx="235" cy="200" r="5" fill="#0F172A" />
              <circle cx="162" cy="196" r="3.5" fill="#FFFFFF" />
              <circle cx="232" cy="196" r="3.5" fill="#FFFFFF" />
            </g>
          )}

          {/* 8. Nose */}
          <path d="M 200 205 L 193 226 L 207 226" stroke="#D97706" strokeWidth="4" fill="none" strokeLinecap="round" />

          {/* 9. 3D Rendered Mouth Visemes */}
          {visemeState === 0 && (
            <path d="M 165 255 Q 200 275 235 255" stroke="#991B1B" strokeWidth="5" fill="none" strokeLinecap="round" />
          )}

          {visemeState === 1 && (
            <g>
              <path d="M 160 250 Q 200 295 240 250 Z" fill="#7F1D1D" stroke="#991B1B" strokeWidth="3" />
              <rect x="175" y="250" width="50" height="9" fill="#FFFFFF" rx="3" />
              <path d="M 178 276 Q 200 264 222 276 Z" fill="#F43F5E" />
            </g>
          )}

          {visemeState === 2 && (
            <g>
              <ellipse cx="200" cy="260" rx="18" ry="22" fill="#7F1D1D" stroke="#991B1B" strokeWidth="3" />
              <ellipse cx="200" cy="252" rx="11" ry="5" fill="#FFFFFF" opacity="0.9" />
            </g>
          )}

          {visemeState === 3 && (
            <g>
              <path d="M 155 252 Q 200 280 245 252 C 245 264, 155 264, 155 252 Z" fill="#7F1D1D" stroke="#991B1B" strokeWidth="3" />
              <rect x="165" y="252" width="70" height="7" fill="#FFFFFF" rx="2" />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
