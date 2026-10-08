"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n";
import TranslateButton from "@/components/TranslateButton";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  ExternalLink,
  Map,
  Footprints,
  ImageOff,
  Maximize2,
  X,
  Glasses,
  Sparkles,
} from "lucide-react";
import VRConsoleTour from "./VRConsoleTour";
import { getCampusImageUrl, getCampusFallback } from "@/lib/campusImages";

export interface Landmark {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  category?: string;
  order: number;
}

const DEFAULT_LANDMARKS: Landmark[] = [
  {
    id: 9901,
    name: "Main Campus Grand Gate (正门牌坊)",
    description: "Ceremonial arch gate welcoming international and domestic scholars with iconic campus calligraphy.",
    image_url: "/images/campus/gate-1.jpg",
    category: "gate",
    order: 1,
  },
  {
    id: 9902,
    name: "Central University Library (中央图书馆)",
    description: "Multi-floor research library with thousands of academic collections, digital resources and study commons.",
    image_url: "/images/campus/library-1.jpg",
    category: "academic",
    order: 2,
  },
  {
    id: 9903,
    name: "Scenic Lotus Lake & Garden Promenade (校园湖景)",
    description: "Serene campus water garden with lotus flowers, weeping willows, and quiet stone pathways.",
    image_url: "/images/campus/lake-1.jpg",
    category: "nature",
    order: 3,
  },
  {
    id: 9904,
    name: "Science & Technology Innovation Complex (科技实验大楼)",
    description: "State-of-the-art engineering laboratories and modern international research centres.",
    image_url: "/images/campus/tower-1.jpg",
    category: "academic",
    order: 4,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  academic: "tour.academic",
  gate: "tour.gate",
  nature: "tour.nature",
  life: "tour.life",
  dining: "tour.dining",
  sports: "tour.sports",
  culture: "tour.culture",
};

interface CampusTourProps {
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  tagline?: string;
  address?: string;
  landmarks: Landmark[];
}

export default function CampusTour({
  name,
  latitude,
  longitude,
  tagline,
  address,
  landmarks,
}: CampusTourProps) {
  const { t } = useLang();
  const effectiveLandmarks = (landmarks && landmarks.length > 0) ? landmarks : DEFAULT_LANDMARKS;
  const withImages = effectiveLandmarks.map((l, i) => ({
    ...l,
    image_url: getCampusImageUrl(l.image_url, l.category, i),
  }));
  const availableCats = Array.from(
    new Set(withImages.map((l) => l.category || "life"))
  );
  const [index, setIndex] = useState(0);
  const [cat, setCat] = useState("all");
  const [lightbox, setLightbox] = useState(false);
  const [mode, setMode] = useState<"tour" | "vr" | "map" | "street">("tour");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [imgError, setImgError] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);

  const filtered =
    cat === "all" ? withImages : withImages.filter((l) => (l.category || "life") === cat);

  const hasCoords =
    typeof latitude === "number" && typeof longitude === "number";
  const current = filtered.length > 0 ? filtered[index % filtered.length] : null;

  useEffect(() => {
    setImgError(false);
  }, [index, cat]);

  useEffect(() => {
    setIndex(0);
  }, [cat]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && lightbox) {
        setLightbox(false);
        return;
      }
      if (mode !== "tour" || filtered.length < 2) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function next() {
    setIndex((i) => (i + 1) % (filtered.length || 1));
  }
  function prev() {
    setIndex((i) => (i - 1 + (filtered.length || 1)) % (filtered.length || 1));
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * 6, y: px * 8 });
  }

  const mapEmbed = hasCoords
    ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&hl=en&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(name)}&z=16&hl=en&output=embed`;
  const streetEmbed = hasCoords
    ? `https://maps.google.com/maps?layer=c&cbll=${latitude},${longitude}&cbp=12,0,0,0,0&output=svembed`
    : null;
  const mapsLink = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;

  return (
    <div className="glass rounded-3xl overflow-hidden mb-8">
      {/* Header */}
      <div className="p-6 sm:p-8 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center">
              <Footprints className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                {t("tour.title")}
              </h2>
              <p className="text-sm text-text-muted">
                {tagline || t("tour.subtitle", { name })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {withImages.length > 0 && (
            <button
              onClick={() => setMode("tour")}
              className={
                "px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer " +
                (mode === "tour"
                  ? "bg-cyan/20 text-cyan border border-cyan/40"
                  : "text-text-muted hover:text-text-primary border border-transparent")
              }
            >
              <Footprints className="w-4 h-4" /> {t("tour.tour")}
            </button>
          )}
          {withImages.length > 0 && (
            <button
              onClick={() => setMode("vr")}
              className={
                "px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer " +
                (mode === "vr"
                  ? "bg-gradient-to-r from-emerald-500 to-cyan text-slate-950 shadow-lg shadow-cyan/30"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20")
              }
              title="Step into 3D Virtual Reality Walkthrough"
            >
              <Glasses className="w-4 h-4 text-current" />
              <span>{t("tour.vr") || "3D VR Console"}</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/40 text-emerald-300">
                3D
              </span>
            </button>
          )}
          <button
            onClick={() => setMode("map")}
            className={
              "px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 " +
              (mode === "map"
                ? "bg-cyan/20 text-cyan border border-cyan/40"
                : "text-text-muted hover:text-text-primary border border-transparent")
            }
          >
            <Map className="w-4 h-4" /> {t("tour.map")}
          </button>
          {streetEmbed && (
            <button
              onClick={() => setMode("street")}
              className={
                "px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 " +
                (mode === "street"
                  ? "bg-cyan/20 text-cyan border border-cyan/40"
                  : "text-text-muted hover:text-text-primary border border-transparent")
              }
            >
              <MapPin className="w-4 h-4" /> {t("tour.street")}
            </button>
          )}
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl text-sm font-medium text-purple hover:text-cyan transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" /> {t("tour.open")}
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8">
        {/* Interactive 3D VR Banner Invite */}
        {withImages.length > 0 && mode === "tour" && (
          <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-slate-900/50 border border-cyan/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-cyan/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/25">
                <Glasses className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>3D VR Console Tour Available</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Virtual Reality
                  </span>
                </h4>
                <p className="text-xs text-text-secondary">
                  Feel like you're wearing a VR console walking through {name}: 360° pan, footsteps sound FX, holographic waypoints & AI voice guide.
                </p>
              </div>
            </div>
            <button
              onClick={() => setMode("vr")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan hover:opacity-90 text-slate-950 font-bold text-xs flex items-center gap-1.5 flex-shrink-0 shadow-md shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
            >
              <Glasses className="w-4 h-4" />
              <span>Launch 3D VR Walk</span>
            </button>
          </div>
        )}

        {/* Category filter chips */}
        {mode === "tour" && withImages.length > 0 && availableCats.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setCat("all")}
              className={
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border " +
                (cat === "all"
                  ? "bg-cyan/20 text-cyan border-cyan/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                  : "text-text-muted border-border-glass hover:text-text-primary hover:border-white/25")
              }
            >
              All · {withImages.length}
            </button>
            {availableCats.map((c) => {
              const count = withImages.filter(
                (l) => (l.category || "life") === c
              ).length;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border " +
                    (cat === c
                      ? "bg-purple/20 text-purple border-purple/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                      : "text-text-muted border-border-glass hover:text-text-primary hover:border-white/25")
                  }
                >
                  {CATEGORY_LABELS[c] ? t(CATEGORY_LABELS[c]) : c} · {count}
                </button>
              );
            })}
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === "tour" && current && (
            <motion.div
              key="tour"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                ref={sceneRef}
                onMouseMove={onMouseMove}
                onMouseLeave={() => setTilt({ x: 0, y: 0 })}
                onClick={() => current.image_url && setLightbox(true)}
                className="relative rounded-2xl overflow-hidden mb-4 cursor-zoom-in"
                style={{ perspective: "1000px" }}
              >
                <motion.div
                  animate={{
                    rotateX: tilt.x,
                    rotateY: tilt.y,
                    scale: 1.03,
                  }}
                  transition={{ type: "spring", stiffness: 150, damping: 20 }}
                  className="relative aspect-[16/9] sm:aspect-[21/9] w-full"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={current.id}
                      src={current.image_url || getCampusFallback(current.category, index)}
                      alt={current.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getCampusFallback(current.category, index + 1);
                      }}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  </AnimatePresence>
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  {/* VR Mode Quick Launch Badge on Hero Image */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMode("vr");
                    }}
                    className="absolute top-4 right-4 z-10 px-3.5 py-1.5 rounded-full bg-slate-950/85 hover:bg-slate-900 backdrop-blur-md border border-cyan/50 text-cyan hover:text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="Launch 3D VR Walkthrough"
                  >
                    <Glasses className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enter 3D VR</span>
                  </button>

                  {/* Landmark info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-cyan/20 text-cyan border border-cyan/30">
                        {(index % (filtered.length || 1)) + 1} /{" "}
                        {filtered.length}
                      </span>
                      <span className="text-[11px] text-white/70 flex items-center gap-1">
                        <Maximize2 className="w-3 h-3" /> {t("tour.enlarge")}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-2xl font-bold text-white mb-1.5 drop-shadow-lg">
                      {current.name}
                    </h3>
                    <p className="text-sm text-white/85 max-w-3xl leading-relaxed line-clamp-3 sm:line-clamp-none">
                      {current.description}
                    </p>
                    <TranslateButton text={current.description} />
                  </div>
                </motion.div>

                {/* Arrows */}
                {filtered.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prev();
                      }}
                      aria-label="Previous landmark"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-cyan/30 hover:border-cyan/50 transition-all flex items-center justify-center z-10"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        next();
                      }}
                      aria-label="Next landmark"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-cyan/30 hover:border-cyan/50 transition-all flex items-center justify-center z-10"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {filtered.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                  {filtered.map((lm, i) => (
                    <button
                      key={lm.id}
                      onClick={() => setIndex(i % filtered.length)}
                      className={
                        "relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all " +
                        (i === index % filtered.length
                          ? "border-cyan shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105"
                          : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30")
                      }
                    >
                      <img
                        src={lm.image_url || getCampusFallback(lm.category, i)}
                        alt={lm.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getCampusFallback(lm.category, i);
                        }}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 text-[9px] text-white px-1 py-0.5 truncate">
                        {lm.name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {mode === "vr" && withImages.length > 0 && (
            <motion.div
              key="vr"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-3xl overflow-hidden"
            >
              <VRConsoleTour
                universityName={name}
                latitude={latitude}
                longitude={longitude}
                landmarks={withImages}
                initialIndex={index}
                onClose={() => setMode("tour")}
              />
            </motion.div>
          )}

          {mode === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl overflow-hidden border border-border-glass"
            >
              <iframe
                src={mapEmbed}
                title={`${name} campus map`}
                className="w-full h-[420px]"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          )}

          {mode === "street" && streetEmbed && (
            <motion.div
              key="street"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl overflow-hidden border border-border-glass relative"
            >
              <iframe
                src={streetEmbed}
                title={`${name} street view`}
                className="w-full h-[420px]"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full pointer-events-none">
                {t("tour.streetHint")}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Address footer */}
        {address && (
          <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
            <MapPin className="w-4 h-4 text-cyan flex-shrink-0" />
            <span>{address}</span>
          </div>
        )}
      </div>

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {lightbox && current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <button
              onClick={() => setLightbox(false)}
              aria-label="Close"
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all flex items-center justify-center z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.img
              key={current.id}
              src={current.image_url || getCampusFallback(current.category, index)}
              alt={current.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = getCampusFallback(current.category, index);
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[78vh] max-w-[92vw] object-contain rounded-xl shadow-2xl"
            />

            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-10 pb-5 px-6 text-center"
            >
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-cyan/20 text-cyan border border-cyan/30 mb-2">
                {(index % (filtered.length || 1)) + 1} / {filtered.length} ·{" "}
                {CATEGORY_LABELS[current.category || "life"]
                  ? t(CATEGORY_LABELS[current.category || "life"])
                  : current.category}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                {current.name}
              </h3>
              <p className="text-sm text-white/75 max-w-3xl mx-auto leading-relaxed line-clamp-2">
                {current.description}
              </p>
            </div>

            {filtered.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  aria-label="Previous"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-cyan/30 hover:border-cyan/50 transition-all flex items-center justify-center z-10"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  aria-label="Next"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-cyan/30 hover:border-cyan/50 transition-all flex items-center justify-center z-10"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
