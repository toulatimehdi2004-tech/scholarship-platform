export interface AirportOption {
  code: string;
  city: string;
  country: string;
  name: string;
  citySlug: string;
}

export const ORIGIN_AIRPORTS: AirportOption[] = [
  { code: "CMN", city: "Casablanca", country: "Maroc", name: "Aéroport Mohammed V (CMN)", citySlug: "casablanca" },
  { code: "RAK", city: "Marrakech", country: "Maroc", name: "Aéroport Menara (RAK)", citySlug: "marrakech" },
  { code: "RBA", city: "Rabat", country: "Maroc", name: "Aéroport Rabat-Salé (RBA)", citySlug: "rabat" },
  { code: "TNG", city: "Tanger", country: "Maroc", name: "Aéroport Ibn Battouta (TNG)", citySlug: "tangier" },
];

export const DEST_AIRPORTS: AirportOption[] = [
  { code: "PEK", city: "Pékin (Beijing)", country: "Chine", name: "Beijing Capital / Daxing (PEK/PKX)", citySlug: "beijing" },
  { code: "PVG", city: "Shanghai", country: "Chine", name: "Shanghai Pudong / Hongqiao (PVG/SHA)", citySlug: "shanghai" },
  { code: "CAN", city: "Guangzhou (Canton)", country: "Chine", name: "Guangzhou Baiyun (CAN)", citySlug: "guangzhou" },
  { code: "TFU", city: "Chengdu", country: "Chine", name: "Chengdu Tianfu (TFU)", citySlug: "chengdu" },
  { code: "HGH", city: "Hangzhou", country: "Chine", name: "Hangzhou Xiaoshan (HGH)", citySlug: "hangzhou" },
  { code: "WUH", city: "Wuhan", country: "Chine", name: "Wuhan Tianhe (WUH)", citySlug: "wuhan" },
  { code: "XIY", city: "Xi'an", country: "Chine", name: "Xi'an Xianyang (XIY)", citySlug: "xian" },
  { code: "NKG", city: "Nanjing", country: "Chine", name: "Nanjing Lukou (NKG)", citySlug: "nanjing" },
  { code: "SZX", city: "Shenzhen", country: "Chine", name: "Shenzhen Bao'an (SZX)", citySlug: "shenzhen" },
];

export interface RealScheduledFlight {
  id: string;
  airline: string;
  airlineCode: string;
  airlineLogo: string;
  flightNumbers: string;
  hub: string;
  aircraft: string;
  standardDuration: string;
  layoverDuration: string;
  originCode: string;
  originCity: string;
  destCode: string;
  destCity: string;
  destAirportName: string;
  baggageAllowance: string;
  transitVisaRequired: boolean;
  transitVisaNote: string;
  studentPerk: string;
  operatingDays: string;
  airlineOfficialUrl: string;
  tag: "student_fav" | "fastest" | "baggage_pro" | "popular";
}

export const REAL_SCHEDULED_FLIGHTS: RealScheduledFlight[] = [
  // ── QATAR AIRWAYS ──
  {
    id: "qr-cmn-pek",
    airline: "Qatar Airways",
    airlineCode: "QR",
    airlineLogo: "🇶🇦",
    flightNumbers: "QR 1396 / QR 1400 ➔ QR 892",
    hub: "Doha (DOH - Hamad International)",
    aircraft: "Boeing 787-9 Dreamliner / Airbus A350-1000",
    standardDuration: "~16h 30m à 17h 15m",
    layoverDuration: "2h30 à 3h15 à Doha",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "PEK",
    destCity: "Pékin (Beijing)",
    destAirportName: "Beijing Daxing (PKX)",
    baggageAllowance: "2 x 23 kg en soute + 7 kg cabine",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa dans la zone internationale de Doha.",
    studentPerk: "Qatar Student Club : +10 kg gratuits (ou 3ème bagage), 10-20% de remise, Wifi haut débit offert.",
    operatingDays: "Vol Quotidien (7j/7)",
    airlineOfficialUrl: "https://www.qatarairways.com",
    tag: "student_fav",
  },
  {
    id: "qr-cmn-pvg",
    airline: "Qatar Airways",
    airlineCode: "QR",
    airlineLogo: "🇶🇦",
    flightNumbers: "QR 1396 / QR 1400 ➔ QR 870",
    hub: "Doha (DOH)",
    aircraft: "Boeing 777-300ER / Airbus A350",
    standardDuration: "~17h 10m",
    layoverDuration: "2h45 à Doha",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "PVG",
    destCity: "Shanghai",
    destAirportName: "Shanghai Pudong (PVG)",
    baggageAllowance: "2 x 23 kg en soute + 7 kg cabine",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa dans la zone internationale de Doha.",
    studentPerk: "Flexibilité date gratuite avec le statut étudiant.",
    operatingDays: "Vol Quotidien (7j/7)",
    airlineOfficialUrl: "https://www.qatarairways.com",
    tag: "student_fav",
  },
  {
    id: "qr-cmn-can",
    airline: "Qatar Airways",
    airlineCode: "QR",
    airlineLogo: "🇶🇦",
    flightNumbers: "QR 1396 ➔ QR 874",
    hub: "Doha (DOH)",
    aircraft: "Boeing 777-300ER",
    standardDuration: "~17h 30m",
    layoverDuration: "2h50 à Doha",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "CAN",
    destCity: "Guangzhou (Canton)",
    destAirportName: "Guangzhou Baiyun (CAN)",
    baggageAllowance: "2 x 23 kg en soute",
    transitVisaRequired: false,
    transitVisaNote: "Transit international sans visa à Doha.",
    studentPerk: "Franchise bagage élargie avec inscription Student Club.",
    operatingDays: "Tous les jours",
    airlineOfficialUrl: "https://www.qatarairways.com",
    tag: "popular",
  },

  // ── SAUDIA ──
  {
    id: "sv-cmn-pek",
    airline: "Saudia (Saudi Arabian Airlines)",
    airlineCode: "SV",
    airlineLogo: "🇸🇦",
    flightNumbers: "SV 373 / SV 375 ➔ SV 886",
    hub: "Djeddah (JED - King Abdulaziz Terminal 1)",
    aircraft: "Boeing 787-9 Dreamliner / Boeing 777-300",
    standardDuration: "~16h 50m à 17h 40m",
    layoverDuration: "2h50 à 3h45 à Djeddah",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "PEK",
    destCity: "Pékin (Beijing)",
    destAirportName: "Beijing Daxing (PKX)",
    baggageAllowance: "2 x 23 kg en soute GARANTIS d'office",
    transitVisaRequired: false,
    transitVisaNote: "Aucun visa requis pour transit international à l'aéroport de Djeddah.",
    studentPerk: "46 kg en soute d'office dans tous les billets économiques (parfait pour déménagement).",
    operatingDays: "4 à 6 vols par semaine",
    airlineOfficialUrl: "https://www.saudia.com",
    tag: "baggage_pro",
  },
  {
    id: "sv-cmn-can",
    airline: "Saudia",
    airlineCode: "SV",
    airlineLogo: "🇸🇦",
    flightNumbers: "SV 373 ➔ SV 884",
    hub: "Djeddah (JED)",
    aircraft: "Boeing 777-300ER",
    standardDuration: "~17h 45m",
    layoverDuration: "3h15 à Djeddah",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "CAN",
    destCity: "Guangzhou (Canton)",
    destAirportName: "Guangzhou Baiyun (CAN)",
    baggageAllowance: "2 x 23 kg en soute inclus",
    transitVisaRequired: false,
    transitVisaNote: "Transit international sans visa.",
    studentPerk: "Repas certifiés 100% Halal et grande franchise de bagages.",
    operatingDays: "5 vols par semaine",
    airlineOfficialUrl: "https://www.saudia.com",
    tag: "baggage_pro",
  },

  // ── TURKISH AIRLINES ──
  {
    id: "tk-cmn-pek",
    airline: "Turkish Airlines",
    airlineCode: "TK",
    airlineLogo: "🇹🇷",
    flightNumbers: "TK 618 / TK 620 ➔ TK 196",
    hub: "Istanbul (IST - Grand Aéroport d'Istanbul)",
    aircraft: "Airbus A350-900 / Boeing 777-300ER",
    standardDuration: "~15h 45m à 16h 20m",
    layoverDuration: "2h15 à 3h à Istanbul",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "PEK",
    destCity: "Pékin (Beijing)",
    destAirportName: "Beijing Capital (PEK)",
    baggageAllowance: "2 x 23 kg en soute + 8 kg cabine",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa en zone internationale à l'aéroport IST.",
    studentPerk: "Programme Miles&Smiles Student : 10-15% de rabais + 40 kg ou 2x23kg garantis.",
    operatingDays: "Vol Quotidien (7j/7)",
    airlineOfficialUrl: "https://www.turkishairlines.com",
    tag: "fastest",
  },
  {
    id: "tk-cmn-pvg",
    airline: "Turkish Airlines",
    airlineCode: "TK",
    airlineLogo: "🇹🇷",
    flightNumbers: "TK 618 ➔ TK 26",
    hub: "Istanbul (IST)",
    aircraft: "Boeing 777-300ER",
    standardDuration: "~16h 15m",
    layoverDuration: "2h30 à Istanbul",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "PVG",
    destCity: "Shanghai",
    destAirportName: "Shanghai Pudong (PVG)",
    baggageAllowance: "2 x 23 kg en soute + 8 kg cabine",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa à Istanbul.",
    studentPerk: "L'un des temps de vol total les plus courts pour Shanghai.",
    operatingDays: "Vol Quotidien",
    airlineOfficialUrl: "https://www.turkishairlines.com",
    tag: "fastest",
  },

  // ── EMIRATES ──
  {
    id: "ek-cmn-pek",
    airline: "Emirates",
    airlineCode: "EK",
    airlineLogo: "🇦🇪",
    flightNumbers: "EK 752 / EK 754 ➔ EK 306 / EK 308",
    hub: "Dubaï (DXB - Terminal 3)",
    aircraft: "Airbus A380-800 / Boeing 777-300ER",
    standardDuration: "~17h 25m",
    layoverDuration: "3h10 à Dubaï",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "PEK",
    destCity: "Pékin (Beijing)",
    destAirportName: "Beijing Capital (PEK)",
    baggageAllowance: "2 x 23 kg (ou 40 kg avec code promo étudiant)",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa en zone internationale de Dubaï.",
    studentPerk: "Offre Étudiant Emirates (Code STUDENT) : 10% de rabais + 10 kg de bagages supplémentaires offerts.",
    operatingDays: "Vol Quotidien",
    airlineOfficialUrl: "https://www.emirates.com",
    tag: "student_fav",
  },
  {
    id: "ek-cmn-pvg",
    airline: "Emirates",
    airlineCode: "EK",
    airlineLogo: "🇦🇪",
    flightNumbers: "EK 752 ➔ EK 302 / EK 304",
    hub: "Dubaï (DXB)",
    aircraft: "Airbus A380-800",
    standardDuration: "~17h 30m",
    layoverDuration: "3h00 à Dubaï",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "PVG",
    destCity: "Shanghai",
    destAirportName: "Shanghai Pudong (PVG)",
    baggageAllowance: "2 x 23 kg en soute",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa à Dubaï.",
    studentPerk: "Vol sur le géant des airs Airbus A380 avec grand confort.",
    operatingDays: "Vol Quotidien",
    airlineOfficialUrl: "https://www.emirates.com",
    tag: "popular",
  },

  // ── ETIHAD AIRWAYS ──
  {
    id: "ey-cmn-pek",
    airline: "Etihad Airways",
    airlineCode: "EY",
    airlineLogo: "🇦🇪",
    flightNumbers: "EY 614 ➔ EY 888",
    hub: "Abu Dhabi (AUH - Terminal Zayed International)",
    aircraft: "Boeing 787-9 Dreamliner",
    standardDuration: "~16h 40m",
    layoverDuration: "2h40 à Abu Dhabi",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "PEK",
    destCity: "Pékin (Beijing)",
    destAirportName: "Beijing Daxing (PKX)",
    baggageAllowance: "2 x 23 kg en soute",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa dans le nouveau terminal d'Abu Dhabi.",
    studentPerk: "Wifi à bord et correspondances très bien synchronisées.",
    operatingDays: "5 vols par semaine",
    airlineOfficialUrl: "https://www.etihad.com",
    tag: "popular",
  },
  {
    id: "ey-cmn-pvg",
    airline: "Etihad Airways",
    airlineCode: "EY",
    airlineLogo: "🇦🇪",
    flightNumbers: "EY 614 ➔ EY 862",
    hub: "Abu Dhabi (AUH)",
    aircraft: "Boeing 787-9 Dreamliner",
    standardDuration: "~17h 15m",
    layoverDuration: "2h35 à Abu Dhabi",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "PVG",
    destCity: "Shanghai",
    destAirportName: "Shanghai Pudong (PVG)",
    baggageAllowance: "2 x 23 kg en soute",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa à Abu Dhabi.",
    studentPerk: "Souvent parmi les options les plus compétitives sur Trip.com.",
    operatingDays: "5 vols par semaine",
    airlineOfficialUrl: "https://www.etihad.com",
    tag: "popular",
  },

  // ── EGYPTAIR ──
  {
    id: "ms-cmn-can",
    airline: "EgyptAir",
    airlineCode: "MS",
    airlineLogo: "🇪🇬",
    flightNumbers: "MS 848 ➔ MS 958",
    hub: "Le Caire (CAI - Terminal 3)",
    aircraft: "Boeing 777-300ER / Boeing 787",
    standardDuration: "~18h 30m",
    layoverDuration: "3h30 au Caire",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "CAN",
    destCity: "Guangzhou (Canton)",
    destAirportName: "Guangzhou Baiyun (CAN)",
    baggageAllowance: "2 x 23 kg en soute inclus",
    transitVisaRequired: false,
    transitVisaNote: "Transit international sans visa au Caire.",
    studentPerk: "Franchise 2 x 23 kg incluse dans tous les billets de base.",
    operatingDays: "4 vols par semaine",
    airlineOfficialUrl: "https://www.egyptair.com",
    tag: "baggage_pro",
  },
];

/**
 * Builds exact deep search link for Skyscanner with exact date.
 */
export function buildSkyscannerUrl(params: {
  originCode: string;
  destCode: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string;   // YYYY-MM-DD
  tripType?: "oneway" | "roundtrip";
}): string {
  const origin = (params.originCode || "cmn").toLowerCase();
  let dest = (params.destCode || "bjs").toLowerCase();
  if (dest === "pek" || dest === "pkx") dest = "bjs";
  if (dest === "pvg" || dest === "sha") dest = "sha";
  if (dest === "tfu") dest = "ctu";

  // Format date to YYMMDD for Skyscanner legacy path or query
  const depParts = params.departureDate.split("-");
  let formattedDep = "";
  if (depParts.length === 3) {
    formattedDep = `${depParts[0].slice(2)}${depParts[1]}${depParts[2]}`;
  }

  if (params.tripType === "roundtrip" && params.returnDate) {
    const retParts = params.returnDate.split("-");
    let formattedRet = "";
    if (retParts.length === 3) {
      formattedRet = `${retParts[0].slice(2)}${retParts[1]}${retParts[2]}`;
    }
    if (formattedDep && formattedRet) {
      return `https://www.skyscanner.net/transport/flights/${origin}/${dest}/${formattedDep}/${formattedRet}/?adultsv2=1&cabinclass=economy&childrenv2=&ref=scholar_china_student`;
    }
  }

  if (formattedDep) {
    return `https://www.skyscanner.net/transport/flights/${origin}/${dest}/${formattedDep}/?adultsv2=1&cabinclass=economy&childrenv2=&ref=scholar_china_student`;
  }

  return `https://www.skyscanner.net/transport/flights/${origin}/${dest}/?adultsv2=1&cabinclass=economy&childrenv2=&ref=scholar_china_student`;
}

/**
 * Builds exact deep search link for Trip.com with exact date.
 */
export function buildTripComUrl(params: {
  originCode: string;
  destCode: string;
  originCity?: string;
  destCity?: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string;   // YYYY-MM-DD
  tripType?: "oneway" | "roundtrip";
}): string {
  const origin = (params.originCode || "cmn").toLowerCase();
  let dest = (params.destCode || "bjs").toLowerCase();
  if (dest === "pek" || dest === "pkx") dest = "bjs";
  if (dest === "pvg" || dest === "sha") dest = "sha";
  if (dest === "tfu") dest = "ctu";

  const originSlug = (params.originCity || "casablanca").toLowerCase().replace(/[^a-z0-9]/g, "-");
  const destSlug = (params.destCity || "beijing").toLowerCase().replace(/[^a-z0-9]/g, "-");

  const isRoundTrip = params.tripType === "roundtrip" && !!params.returnDate;
  const tripTypeParam = isRoundTrip ? "&tripType=RT" : "&tripType=OW";
  const rdateParam = isRoundTrip ? `&rdate=${params.returnDate}` : "";

  return `https://www.trip.com/flights/${originSlug}-to-${destSlug}/tickets-${origin}-${dest}?dcity=${origin}&acity=${dest}&ddate=${params.departureDate}${rdateParam}${tripTypeParam}&class=y&quantity=1&ref=scholar_china_student`;
}
