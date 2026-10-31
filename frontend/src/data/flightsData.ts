export interface AirportOption {
  code: string;
  city: string;
  country: string;
  name: string;
  chineseName: string;
  citySlug: string;
  province?: string;
  isMultiAirport?: boolean;
  majorUniversities?: string;
}

export const ORIGIN_AIRPORTS: AirportOption[] = [
  { code: "CMN", city: "Casablanca", country: "Maroc", name: "Aéroport Mohammed V (CMN)", chineseName: "卡萨布兰卡", citySlug: "casablanca" },
  { code: "RAK", city: "Marrakech", country: "Maroc", name: "Aéroport Menara (RAK)", chineseName: "马拉喀什", citySlug: "marrakech" },
  { code: "RBA", city: "Rabat", country: "Maroc", name: "Aéroport Rabat-Salé (RBA)", chineseName: "拉巴特", citySlug: "rabat" },
  { code: "TNG", city: "Tanger", country: "Maroc", name: "Aéroport Ibn Battouta (TNG)", chineseName: "丹吉尔", citySlug: "tangier" },
];

export const DEST_AIRPORTS: AirportOption[] = [
  // ── 1. VILLES AVEC PLUSIEURS AÉROPORTS (MULTI-AIRPORTS) ──
  // CHENGDU (Tianfu TFU & Shuangliu CTU)
  {
    code: "TFU",
    city: "Chengdu (Tianfu)",
    country: "Chine",
    name: "Chengdu Tianfu International (TFU)",
    chineseName: "成都天府国际机场",
    citySlug: "chengdu",
    province: "Sichuan",
    isMultiAirport: true,
    majorUniversities: "Sichuan University, UESTC, Southwest Jiaotong",
  },
  {
    code: "CTU",
    city: "Chengdu (Shuangliu)",
    country: "Chine",
    name: "Chengdu Shuangliu International (CTU)",
    chineseName: "成都双流国际机场",
    citySlug: "chengdu",
    province: "Sichuan",
    isMultiAirport: true,
    majorUniversities: "Sichuan University, UESTC, Chengdu University of TCM",
  },

  // PÉKIN / BEIJING (Daxing PKX & Capital PEK)
  {
    code: "PKX",
    city: "Pékin (Daxing)",
    country: "Chine",
    name: "Beijing Daxing International (PKX)",
    chineseName: "北京大兴国际机场",
    citySlug: "beijing",
    province: "Beijing",
    isMultiAirport: true,
    majorUniversities: "Tsinghua, Peking Univ, Beihang, BIT, BLCU",
  },
  {
    code: "PEK",
    city: "Pékin (Capital)",
    country: "Chine",
    name: "Beijing Capital International (PEK)",
    chineseName: "北京首都国际机场",
    citySlug: "beijing",
    province: "Beijing",
    isMultiAirport: true,
    majorUniversities: "Tsinghua, Peking Univ, Beihang, Renmin Univ",
  },

  // SHANGHAI (Pudong PVG & Hongqiao SHA)
  {
    code: "PVG",
    city: "Shanghai (Pudong)",
    country: "Chine",
    name: "Shanghai Pudong International (PVG)",
    chineseName: "上海浦东国际机场",
    citySlug: "shanghai",
    province: "Shanghai",
    isMultiAirport: true,
    majorUniversities: "Fudan, Shanghai Jiao Tong (SJTU), Tongji, ECNU, SHU",
  },
  {
    code: "SHA",
    city: "Shanghai (Hongqiao)",
    country: "Chine",
    name: "Shanghai Hongqiao International (SHA)",
    chineseName: "上海虹桥国际机场",
    citySlug: "shanghai",
    province: "Shanghai",
    isMultiAirport: true,
    majorUniversities: "Fudan, SJTU, Tongji, ECNU, Shanghai University",
  },

  // ── 2. GRANDS HUBS INTERNATIONAUX ──
  {
    code: "CAN",
    city: "Guangzhou (Canton)",
    country: "Chine",
    name: "Guangzhou Baiyun International (CAN)",
    chineseName: "广州白云国际机场",
    citySlug: "guangzhou",
    province: "Guangdong",
    majorUniversities: "Sun Yat-sen Univ (SYSU), South China Univ of Tech (SCUT), Jinan Univ",
  },
  {
    code: "SZX",
    city: "Shenzhen",
    country: "Chine",
    name: "Shenzhen Bao'an International (SZX)",
    chineseName: "深圳宝安国际机场",
    citySlug: "shenzhen",
    province: "Guangdong",
    majorUniversities: "Shenzhen University, CUHK Shenzhen, SUSTech",
  },
  {
    code: "CKG",
    city: "Chongqing",
    country: "Chine",
    name: "Chongqing Jiangbei International (CKG)",
    chineseName: "重庆江北国际机场",
    citySlug: "chongqing",
    province: "Chongqing",
    majorUniversities: "Chongqing University, Southwest University",
  },
  {
    code: "WUH",
    city: "Wuhan",
    country: "Chine",
    name: "Wuhan Tianhe International (WUH)",
    chineseName: "武汉天河国际机场",
    citySlug: "wuhan",
    province: "Hubei",
    majorUniversities: "Wuhan University, Huazhong Univ of Science and Tech (HUST)",
  },
  {
    code: "HGH",
    city: "Hangzhou",
    country: "Chine",
    name: "Hangzhou Xiaoshan International (HGH)",
    chineseName: "杭州萧山国际机场",
    citySlug: "hangzhou",
    province: "Zhejiang",
    majorUniversities: "Zhejiang University (ZJU), Zhejiang Normal",
  },

  // ── 3. GRANDES VILLES UNIVERSITAIRES MAJEURES ──
  {
    code: "XIY",
    city: "Xi'an",
    country: "Chine",
    name: "Xi'an Xianyang International (XIY)",
    chineseName: "西安咸阳国际机场",
    citySlug: "xian",
    province: "Shaanxi",
    majorUniversities: "Xi'an Jiaotong (XJTU), Northwestern Polytechnical (NPU), Xidian",
  },
  {
    code: "NKG",
    city: "Nanjing",
    country: "Chine",
    name: "Nanjing Lukou International (NKG)",
    chineseName: "南京禄口国际机场",
    citySlug: "nanjing",
    province: "Jiangsu",
    majorUniversities: "Nanjing University (NJU), Southeast University (SEU), NJUST",
  },
  {
    code: "TSN",
    city: "Tianjin",
    country: "Chine",
    name: "Tianjin Binhai International (TSN)",
    chineseName: "天津滨海国际机场",
    citySlug: "tianjin",
    province: "Tianjin",
    majorUniversities: "Tianjin University (TJU), Nankai University",
  },
  {
    code: "HRB",
    city: "Harbin",
    country: "Chine",
    name: "Harbin Taiping International (HRB)",
    chineseName: "哈尔滨太平国际机场",
    citySlug: "harbin",
    province: "Heilongjiang",
    majorUniversities: "Harbin Institute of Technology (HIT), Harbin Engineering",
  },
  {
    code: "CSX",
    city: "Changsha",
    country: "Chine",
    name: "Changsha Huanghua International (CSX)",
    chineseName: "长沙黄花国际机场",
    citySlug: "changsha",
    province: "Hunan",
    majorUniversities: "Central South University (CSU), Hunan University",
  },
  {
    code: "XMN",
    city: "Xiamen",
    country: "Chine",
    name: "Xiamen Gaoqi International (XMN)",
    chineseName: "厦门高崎国际机场",
    citySlug: "xiamen",
    province: "Fujian",
    majorUniversities: "Xiamen University (XMU)",
  },
  {
    code: "TAO",
    city: "Qingdao",
    country: "Chine",
    name: "Qingdao Jiaodong International (TAO)",
    chineseName: "青岛胶东国际机场",
    citySlug: "qingdao",
    province: "Shandong",
    majorUniversities: "Ocean University of China (OUC), China Univ of Petroleum",
  },
  {
    code: "DLC",
    city: "Dalian",
    country: "Chine",
    name: "Dalian Zhoushuizi International (DLC)",
    chineseName: "大连周水子国际机场",
    citySlug: "dalian",
    province: "Liaoning",
    majorUniversities: "Dalian University of Technology (DUT), Dalian Maritime",
  },
  {
    code: "TNA",
    city: "Jinan",
    country: "Chine",
    name: "Jinan Yaoqiang International (TNA)",
    chineseName: "济南遥墙国际机场",
    citySlug: "jinan",
    province: "Shandong",
    majorUniversities: "Shandong University (SDU)",
  },
  {
    code: "SHE",
    city: "Shenyang",
    country: "Chine",
    name: "Shenyang Taoxian International (SHE)",
    chineseName: "沈阳桃仙国际机场",
    citySlug: "shenyang",
    province: "Liaoning",
    majorUniversities: "Northeastern University (NEU), China Medical University",
  },
  {
    code: "KMG",
    city: "Kunming",
    country: "Chine",
    name: "Kunming Changshui International (KMG)",
    chineseName: "昆明长水国际机场",
    citySlug: "kunming",
    province: "Yunnan",
    majorUniversities: "Yunnan University (YNU), Kunming Univ of Science and Tech",
  },
  {
    code: "CGO",
    city: "Zhengzhou",
    country: "Chine",
    name: "Zhengzhou Xinzheng International (CGO)",
    chineseName: "郑州新郑国际机场",
    citySlug: "zhengzhou",
    province: "Henan",
    majorUniversities: "Zhengzhou University (ZZU)",
  },
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
  // ── CHENGDU (TIANFU TFU & SHUANGLIU CTU) ──
  {
    id: "qr-cmn-tfu",
    airline: "Qatar Airways",
    airlineCode: "QR",
    airlineLogo: "🇶🇦",
    flightNumbers: "QR 1396 / QR 1400 ➔ QR 860",
    hub: "Doha (DOH - Hamad International)",
    aircraft: "Boeing 787-9 Dreamliner / Airbus A350-900",
    standardDuration: "~17h 15m",
    layoverDuration: "2h35 à Doha",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "TFU",
    destCity: "Chengdu (Tianfu)",
    destAirportName: "Chengdu Tianfu International (TFU)",
    baggageAllowance: "2 x 23 kg en soute (Franchise Étudiante)",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa dans le terminal de Doha.",
    studentPerk: "Qatar Student Club : +10 kg offerts & Wifi gratuit pour étudiants.",
    operatingDays: "4 à 6 vols par semaine",
    airlineOfficialUrl: "https://www.qatarairways.com",
    tag: "student_fav",
  },
  {
    id: "ca-3u-cmn-ctu",
    airline: "Sichuan Airlines / Air China Partner",
    airlineCode: "3U / CA",
    airlineLogo: "🇨🇳",
    flightNumbers: "Liaison via Hub International ➔ 3U 8000 series",
    hub: "Hub International Connecté",
    aircraft: "Airbus A330-300 / A350",
    standardDuration: "~18h 30m",
    layoverDuration: "Correspondance fluide",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "CTU",
    destCity: "Chengdu (Shuangliu)",
    destAirportName: "Chengdu Shuangliu International (CTU)",
    baggageAllowance: "2 x 23 kg en soute inclus",
    transitVisaRequired: false,
    transitVisaNote: "Arrivée directe à Shuangliu, très proche du centre-ville de Chengdu.",
    studentPerk: "Aéroport historique Shuangliu plus proche des campus de Sichuan University.",
    operatingDays: "Vols fréquents",
    airlineOfficialUrl: "https://www.sichuanair.com",
    tag: "popular",
  },

  // ── PÉKIN / BEIJING (DAXING PKX & CAPITAL PEK) ──
  {
    id: "sv-cmn-pkx",
    airline: "Saudia (Saudi Arabian Airlines)",
    airlineCode: "SV",
    airlineLogo: "🇸🇦",
    flightNumbers: "SV 373 / SV 375 ➔ SV 886",
    hub: "Djeddah (JED - King Abdulaziz Terminal 1)",
    aircraft: "Boeing 787-9 Dreamliner / Boeing 777-300ER",
    standardDuration: "~16h 50m",
    layoverDuration: "2h50 à 3h45 à Djeddah",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "PKX",
    destCity: "Pékin (Daxing)",
    destAirportName: "Beijing Daxing International (PKX)",
    baggageAllowance: "2 x 23 kg en soute GARANTIS (46 kg au total)",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa à l'aéroport de Djeddah.",
    studentPerk: "46 kg d'office dans tous les billets économiques (idéal pour déménagement).",
    operatingDays: "4 à 6 vols par semaine",
    airlineOfficialUrl: "https://www.saudia.com",
    tag: "baggage_pro",
  },
  {
    id: "qr-cmn-pkx",
    airline: "Qatar Airways",
    airlineCode: "QR",
    airlineLogo: "🇶🇦",
    flightNumbers: "QR 1396 / QR 1400 ➔ QR 892",
    hub: "Doha (DOH)",
    aircraft: "Airbus A350-1000 / Boeing 787-9",
    standardDuration: "~16h 45m",
    layoverDuration: "2h30 à 3h15 à Doha",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "PKX",
    destCity: "Pékin (Daxing)",
    destAirportName: "Beijing Daxing International (PKX)",
    baggageAllowance: "2 x 23 kg + Carte Student Club (+10 kg offerts)",
    transitVisaRequired: false,
    transitVisaNote: "Transit international sans visa à Doha.",
    studentPerk: "Arrivée au terminal futuriste de Daxing avec métro express direct.",
    operatingDays: "Vol Quotidien (7j/7)",
    airlineOfficialUrl: "https://www.qatarairways.com",
    tag: "student_fav",
  },
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
    destCity: "Pékin (Capital)",
    destAirportName: "Beijing Capital International (PEK)",
    baggageAllowance: "2 x 23 kg en soute + 8 kg cabine",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa en zone internationale à l'aéroport IST.",
    studentPerk: "Trajet le plus court vers Pékin avec repas chauds certifiés Halal.",
    operatingDays: "Vol Quotidien (7j/7)",
    airlineOfficialUrl: "https://www.turkishairlines.com",
    tag: "fastest",
  },
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
    destCity: "Pékin (Capital)",
    destAirportName: "Beijing Capital International (PEK)",
    baggageAllowance: "2 x 23 kg (ou 40 kg avec code étudiant)",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa en zone internationale de Dubaï.",
    studentPerk: "Code promo étudiant Emirates STUDENT : -10% + 10 kg supplémentaires.",
    operatingDays: "Vol Quotidien",
    airlineOfficialUrl: "https://www.emirates.com",
    tag: "popular",
  },

  // ── SHANGHAI (PUDONG PVG & HONGQIAO SHA) ──
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
    destCity: "Shanghai (Pudong)",
    destAirportName: "Shanghai Pudong International (PVG)",
    baggageAllowance: "2 x 23 kg en soute + 7 kg cabine",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa dans le terminal de Doha.",
    studentPerk: "Grand confort et flexibilité de date gratuite avec statut étudiant.",
    operatingDays: "Vol Quotidien (7j/7)",
    airlineOfficialUrl: "https://www.qatarairways.com",
    tag: "student_fav",
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
    destCity: "Shanghai (Pudong)",
    destAirportName: "Shanghai Pudong International (PVG)",
    baggageAllowance: "2 x 23 kg en soute + 8 kg cabine",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa à Istanbul.",
    studentPerk: "Temps de vol le plus rapide pour Shanghai.",
    operatingDays: "Vol Quotidien",
    airlineOfficialUrl: "https://www.turkishairlines.com",
    tag: "fastest",
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
    destCity: "Shanghai (Pudong)",
    destAirportName: "Shanghai Pudong International (PVG)",
    baggageAllowance: "2 x 23 kg en soute",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa à Abu Dhabi.",
    studentPerk: "Souvent parmi les options les plus compétitives sur Trip.com.",
    operatingDays: "5 vols par semaine",
    airlineOfficialUrl: "https://www.etihad.com",
    tag: "popular",
  },
  {
    id: "mu-cmn-sha",
    airline: "China Eastern Airlines / Partenaires",
    airlineCode: "MU",
    airlineLogo: "🇨🇳",
    flightNumbers: "Correspondance vers SHA Hongqiao",
    hub: "Hub International Connecté",
    aircraft: "Airbus A330 / A350",
    standardDuration: "~18h 00m",
    layoverDuration: "Escale internationale",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "SHA",
    destCity: "Shanghai (Hongqiao)",
    destAirportName: "Shanghai Hongqiao International (SHA)",
    baggageAllowance: "2 x 23 kg en soute",
    transitVisaRequired: false,
    transitVisaNote: "Aéroport connecté directement à la Gare TGV de Shanghai Hongqiao.",
    studentPerk: "Arrivée idéale si vous prenez le TGV vers Hangzhou, Suzhou ou Nanjing.",
    operatingDays: "Vols quotidiens",
    airlineOfficialUrl: "https://www.ceair.com",
    tag: "popular",
  },

  // ── GUANGZHOU (CANTON) ──
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
    destAirportName: "Guangzhou Baiyun International (CAN)",
    baggageAllowance: "2 x 23 kg en soute inclus",
    transitVisaRequired: false,
    transitVisaNote: "Transit international sans visa au Caire.",
    studentPerk: "Franchise 2 x 23 kg incluse dans tous les billets de base.",
    operatingDays: "4 vols par semaine",
    airlineOfficialUrl: "https://www.egyptair.com",
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
    destAirportName: "Guangzhou Baiyun International (CAN)",
    baggageAllowance: "2 x 23 kg en soute d'office (46 kg)",
    transitVisaRequired: false,
    transitVisaNote: "Transit international sans visa à Djeddah.",
    studentPerk: "Repas certifiés 100% Halal et grande franchise de bagages.",
    operatingDays: "5 vols par semaine",
    airlineOfficialUrl: "https://www.saudia.com",
    tag: "baggage_pro",
  },

  // ── CHONGQING (CKG) & WUHAN (WUH) & HANGZHOU (HGH) ──
  {
    id: "qr-cmn-ckg",
    airline: "Qatar Airways",
    airlineCode: "QR",
    airlineLogo: "🇶🇦",
    flightNumbers: "QR 1396 ➔ QR 880",
    hub: "Doha (DOH)",
    aircraft: "Airbus A350-900 / Boeing 787",
    standardDuration: "~17h 35m",
    layoverDuration: "2h40 à Doha",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "CKG",
    destCity: "Chongqing",
    destAirportName: "Chongqing Jiangbei International (CKG)",
    baggageAllowance: "2 x 23 kg en soute",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa à Doha.",
    studentPerk: "Liaison directe vers la mégapole de Chongqing (Chongqing University).",
    operatingDays: "4 vols par semaine",
    airlineOfficialUrl: "https://www.qatarairways.com",
    tag: "student_fav",
  },
  {
    id: "tk-cmn-wuh",
    airline: "Turkish Airlines + China Southern",
    airlineCode: "TK / CZ",
    airlineLogo: "🇹🇷",
    flightNumbers: "TK 618 ➔ CZ 6038",
    hub: "Istanbul (IST)",
    aircraft: "Boeing 777-300ER / Boeing 787",
    standardDuration: "~17h 45m",
    layoverDuration: "3h10 à Istanbul",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "WUH",
    destCity: "Wuhan",
    destAirportName: "Wuhan Tianhe International (WUH)",
    baggageAllowance: "2 x 23 kg en soute",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa à Istanbul.",
    studentPerk: "Liaison privilégiée pour les étudiants de Wuhan Univ et HUST.",
    operatingDays: "Vols fréquents",
    airlineOfficialUrl: "https://www.turkishairlines.com",
    tag: "popular",
  },
  {
    id: "ey-cmn-hgh",
    airline: "Etihad Airways",
    airlineCode: "EY",
    airlineLogo: "🇦🇪",
    flightNumbers: "EY 614 ➔ EY 811",
    hub: "Abu Dhabi (AUH)",
    aircraft: "Boeing 787-9 Dreamliner",
    standardDuration: "~17h 45m",
    layoverDuration: "2h50 à Abu Dhabi",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "HGH",
    destCity: "Hangzhou",
    destAirportName: "Hangzhou Xiaoshan International (HGH)",
    baggageAllowance: "2 x 23 kg en soute inclus",
    transitVisaRequired: false,
    transitVisaNote: "Transit sans visa à Abu Dhabi.",
    studentPerk: "Arrivée directe à Hangzhou pour les étudiants de Zhejiang University.",
    operatingDays: "3 vols par semaine",
    airlineOfficialUrl: "https://www.etihad.com",
    tag: "student_fav",
  },
  {
    id: "ca-cmn-xiy",
    airline: "Air China / Partenaires",
    airlineCode: "CA",
    airlineLogo: "🇨🇳",
    flightNumbers: "Liaison internationale ➔ CA Xi'an",
    hub: "Hub International Connecté",
    aircraft: "Airbus A330 / Boeing 787",
    standardDuration: "~18h 15m",
    layoverDuration: "Correspondance fluide",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "XIY",
    destCity: "Xi'an",
    destAirportName: "Xi'an Xianyang International (XIY)",
    baggageAllowance: "2 x 23 kg en soute",
    transitVisaRequired: false,
    transitVisaNote: "Arrivée directe au cœur universitaire de Xi'an (XJTU, NPU).",
    studentPerk: "Idéal pour les étudiants des universités de Shaanxi.",
    operatingDays: "Tous les jours",
    airlineOfficialUrl: "https://www.airchina.com",
    tag: "popular",
  },
  {
    id: "ca-cmn-hrb",
    airline: "Air China / China Southern",
    airlineCode: "CA / CZ",
    airlineLogo: "🇨🇳",
    flightNumbers: "Liaison internationale ➔ Harbin Taiping",
    hub: "Hub International Connecté",
    aircraft: "Airbus A330 / Boeing 777",
    standardDuration: "~19h 30m",
    layoverDuration: "Correspondance internationale",
    originCode: "CMN",
    originCity: "Casablanca",
    destCode: "HRB",
    destCity: "Harbin",
    destAirportName: "Harbin Taiping International (HRB)",
    baggageAllowance: "2 x 23 kg en soute",
    transitVisaRequired: false,
    transitVisaNote: "Arrivée directe pour les étudiants de Harbin Institute of Technology (HIT).",
    studentPerk: "Franchise 2 x 23 kg indispensable pour vêtements d'hiver grand froid à Harbin.",
    operatingDays: "Vols fréquents",
    airlineOfficialUrl: "https://www.airchina.com",
    tag: "baggage_pro",
  },
];

/**
 * Builds exact deep search link for Skyscanner with exact date and airport.
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
 * Builds exact deep search link for Trip.com with exact date and airport.
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
  const dest = (params.destCode || "bjs").toLowerCase();

  const originSlug = (params.originCity || "casablanca").toLowerCase().replace(/[^a-z0-9]/g, "-");
  const destSlug = (params.destCity || "beijing").toLowerCase().replace(/[^a-z0-9]/g, "-");

  const isRoundTrip = params.tripType === "roundtrip" && !!params.returnDate;
  const tripTypeParam = isRoundTrip ? "&tripType=RT" : "&tripType=OW";
  const rdateParam = isRoundTrip ? `&rdate=${params.returnDate}` : "";

  return `https://www.trip.com/flights/${originSlug}-to-${destSlug}/tickets-${origin}-${dest}?dcity=${origin}&acity=${dest}&ddate=${params.departureDate}${rdateParam}${tripTypeParam}&class=y&quantity=1&ref=scholar_china_student`;
}
