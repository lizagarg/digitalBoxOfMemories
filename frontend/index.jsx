import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Mic, Square, Upload, Plus, Trash2, Check, Copy, ArrowLeft } from "lucide-react";
import cardboardImg from "./cardboard.png";
import axios from "axios";
import { Routes, Route, useParams } from "react-router-dom";


/* ---------------------------------------------------------------
   TOKENS
--------------------------------------------------------------- */
const CREAM  = "#F3E8D6";
const CREAM2 = "#EADDC3";
const CARD   = "#FBF6EC";
const RED    = "#B5624C";
const RED_D  = "#96503F";
const SAGE   = "#8C9B7A";
const SAGE_D = "#6E7C5C";
const BEIGE  = "#E4D3AE";
const INK    = "#3A322A";
const INKLT  = "#6B5F51";
/* new soft accent palette for the cuter object badges */
const BLUSH   = "#E3B7A0";
const MUSTARD = "#D6A24A";
const DUSTY   = "#93A8B5";
const MINT    = "#A9C2AC";

const heading = { fontFamily: "'Fredoka','Fraunces',serif" };
const bodyF   = { fontFamily: "'Quicksand','Inter',sans-serif" };
const mono    = { fontFamily: "'IBM Plex Mono',monospace" };
const hand    = { fontFamily: "'Quicksand','Inter',sans-serif" };

const CARDBOARD = "#c9a97d";
const CARDBOARD2 = "#d8b17f";
const CARDBOARD3 = "#b08b5d";
const CARDBOARD4 = "#a88560";
const CARDBOARD_SHADOW = "rgba(42, 28, 12, 0.12)";

let uidCounter = 0;
const uid = () => `it_${Date.now()}_${uidCounter++}`;

/* ---------------------------------------------------------------
   GLOBAL STYLE
--------------------------------------------------------------- */
function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@500;600;700&family=Cormorant+Garamond:wght@500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
      * { box-sizing: border-box; }
      @keyframes dustDrift { 0% { transform: translateY(0) translateX(0); opacity:0; } 12% { opacity:.7; } 100% { transform: translateY(-85vh) translateX(24px); opacity:0; } }
      @keyframes popIn { 0% { transform: scale(.6) rotate(-6deg); opacity:0;} 100% { transform: scale(1) rotate(0deg); opacity:1;} }
      @keyframes modalIn { 0% { opacity:0; transform: translateY(16px) scale(.98);} 100% { opacity:1; transform: translateY(0) scale(1);} }
      @keyframes backdropIn { 0% { opacity:0;} 100% { opacity:1;} }
      @keyframes ribbonV { 0% { transform: scaleY(0);} 100% { transform: scaleY(1);} }
      @keyframes ribbonH { 0% { transform: scaleX(0);} 100% { transform: scaleX(1);} }
      @keyframes unfold { 0% { clip-path: inset(0 46% 0 46%);} 100% { clip-path: inset(0 0% 0 0%);} }
      @keyframes fadeUp { 0% { opacity:0; transform: translateY(10px);} 100% { opacity:1; transform: translateY(0);} }
      @keyframes pulseDot { 0%,100% { opacity:.4;} 50% { opacity:1;} }
      @keyframes wiggle { 0%,100% { transform: rotate(0deg);} 50% { transform: rotate(-4deg);} }
      @keyframes floatSlow { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-4px);} }
      @keyframes boxShake {
        0%, 100% { transform: rotate(0deg) translateX(0); }
        10% { transform: rotate(-3deg) translateX(-3px); }
        20% { transform: rotate(3deg) translateX(3px); }
        30% { transform: rotate(-4deg) translateX(-4px); }
        40% { transform: rotate(4deg) translateX(4px); }
        50% { transform: rotate(-5deg) translateX(-5px); }
        60% { transform: rotate(5deg) translateX(5px); }
        70% { transform: rotate(-3deg) translateX(-3px); }
        80% { transform: rotate(3deg) translateX(3px); }
        90% { transform: rotate(-2deg) translateX(-2px); }
      }
      @keyframes lidPop {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(-140px) rotate(-18deg); opacity: 0; }
      }
      @keyframes boxSquash {
        0% { transform: scale(1); }
        50% { transform: scale(1.06, 0.9); }
        100% { transform: scale(1); }
      }
      @keyframes itemPop {
        0% { transform: scale(0) rotate(-14deg) translateY(20px); opacity: 0; }
        70% { transform: scale(1.08) rotate(3deg) translateY(-4px); opacity: 1; }
        100% { transform: scale(1) rotate(var(--tilt, 0deg)) translateY(0); opacity: 1; }
      }
    `}</style>
  );
}

/* ---------------------------------------------------------------
   TEXTURES + DECOR
--------------------------------------------------------------- */
const grainCss = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
  mixBlendMode: "multiply",
};
function Grain({ opacity = 0.2 }) {
  return <div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ ...grainCss, opacity }} />;
}
function Dust({ count = 12 }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{
          position: "absolute", left: `${(i * 53) % 100}%`, bottom: -10,
          width: 2 + (i % 3), height: 2 + (i % 3), borderRadius: "50%",
          background: "rgba(107,95,81,0.22)",
          animation: `dustDrift ${10 + (i % 6) * 2}s linear ${(i % 5) * 1.5}s infinite`,
        }} />
      ))}
    </div>
  );
}
function WashiTape({ style, tint = SAGE }) {
  return <div className="absolute" style={{ width: 80, height: 24, background: `repeating-linear-gradient(45deg, ${tint}55, ${tint}55 6px, ${tint}33 6px, ${tint}33 12px)`, boxShadow: "0 2px 5px rgba(58,50,42,0.12)", ...style }} />;
}
function Stamp({ children, style, tone = RED }) {
  return (
    <div
      className="inline-block rounded-md border-[1.6px] px-4 py-1.5"
      style={{ ...hand, fontSize: 20, color: tone, borderColor: tone, borderStyle: "dashed", transform: "rotate(-2deg)", ...style }}
    >
      {children}
    </div>
  );
}
function Barcode({ seed = "8842019394", width = 170 }) {
  const bars = []; let s = 0;
  for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
  for (let i = 0; i < 36; i++) bars.push(((s * (i + 3)) % 3) + 1);
  let x = 0;
  return (
    <svg width={width} height={34} viewBox={`0 0 ${width} 34`}>
      {bars.map((w, i) => {
        const bw = w * 1.4;
        const el = i % 2 === 0 ? <rect key={i} x={x} y={0} width={bw} height={26} fill={INK} /> : null;
        x += bw + 1.2;
        return el;
      })}
    </svg>
  );
}

/* ---------------------------------------------------------------
   ILLUSTRATED OBJECT ICONS — cute little "flatlay" objects,
   each grounded with a soft shadow like it's resting on a table.
--------------------------------------------------------------- */
function ObjectArt({ id, size = 40 }) {
  const box = { width: size, height: size };
  switch (id) {
    case "letter":
      return (
        <svg viewBox="0 0 64 64" style={box}>
          <ellipse cx="32" cy="55" rx="19" ry="3" fill={INK} opacity="0.09" />
          <g transform="rotate(-3 32 32)">
            <rect x="8" y="14" width="48" height="34" rx="4" fill={CARD} stroke={INKLT} strokeWidth="1.4" />
            <path d="M8 16 L32 34 L56 16" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M27 42 q5 -6 10 0" fill="none" stroke={BEIGE} strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="45" cy="41" r="7.5" fill={RED} />
            <path d="M45 38.2c-1.1-1.6-3.8-1.3-3.8 1.1 0 2 3.8 4 3.8 4s3.8-2 3.8-4c0-2.4-2.7-2.7-3.8-1.1z" fill={CARD} />
          </g>
        </svg>
      );
    case "photos":
      return (
        <svg viewBox="0 0 64 64" style={box}>
          <ellipse cx="32" cy="55" rx="19" ry="3" fill={INK} opacity="0.09" />
          <g transform="rotate(9 30 30)"><rect x="17" y="9" width="25" height="31" rx="2" fill={CARD} stroke={INKLT} strokeWidth="1.1" /><rect x="20" y="12" width="19" height="17" fill={MUSTARD} opacity="0.55" /></g>
          <g transform="rotate(-7 30 30)"><rect x="13" y="11" width="25" height="31" rx="2" fill={CARD} stroke={INKLT} strokeWidth="1.3" /><rect x="16" y="14" width="19" height="17" fill={BLUSH} /></g>
          <g transform="rotate(3 32 32)"><rect x="19" y="13" width="25" height="31" rx="2" fill={CARD} stroke={INKLT} strokeWidth="1.6" /><rect x="22" y="16" width="19" height="17" fill={SAGE} opacity="0.6" /></g>
        </svg>
      );
    case "video":
      return (
        <svg viewBox="0 0 64 64" style={box}>
          <ellipse cx="32" cy="55" rx="19" ry="3" fill={INK} opacity="0.09" />
          <rect x="9" y="19" width="8" height="6" rx="1.5" fill={RED} />
          <rect x="11" y="24" width="27" height="21" rx="4" fill={MINT} stroke={INKLT} strokeWidth="1.4" />
          <path d="M38 29 L54 21 V44 L38 36 Z" fill={INK} stroke={INKLT} strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="24" cy="35" r="6.5" fill={CARD} stroke={INKLT} strokeWidth="1.6" />
          <circle cx="24" cy="35" r="2.3" fill={RED} />
        </svg>
      );
    case "song":
      return (
        <svg viewBox="0 0 64 64" style={box}>
          <ellipse cx="32" cy="55" rx="17" ry="3" fill={INK} opacity="0.09" />
          <circle cx="32" cy="32" r="22" fill={INK} />
          <circle cx="32" cy="32" r="22" fill="none" stroke={CREAM} strokeWidth="0.7" opacity="0.18" />
          <circle cx="32" cy="32" r="16.5" fill="none" stroke={CREAM} strokeWidth="0.6" opacity="0.22" />
          <circle cx="32" cy="32" r="11" fill={MUSTARD} />
          <circle cx="32" cy="32" r="3" fill={CREAM} />
          <path d="M43 19c5 3.5 6.5 9 4 14.5" stroke={CREAM} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.45" />
        </svg>
      );
    case "voice":
      return (
        <svg viewBox="0 0 64 64" style={box}>
          <ellipse cx="32" cy="55" rx="19" ry="3" fill={INK} opacity="0.09" />
          <rect x="9" y="17" width="46" height="29" rx="7" fill={DUSTY} stroke={INKLT} strokeWidth="1.4" />
          <rect x="14" y="22" width="19" height="8" rx="2" fill={CREAM} />
          <circle cx="19" cy="38" r="3.2" fill={RED} />
          <circle cx="29" cy="38" r="3.2" fill={CARD} stroke={INKLT} strokeWidth="1" />
          <circle cx="39" cy="38" r="3.2" fill={CARD} stroke={INKLT} strokeWidth="1" />
          <circle cx="47" cy="24" r="2.1" fill={RED} />
        </svg>
      );
    case "place":
      return (
        <svg viewBox="0 0 64 64" style={box}>
          <ellipse cx="32" cy="55" rx="19" ry="3" fill={INK} opacity="0.09" />
          <path d="M9 15 L24 11 L40 15 L55 11 V47 L40 51 L24 47 L9 51 Z" fill={CREAM2} stroke={INKLT} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M24 11 V47 M40 15 V51" stroke={INKLT} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.45" />
          <path d="M16 27 Q28 21 40 33" stroke={SAGE_D} strokeWidth="1.5" fill="none" strokeDasharray="1 3.4" strokeLinecap="round" />
          <path d="M42 21a6.5 6.5 0 00-6.5 6.5c0 5 6.5 13 6.5 13s6.5-8 6.5-13A6.5 6.5 0 0042 21z" fill={RED} />
          <circle cx="42" cy="27.5" r="2.4" fill={CARD} />
        </svg>
      );
    case "coupon":
      return (
        <svg viewBox="0 0 64 64" style={box}>
          <ellipse cx="32" cy="55" rx="19" ry="3" fill={INK} opacity="0.09" />
          <path d="M7 21a4 4 0 010 8v6a4 4 0 010 8h50a4 4 0 010-8v-6a4 4 0 010-8z" fill={MUSTARD} stroke={INKLT} strokeWidth="1.2" />
          <line x1="24" y1="19" x2="24" y2="45" stroke={CARD} strokeWidth="1.3" strokeDasharray="2 3" />
          <text x="12" y="37" fontSize="15" fontWeight="700" fill={CARD} fontFamily="Georgia,serif">%</text>
          <path d="M36 27 l2.2 4.4 4.8.7-3.5 3.4.8 4.8-4.3-2.3-4.3 2.3.8-4.8-3.5-3.4 4.8-.7z" fill={CARD} />
        </svg>
      );
    case "timeline":
      return (
        <svg viewBox="0 0 64 64" style={box}>
          <ellipse cx="32" cy="55" rx="19" ry="3" fill={INK} opacity="0.09" />
          <line x1="8" y1="19" x2="56" y2="19" stroke={INKLT} strokeWidth="1.3" />
          <circle cx="19" cy="19" r="1.8" fill={RED} /><circle cx="32" cy="19" r="1.8" fill={RED} /><circle cx="45" cy="19" r="1.8" fill={RED} />
          <g transform="rotate(-5 19 30)"><rect x="12" y="21" width="14" height="17" rx="1.5" fill={CARD} stroke={INKLT} strokeWidth="1.2" /><rect x="14" y="23" width="10" height="9.5" fill={BLUSH} /></g>
          <g transform="rotate(4 32 31)"><rect x="25" y="22" width="14" height="18" rx="1.5" fill={CARD} stroke={INKLT} strokeWidth="1.3" /><rect x="27" y="24" width="10" height="10" fill={SAGE} opacity="0.6" /></g>
          <g transform="rotate(-3 45 30)"><rect x="38" y="21" width="14" height="17" rx="1.5" fill={CARD} stroke={INKLT} strokeWidth="1.2" /><rect x="40" y="23" width="10" height="9.5" fill={MUSTARD} opacity="0.55" /></g>
        </svg>
      );
    case "openwhen":
      return (
        <svg viewBox="0 0 64 64" style={box}>
          <ellipse cx="32" cy="55" rx="19" ry="3" fill={INK} opacity="0.09" />
          <g transform="rotate(-6 30 30)"><rect x="10" y="15" width="34" height="23" rx="2" fill={CARD} stroke={INKLT} strokeWidth="1.1" /></g>
          <g transform="rotate(5 34 33)"><rect x="18" y="20" width="34" height="23" rx="2" fill={CARD} stroke={INKLT} strokeWidth="1.4" /><path d="M18 21 L35 32 L52 21" fill="none" stroke={INKLT} strokeWidth="1" opacity="0.4" /></g>
          <rect x="27" y="12" width="7" height="38" fill={RED} opacity="0.9" />
          <path d="M30.5 24c-3.4-3.2-9.4-.6-6.2 4 2 2.9 6.2 6 6.2 6s4.2-3.1 6.2-6c3.2-4.6-2.8-7.2-6.2-4z" fill={RED} />
        </svg>
      );
    default:
      return <div style={box} />;
  }
}

/* soft pastel badge colors that sit behind each catalog icon */
const BADGE_COLORS = [BLUSH, SAGE, MUSTARD, DUSTY, MINT, RED];

/* ---------------------------------------------------------------
   CATALOG DEFINITION
--------------------------------------------------------------- */
const CATALOG = [
  { id: "letter",   label: "Letter",       hint: "a handwritten note" },
  { id: "photos",   label: "Photos",       hint: "a few from your camera roll" },
  { id: "video",    label: "Video",        hint: "one or more clips" },
  { id: "song",     label: "Song",         hint: "a track that says it for you" },
  { id: "voice",    label: "Voice Note",   hint: "record or upload audio" },
  { id: "place",    label: "Place",        hint: "somewhere that means something" },
  { id: "coupon",   label: "Coupon",       hint: "redeemable for one hug" },
  { id: "timeline", label: "Timeline",     hint: "memories, in order" },
  { id: "openwhen", label: "Open When…",   hint: "letters for later" },
];
const CATALOG_BY_ID = Object.fromEntries(CATALOG.map((c) => [c.id, c]));

/* ---------------------------------------------------------------
   SOUND
--------------------------------------------------------------- */
function useSoftBlip() {
  const ctxRef = useRef(null);
  return useCallback((freq = 520, dur = 0.09) => {
    try {
      if (!ctxRef.current) { const Ctx = window.AudioContext || window.webkitAudioContext; ctxRef.current = new Ctx(); }
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.055, ctx.currentTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + dur + 0.02);
    } catch (e) {}
  }, []);
}

/* ---------------------------------------------------------------
   PRIMITIVES
--------------------------------------------------------------- */
function TagButton({ children, onClick, tone = RED, ghost, size = "md", disabled }) {
  const [pressed, setPressed] = useState(false);
  const pad = size === "lg" ? "px-7 py-3" : size === "sm" ? "px-3 py-1.5" : "px-4 py-1.5";
  const fs = size === "lg" ? 12.5 : size === "sm" ? 9.5 : 11;
  return (
    <button
      disabled={disabled}
      onMouseDown={() => !disabled && setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}
      onClick={onClick}
      className={`relative ${pad} rounded-full font-semibold tracking-wide transition-all`}
      style={{
        ...mono, fontSize: fs, letterSpacing: "0.14em", textTransform: "uppercase",
        color: disabled ? `${INKLT}88` : ghost ? tone : CARD,
        background: disabled ? `${INKLT}18` : ghost ? "transparent" : tone,
        border: `1.6px solid ${disabled ? `${INKLT}55` : tone}`,
        boxShadow: disabled ? "none" : pressed ? `0 1px 0 ${tone}` : `0 4px 0 ${tone}, 0 8px 16px rgba(58,50,42,0.15)`,
        transform: `translateY(${pressed && !disabled ? 3 : 0}px)`,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
function Field({ label, children }) {
  return (
    <div className="mb-3">
      <div style={{ ...mono, color: INKLT }} className="text-[9.5px] uppercase tracking-[0.2em] mb-1">{label}</div>
      {children}
    </div>
  );
}
const inputStyle = { ...bodyF, color: INK, borderColor: `${INKLT}44` };
const textInputClass = "w-full border rounded-md px-3 py-1.5 text-sm bg-transparent focus:outline-none focus:border-current";

/* =================================================================
   ITEM EDITORS (one per catalog type)
================================================================= */
function LetterEditor({ onAdd }) {
  const [text, setText] = useState("");
  return (
    <div>
      <Field label="Your note">
        <textarea
          value={text} onChange={(e) => setText(e.target.value)} rows={6}
          placeholder="Write it the way you'd say it out loud…"
          style={{
            ...hand, fontSize: 20, color: INK, lineHeight: "30px",
            background: `repeating-linear-gradient(180deg, transparent, transparent 29px, ${INKLT}22 30px)`,
          }}
          className="w-full rounded-md px-3 py-2 focus:outline-none resize-none"
        />
      </Field>
      <TagButton disabled={!text.trim()} onClick={() => onAdd({ text: text.trim() })}>Add to package</TagButton>
    </div>
  );
}

function PhotosEditor({ onAdd }) {
  const [images, setImages] = useState([]);
  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const next = files.map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    setImages((prev) => [...prev, ...next]);
  };
  return (
    <div>
      <Field label="Choose photos from your device">
        <label className="flex items-center gap-2 border rounded-md px-3 py-1.5 text-sm cursor-pointer" style={{ ...bodyF, borderColor: `${INKLT}44`, color: INKLT }}>
          <Upload size={15} /> Select photos
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
        </label>
      </Field>
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {images.map((im, i) => (
            <div key={i} className="relative rounded-md overflow-hidden" style={{ aspectRatio: "1/1", border: `1px solid ${INKLT}33` }}>
              <img src={im.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
      <TagButton disabled={!images.length} onClick={() => onAdd({ images })}>Add to package</TagButton>
    </div>
  );
}

function VideoEditor({ onAdd }) {
  const [videos, setVideos] = useState([]);
  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const next = files.map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    setVideos((prev) => [...prev, ...next]);
  };
  return (
    <div>
      <Field label="Upload one or more clips">
        <label className="flex items-center gap-2 border rounded-md px-3 py-1.5 text-sm cursor-pointer" style={{ ...bodyF, borderColor: `${INKLT}44`, color: INKLT }}>
          <Upload size={15} /> Select videos
          <input type="file" accept="video/*" multiple className="hidden" onChange={onFiles} />
        </label>
      </Field>
      {videos.length > 0 && (
        <div className="space-y-2 mb-3">
          {videos.map((v, i) => (
            <video key={i} src={v.url} controls className="w-full rounded-md" style={{ maxHeight: 140, border: `1px solid ${INKLT}33` }} />
          ))}
        </div>
      )}
      <TagButton disabled={!videos.length} onClick={() => onAdd({ videos })}>Add to package</TagButton>
    </div>
  );
}

function detectPlatform(url) {
  const u = url.toLowerCase();
  if (u.includes("spotify")) return "Spotify";
  if (u.includes("youtube") || u.includes("youtu.be")) return "YouTube";
  if (u.includes("music.apple")) return "Apple Music";
  return "Link";
}
function SongEditor({ onAdd }) {
  const [url, setUrl] = useState("");
  const platform = url ? detectPlatform(url) : null;
  return (
    <div>
      <Field label="Paste a Spotify, YouTube, or Apple Music link">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://open.spotify.com/track/…" style={inputStyle} className={textInputClass} />
      </Field>
      {platform && (
        <div style={{ ...mono, color: SAGE_D }} className="text-[10.5px] uppercase tracking-widest mb-3">detected · {platform}</div>
      )}
      <TagButton disabled={!url.trim()} onClick={() => onAdd({ url: url.trim(), platform })}>Add to package</TagButton>
    </div>
  );
}

function VoiceEditor({ onAdd }) {
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(false);
  const mrRef = useRef(null);
  const chunksRef = useRef([]);

  const start = async () => {
    setError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start(); mrRef.current = mr; setRecording(true);
    } catch (e) { setError(true); }
  };
  const stop = () => { mrRef.current && mrRef.current.stop(); setRecording(false); };
  const onFile = (e) => { const f = e.target.files && e.target.files[0]; if (f) setUrl(URL.createObjectURL(f)); };

  return (
    <div>
      <Field label="Record a voice note">
        <div className="flex items-center gap-3">
          {!recording ? (
            <TagButton size="sm" tone={RED} onClick={start}><span className="flex items-center gap-1"><Mic size={12} /> Record</span></TagButton>
          ) : (
            <TagButton size="sm" tone={INK} onClick={stop}><span className="flex items-center gap-1"><Square size={12} /> Stop</span></TagButton>
          )}
          {recording && <span style={{ ...mono, color: RED, animation: "pulseDot 1s ease infinite" }} className="text-xs">● recording…</span>}
        </div>
        {error && <p style={{ ...bodyF, color: INKLT }} className="text-xs mt-2 opacity-70">Microphone unavailable here — upload an audio file instead.</p>}
      </Field>
      <Field label="or upload an audio file">
        <label className="flex items-center gap-2 border rounded-md px-3 py-1.5 text-sm cursor-pointer w-fit" style={{ ...bodyF, borderColor: `${INKLT}44`, color: INKLT }}>
          <Upload size={15} /> Choose file
          <input type="file" accept="audio/*" className="hidden" onChange={onFile} />
        </label>
      </Field>
      {url && <audio src={url} controls className="w-full mb-3" />}
      <TagButton disabled={!url} onClick={() => onAdd({ url })}>Add to package</TagButton>
    </div>
  );
}

function PlaceEditor({ onAdd }) {
  const [query, setQuery] = useState("");
  return (
    <div>
      <Field label="Write your memorable place">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="that little café on 5th street…" style={inputStyle} className={textInputClass} />
      </Field>
      <TagButton disabled={!query.trim()} onClick={() => onAdd({ query: query.trim() })}>Add to package</TagButton>
    </div>
  );
}

const COUPON_PRESETS = ["Movie Night", "One Hug", "Breakfast in Bed", "Free Pass", "Coffee on Me"];
function CouponEditor({ onAdd }) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  return (
    <div>
      <Field label="Quick picks">
        <div className="flex flex-wrap gap-2">
          {COUPON_PRESETS.map((p) => (
            <button key={p} onClick={() => setTitle(p)} style={{ ...mono, color: INKLT, borderColor: `${INKLT}44` }} className="text-[10.5px] uppercase tracking-wide border rounded-full px-3 py-1">{p}</button>
          ))}
        </div>
      </Field>
      <Field label="Coupon title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Redeemable for…" style={inputStyle} className={textInputClass} />
      </Field>
      <Field label="Fine print (optional)">
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="valid anytime, anywhere" style={inputStyle} className={textInputClass} />
      </Field>
      <TagButton disabled={!title.trim()} onClick={() => onAdd({ title: title.trim(), note: note.trim() })}>Add to package</TagButton>
    </div>
  );
}

function TimelineEditor({ onAdd }) {
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState("");
  const [text, setText] = useState("");
  const addEntry = () => {
    if (!text.trim()) return;
    setEntries((p) => [...p, { date, text: text.trim() }]);
    setDate(""); setText("");
  };
  return (
    <div>
      <Field label="Add a memory">
        <div className="flex gap-2 mb-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} className={`${textInputClass} w-36`} />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="what happened?" style={inputStyle} className={textInputClass} />
        </div>
        <TagButton size="sm" tone={SAGE_D} onClick={addEntry}><span className="flex items-center gap-1"><Plus size={12} /> Add memory</span></TagButton>
      </Field>
      {entries.length > 0 && (
        <div className="space-y-2 mb-3">
          {entries.map((e, i) => (
            <div key={i} className="flex items-center justify-between rounded-md px-3 py-1.5" style={{ border: `1px dashed ${INKLT}44` }}>
              <div>
                <div style={{ ...mono, color: INKLT }} className="text-[9.5px] uppercase tracking-wide">{e.date || "no date"}</div>
                <div style={{ ...bodyF, color: INK }} className="text-sm">{e.text}</div>
              </div>
              <button onClick={() => setEntries((p) => p.filter((_, idx) => idx !== i))} style={{ color: RED }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
      <TagButton disabled={!entries.length} onClick={() => onAdd({ entries })}>Add to package</TagButton>
    </div>
  );
}

function OpenWhenEditor({ onAdd }) {
  const [letters, setLetters] = useState([]);
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");
  const addLetter = () => {
    if (!label.trim() || !content.trim()) return;
    setLetters((p) => [...p, { label: label.trim(), content: content.trim() }]);
    setLabel(""); setContent("");
  };
  const presets = ["Open when you're sad", "Open when you miss me", "Open when you need a laugh", "Open when it's 3am"];
  return (
    <div>
      <Field label="Label">
        <div className="flex flex-wrap gap-2 mb-2">
          {presets.map((p) => (
            <button key={p} onClick={() => setLabel(p)} style={{ ...mono, color: INKLT, borderColor: `${INKLT}44` }} className="text-[10px] uppercase tracking-wide border rounded-full px-3 py-1">{p}</button>
          ))}
        </div>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Open when…" style={inputStyle} className={textInputClass} />
      </Field>
      <Field label="Letter content">
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} style={{ ...hand, fontSize: 19, color: INK }} className="w-full border rounded-md px-3 py-2 resize-none focus:outline-none" placeholder="write what you'd want them to read…" />
      </Field>
      <TagButton size="sm" tone={SAGE_D} onClick={addLetter}><span className="flex items-center gap-1"><Plus size={12} /> Add letter</span></TagButton>

      {letters.length > 0 && (
        <div className="space-y-2 my-3">
          {letters.map((l, i) => (
            <div key={i} className="flex items-center justify-between rounded-md px-3 py-1.5" style={{ border: `1px dashed ${INKLT}44` }}>
              <div style={{ ...mono, color: INK }} className="text-xs">{l.label}</div>
              <button onClick={() => setLetters((p) => p.filter((_, idx) => idx !== i))} style={{ color: RED }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3">
        <TagButton disabled={!letters.length} onClick={() => onAdd({ letters })}>Add to package</TagButton>
      </div>
    </div>
  );
}

const EDITORS = {
  letter: LetterEditor, photos: PhotosEditor, video: VideoEditor, song: SongEditor,
  voice: VoiceEditor, place: PlaceEditor, coupon: CouponEditor, timeline: TimelineEditor, openwhen: OpenWhenEditor,
};

/* =================================================================
   MODAL WRAPPER
================================================================= */
function Modal({ title, hint, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ background: "rgba(58,50,42,0.45)", animation: "backdropIn 200ms ease" }}>
      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-md p-6" style={{ background: CARD, boxShadow: "0 30px 60px rgba(58,50,42,0.35)", animation: "modalIn 260ms cubic-bezier(.2,.8,.2,1)" }}>
        <Grain opacity={0.15} />
        <button onClick={onClose} className="absolute top-4 right-4" style={{ color: INKLT }}><X size={18} /></button>
        <div style={{ ...heading, color: INK }} className="text-xl font-semibold mb-0.5">{title}</div>
        <div style={{ ...hand, color: INKLT }} className="text-lg mb-4">{hint}</div>
        {children}
      </div>
    </div>
  );
}

/* =================================================================
   CART PREVIEWS
================================================================= */
function CartPreview({ type, data }) {
  switch (type) {
    case "letter":
      return <p style={{ ...hand, color: INK }} className="text-base leading-snug">{data.text.slice(0, 80)}{data.text.length > 80 ? "…" : ""}</p>;
    case "photos":
      return (
        <div className="flex gap-1.5 mt-1">
          {data.images.slice(0, 4).map((im, i) => (
            <img key={i} src={im.url} alt="" className="rounded" style={{ width: 28, height: 28, objectFit: "cover", border: `1px solid ${INKLT}33` }} />
          ))}
          {data.images.length > 4 && <span style={{ ...mono, color: INKLT }} className="text-xs self-center">+{data.images.length - 4}</span>}
        </div>
      );
    case "video":
      return <span style={{ ...bodyF, color: INKLT }} className="text-sm">{data.videos.length} clip{data.videos.length !== 1 ? "s" : ""} attached</span>;
    case "song":
      return <span style={{ ...mono, color: INKLT }} className="text-xs uppercase tracking-widest">{data.platform} · {data.url.slice(0, 28)}…</span>;
    case "voice":
      return <audio src={data.url} controls className="mt-1 h-7" style={{ maxWidth: 190 }} />;
    case "place":
      return <span style={{ ...bodyF, color: INKLT }} className="text-sm">{data.query}</span>;
    case "coupon":
      return <span style={{ ...bodyF, color: INKLT }} className="text-sm">"{data.title}"{data.note ? ` — ${data.note}` : ""}</span>;
    case "timeline":
      return <span style={{ ...bodyF, color: INKLT }} className="text-sm">{data.entries.length} memories added in</span>;
    case "openwhen":
      return <span style={{ ...bodyF, color: INKLT }} className="text-sm">{data.letters.length} sealed letter{data.letters.length !== 1 ? "s" : ""}</span>;
    default:
      return null;
  }
}

/* =================================================================
   SINGLE PAGE SECTIONS
================================================================= */
function LabelCard({ to, from, setTo, setFrom }) {
  return (
    <div className="relative overflow-hidden mx-auto" style={{ width: "100%", background: "#f6e9d2", boxShadow: "0 14px 28px rgba(58,50,42,0.18)", transform: "rotate(-0.5deg)", border: `1px solid ${INKLT}22`, maxWidth: 520 }}>
      <Grain opacity={0.12} />
      <div className="absolute inset-x-0 top-0 h-2" style={{ background: "radial-gradient(circle at center, rgba(255,255,255,0.7), transparent 60%)" }} />
      <div className="px-5 py-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div style={{ ...mono, color: INK }} className="text-[9px] uppercase tracking-[0.25em] mb-0.5">shipping slip</div>
            <div style={{ ...heading, color: INK }} className="text-lg font-semibold">Care package</div>
          </div>
          <div style={{ ...mono, color: INKLT }} className="text-[8.5px] uppercase tracking-[0.28em] pt-1">attached</div>
        </div>
        <div className="mt-3 rounded-sm border border-dashed" style={{ borderColor: `${INKLT}30`, background: `rgba(255,255,255,0.72)` }}>
          <div className="px-3 py-2">
            <div style={{ ...mono, color: INK }} className="text-[8.5px] uppercase tracking-[0.28em] mb-0.5">TO</div>
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="who's this for?" style={{ ...mono, color: INK, fontSize: 14, background: "transparent" }} className="w-full border-b border-slate-300 pb-1.5 focus:outline-none placeholder:opacity-50" />
          </div>
          <div className="px-3 py-2">
            <div style={{ ...mono, color: INK }} className="text-[8.5px] uppercase tracking-[0.28em] mb-0.5">FROM</div>
            <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="and who's it from?" style={{ ...mono, color: INK, fontSize: 14, background: "transparent" }} className="w-full focus:outline-none placeholder:opacity-50" />
          </div>
        </div>
      </div>
      <div className="border-t px-5 py-2 flex items-center justify-between" style={{ borderColor: `${INKLT}22`, background: `rgba(58,50,42,0.03)` }}>
        <div style={{ ...mono, color: INKLT }} className="text-[9px] uppercase tracking-[0.2em]">box code</div>
        <Barcode seed="9405511899561891234567" width={140} />
      </div>
    </div>
  );
}

function CatalogCard({ onPick }) {
  return (
    <div className="relative rounded-md mx-auto p-5" style={{ width: "100%", background: CARD, boxShadow: "0 18px 36px rgba(58,50,42,0.16)", transform: "rotate(0.4deg)" }}>
      <Grain opacity={0.15} />
      <WashiTape style={{ top: -12, right: 36, transform: "rotate(5deg)" }} tint={MUSTARD} />
      <div className="text-center mb-3">
        <div style={{ ...heading, color: INK }} className="text-sm font-semibold tracking-[0.15em] uppercase mb-1">A Box of Love</div>
        <p style={{ ...bodyF, color: INKLT }} className="text-xs mb-2">for making your loved ones happy</p>
        <Stamp style={{ transform: "rotate(-2deg)", padding: "4px 14px", fontSize: 16 }}>things to add inside</Stamp>
      </div>
      <div className="border-t border-b py-1.5 mb-3 flex items-center justify-center" style={{ borderColor: `${INKLT}30` }}>
        <span style={{ ...mono, color: INKLT }} className="text-[9.5px] tracking-[0.3em]">✳ SELECT ITEMS TO add ✳</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {CATALOG.map((item, i) => {
          const badge = BADGE_COLORS[i % BADGE_COLORS.length];
          const tilt = i % 2 === 0 ? -2 : 2;
          return (
            <button
              key={item.id} onClick={() => onPick(item.id)}
              className="group flex flex-col items-center text-center rounded-xl p-2.5 transition-all"
              style={{ background: `${CREAM2}88`, border: `1px solid ${INKLT}14` }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = `translateY(-4px) rotate(${tilt}deg)`; e.currentTarget.style.boxShadow = "0 12px 20px rgba(58,50,42,0.2)"; e.currentTarget.style.background = CARD; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = `${CREAM2}88`; }}
            >
              <div
                className="relative flex items-center justify-center rounded-full mb-1"
                style={{ width: 44, height: 44, background: `${badge}38`, border: `1.4px dashed ${badge}` }}
              >
                <ObjectArt id={item.id} size={30} />
              </div>
              <div style={{ ...heading, color: INK }} className="text-[10.5px] font-semibold mt-1">+ {item.label}</div>
              <div style={{ ...hand, color: INKLT }} className="text-[13px] -mt-0.5 leading-tight">{item.hint}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CartCard({ cart, onRemove }) {
  return (
    <div className="relative rounded-md mx-auto p-5" style={{ width: "100%", background: CARD, boxShadow: "0 18px 36px rgba(58,50,42,0.16)", transform: "rotate(-0.3deg)" }}>
      <Grain opacity={0.15} />
      <div style={{ ...heading, color: INK }} className="text-sm font-semibold tracking-[0.15em] uppercase mb-2">Inside the box</div>
      {cart.length === 0 ? (
        <p style={{ ...hand, color: INKLT }} className="text-lg opacity-70 py-4 text-center">nothing added in yet — pick something above</p>
      ) : (
        <div className="max-h-[220px] overflow-y-auto pr-1">
          {cart.map((c, i) => (
            <div key={c.uid} className="flex items-start justify-between gap-3 py-2.5" style={{ borderBottom: i < cart.length - 1 ? `1px dashed ${INKLT}30` : "none" }}>
              <div className="flex gap-2.5 items-start min-w-0">
                <div
                  className="shrink-0 rounded-full flex items-center justify-center"
                  style={{ width: 36, height: 36, background: `${BADGE_COLORS[i % BADGE_COLORS.length]}30` }}
                >
                  <ObjectArt id={c.type} size={24} />
                </div>
                <div className="min-w-0">
                  <div style={{ ...mono, color: INK }} className="text-[10.5px] font-bold uppercase tracking-wide">{CATALOG_BY_ID[c.type].label}</div>
                  <div className="mt-0.5"><CartPreview type={c.type} data={c.data} /></div>
                </div>
              </div>
              <button onClick={() => onRemove(c.uid)} style={{ ...mono, color: RED, borderColor: RED }} className="shrink-0 text-[9px] uppercase tracking-widest border rounded-full px-2.5 py-0.5">remove</button>
            </div>
          ))}
        </div>
      )}
      <div className="border-t mt-1 pt-3" style={{ borderColor: `${INKLT}22` }}>
        <div className="text-right">
          <div style={{ ...mono, color: INK }} className="text-[10px] font-bold tracking-widest">THANK YOU FOR CARING</div>
          <div style={{ ...hand, color: INKLT }} className="text-base -mt-1">have a lovely day :)</div>
        </div>
      </div>
    </div>
  );
}

function CheckoutCard({ cartCount, onPay, onPreview }) {
  return (
    <div className="relative rounded-md mx-auto p-5 text-center" style={{ width: "100%", background: CARD, boxShadow: "0 18px 36px rgba(58,50,42,0.18)", transform: "rotate(0.5deg)" }}>
      <Grain opacity={0.15} />
      <div style={{ ...heading, color: INK }} className="text-sm font-semibold tracking-[0.15em] uppercase mb-0.5">A Box of Little Things</div>
      <p style={{ ...bodyF, color: INKLT }} className="text-xs mb-2">checkout · share your parcel</p>
      <div className="mb-3"><Stamp style={{ padding: "4px 14px", fontSize: 16 }}>send your love</Stamp></div>
      <div className="border-t border-b py-1.5 mb-3" style={{ borderColor: `${INKLT}30` }}>
        <span style={{ ...mono, color: INKLT }} className="text-[9.5px] tracking-[0.28em]">✳ PAY, THEN GET YOUR LINK ✳</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch max-w-sm mx-auto">
        <TagButton tone={RED} disabled={!cartCount} onClick={onPay}>Pay ₹100 &amp; generate link</TagButton>
        <TagButton tone={SAGE_D} ghost disabled={!cartCount} onClick={onPreview}>Preview package</TagButton>
      </div>
      {!cartCount && <p style={{ ...bodyF, color: INKLT }} className="text-xs opacity-60 mt-3">add at least one thing in before sending</p>}
      <div className="mt-4 flex flex-col items-center gap-1">
        <span style={{ ...hand, color: INKLT }} className="text-base mt-0.5">send it to someone special</span>
      </div>
    </div>
  );
}

/* =================================================================
   PAYMENT / DELIVERED MODALS
================================================================= */
function PaymentModal({ onPaid, onClose }) {
  const [processing, setProcessing] = useState(false);
  const pay = () => { setProcessing(true); setTimeout(onPaid, 1400); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(58,50,42,0.45)" }}>
      <div className="relative w-full max-w-sm rounded-md p-7" style={{ background: CARD, boxShadow: "0 30px 60px rgba(58,50,42,0.3)", animation: "modalIn 260ms ease" }}>
        <Grain opacity={0.15} />
        {!processing && <button onClick={onClose} className="absolute top-4 left-4" style={{ color: INKLT }}><ArrowLeft size={18} /></button>}
        <div className="text-center mb-5 mt-2">
          <div style={{ ...mono, color: INKLT }} className="text-[10px] uppercase tracking-[0.3em]">Delivery fee</div>
          <div style={{ ...heading, color: INK }} className="text-3xl font-semibold mt-1">₹100</div>
        </div>
        {!processing ? (
          <>
            <div className="space-y-2.5 mb-5">
              <input placeholder="Card number" style={inputStyle} className={textInputClass} />
              <div className="flex gap-3">
                <input placeholder="MM/YY" style={inputStyle} className={`${textInputClass} w-1/2`} />
                <input placeholder="CVV" style={inputStyle} className={`${textInputClass} w-1/2`} />
              </div>
            </div>
            <div className="flex justify-center"><TagButton size="lg" tone={RED} onClick={pay}>Pay ₹100</TagButton></div>
            <p style={{ ...bodyF, color: INKLT }} className="text-[11px] opacity-70 mt-3 text-center">Demo checkout — no real payment is processed here. A production build would connect this to a gateway like Razorpay or Stripe on a real backend.</p>
          </>
        ) : (
          <div className="text-center py-8"><div style={{ ...mono, color: INKLT }} className="text-sm animate-pulse">Processing payment…</div></div>
        )}
      </div>
    </div>
  );
}

function DeliveredModal({ onPreview, onClose }) {
  const [copied, setCopied] = useState(false);
  const link = `https://care-pkg.example/p/${Math.random().toString(36).slice(2, 9)}`;
  const copy = () => { try { navigator.clipboard.writeText(link); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1800); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(58,50,42,0.45)" }}>
      <div className="relative w-full max-w-sm rounded-md p-7 text-center" style={{ background: CARD, boxShadow: "0 30px 60px rgba(58,50,42,0.3)", animation: "modalIn 260ms ease" }}>
        <Grain opacity={0.15} />
        <button onClick={onClose} className="absolute top-4 right-4" style={{ color: INKLT }}><X size={18} /></button>
        <div className="mx-auto rounded-full flex items-center justify-center mb-4" style={{ width: 52, height: 52, background: `${SAGE}22`, color: SAGE_D }}><Check size={24} /></div>
        <h2 style={{ ...heading, color: INK }} className="text-lg font-semibold mb-1">Out for delivery</h2>
        <p style={{ ...hand, color: INKLT }} className="text-xl mb-4">it's on its way now</p>
        <div className="flex items-center justify-between rounded-md px-3 py-2 mb-3" style={{ border: `1.4px dashed ${INKLT}44` }}>
          <span style={{ ...mono, color: INK }} className="text-xs truncate">{link}</span>
          <button onClick={copy} style={{ color: RED }}><Copy size={16} /></button>
        </div>
        {copied && <div style={{ ...mono, color: SAGE_D }} className="text-xs mb-3">Link copied</div>}
        <TagButton tone={SAGE_D} onClick={onPreview}>Preview anyway</TagButton>
      </div>
    </div>
  );
}

/* =================================================================
   RECEIVER PREVIEW (full screen takeover)
   Box shakes → pops open → all items spill out as a clickable
   spread → tapping one opens its contents.
================================================================= */
function ItemCard({ entry, index, onOpen }) {
  const { type, data } = entry;
  const label = type === "openwhen" ? data.label : CATALOG_BY_ID[type].label;
  const badge = BADGE_COLORS[index % BADGE_COLORS.length];
  const tilt = (index % 2 === 0 ? -1 : 1) * (4 + (index % 3) * 2);
  return (
    <button
      onClick={() => onOpen(entry)}
      className="relative flex flex-col items-center justify-center rounded-xl p-4 transition-transform"
      style={{
        width: 130, height: 130,
        background: CARD,
        boxShadow: "0 10px 22px rgba(58,50,42,0.2)",
        border: `1px solid ${INKLT}18`,
        "--tilt": `${tilt}deg`,
        transform: `rotate(${tilt}deg)`,
        animation: `itemPop 520ms cubic-bezier(.3,1.4,.5,1) ${index * 140}ms both`,
        cursor: "pointer",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = `rotate(0deg) scale(1.06) translateY(-4px)`; e.currentTarget.style.boxShadow = "0 16px 28px rgba(58,50,42,0.28)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${tilt}deg)`; e.currentTarget.style.boxShadow = "0 10px 22px rgba(58,50,42,0.2)"; }}
    >
      <div className="rounded-full flex items-center justify-center mb-1.5" style={{ width: 52, height: 52, background: `${badge}38` }}>
        <ObjectArt id={type} size={34} />
      </div>
      <div style={{ ...heading, color: INK }} className="text-[11px] font-semibold text-center leading-tight">{label}</div>
      <div style={{ ...mono, color: INKLT }} className="text-[8.5px] uppercase tracking-widest mt-0.5">tap to open</div>
    </button>
  );
}

function ItemDetailModal({ entry, onClose }) {
  const { type, data } = entry;
  const label = type === "openwhen" ? data.label : CATALOG_BY_ID[type].label;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ background: "rgba(58,50,42,0.55)" }} onClick={onClose}>
      <div
        className="relative w-full max-w-sm max-h-[80vh] overflow-y-auto rounded-md p-6 text-center"
        style={{ background: CARD, boxShadow: "0 30px 60px rgba(58,50,42,0.35)", animation: "modalIn 240ms cubic-bezier(.2,.8,.2,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Grain opacity={0.15} />
        <button onClick={onClose} className="absolute top-4 right-4" style={{ color: INKLT }}><X size={18} /></button>
        <ObjectArt id={type} size={48} />
        <div style={{ ...heading, color: INK }} className="text-sm font-semibold tracking-wide mt-2 mb-3">{label}</div>
        <div className="text-left">
          {type === "letter" && <p style={{ ...hand, color: INK, fontSize: 21 }} className="whitespace-pre-wrap text-center">{data.text}</p>}
          {type === "photos" && (
            <div className="flex flex-wrap gap-2 justify-center">
              {data.images.map((im, i) => <img key={i} src={im.url} alt="" className="rounded" style={{ width: 60, height: 60, objectFit: "cover" }} />)}
            </div>
          )}
          {type === "video" && data.videos.map((v, i) => <video key={i} src={v.url} controls className="w-full rounded mt-1" />)}
          {type === "song" && (
            <div className="space-y-3">
              <p style={{ ...bodyF, color: INKLT }} className="text-sm break-all text-center">{data.platform}: {data.url}</p>
              <a
                href={data.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold"
                style={{ ...mono, color: CARD, background: RED, textDecoration: "none" }}
              >
                Listen to song
              </a>
            </div>
          )}
          {type === "voice" && <audio src={data.url} controls className="w-full" />}
          {type === "place" && <p style={{ ...hand, color: INK }} className="text-xl text-center">{data.query}</p>}
          {type === "coupon" && <p style={{ ...hand, color: INK }} className="text-2xl text-center">"{data.title}"{data.note ? <span className="block text-sm" style={bodyF}>{data.note}</span> : null}</p>}
          {type === "timeline" && (
            <div className="space-y-1">
              {data.entries.map((e, i) => (
                <div key={i}><span style={{ ...mono, color: INKLT }} className="text-[10px] uppercase mr-2">{e.date || "—"}</span><span style={{ ...bodyF, color: INK }} className="text-sm">{e.text}</span></div>
              ))}
            </div>
          )}
          {type === "openwhen" && (
            <div className="space-y-2">
              <div style={{ ...mono, color: RED }} className="text-xs uppercase tracking-wide">{data.label}</div>
              <div style={{ ...bodyF, color: INK }} className="text-lg">{data.content}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewExperience({ to, from, cart, onExit }) {
  const [stage, setStage] = useState("closed"); // closed | shaking | open
  const [openedItem, setOpenedItem] = useState(null);
  const blip = useSoftBlip();

  const beginOpen = () => {
    if (stage !== "closed") return;
    blip(500);
    setStage("shaking");
    setTimeout(() => { blip(650); setStage("open"); }, 900);
  };

  const previewItems = cart.flatMap((entry) => {
    if (entry.type === "openwhen" && Array.isArray(entry.data.letters)) {
      return entry.data.letters.map((letter, idx) => ({
        ...entry,
        uid: `${entry.uid}-letter-${idx}`,
        data: letter,
      }));
    }
    return entry;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center px-6 py-10 overflow-y-auto" style={{ background: `linear-gradient(180deg, ${CREAM}, ${CREAM2})` }}>
      <button onClick={onExit} className="absolute top-6 right-6 z-10" style={{ color: INKLT }}><X size={22} /></button>
      <Dust count={10} />

      {stage !== "open" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p style={{ ...hand, color: INKLT }} className="text-2xl mb-8">a package has arrived for {to || "you"}…</p>
          <div
            className="relative mx-auto"
            style={{
              width: 230, height: 165,
              animation: stage === "shaking" ? "boxShake 900ms ease-in-out" : "floatSlow 3.4s ease-in-out infinite",
            }}
          >
            <div className="absolute inset-0 rounded-md" style={{ background: `linear-gradient(180deg, ${CREAM2}, #C7A876)`, boxShadow: "0 20px 40px rgba(58,50,42,0.24)" }} />
            <div className="absolute left-1/2 top-0 h-full" style={{ width: 15, marginLeft: -7.5, background: RED, opacity: 0.9 }} />
            <div className="absolute top-1/2 left-0 w-full" style={{ height: 15, marginTop: -7.5, background: RED, opacity: 0.9 }} />
          </div>
          <div className="mt-8">
            <TagButton onClick={beginOpen} tone={RED} disabled={stage === "shaking"}>
              {stage === "shaking" ? "Opening…" : "Shake it open"}
            </TagButton>
          </div>
        </div>
      )}

      {stage === "open" && (
        <div className="flex-1 flex flex-col items-center w-full max-w-2xl" style={{ animation: "fadeUp 450ms ease" }}>
          <p style={{ ...hand, color: INKLT }} className="text-3xl mb-1 text-center">everything, all at once</p>
          <p style={{ ...mono, color: INKLT }} className="text-[10px] uppercase tracking-[0.28em] mb-6 text-center">tap anything to open it</p>
          <div className="flex flex-wrap gap-4 justify-center items-start">
            {previewItems.map((entry, i) => (
              <ItemCard key={entry.uid} entry={entry} index={i} onOpen={setOpenedItem} />
            ))}
          </div>
          <div className="mt-10 text-center pb-4">
            <p style={{ ...hand, color: INKLT }} className="text-4xl mb-1">with love, {from || "a friend"}</p>
            <p style={{ ...bodyF, color: INKLT }} className="text-sm opacity-70 mb-6">end of package</p>
            <TagButton onClick={onExit} tone={SAGE_D}>Close</TagButton>
          </div>
        </div>
      )}

      {openedItem && <ItemDetailModal entry={openedItem} onClose={() => setOpenedItem(null)} />}
    </div>
  );

}

/* =================================================================
   ROOT APP
================================================================= */
function Home() {
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [cart, setCart] = useState([]);
  const [editorType, setEditorType] = useState(null);
  const [overlay, setOverlay] = useState(null); // 'payment' | 'delivered' | 'preview' | null

  const addToCart = (type, data) => setCart((c) => [...c, { uid: uid(), type, data }]);
  const removeFromCart = (uidToRemove) => setCart((c) => c.filter((c2) => c2.uid !== uidToRemove));

  const createOrder = async () => {
  try {
    const response = await axios.post(
      "https://digitalboxofmemories.onrender.com/create-order",
      {
        amount: 99,
      }
    );

    return response.data.order;
  } catch (err) {
    console.error(err);
    alert("Failed to create order");
    return null;
  }
  };
  const createPackage = async () => {
    try {
      const order = await createOrder();
      const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Care Package",
      description: "Gift Package",
      order_id: order.id,

      handler: async function (response) {
  try {
    const verifyResponse = await axios.post(
      "https://digitalboxofmemories.onrender.com/verify-payment",
      response
    );

    if (!verifyResponse.data.success) {
      alert("Payment verification failed");
      return;
    }

    const payload = {
      sender: from,
      receiver: to,
      items: cart.map((item) => ({
        type: item.type,
        ...item.data,
      })),
    };

    const packageResponse = await axios.post(
      "https://digitalboxofmemories.onrender.com/package",
      payload
    );

    const publicId = packageResponse.data.publicId;

    const link = `http://digital-box-of-memories.vercel.app/package/${publicId}`;

    alert(link);

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
},
    };

    const paymentObject = new window.Razorpay(options); 
    paymentObject.open();
  

    } catch (err) {
      console.error(err);
      alert("Failed to create package.");
      return null;
    }
  };
  const EditorComp = editorType ? EDITORS[editorType] : null;

  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        backgroundColor: CARDBOARD,
        backgroundImage: `
          url(${cardboardImg}),
          linear-gradient(180deg, rgba(255,255,255,0.08), transparent 48%),
          radial-gradient(circle at 12% 12%, rgba(255,255,255,0.18), transparent 16%),
          radial-gradient(circle at 84% 20%, rgba(0,0,0,0.08), transparent 14%),
          repeating-linear-gradient(90deg, rgba(58,50,42,0.1), rgba(58,50,42,0.1) 1px, transparent 1px, transparent 12px)
        `,
        backgroundSize: "cover, 100% 100%, 160% 160%, 140% 140%, 12px 12px",
        backgroundPosition: "center, center, center, center, center",
        backgroundBlendMode: "normal, normal, screen, multiply, multiply",
        backgroundRepeat: "no-repeat",
        boxShadow: `inset 0 0 0 1px ${CARDBOARD_SHADOW}`,
        ...bodyF,
      }}
    >
      <GlobalStyle />
      <Dust />

      <div className="relative z-10 py-6 px-4">
        <div className="mx-auto grid gap-4 lg:grid-cols-2" style={{ maxWidth: 1180 }}>
          <div className="space-y-4">
            <LabelCard to={to} from={from} setTo={setTo} setFrom={setFrom} />
            <CartCard cart={cart} onRemove={removeFromCart} />
          </div>
          <div className="space-y-4">
            <CatalogCard onPick={setEditorType} />
            <CheckoutCard cartCount={cart.length} onPay={createPackage} onPreview={() => setOverlay("preview")} />
          </div>
        </div>
      </div>

      {EditorComp && (
        <Modal title={CATALOG_BY_ID[editorType].label} hint={CATALOG_BY_ID[editorType].hint} onClose={() => setEditorType(null)}>
          <EditorComp onAdd={(data) => { addToCart(editorType, data); setEditorType(null); }} />
        </Modal>
      )}

      {overlay === "payment" && (
        <PaymentModal onClose={() => setOverlay(null)} onPaid={() => setOverlay("delivered")} />
      )}
      {overlay === "delivered" && (
        <DeliveredModal onClose={() => setOverlay(null)} onPreview={() => setOverlay("preview")} />
      )}
      {overlay === "preview" && (
        <PreviewExperience to={to} from={from} cart={cart} onExit={() => setOverlay(null)} />
      )}
    </div>

    
  );
  
}

function PackageViewer() {
  const { publicId } = useParams();

  const [pkg, setPkg] = useState(null);

  useEffect(() => {
    async function fetchPackage() {
      try {
        const response = await axios.get(
          `https://digitalboxofmemories.onrender.com/package/${publicId}`
        );

        setPkg(response.data.package);
      } catch (err) {
        console.error(err);
      }
    }

    fetchPackage();
  }, [publicId]);

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const cart = pkg.items.map((item, index) => ({
    uid: `item-${index}`,
    type: item.type,
    data: Object.fromEntries(
      Object.entries(item).filter(([key]) => key !== "type")
    ),
  }));

  return (
    <PreviewExperience
      to={pkg.receiver_name}
      from={pkg.sender_name}
      cart={cart}
      onExit={() => window.history.back()}
    />
  );
}

export default function CarePackageApp() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/package/:publicId" element={<PackageViewer />} />
    </Routes>
  );
}