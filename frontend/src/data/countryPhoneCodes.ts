export interface CountryPhone {
  code: string;        // ISO 2-letter (e.g. "MA")
  nameEn: string;      // English name (e.g. "Morocco")
  nameFr: string;      // French name (e.g. "Maroc")
  nameAr: string;      // Arabic name (e.g. "المغرب")
  dialCode: string;    // Dialing code (e.g. "+212")
  flag: string;        // Flag emoji (e.g. "🇲🇦")
  formatPlaceholder?: string; // Example number format (e.g. "6 12 34 56 78")
}

export const COUNTRY_PHONE_LIST: CountryPhone[] = [
  // North Africa & Priority Countries
  { code: "MA", nameEn: "Morocco", nameFr: "Maroc", nameAr: "المغرب", dialCode: "+212", flag: "🇲🇦", formatPlaceholder: "6 00 00 00 00" },
  { code: "DZ", nameEn: "Algeria", nameFr: "Algérie", nameAr: "الجزائر", dialCode: "+213", flag: "🇩🇿", formatPlaceholder: "5 00 00 00 00" },
  { code: "TN", nameEn: "Tunisia", nameFr: "Tunisie", nameAr: "تونس", dialCode: "+216", flag: "🇹🇳", formatPlaceholder: "20 000 000" },
  { code: "EG", nameEn: "Egypt", nameFr: "Égypte", nameAr: "مصر", dialCode: "+20", flag: "🇪🇬", formatPlaceholder: "10 0000 0000" },
  { code: "MR", nameEn: "Mauritania", nameFr: "Mauritanie", nameAr: "موريتانيا", dialCode: "+222", flag: "🇲🇷", formatPlaceholder: "45 00 00 00" },
  { code: "LY", nameEn: "Libya", nameFr: "Libye", nameAr: "ليبيا", dialCode: "+218", flag: "🇱🇾", formatPlaceholder: "91 000 0000" },
  { code: "SD", nameEn: "Sudan", nameFr: "Soudan", nameAr: "السودان", dialCode: "+249", flag: "🇸🇩", formatPlaceholder: "91 000 0000" },

  // China & Asia
  { code: "CN", nameEn: "China", nameFr: "Chine", nameAr: "الصين", dialCode: "+86", flag: "🇨🇳", formatPlaceholder: "138 0000 0000" },
  { code: "MY", nameEn: "Malaysia", nameFr: "Malaisie", nameAr: "ماليزيا", dialCode: "+60", flag: "🇲🇾", formatPlaceholder: "12 345 6789" },
  { code: "ID", nameEn: "Indonesia", nameFr: "Indonésie", nameAr: "إندونيسيا", dialCode: "+62", flag: "🇮🇩", formatPlaceholder: "812 3456 7890" },
  { code: "PK", nameEn: "Pakistan", nameFr: "Pakistan", nameAr: "باكستان", dialCode: "+92", flag: "🇵🇰", formatPlaceholder: "300 0000000" },
  { code: "IN", nameEn: "India", nameFr: "Inde", nameAr: "الهند", dialCode: "+91", flag: "🇮🇳", formatPlaceholder: "98765 43210" },
  { code: "BD", nameEn: "Bangladesh", nameFr: "Bangladesh", nameAr: "بنغلاديش", dialCode: "+880", flag: "🇧🇩", formatPlaceholder: "1700 000000" },
  { code: "KR", nameEn: "South Korea", nameFr: "Corée du Sud", nameAr: "كوريا الجنوبية", dialCode: "+82", flag: "🇰🇷", formatPlaceholder: "10 0000 0000" },
  { code: "JP", nameEn: "Japan", nameFr: "Japon", nameAr: "اليابان", dialCode: "+81", flag: "🇯🇵", formatPlaceholder: "90 0000 0000" },

  // Sub-Saharan Africa
  { code: "SN", nameEn: "Senegal", nameFr: "Sénégal", nameAr: "السنغال", dialCode: "+221", flag: "🇸🇳", formatPlaceholder: "77 000 00 00" },
  { code: "CI", nameEn: "Ivory Coast", nameFr: "Côte d'Ivoire", nameAr: "ساحل العاج", dialCode: "+225", flag: "🇨🇮", formatPlaceholder: "07 00 00 00 00" },
  { code: "CM", nameEn: "Cameroon", nameFr: "Cameroun", nameAr: "الكاميرون", dialCode: "+237", flag: "🇨🇲", formatPlaceholder: "6 00 00 00 00" },
  { code: "ML", nameEn: "Mali", nameFr: "Mali", nameAr: "مالي", dialCode: "+223", flag: "🇲🇱", formatPlaceholder: "70 00 00 00" },
  { code: "GN", nameEn: "Guinea", nameFr: "Guinée", nameAr: "غينيا", dialCode: "+224", flag: "🇬🇳", formatPlaceholder: "620 00 00 00" },
  { code: "GA", nameEn: "Gabon", nameFr: "Gabon", nameAr: "الغابون", dialCode: "+241", flag: "🇬🇦", formatPlaceholder: "06 00 00 00" },
  { code: "CG", nameEn: "Congo", nameFr: "Congo", nameAr: "الكونغو", dialCode: "+242", flag: "🇨🇬", formatPlaceholder: "06 000 0000" },
  { code: "CD", nameEn: "DR Congo", nameFr: "RD Congo", nameAr: "الكونغو الديمقراطية", dialCode: "+243", flag: "🇨🇩", formatPlaceholder: "81 000 0000" },
  { code: "NG", nameEn: "Nigeria", nameFr: "Nigéria", nameAr: "نيجيريا", dialCode: "+234", flag: "🇳🇬", formatPlaceholder: "803 000 0000" },
  { code: "GH", nameEn: "Ghana", nameFr: "Ghana", nameAr: "غانا", dialCode: "+233", flag: "🇬🇭", formatPlaceholder: "24 000 0000" },
  { code: "BF", nameEn: "Burkina Faso", nameFr: "Burkina Faso", nameAr: "بوركينا فاسو", dialCode: "+226", flag: "🇧🇫", formatPlaceholder: "70 00 00 00" },
  { code: "NE", nameEn: "Niger", nameFr: "Niger", nameAr: "النيجر", dialCode: "+227", flag: "🇳🇪", formatPlaceholder: "90 00 00 00" },
  { code: "TG", nameEn: "Togo", nameFr: "Togo", nameAr: "توغو", dialCode: "+228", flag: "🇹🇬", formatPlaceholder: "90 00 00 00" },
  { code: "BJ", nameEn: "Benin", nameFr: "Bénin", nameAr: "بنين", dialCode: "+229", flag: "🇧🇯", formatPlaceholder: "90 00 00 00" },
  { code: "TD", nameEn: "Chad", nameFr: "Tchad", nameAr: "تشاد", dialCode: "+235", flag: "🇹🇩", formatPlaceholder: "66 00 00 00" },
  { code: "RW", nameEn: "Rwanda", nameFr: "Rwanda", nameAr: "رواندا", dialCode: "+250", flag: "🇷🇼", formatPlaceholder: "780 000 000" },
  { code: "MG", nameEn: "Madagascar", nameFr: "Madagascar", nameAr: "مدغشقر", dialCode: "+261", flag: "🇲🇬", formatPlaceholder: "34 00 000 00" },

  // Middle East & Gulf
  { code: "SA", nameEn: "Saudi Arabia", nameFr: "Arabie Saoudite", nameAr: "المملكة العربية السعودية", dialCode: "+966", flag: "🇸🇦", formatPlaceholder: "50 000 0000" },
  { code: "AE", nameEn: "United Arab Emirates", nameFr: "Émirats Arabes Unis", nameAr: "الإمارات العربية المتحدة", dialCode: "+971", flag: "🇦🇪", formatPlaceholder: "50 000 0000" },
  { code: "QA", nameEn: "Qatar", nameFr: "Qatar", nameAr: "قطر", dialCode: "+974", flag: "🇶🇦", formatPlaceholder: "3300 0000" },
  { code: "KW", nameEn: "Kuwait", nameFr: "Koweït", nameAr: "الكويت", dialCode: "+965", flag: "🇰🇼", formatPlaceholder: "5000 0000" },
  { code: "BH", nameEn: "Bahrain", nameFr: "Bahreïn", nameAr: "البحرين", dialCode: "+973", flag: "🇧🇭", formatPlaceholder: "3600 0000" },
  { code: "OM", nameEn: "Oman", nameFr: "Oman", nameAr: "عمان", dialCode: "+968", flag: "🇴🇲", formatPlaceholder: "9100 0000" },
  { code: "JO", nameEn: "Jordan", nameFr: "Jordanie", nameAr: "الأردن", dialCode: "+962", flag: "🇯🇴", formatPlaceholder: "7 9000 0000" },
  { code: "LB", nameEn: "Lebanon", nameFr: "Liban", nameAr: "لبنان", dialCode: "+961", flag: "🇱🇧", formatPlaceholder: "70 000 000" },
  { code: "IQ", nameEn: "Iraq", nameFr: "Irak", nameAr: "العراق", dialCode: "+964", flag: "🇮🇶", formatPlaceholder: "790 000 0000" },
  { code: "YE", nameEn: "Yemen", nameFr: "Yémen", nameAr: "اليمن", dialCode: "+967", flag: "🇾🇪", formatPlaceholder: "770 000 000" },
  { code: "SY", nameEn: "Syria", nameFr: "Syrie", nameAr: "سوريا", dialCode: "+963", flag: "🇸🇾", formatPlaceholder: "933 000 000" },
  { code: "PS", nameEn: "Palestine", nameFr: "Palestine", nameAr: "فلسطين", dialCode: "+970", flag: "🇵🇸", formatPlaceholder: "59 000 0000" },
  { code: "TR", nameEn: "Turkey", nameFr: "Turquie", nameAr: "تركيا", dialCode: "+90", flag: "🇹🇷", formatPlaceholder: "500 000 0000" },

  // Europe & Americas
  { code: "FR", nameEn: "France", nameFr: "France", nameAr: "فرنسا", dialCode: "+33", flag: "🇫🇷", formatPlaceholder: "6 00 00 00 00" },
  { code: "ES", nameEn: "Spain", nameFr: "Espagne", nameAr: "إسبانيا", dialCode: "+34", flag: "🇪🇸", formatPlaceholder: "600 000 000" },
  { code: "BE", nameEn: "Belgium", nameFr: "Belgique", nameAr: "بلجيكا", dialCode: "+32", flag: "🇧🇪", formatPlaceholder: "470 00 00 00" },
  { code: "IT", nameEn: "Italy", nameFr: "Italie", nameAr: "إيطاليا", dialCode: "+39", flag: "🇮🇹", formatPlaceholder: "320 000 0000" },
  { code: "DE", nameEn: "Germany", nameFr: "Allemagne", nameAr: "ألمانيا", dialCode: "+49", flag: "🇩🇪", formatPlaceholder: "151 0000000" },
  { code: "GB", nameEn: "United Kingdom", nameFr: "Royaume-Uni", nameAr: "المملكة المتحدة", dialCode: "+44", flag: "🇬🇧", formatPlaceholder: "7911 123456" },
  { code: "US", nameEn: "United States", nameFr: "États-Unis", nameAr: "الولايات المتحدة", dialCode: "+1", flag: "🇺🇸", formatPlaceholder: "(555) 000-0000" },
  { code: "CA", nameEn: "Canada", nameFr: "Canada", nameAr: "كندا", dialCode: "+1", flag: "🇨🇦", formatPlaceholder: "(555) 000-0000" },
  { code: "CH", nameEn: "Switzerland", nameFr: "Suisse", nameAr: "سويسرا", dialCode: "+41", flag: "🇨🇭", formatPlaceholder: "78 000 00 00" },
  { code: "NL", nameEn: "Netherlands", nameFr: "Pays-Bas", nameAr: "هولندا", dialCode: "+31", flag: "🇳🇱", formatPlaceholder: "6 12345678" },
  { code: "RU", nameEn: "Russia", nameFr: "Russie", nameAr: "روسيا", dialCode: "+7", flag: "🇷🇺", formatPlaceholder: "900 000-00-00" },
  { code: "BR", nameEn: "Brazil", nameFr: "Brésil", nameAr: "البرازيل", dialCode: "+55", flag: "🇧🇷", formatPlaceholder: "11 90000-0000" },
  { code: "AU", nameEn: "Australia", nameFr: "Australie", nameAr: "أستراليا", dialCode: "+61", flag: "🇦🇺", formatPlaceholder: "400 000 000" },
];

export const DEFAULT_COUNTRY = COUNTRY_PHONE_LIST[0]; // Morocco (+212)

/**
 * Searches the countries list by query (name in EN/FR/AR, dial code, or ISO code).
 */
export function searchCountries(query: string): CountryPhone[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return COUNTRY_PHONE_LIST;

  const codeQuery = clean.startsWith("+") ? clean : `+${clean}`;

  return COUNTRY_PHONE_LIST.filter((c) => {
    return (
      c.nameEn.toLowerCase().includes(clean) ||
      c.nameFr.toLowerCase().includes(clean) ||
      c.nameAr.toLowerCase().includes(clean) ||
      c.code.toLowerCase().includes(clean) ||
      c.dialCode.includes(clean) ||
      c.dialCode === codeQuery
    );
  });
}

/**
 * Parses an existing full phone string (e.g. "+212 661234567" or "+33612345678")
 * and extracts the matching CountryPhone object + the local number.
 */
export function parsePhoneAndCountry(fullPhone: string): {
  country: CountryPhone;
  localNumber: string;
} {
  const trimmed = fullPhone.trim();
  if (!trimmed) {
    return { country: DEFAULT_COUNTRY, localNumber: "" };
  }

  // Sort dial codes by length descending (e.g. +880 before +86, +212 before +20)
  const sorted = [...COUNTRY_PHONE_LIST].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  );

  for (const c of sorted) {
    if (trimmed.startsWith(c.dialCode)) {
      const local = trimmed.slice(c.dialCode.length).trim();
      return { country: c, localNumber: local };
    }
  }

  // Check if starts with 0 (Moroccan local default)
  if (/^0[567]/.test(trimmed)) {
    return { country: DEFAULT_COUNTRY, localNumber: trimmed.slice(1) };
  }

  return { country: DEFAULT_COUNTRY, localNumber: trimmed };
}
