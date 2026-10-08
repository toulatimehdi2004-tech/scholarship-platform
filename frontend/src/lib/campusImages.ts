/**
 * Centralized Campus Photography & Landmark Image Utility
 * Provides 100% reliable local image assets with automatic fallback support
 * for both Localhost and GitHub Pages (basePath: /scholarship-platform).
 */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const CAMPUS_IMAGES = {
  gate: [
    `${BASE_PATH}/images/campus/gate-1.jpg`,
    `${BASE_PATH}/images/campus/gate-2.jpg`,
  ],
  academic: [
    `${BASE_PATH}/images/campus/library-1.jpg`,
    `${BASE_PATH}/images/campus/library-2.jpg`,
    `${BASE_PATH}/images/campus/tower-1.jpg`,
    `${BASE_PATH}/images/campus/tower-2.jpg`,
    `${BASE_PATH}/images/campus/hall-1.jpg`,
  ],
  nature: [
    `${BASE_PATH}/images/campus/lake-1.jpg`,
    `${BASE_PATH}/images/campus/lake-2.jpg`,
    `${BASE_PATH}/images/campus/garden-1.jpg`,
  ],
  culture: [
    `${BASE_PATH}/images/campus/museum-1.jpg`,
    `${BASE_PATH}/images/campus/auditorium-1.jpg`,
  ],
  life: [
    `${BASE_PATH}/images/campus/life-1.jpg`,
    `${BASE_PATH}/images/campus/quad-1.jpg`,
    `${BASE_PATH}/images/campus/campus-1.jpg`,
    `${BASE_PATH}/images/campus/campus-2.jpg`,
  ],
  sports: [
    `${BASE_PATH}/images/campus/sports-1.jpg`,
  ],
  aerial: [
    `${BASE_PATH}/images/campus/aerial-1.jpg`,
  ],
};

const ALL_CAMPUS_IMAGES = [
  ...CAMPUS_IMAGES.gate,
  ...CAMPUS_IMAGES.academic,
  ...CAMPUS_IMAGES.nature,
  ...CAMPUS_IMAGES.culture,
  ...CAMPUS_IMAGES.life,
  ...CAMPUS_IMAGES.sports,
  ...CAMPUS_IMAGES.aerial,
];

/**
 * Returns a guaranteed working local fallback image path for a given category.
 */
export function getCampusFallback(category?: string | null, seed = 0): string {
  const cat = (category || "academic").toLowerCase();
  const list = (CAMPUS_IMAGES as Record<string, string[]>)[cat] || ALL_CAMPUS_IMAGES;
  const idx = Math.abs(seed) % list.length;
  return list[idx];
}

/**
 * Returns a deterministic, beautiful campus cover image for a university by ID.
 */
export function getUniversityCoverImage(universityId: number): string {
  const idx = Math.abs(universityId) % ALL_CAMPUS_IMAGES.length;
  return ALL_CAMPUS_IMAGES[idx];
}

/**
 * Resolves a landmark or university image URL.
 * - If the URL starts with /images/campus/, prepends BASE_PATH
 * - If the URL is empty, contains broken wikimedia thumbs, or is invalid, returns local fallback
 * - If the URL is a full http URL, returns it as-is (with fallback to be handled by onError)
 */
export function getCampusImageUrl(
  rawUrl?: string | null,
  category?: string | null,
  seed = 0
): string {
  if (!rawUrl || rawUrl.trim() === "") {
    return getCampusFallback(category, seed);
  }

  const url = rawUrl.trim();

  // If Wikimedia thumb URL (often 404s/rate-limited), prefer reliable local photo
  if (url.includes("upload.wikimedia.org") && url.includes("/thumb/")) {
    return getCampusFallback(category, seed);
  }

  // If local static path
  if (url.startsWith("/images/campus/")) {
    return `${BASE_PATH}${url}`;
  }

  if (url.startsWith("/")) {
    return `${BASE_PATH}${url}`;
  }

  return url;
}
