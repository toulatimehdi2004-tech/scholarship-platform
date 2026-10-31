export interface FlightOffer {
  id: string;
  airline: string;
  airlineCode: string;
  airlineLogo: string; // Emoji / Symbol
  originCity: string;
  originCode: string;
  destCity: string;
  destCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  layover: string;
  priceMad: number;
  priceUsd: number;
  priceRmb: number;
  baggage: string;
  studentPerk: string;
  provider: "trip" | "skyscanner" | "both";
  dealTag?: "cheapest" | "fastest" | "best_value" | "student_choice";
}

export interface AirportOption {
  code: string;
  city: string;
  country: string;
  name: string;
}

export const ORIGIN_AIRPORTS: AirportOption[] = [
  { code: "CMN", city: "Casablanca", country: "Maroc", name: "Aéroport Mohammed V (CMN)" },
  { code: "RAK", city: "Marrakech", country: "Maroc", name: "Aéroport Menara (RAK)" },
  { code: "RBA", city: "Rabat", country: "Maroc", name: "Aéroport Rabat-Salé (RBA)" },
  { code: "TNG", city: "Tanger", country: "Maroc", name: "Aéroport Ibn Battouta (TNG)" },
];

export const DEST_AIRPORTS: AirportOption[] = [
  { code: "PEK", city: "Pékin (Beijing)", country: "Chine", name: "Beijing Capital / Daxing (PEK/PKX)" },
  { code: "PVG", city: "Shanghai", country: "Chine", name: "Shanghai Pudong / Hongqiao (PVG/SHA)" },
  { code: "CAN", city: "Guangzhou (Canton)", country: "Chine", name: "Guangzhou Baiyun (CAN)" },
  { code: "TFU", city: "Chengdu", country: "Chine", name: "Chengdu Tianfu (TFU)" },
  { code: "HGH", city: "Hangzhou", country: "Chine", name: "Hangzhou Xiaoshan (HGH)" },
  { code: "WUH", city: "Wuhan", country: "Chine", name: "Wuhan Tianhe (WUH)" },
  { code: "XIY", city: "Xi'an", country: "Chine", name: "Xi'an Xianyang (XIY)" },
  { code: "NKG", city: "Nanjing", country: "Chine", name: "Nanjing Lukou (NKG)" },
];

export const REAL_STUDENT_FLIGHTS: FlightOffer[] = [
  // ── 1. CASABLANCA ➔ PÉKIN (BEIJING) ──
  {
    id: "cmn-pek-saudia",
    airline: "Saudia (Saudi Arabian Airlines)",
    airlineCode: "SV",
    airlineLogo: "🇸🇦",
    originCity: "Casablanca",
    originCode: "CMN",
    destCity: "Pékin (Beijing)",
    destCode: "PEK",
    departureTime: "14:15",
    arrivalTime: "14:30 (+1j)",
    duration: "17h 15m",
    stops: 1,
    layover: "1 escale à Djeddah (JED) • 3h10",
    priceMad: 4350,
    priceUsd: 435,
    priceRmb: 3150,
    baggage: "2 x 23 kg en soute + 7 kg cabine",
    studentPerk: "Bagage généreux 46 kg idéal pour installation universitaire",
    provider: "both",
    dealTag: "cheapest",
  },
  {
    id: "cmn-pek-etihad",
    airline: "Etihad Airways",
    airlineCode: "EY",
    airlineLogo: "🇦🇪",
    originCity: "Casablanca",
    originCode: "CMN",
    destCity: "Pékin (Beijing)",
    destCode: "PEK",
    departureTime: "10:30",
    arrivalTime: "09:45 (+1j)",
    duration: "16h 15m",
    stops: 1,
    layover: "1 escale à Abu Dhabi (AUH) • 2h30",
    priceMad: 4650,
    priceUsd: 465,
    priceRmb: 3370,
    baggage: "2 x 23 kg + 7 kg cabine",
    studentPerk: "Escale courte à Abu Dhabi & Wifi à bord",
    provider: "trip",
    dealTag: "best_value",
  },
  {
    id: "cmn-pek-qatar",
    airline: "Qatar Airways",
    airlineCode: "QR",
    airlineLogo: "🇶🇦",
    originCity: "Casablanca",
    originCode: "CMN",
    destCity: "Pékin (Beijing)",
    destCode: "PEK",
    departureTime: "14:40",
    arrivalTime: "14:50 (+1j)",
    duration: "17h 10m",
    stops: 1,
    layover: "1 escale à Doha (DOH) • 2h45",
    priceMad: 5200,
    priceUsd: 520,
    priceRmb: 3770,
    baggage: "2 x 23 kg + Carte Qatar Student Club (+10 kg gratuit)",
    studentPerk: "Qatar Student Club : Bagage supplémentaire + Wifi gratuit",
    provider: "both",
    dealTag: "student_choice",
  },
  {
    id: "cmn-pek-turkish",
    airline: "Turkish Airlines",
    airlineCode: "TK",
    airlineLogo: "🇹🇷",
    originCity: "Casablanca",
    originCode: "CMN",
    destCity: "Pékin (Beijing)",
    destCode: "PEK",
    departureTime: "16:45",
    arrivalTime: "15:35 (+1j)",
    duration: "15h 50m",
    stops: 1,
    layover: "1 escale à Istanbul (IST) • 2h15",
    priceMad: 5400,
    priceUsd: 540,
    priceRmb: 3910,
    baggage: "2 x 23 kg + 8 kg cabine",
    studentPerk: "Trajet le plus rapide avec repas chauds certifiés Halal",
    provider: "skyscanner",
    dealTag: "fastest",
  },

  // ── 2. CASABLANCA ➔ SHANGHAI (PVG) ──
  {
    id: "cmn-pvg-etihad",
    airline: "Etihad Airways",
    airlineCode: "EY",
    airlineLogo: "🇦🇪",
    originCity: "Casablanca",
    originCode: "CMN",
    destCity: "Shanghai",
    destCode: "PVG",
    departureTime: "10:30",
    arrivalTime: "10:50 (+1j)",
    duration: "17h 20m",
    stops: 1,
    layover: "1 escale à Abu Dhabi (AUH) • 2h40",
    priceMad: 4420,
    priceUsd: 442,
    priceRmb: 3200,
    baggage: "2 x 23 kg en soute",
    studentPerk: "Meilleur tarif Shanghai enregistré sur Trip.com",
    provider: "trip",
    dealTag: "cheapest",
  },
  {
    id: "cmn-pvg-saudia",
    airline: "Saudia",
    airlineCode: "SV",
    airlineLogo: "🇸🇦",
    originCity: "Casablanca",
    originCode: "CMN",
    destCity: "Shanghai",
    destCode: "PVG",
    departureTime: "15:20",
    arrivalTime: "15:10 (+1j)",
    duration: "16h 50m",
    stops: 1,
    layover: "1 escale à Djeddah (JED) • 2h55",
    priceMad: 4580,
    priceUsd: 458,
    priceRmb: 3320,
    baggage: "2 x 23 kg + 7 kg cabine",
    studentPerk: "Franchise 46 kg garantie pour étudiants",
    provider: "both",
    dealTag: "best_value",
  },
  {
    id: "cmn-pvg-emirates",
    airline: "Emirates",
    airlineCode: "EK",
    airlineLogo: "🇦🇪",
    originCity: "Casablanca",
    originCode: "CMN",
    destCity: "Shanghai",
    destCode: "PVG",
    departureTime: "15:05",
    arrivalTime: "15:30 (+1j)",
    duration: "17h 25m",
    stops: 1,
    layover: "1 escale à Dubaï (DXB) • 3h15",
    priceMad: 5600,
    priceUsd: 560,
    priceRmb: 4060,
    baggage: "2 x 23 kg (Offre Étudiant Emirates avec code promo)",
    studentPerk: "Réduction étudiant Emirates 10% + 10 kg supplémentaires",
    provider: "both",
    dealTag: "student_choice",
  },

  // ── 3. CASABLANCA ➔ GUANGZHOU (CAN) ──
  {
    id: "cmn-can-egyptair",
    airline: "EgyptAir",
    airlineCode: "MS",
    airlineLogo: "🇪🇬",
    originCity: "Casablanca",
    originCode: "CMN",
    destCity: "Guangzhou (Canton)",
    destCode: "CAN",
    departureTime: "13:30",
    arrivalTime: "15:15 (+1j)",
    duration: "18h 45m",
    stops: 1,
    layover: "1 escale au Caire (CAI) • 3h30",
    priceMad: 4190,
    priceUsd: 419,
    priceRmb: 3040,
    baggage: "2 x 23 kg en soute inclus",
    studentPerk: "Le billet le plus économique vers le sud de la Chine",
    provider: "skyscanner",
    dealTag: "cheapest",
  },
  {
    id: "cmn-can-saudia",
    airline: "Saudia",
    airlineCode: "SV",
    airlineLogo: "🇸🇦",
    originCity: "Casablanca",
    originCode: "CMN",
    destCity: "Guangzhou (Canton)",
    destCode: "CAN",
    departureTime: "14:15",
    arrivalTime: "16:00 (+1j)",
    duration: "18h 45m",
    stops: 1,
    layover: "1 escale à Djeddah (JED) • 3h45",
    priceMad: 4490,
    priceUsd: 449,
    priceRmb: 3250,
    baggage: "2 x 23 kg + 7 kg cabine",
    studentPerk: "Connexion directe fluide vers Baiyun International",
    provider: "both",
    dealTag: "best_value",
  },

  // ── 4. CASABLANCA ➔ CHENGDU (TFU) ──
  {
    id: "cmn-tfu-qatar",
    airline: "Qatar Airways",
    airlineCode: "QR",
    airlineLogo: "🇶🇦",
    originCity: "Casablanca",
    originCode: "CMN",
    destCity: "Chengdu",
    destCode: "TFU",
    departureTime: "14:40",
    arrivalTime: "14:55 (+1j)",
    duration: "17h 15m",
    stops: 1,
    layover: "1 escale à Doha (DOH) • 2h35",
    priceMad: 4890,
    priceUsd: 489,
    priceRmb: 3540,
    baggage: "2 x 23 kg (Extension Student Club)",
    studentPerk: "Liaison directe Doha-Tianfu très moderne",
    provider: "both",
    dealTag: "student_choice",
  },

  // ── 5. CASABLANCA ➔ WUHAN (WUH) / HANGZHOU (HGH) ──
  {
    id: "cmn-wuh-turkish",
    airline: "Turkish Airlines + China Southern",
    airlineCode: "TK-CZ",
    airlineLogo: "🇹🇷",
    originCity: "Casablanca",
    originCode: "CMN",
    destCity: "Wuhan",
    destCode: "WUH",
    departureTime: "16:45",
    arrivalTime: "17:30 (+1j)",
    duration: "17h 45m",
    stops: 1,
    layover: "1 escale à Istanbul (IST) • 3h10",
    priceMad: 4790,
    priceUsd: 479,
    priceRmb: 3470,
    baggage: "2 x 23 kg en soute",
    studentPerk: "Idéal pour universités de Wuhan & HUST",
    provider: "both",
    dealTag: "best_value",
  },
  {
    id: "cmn-hgh-etihad",
    airline: "Etihad Airways",
    airlineCode: "EY",
    airlineLogo: "🇦🇪",
    originCity: "Casablanca",
    originCode: "CMN",
    destCity: "Hangzhou",
    destCode: "HGH",
    departureTime: "10:30",
    arrivalTime: "11:15 (+1j)",
    duration: "17h 45m",
    stops: 1,
    layover: "1 escale à Abu Dhabi (AUH) • 2h50",
    priceMad: 4620,
    priceUsd: 462,
    priceRmb: 3350,
    baggage: "2 x 23 kg inclus",
    studentPerk: "Arrivée directe à Hangzhou (Zhejiang University)",
    provider: "trip",
    dealTag: "cheapest",
  },
];

/**
 * Generates an active, pre-filled search link on Skyscanner.
 */
export function buildSkyscannerUrl(params: {
  originCode: string;
  destCode: string;
  date?: string;
}): string {
  const origin = (params.originCode || "cmn").toLowerCase();
  let dest = (params.destCode || "bjs").toLowerCase();
  if (dest === "pek" || dest === "pkx") dest = "bjs"; // All Beijing airports
  if (dest === "pvg" || dest === "sha") dest = "sha"; // All Shanghai airports

  // Skyscanner format
  return `https://www.skyscanner.net/transport/flights/${origin}/${dest}/?adultsv2=1&cabinclass=economy&childrenv2=&ref=scholar_china_student`;
}

/**
 * Generates an active, pre-filled search link on Trip.com.
 */
export function buildTripComUrl(params: {
  originCode: string;
  destCode: string;
  originCity?: string;
  destCity?: string;
}): string {
  const origin = (params.originCode || "cmn").toLowerCase();
  const dest = (params.destCode || "bjs").toLowerCase();
  const originCitySlug = (params.originCity || "casablanca").toLowerCase().replace(/[^a-z0-9]/g, "-");
  const destCitySlug = (params.destCity || "beijing").toLowerCase().replace(/[^a-z0-9]/g, "-");

  return `https://www.trip.com/flights/${originCitySlug}-to-${destCitySlug}/tickets-${origin}-${dest}/?dcity=${origin}&acity=${dest}&ref=scholar_china_student`;
}
