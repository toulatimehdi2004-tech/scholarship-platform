"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Footprints,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Eye,
  Radio,
  ChevronRight,
  ChevronLeft,
  X,
  RotateCcw,
  Sparkles,
  MapPin,
  HelpCircle,
} from "lucide-react";
import type { Landmark } from "./CampusTour";

interface VRConsoleTourProps {
  universityName: string;
  latitude?: number | null;
  longitude?: number | null;
  landmarks: Landmark[];
  initialIndex?: number;
  onClose?: () => void;
}

export default function VRConsoleTour({
  universityName,
  latitude = 39.9,
  longitude = 116.4,
  landmarks,
  initialIndex = 0,
  onClose,
}: VRConsoleTourProps) {
  const withImages = landmarks.filter((l) => l.image_url);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [yaw, setYaw] = useState(0); // 0 to 360 degrees
  const [pitch, setPitch] = useState(0); // -35 to 35 degrees
  const [zoom, setZoom] = useState(1);
  const [isWalking, setIsWalking] = useState(false);
  const [walkSteps, setWalkSteps] = useState(0);
  const [stereoMode, setStereoMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [guideVoiceEnabled, setGuideVoiceEnabled] = useState(false);
  const [guideSpeechText, setGuideSpeechText] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startYaw: number; startPitch: number }>({
    x: 0,
    y: 0,
    startYaw: 0,
    startPitch: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const current = withImages[currentIndex % (withImages.length || 1)] || null;

  // Synthesize realistic soft walking footstep sound using Web Audio API
  const playFootstepSound = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(90, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {}
  }, [soundEnabled]);

  // AI Tour Guide audio speech synthesis
  const speakGuide = useCallback(
    (text: string) => {
      if (!guideVoiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window))
        return;
      window.speechSynthesis.cancel();
      const clean = text.replace(/\([^)]*\)/g, ""); // remove bracketed Chinese characters for speech
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    },
    [guideVoiceEnabled]
  );

  // Trigger tour guide speech on landmark change
  useEffect(() => {
    if (!current) return;
    const msg = `Now entering ${current.name}. ${current.description || ""}`;
    setGuideSpeechText(current.description || current.name);
    if (guideVoiceEnabled) {
      speakGuide(msg);
    }
  }, [current, guideVoiceEnabled, speakGuide]);

  // Keyboard navigation (WASD / Arrows)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "w" || e.key === "ArrowUp") {
        walkForward();
      } else if (e.key === "s" || e.key === "ArrowDown") {
        walkBackward();
      } else if (e.key === "a" || e.key === "ArrowLeft") {
        turn(-15);
      } else if (e.key === "d" || e.key === "ArrowRight") {
        turn(15);
      } else if (e.key === "Escape" && onClose) {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Walk forward simulation
  const walkForward = () => {
    setIsWalking(true);
    setWalkSteps((s) => s + 1);
    playFootstepSound();
    setZoom((z) => Math.min(1.35, z + 0.05));
    setTimeout(() => setIsWalking(false), 300);
  };

  // Walk backward simulation
  const walkBackward = () => {
    setIsWalking(true);
    setWalkSteps((s) => s + 1);
    playFootstepSound();
    setZoom((z) => Math.max(0.9, z - 0.05));
    setTimeout(() => setIsWalking(false), 300);
  };

  // Turn yaw
  const turn = (deltaYaw: number) => {
    setYaw((y) => (y + deltaYaw + 360) % 360);
  };

  // Teleport to next / previous spot
  const teleportTo = (idx: number) => {
    setIsWalking(true);
    playFootstepSound();
    setZoom(1);
    setCurrentIndex(idx);
    setYaw((y) => (y + 45) % 360);
    setTimeout(() => setIsWalking(false), 400);
  };

  // Mouse / Touch drag handling for 360 look around
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startYaw: yaw,
      startPitch: pitch,
    };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const newYaw = (dragStartRef.current.startYaw - dx * 0.25 + 360) % 360;
    const newPitch = Math.max(-30, Math.min(30, dragStartRef.current.startPitch + dy * 0.2));
    setYaw(newYaw);
    setPitch(newPitch);
  };

  const onMouseUp = () => setIsDragging(false);

  // Touch handlers for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        startYaw: yaw,
        startPitch: pitch,
      };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    const newYaw = (dragStartRef.current.startYaw - dx * 0.35 + 360) % 360;
    const newPitch = Math.max(-30, Math.min(30, dragStartRef.current.startPitch + dy * 0.25));
    setYaw(newYaw);
    setPitch(newPitch);
  };

  const onTouchEnd = () => setIsDragging(false);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Compass heading label
  const getCompassHeading = (deg: number) => {
    const d = Math.round(deg) % 360;
    if (d >= 337 || d < 23) return "N";
    if (d >= 23 && d < 68) return "NE";
    if (d >= 68 && d < 113) return "E";
    if (d >= 113 && d < 158) return "SE";
    if (d >= 158 && d < 203) return "S";
    if (d >= 203 && d < 248) return "SW";
    if (d >= 248 && d < 293) return "W";
    return "NW";
  };

  // Walking headbob calculation
  const headBobOffset = isWalking ? Math.sin(walkSteps * 3) * 6 : 0;

  // Single Eye Viewport Render
  const renderEyeViewport = (isLeftEye = true) => (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      {/* 3D Panorama Scene Layer */}
      <div
        className="absolute inset-0 transition-transform duration-100 ease-out flex items-center justify-center"
        style={{
          transform: `translateY(${headBobOffset}px) scale(${zoom}) perspective(900px) rotateX(${pitch}deg) rotateY(${
            (yaw % 60) - 30 + (isLeftEye ? -1 : 1)
          }deg)`,
          transformOrigin: "center center",
        }}
      >
        {current?.image_url ? (
          <img
            src={current.image_url}
            alt={current.name}
            className="w-[140%] h-[140%] max-w-none object-cover transition-opacity duration-300"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-text-muted">
            No image available
          </div>
        )}
      </div>

      {/* Realistic Curved Lens Optical Vignette / Scanline Shader */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.65) 90%, rgba(0, 0, 0, 0.95) 100%)",
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#059669_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-10" />

      {/* In-World Spatial Landmark Waypoint Beacons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {withImages.map((lm, i) => {
          if (i === currentIndex) return null;
          // compute angular difference
          const targetAngle = (i * (360 / withImages.length)) % 360;
          let diff = (targetAngle - yaw + 540) % 360 - 180;
          if (Math.abs(diff) > 50) return null; // out of view field

          const xOffset = (diff / 50) * 42; // percent across screen
          const distanceEst = 35 + ((i * 37) % 180);

          return (
            <motion.div
              key={lm.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                left: `${50 + xOffset}%`,
                top: "46%",
              }}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
              onClick={() => teleportTo(i)}
            >
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-cyan/20 border-2 border-cyan backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-bounce group-hover:scale-125 transition-transform">
                  <MapPin className="w-4 h-4 text-cyan" />
                </div>
                <div className="mt-1 px-2.5 py-1 rounded-xl bg-slate-950/85 border border-cyan/40 text-[11px] font-bold text-white shadow-xl whitespace-nowrap flex items-center gap-1 group-hover:border-cyan">
                  <span>{lm.name.slice(0, 18)}</span>
                  <span className="text-[10px] text-cyan font-mono">• {distanceEst}m</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Holographic Center Reticle & Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-8 h-8 flex items-center justify-center opacity-60">
          <div className="w-2.5 h-2.5 rounded-full border border-cyan/70" />
          <div className="absolute top-0 w-0.5 h-1.5 bg-cyan/60" />
          <div className="absolute bottom-0 w-0.5 h-1.5 bg-cyan/60" />
          <div className="absolute left-0 w-1.5 h-0.5 bg-cyan/60" />
          <div className="absolute right-0 w-1.5 h-0.5 bg-cyan/60" />
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden bg-slate-950 text-white font-sans select-none border border-cyan/30 shadow-2xl shadow-cyan/20 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none h-screen" : "h-[540px] sm:h-[620px]"
      }`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Stereo Dual-Lens or Single-Lens Display */}
      {stereoMode ? (
        <div className="grid grid-cols-2 h-full w-full divide-x-4 divide-black">
          <div className="relative h-full overflow-hidden">{renderEyeViewport(true)}</div>
          <div className="relative h-full overflow-hidden">{renderEyeViewport(false)}</div>
        </div>
      ) : (
        <div className="relative h-full w-full">{renderEyeViewport(true)}</div>
      )}

      {/* ── VR CONSOLE HUD OVERLAY (Non-Intrusive, Highly Immersive) ── */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 z-30">
        {/* Top HUD Bar */}
        <div className="flex items-center justify-between pointer-events-auto">
          {/* Status Telemetry */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono font-bold text-cyan tracking-wider">VR CONSOLE 3.0</span>
            <span className="text-white/40 hidden sm:inline">|</span>
            <span className="font-mono text-[11px] text-white/80 hidden sm:inline">
              {latitude ? latitude.toFixed(2) : "39.90"}°N, {longitude ? longitude.toFixed(2) : "116.40"}°E
            </span>
            <span className="text-white/40 hidden sm:inline">|</span>
            <span className="font-mono text-[11px] text-emerald-400">60 FPS</span>
          </div>

          {/* 360 Degree Rotating Compass Tape */}
          <div className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan/30 text-xs font-mono">
            <Compass className="w-4 h-4 text-cyan animate-spin [animation-duration:12s]" />
            <span className="text-cyan font-bold">{Math.round(yaw)}°</span>
            <span className="px-1.5 py-0.5 rounded bg-cyan/20 text-cyan font-bold">
              {getCompassHeading(yaw)}
            </span>
          </div>

          {/* Quick Controls Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStereoMode(!stereoMode)}
              className={`p-2 rounded-xl backdrop-blur-md border transition-all text-xs font-bold flex items-center gap-1 cursor-pointer ${
                stereoMode
                  ? "bg-cyan text-slate-950 border-cyan shadow-lg shadow-cyan/30"
                  : "bg-slate-950/80 text-white/80 border-white/20 hover:text-cyan"
              }`}
              title="Toggle Stereo Dual-Lens VR (Cardboard mode)"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">VR Split</span>
            </button>

            <button
              onClick={() => setGuideVoiceEnabled(!guideVoiceEnabled)}
              className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                guideVoiceEnabled
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30"
                  : "bg-slate-950/80 text-white/80 border-white/20 hover:text-emerald-400"
              }`}
              title="Toggle AI Voice Tour Guide"
            >
              {guideVoiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/20 text-white/80 hover:text-cyan transition-all cursor-pointer"
              title="Footstep Sound FX"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/20 text-white/80 hover:text-cyan transition-all cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/20 text-white/80 hover:text-red-400 transition-all cursor-pointer"
                title="Exit VR Tour"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Center Hint Notification on Drag or Walk */}
        <AnimatePresence>
          {isWalking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="self-center px-4 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan/40 text-xs text-cyan font-bold flex items-center gap-2 pointer-events-none shadow-lg shadow-cyan/20"
            >
              <Footprints className="w-3.5 h-3.5 animate-bounce" />
              <span>Step {walkSteps} • Walking through Campus</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom HUD: Landmark Info, AI Speech Subtitles, Movement Controls */}
        <div className="flex flex-col sm:flex-row items-end justify-between gap-4 pointer-events-auto">
          {/* Landmark Information Card & AI Narration Subtitles */}
          <div className="max-w-xl w-full p-4 sm:p-5 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-cyan/30 shadow-2xl">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase font-bold text-cyan tracking-wider flex items-center gap-1.5">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                Spot {(currentIndex % withImages.length) + 1} of {withImages.length} • {universityName}
              </span>
              <span className="text-[11px] text-white/60 font-mono">
                Heading {Math.round(yaw)}° {getCompassHeading(yaw)}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-white mb-1 tracking-tight">
              {current?.name}
            </h3>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed line-clamp-2 sm:line-clamp-3">
              {current?.description}
            </p>

            {guideVoiceEnabled && (
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-emerald-400">
                <Mic className="w-3.5 h-3.5 animate-pulse flex-shrink-0" />
                <span className="truncate italic">AI Guide: "{guideSpeechText.slice(0, 75)}..."</span>
              </div>
            )}
          </div>

          {/* Physical Virtual Walk & D-Pad Controls */}
          <div className="flex items-center gap-3">
            {/* Walk Forward / Backward */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={walkForward}
                className="px-4 py-2.5 rounded-xl bg-cyan/20 hover:bg-cyan/30 text-cyan border border-cyan/40 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan/20 active:scale-95 transition-all cursor-pointer"
                title="Walk Forward (W or Up Arrow)"
              >
                <Footprints className="w-4 h-4" />
                <span>Walk (W)</span>
              </button>
              <button
                onClick={walkBackward}
                className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-white/10 text-white/80 border border-white/20 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                title="Step Back (S or Down Arrow)"
              >
                <span>Back (S)</span>
              </button>
            </div>

            {/* Turn Camera Left / Right */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => turn(-30)}
                className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-white/10 text-white/80 border border-white/20 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                title="Turn Left (A or Left Arrow)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => turn(30)}
                className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-white/10 text-white/80 border border-white/20 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                title="Turn Right (D or Right Arrow)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Teleport Next Spot */}
            <button
              onClick={() => teleportTo((currentIndex + 1) % withImages.length)}
              className="px-3.5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-lg shadow-emerald-500/30 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              title="Teleport to next landmark"
            >
              <span>Next Spot</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Help Modal Overlay */}
      {showHelp && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl z-40 flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-6 max-w-md w-full border border-cyan/40">
            <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan" /> 3D VR Console Walk Guide
            </h4>
            <div className="space-y-2.5 text-xs text-text-secondary leading-relaxed">
              <p>• <strong>Click & Drag / Swipe:</strong> Look around 360° freely in the 3D space.</p>
              <p>• <strong>WASD / Arrow Keys:</strong> Walk forward, step back, and turn.</p>
              <p>• <strong>Spatial Hotspots:</strong> Click floating waypoint pins in the distance to walk there.</p>
              <p>• <strong>👓 VR Split Mode:</strong> Puts the display into Left/Right dual-lens mode for mobile VR headsets (Google Cardboard, etc.).</p>
              <p>• <strong>🎙️ AI Tour Guide:</strong> Speaks aloud historical background as you walk up to each spot.</p>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full btn-gradient py-2.5 rounded-xl text-xs font-bold"
            >
              Got it, let's explore!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
