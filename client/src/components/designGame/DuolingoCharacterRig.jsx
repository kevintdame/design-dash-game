import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function DuolingoCharacterRig({ isSpeaking }) {
  const [blink, setBlink] = useState(false);
  const [visemeState, setVisemeState] = useState(0); // 0: smirk, 1: AA, 2: OO, 3: EE

  // Eyelid blink cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3400 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Real-time mouth viseme morphing during speech
  useEffect(() => {
    if (!isSpeaking) {
      setVisemeState(0);
      return;
    }

    const interval = setInterval(() => {
      const visemes = [1, 2, 3, 1, 0, 2];
      setVisemeState(visemes[Math.floor(Math.random() * visemes.length)]);
    }, 110);

    return () => {
      clearInterval(interval);
      setVisemeState(0);
    };
  }, [isSpeaking]);

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#3F1B68] via-[#2A1149] to-[#160728] overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: isSpeaking ? [-1, 1.5, -1] : [0, 0.5, 0]
        }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        className="w-full max-w-md h-[72vh] relative flex items-center justify-center filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
      >
        <svg viewBox="0 0 400 500" className="w-full h-full">
          {/* 1. Turtleneck & Shoulders */}
          <path
            d="M 90 500 C 90 410, 310 410, 310 500 Z"
            fill="#3A1663"
          />
          <rect x="180" y="320" width="40" height="110" fill="#3A1663" />

          {/* 2. Head Block (Rounded Rectangle) */}
          <rect x="130" y="160" width="160" height="180" rx="40" fill="#F8B1A0" />

          {/* 3. Hair (Dome + Geometric 90-Degree Side Bang) */}
          {/* Back Hair Dome */}
          <path
            d="M 100 230 C 90 70, 310 70, 300 230 L 300 370 L 250 370 L 250 320 Q 200 320 150 320 L 150 370 L 100 370 Z"
            fill="#7D40E7"
          />
          {/* Front Geometric 90° Sweep Bang */}
          <path
            d="M 100 230 C 90 70, 250 70, 250 200 L 210 200 L 210 260 L 170 260 L 170 330 L 100 330 Z"
            fill="#7D40E7"
          />

          {/* 4. Eyes (Circular white eye sockets with deadpan lids) */}
          <g>
            {/* Left Eye */}
            <circle cx="175" cy="245" r="22" fill="#FFFFFF" />
            <circle cx="178" cy="247" r="9" fill="#1E1B4B" />

            {/* Right Eye */}
            <circle cx="235" cy="245" r="22" fill="#FFFFFF" />
            <circle cx="238" cy="247" r="9" fill="#1E1B4B" />

            {/* Deadpan Eyelids / Blinking */}
            {blink ? (
              <>
                <rect x="150" y="220" width="50" height="30" fill="#7D40E7" rx="10" />
                <rect x="210" y="220" width="50" height="30" fill="#7D40E7" rx="10" />
                <line x1="155" y1="248" x2="195" y2="248" stroke="#3A1663" strokeWidth="4" />
                <line x1="215" y1="248" x2="255" y2="248" stroke="#3A1663" strokeWidth="4" />
              </>
            ) : (
              <>
                {/* Top 40% Eyelids */}
                <path d="M 150 220 Q 175 238 200 220 L 200 240 L 150 240 Z" fill="#7D40E7" />
                <path d="M 210 220 Q 235 238 260 220 L 260 240 L 210 240 Z" fill="#7D40E7" />
                <path d="M 150 240 Q 175 248 200 240" stroke="#5B21B6" strokeWidth="3" fill="none" />
                <path d="M 210 240 Q 235 248 260 240" stroke="#5B21B6" strokeWidth="3" fill="none" />
              </>
            )}
          </g>

          {/* 5. Rose Pink Teardrop Nose */}
          <path
            d="M 200 248 C 190 262, 192 280, 200 282 C 208 280, 210 262, 200 248 Z"
            fill="#E26868"
          />

          {/* 6. Asymmetrical Dynamic SVG Mouth Visemes */}
          {/* Viseme 0: Asymmetrical Smirk with Teeth */}
          {visemeState === 0 && (
            <g>
              <path
                d="M 175 295 Q 210 320 245 290 Q 210 300 175 295 Z"
                fill="#5E0011"
                stroke="#D97706"
                strokeWidth="1.5"
              />
              <path d="M 180 295 Q 210 305 240 292 L 238 297 Q 210 309 182 299 Z" fill="#FFFFFF" />
            </g>
          )}

          {/* Viseme 1: Wide Open 'AA' */}
          {visemeState === 1 && (
            <g>
              <path
                d="M 170 292 Q 210 335 250 292 Z"
                fill="#5E0011"
              />
              <rect x="182" y="292" width="56" height="8" fill="#FFFFFF" rx="2" />
              <path d="M 188 320 Q 210 310 232 320 Z" fill="#E26868" />
            </g>
          )}

          {/* Viseme 2: Rounded 'OO' */}
          {visemeState === 2 && (
            <g>
              <ellipse cx="210" cy="302" rx="18" ry="22" fill="#5E0011" />
              <ellipse cx="210" cy="293" rx="11" ry="5" fill="#FFFFFF" opacity="0.9" />
            </g>
          )}

          {/* Viseme 3: Wide 'EE' */}
          {visemeState === 3 && (
            <g>
              <path
                d="M 165 290 Q 210 322 255 290 Z"
                fill="#5E0011"
              />
              <rect x="175" y="290" width="70" height="7" fill="#FFFFFF" rx="2" />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
