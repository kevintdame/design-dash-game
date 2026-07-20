// Palette definitions (hex) + runtime CSS-variable applier.
// applyPalette injects HSL values onto :root so the whole app re-themes instantly.

export const PALETTES = [
  { name: "Swiss Minimal (original)", bg: "#2B303A", card: "#FFFFFF", primary: "#00D4FF", support: "#00D4FF", text: "#2B303A" },
  { name: "Sunny Citrus", bg: "#FFF8E7", card: "#FFFFFF", primary: "#FF8A00", support: "#FF3D6E", text: "#2D1B00" },
  { name: "Bubblegum Pop", bg: "#FFE8F1", card: "#FFFFFF", primary: "#FF4D9D", support: "#7A5CFF", text: "#3A0E2A" },
  { name: "Tropical Punch", bg: "#00C9A7", card: "#FFFFFF", primary: "#FF5E5B", support: "#FFD23F", text: "#06302B" },
  { name: "Blue Skies & Lemonade", bg: "#4DA8FF", card: "#FFFFFF", primary: "#FFD23F", support: "#FF6B6B", text: "#0A2540" },
  { name: "Mint Mojito", bg: "#E8F8F1", card: "#FFFFFF", primary: "#00B894", support: "#FDCB6E", text: "#14342B" },
  { name: "Grape Soda", bg: "#2D1B69", card: "#FFFFFF", primary: "#A855F7", support: "#FF5E9C", text: "#FFFFFF" },
  { name: "Tangerine Dream", bg: "#FFF3E0", card: "#FFFFFF", primary: "#FF6B00", support: "#00BFA6", text: "#3A1A00" },
  { name: "Coral Reef", bg: "#00ACC1", card: "#FFFFFF", primary: "#FF6E6E", support: "#FFCA28", text: "#06303A" },
  { name: "Playful Primary", bg: "#FFD23F", card: "#FFFFFF", primary: "#E63946", support: "#1D3557", text: "#1D3557" },
  { name: "Sunset Sorbet", bg: "#FF6B6B", card: "#FFFFFF", primary: "#FFB347", support: "#9B5DE5", text: "#FFFFFF" },
  { name: "Watermelon", bg: "#FFD9E4", card: "#FFFBF5", primary: "#3E8E5E", support: "#FF4D7E", text: "#3A1F2A" }
];

function toHsl(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hh = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hh = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hh = (b - r) / d + 2; break;
      case b: hh = (r - g) / d + 4; break;
    }
    hh /= 6;
  }
  return { h: Math.round(hh * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
const fmt = (c) => `${c.h} ${c.s}% ${c.l}%`;
const shade = (c, dl) => ({ ...c, l: Math.max(0, Math.min(100, c.l + dl)) });

export function applyPalette(p) {
  const root = document.documentElement;
  const set = (k, v) => root.style.setProperty(k, v);
  const bg = toHsl(p.bg);
  const primary = toHsl(p.primary);
  const accent = toHsl(p.support);
  const text = toHsl(p.text);
  const lightBg = bg.l > 55;
  const lightPrimary = primary.l > 60;

  const fg = lightBg ? fmt(text) : "0 0% 100%";
  const primaryFg = lightPrimary ? fmt(text) : "0 0% 100%";
  const secondary = lightBg ? shade(bg, -8) : shade(bg, 6);
  const border = lightBg ? shade(bg, -14) : shade(bg, 8);

  // Cards are light, so card text uses dark ink for crisp readability —
  // even when the background is dark and `text` is light (e.g. Grape Soda).
  const cardHsl = toHsl(p.card);
  const lightCard = cardHsl.l > 55;
  const cardFg = lightCard ? (text.l <= 55 ? fmt(text) : fmt(shade(bg, -28))) : "0 0% 100%";
  const cardMuted = lightCard ? (text.l <= 55 ? fmt(shade(text, 22)) : fmt(shade(bg, 14))) : "0 0% 80%";

  set("--background", fmt(bg));
  set("--foreground", fg);
  set("--card", fmt(cardHsl));
  set("--card-foreground", cardFg);
  set("--popover", fmt(cardHsl));
  set("--popover-foreground", cardFg);
  set("--primary", fmt(primary));
  set("--primary-foreground", primaryFg);
  set("--secondary", fmt(secondary));
  set("--secondary-foreground", fg);
  set("--muted", fmt(secondary));
  set("--muted-foreground", cardMuted);
  set("--accent", fmt(accent));
  set("--accent-foreground", cardFg);
  set("--border", fmt(border));
  set("--input", fmt(border));
  set("--ring", fmt(primary));
  set("--chart-1", fmt(primary));
  set("--chart-2", fmt(accent));
  set("--chart-3", fmt(shade(primary, -15)));
  set("--chart-4", fmt(shade(accent, -15)));
  set("--chart-5", fmt(shade(bg, 20)));
  set("--sidebar-background", fmt(bg));
  set("--sidebar-foreground", fg);
  set("--sidebar-primary", fmt(primary));
  set("--sidebar-primary-foreground", primaryFg);
  set("--sidebar-accent", fmt(secondary));
  set("--sidebar-accent-foreground", fg);
  set("--sidebar-border", fmt(border));
  set("--sidebar-ring", fmt(primary));
}

export function resetPalette() {
  document.documentElement.style.cssText = "";
}