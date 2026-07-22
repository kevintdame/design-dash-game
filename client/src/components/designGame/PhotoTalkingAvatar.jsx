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
      drawCanvas(0);
    };
  }, [src]);

  useEffect(() => {
    let frame = 0;
    function animate() {
      frame++;
      // Calculate realistic dynamic mouth opening amplitude
      const mouthOpen = isSpeaking ? (Math.sin(frame * 0.35) * 0.5 + 0.5) * (0.4 + Math.random() * 0.6) : 0;
      drawCanvas(mouthOpen);
      animRef.current = requestAnimationFrame(animate);
    }

    loop();
    function loop() {
      animate();
    }

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isSpeaking]);

  function drawCanvas(mouthOpen) {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw full base image
    ctx.drawImage(img, 0, 0, w, h);

    if (mouthOpen > 0.05) {
      // Split face at mouth line (approx 58% down height)
      const mouthLineY = h * 0.58;
      const jawShift = mouthOpen * 16; // Vertical jaw displacement

      // Draw dark inner mouth cavity gap
      ctx.fillStyle = "#110505";
      ctx.beginPath();
      ctx.ellipse(w * 0.5, mouthLineY + jawShift * 0.5, w * 0.16, jawShift * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw lower face (mouth & chin) shifted down dynamically
      const sourceY = img.height * 0.58;
      const sourceHeight = img.height * 0.42;
      ctx.drawImage(
        img,
        0,
        sourceY,
        img.width,
        sourceHeight,
        0,
        mouthLineY + jawShift,
        w,
        h - mouthLineY
      );
    }
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        width={600}
        height={800}
        className="w-full h-full object-cover opacity-95 filter contrast-105"
      />
    </div>
  );
}
