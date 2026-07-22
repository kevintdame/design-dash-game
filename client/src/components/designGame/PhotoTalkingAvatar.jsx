import { useEffect, useRef } from "react";

export default function PhotoTalkingAvatar({ src, isSpeaking, altName }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      imgRef.current = img;
    };
  }, [src]);

  useEffect(() => {
    let frame = 0;

    function animate() {
      frame++;
      const img = imgRef.current;
      const canvas = canvasRef.current;
      if (!canvas || !img) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Natural Breathing & Body Posture Motion (Subtle 0.5Hz Float + Head Tilt)
      const bodyFloatY = Math.sin(frame * 0.04) * 6;
      const bodyTilt = Math.sin(frame * 0.02) * 0.012; // Subtle head tilt in radians

      // 2. Eye Blinking Logic (Blinks naturally every ~3.5 seconds)
      const blinkCycle = frame % 200;
      const isBlinking = blinkCycle > 188 && blinkCycle <= 196;

      // 3. Speech Jaw & Mouth Motion
      const mouthOpen = isSpeaking ? (Math.sin(frame * 0.35) * 0.5 + 0.5) * (0.45 + Math.random() * 0.55) : 0;

      ctx.save();
      
      // Apply posture tilt & floating movement centered on canvas
      ctx.translate(w / 2, h / 2 + bodyFloatY);
      ctx.rotate(bodyTilt);
      ctx.translate(-w / 2, -h / 2);

      // 4. Zoom Framing: Scale to show FULL head, shoulders, and torso (Not cropped tight)
      const scale = Math.min((w * 0.90) / img.width, (h * 0.90) / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = (w - drawW) / 2;
      const drawY = (h - drawH) / 2 + 15;

      // Draw full customer portrait (head & torso)
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // 5. Dynamic Eye Blinking Overlay
      if (isBlinking) {
        const eyeY = drawY + drawH * 0.36;
        const eyeH = drawH * 0.06;
        ctx.fillStyle = "rgba(35, 20, 15, 0.45)";
        ctx.fillRect(drawX + drawW * 0.22, eyeY, drawW * 0.56, eyeH);
      }

      // 6. Real-Time Talking Mouth & Jaw Animation
      if (mouthOpen > 0.05) {
        const mouthLineY = drawY + drawH * 0.58;
        const jawShift = mouthOpen * 14;

        // Dark inner mouth cavity
        ctx.fillStyle = "#140505";
        ctx.beginPath();
        ctx.ellipse(drawX + drawW * 0.5, mouthLineY + jawShift * 0.4, drawW * 0.14, jawShift * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shift lower jaw/chin section down dynamically
        const sourceY = img.height * 0.58;
        const sourceH = img.height * 0.42;
        ctx.drawImage(
          img,
          0,
          sourceY,
          img.width,
          sourceH,
          drawX,
          mouthLineY + jawShift,
          drawW,
          drawH * 0.42
        );
      }

      ctx.restore();

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isSpeaking]);

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center p-4 sm:p-8 pointer-events-none">
      <canvas
        ref={canvasRef}
        width={800}
        height={1000}
        className="w-full h-full max-w-xl max-h-[85vh] object-contain drop-shadow-2xl filter contrast-105"
      />
    </div>
  );
}
