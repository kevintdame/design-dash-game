import React from "react";

// Simple string hash helper to select style indices deterministically
function hashCode(str) {
  let hash = 0;
  if (!str) return hash;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export default function CustomerAvatar({ name, className = "h-16 w-16" }) {
  const hash = hashCode(name || "Alex");

  // Palette matching the reference illustration
  const bgColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f43f5e", "#f59e0b"];
  const skinTones = ["#ffc5a1", "#ffd8b3", "#d98b6c", "#ab684f", "#e69c73"];
  const hairColors = ["#1e293b", "#475569", "#7c2d12", "#b45309", "#8b5cf6", "#3f3f46"];
  const shirtColors = ["#2563eb", "#d946ef", "#eab308", "#10b981", "#f43f5e", "#8b5cf6"];

  const bgColor = bgColors[hash % bgColors.length];
  const skinTone = skinTones[(hash >> 1) % skinTones.length];
  const hairColor = hairColors[(hash >> 2) % hairColors.length];
  const shirtColor = shirtColors[(hash >> 3) % shirtColors.length];

  const hairStyle = hash % 5; // 0: short hair, 1: curly top, 2: long hair, 3: round cut, 4: beard / bald
  const hasBeard = (hash >> 4) % 2 === 0;
  const hasGlasses = (hash >> 5) % 3 === 0;

  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-inner flex items-center justify-center shrink-0 border border-white/10 ${className}`} style={{ backgroundColor: bgColor }}>
      <svg viewBox="0 0 100 100" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
        {/* Background Decorative Circle / Lamp glow effect */}
        <circle cx="20" cy="20" r="15" fill="white" fillOpacity="0.1" />

        {/* Neck */}
        <path d="M43 65 L43 75 L57 75 L57 65 Z" fill={skinTone} opacity="0.9" />

        {/* Body / Shoulders */}
        <path d="M25 80 C 25 72, 35 70, 50 70 C 65 70, 75 72, 75 80 L 75 100 L 25 100 Z" fill={shirtColor} />
        {/* Shirt collar notch */}
        <path d="M45 70 L50 77 L55 70 Z" fill={skinTone} />

        {/* Head */}
        <ellipse cx="50" cy="50" rx="16" ry="18" fill={skinTone} />

        {/* Eyes (Curved cozy closed eyes from reference) */}
        <path d="M40 50 Q 43 53 46 50" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M54 50 Q 57 53 60 50" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Eyebrows */}
        <path d="M38 45 Q 42 43 47 46" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M53 46 Q 58 43 62 45" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Nose (Cute flat vector rounded nose) */}
        <path d="M48 52 C48 55 52 55 52 52" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Mouth (Happy content curve) */}
        <path d="M46 59 Q 50 62 54 59" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Beard (if selected, matching reference style) */}
        {hasBeard && (
          <path d="M34 50 C34 64, 40 68, 50 68 C60 68, 66 64, 66 50 C66 53, 62 55, 60 56 C57 58, 55 60, 50 60 C45 60, 43 58, 40 56 C38 55, 34 53, 34 50 Z" fill={hairColor} />
        )}

        {/* Hair Styles */}
        {hairStyle === 0 && (
          // Short classic cut
          <path d="M34 44 C 34 30, 66 30, 66 44 C 66 40, 60 38, 50 38 C 40 38, 34 40, 34 44 Z" fill={hairColor} />
        )}
        {hairStyle === 1 && (
          // Curly volume top
          <path d="M33 42 C 30 33, 40 28, 50 30 C 60 28, 70 33, 67 42 C 65 38, 58 36, 50 37 C 42 36, 35 38, 33 42 Z" fill={hairColor} />
        )}
        {hairStyle === 2 && (
          // Long side swept hair
          <path d="M32 46 C32 30, 55 25, 68 38 C70 45, 68 55, 64 53 C64 45, 60 40, 50 40 C40 40, 33 43, 32 46 Z" fill={hairColor} />
        )}
        {hairStyle === 3 && (
          // Round bob / bowl cut
          <path d="M31 46 C31 28, 69 28, 69 46 C69 43, 65 42, 60 42 C50 42, 45 44, 40 42 C35 42, 31 43, 31 46 Z" fill={hairColor} fillRule="evenodd" />
        )}
        {hairStyle === 4 && !hasBeard && (
          // Spiky hair
          <path d="M34 44 L 38 36 L 43 40 L 50 34 L 57 40 L 62 36 L 66 44 Z" fill={hairColor} />
        )}

        {/* Glasses (if selected) */}
        {hasGlasses && (
          <g stroke="#1e293b" strokeWidth="2.5" fill="none">
            {/* Left frame */}
            <circle cx="43" cy="49" r="6" />
            {/* Right frame */}
            <circle cx="57" cy="49" r="6" />
            {/* Bridge */}
            <path d="M49 49 L51 49" />
            {/* Side bars */}
            <path d="M37 49 L34 49" />
            <path d="M63 49 L66 49" />
          </g>
        )}
      </svg>
    </div>
  );
}
