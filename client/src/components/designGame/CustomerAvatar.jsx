import React from "react";

export default function CustomerAvatar({ name, image, className }) {
  // If the server-provided image is one of the official base44 vector images, use it directly
  const isBase44Image = image && (image.startsWith("https://media.base44.com") || image.includes("generated_image.png"));
  
  if (isBase44Image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${className} object-cover`}
      />
    );
  }

  // Otherwise, construct a custom flat vector avatar with the exact cyan geometric accents & charcoal background
  const seed = name || "Customer";
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`;

  return (
    <div className={`relative bg-[#20262e] overflow-hidden flex items-center justify-center border border-slate-800 ${className}`}>
      {/* Background Abstract Cyan Geometric Accent Lines matching the game's style */}
      <svg className="absolute inset-0 w-full h-full opacity-70 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Left cyan angle shape */}
        <polyline
          points="15,45 40,55 20,80"
          fill="none"
          stroke="#00d4ff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right cyan line with circle */}
        <line
          x1="85"
          y1="30"
          x2="65"
          y2="60"
          stroke="#00d4ff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="65"
          cy="60"
          r="6.5"
          fill="#00d4ff"
        />
      </svg>

      {/* Avatar character in front */}
      <img
        src={avatarUrl}
        alt={name}
        className="relative z-10 w-[80%] h-[80%] object-contain mt-5"
      />
    </div>
  );
}
