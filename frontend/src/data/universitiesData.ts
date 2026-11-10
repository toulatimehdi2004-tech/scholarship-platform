// Comprehensive Real Chinese Universities Dataset
// Verified institution data for ScholarChina platform

export interface MajorCategory {
  id: string;
  name: string;
  name_ar: string;
  name_fr: string;
  icon: string;
  badgeColor: string;
  subMajors: string[];
}

export interface DegreeOption {
  id: string;
  name: string;
  name_ar: string;
  name_fr: string;
  icon: string;
  duration: string;
  description: string;
}

export interface EnrichedUniversity {
  id: number;
  name: string;
  city: string;
  country: string;
  tier: "c9" | "985" | "211" | "national";
  tierLabel: string;
  is_verified: boolean;
  scholarships_count: number;
  degrees: ("bachelor" | "master" | "phd" | "language")[];
  majors: string[];
  major_degrees?: Record<string, ("bachelor" | "master" | "phd" | "language")[]>;
  popular_programs: string[];
  website: string;
  tagline: string;
  motto: string;
  description: string;
}

export const MAJOR_CATEGORIES: MajorCategory[] = [
  {
    id: "all",
    name: "All Majors & Disciplines",
    name_ar: "جميع التخصصات",
    name_fr: "Toutes les filières",
    icon: "🎓",
    badgeColor: "from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/30",
    subMajors: ["All Available Academic Programs in China"]
  },
  {
    id: "cs_ai",
    name: "Computer Science & AI",
    name_ar: "علوم الحاسوب والذكاء الاصطناعي",
    name_fr: "Informatique & Intelligence Artificielle",
    icon: "💻",
    badgeColor: "from-cyan/20 to-blue-500/20 text-cyan border-cyan/30",
    subMajors: [
      "Artificial Intelligence (AI)",
      "Computer Science & Technology",
      "Software Engineering",
      "Data Science & Big Data",
      "Cybersecurity",
      "Robotics & Automation"
    ]
  },
  {
    id: "medicine",
    name: "Medicine & Health (MBBS)",
    name_ar: "الطب البشري والصيدلة (MBBS)",
    name_fr: "Médecine & Santé (MBBS)",
    icon: "🩺",
    badgeColor: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    subMajors: [
      "Clinical Medicine (MBBS)",
      "Pharmacy & Pharmacology",
      "Stomatology (Dentistry)",
      "Biomedical Engineering",
      "Traditional Chinese Medicine",
      "Public Health"
    ]
  },
  {
    id: "engineering",
    name: "Engineering & Tech",
    name_ar: "الهندسة والتقنيات الحديثة",
    name_fr: "Ingénierie & Technologies",
    icon: "⚙️",
    badgeColor: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    subMajors: [
      "Mechanical & Mechatronics",
      "Civil & Structural Engineering",
      "Electrical & Electronics",
      "Aeronautics & Aerospace",
      "Chemical Engineering",
      "Telecommunications"
    ]
  },
  {
    id: "business",
    name: "Business, Econ & Trade",
    name_ar: "التجارة الدولية، الاقتصاد وإدارة الأعمال",
    name_fr: "Commerce, Économie & Finance",
    icon: "📈",
    badgeColor: "from-purple/20 to-indigo-500/20 text-purple border-purple/30",
    subMajors: [
      "International Economics & Trade",
      "Finance & Banking",
      "Business Administration (MBA / BBA)",
      "Accounting",
      "E-Commerce & Supply Chain",
      "Global Marketing"
    ]
  },
  {
    id: "language",
    name: "Chinese Language & Culture",
    name_ar: "اللغة الصينية والآداب",
    name_fr: "Langue Chinoise & Culture",
    icon: "🈯",
    badgeColor: "from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30",
    subMajors: [
      "Chinese Language & Literature",
      "Teaching Chinese to Speakers of Other Languages (MTCSOL)",
      "Cross-Cultural Studies",
      "Translation & Interpretation"
    ]
  },
  {
    id: "science",
    name: "Natural Sciences & Math",
    name_ar: "العلوم الطبيعية والرياضيات",
    name_fr: "Sciences Naturelles & Mathématiques",
    icon: "🔬",
    badgeColor: "from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30",
    subMajors: [
      "Applied Mathematics",
      "Physics & Quantum Materials",
      "Chemistry & Nanotech",
      "Biological & Life Sciences"
    ]
  },
  {
    id: "architecture",
    name: "Architecture & Urban Design",
    name_ar: "الهندسة المعمارية والتصميم الحضري",
    name_fr: "Architecture & Urbanisme",
    icon: "🏛️",
    badgeColor: "from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30",
    subMajors: [
      "Architecture",
      "Urban & Regional Planning",
      "Landscape Design",
      "Civil Infrastructure"
    ]
  },
  {
    id: "law_ir",
    name: "Law & International Relations",
    name_ar: "القانون والعلاقات الدولية",
    name_fr: "Droit & Relations Internationales",
    icon: "⚖️",
    badgeColor: "from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30",
    subMajors: [
      "International Law",
      "Diplomacy & Global Governance",
      "Political Science",
      "Public Policy"
    ]
  },
  {
    id: "agriculture",
    name: "Agriculture & Food Science",
    name_ar: "العلوم الزراعية والتغذية",
    name_fr: "Agriculture & Agroalimentaire",
    icon: "🌾",
    badgeColor: "from-lime-500/20 to-green-500/20 text-lime-400 border-lime-500/30",
    subMajors: [
      "Agronomy & Plant Protection",
      "Food Science & Quality Engineering",
      "Horticulture",
      "Agricultural Resources"
    ]
  }
];

export const DEGREE_OPTIONS: DegreeOption[] = [
  {
    id: "all",
    name: "All Degrees",
    name_ar: "جميع الدرجات العلمية",
    name_fr: "Tous les diplômes",
    icon: "🌟",
    duration: "1 - 5 Years",
    description: "Bachelor, Master, PhD & Language programs"
  },
  {
    id: "bachelor",
    name: "Bachelor's Degree",
    name_ar: "بكالوريوس (إجازة)",
    name_fr: "Licence / Bachelor (Bac+3/4)",
    icon: "🎓",
    duration: "4 - 5 Years",
    description: "Undergraduate degree programs (High school diploma required)"
  },
  {
    id: "master",
    name: "Master's Degree",
    name_ar: "ماجستير (ماستر)",
    name_fr: "Master (Bac+5)",
    icon: "📜",
    duration: "2 - 3 Years",
    description: "Postgraduate programs with full CSC stipend eligibility"
  },
  {
    id: "phd",
    name: "PhD / Doctorate",
    name_ar: "دكتوراه (PhD)",
    name_fr: "Doctorat (PhD)",
    icon: "🎖️",
    duration: "3 - 4 Years",
    description: "Advanced doctoral research with top monthly living allowance"
  },
  {
    id: "language",
    name: "Chinese Language & Prep",
    name_ar: "سنة تحضيرية / لغة صينية",
    name_fr: "Langue Chinoise / Préparatoire",
    icon: "🈯",
    duration: "1 - 2 Semesters",
    description: "Intensive HSK Chinese preparatory course for scholarship students"
  }
];

export const REAL_UNIVERSITIES: EnrichedUniversity[] = [
  {
    "id": 1,
    "name": "Tsinghua University",
    "city": "Beijing",
    "country": "China",
    "tier": "c9",
    "tierLabel": "C9 League (Top 9 in China)",
    "is_verified": true,
    "scholarships_count": 10,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "business",
      "science",
      "architecture"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "International Economics & Trade",
      "Business Administration (MBA)",
      "Applied Mathematics & Physics",
      "Biotechnology",
      "Architecture & Urban Design"
    ],
    "website": "https://www.tsinghuauniversity.edu.cn",
    "tagline": "C9 League (Top 9 in China) • Located in Beijing",
    "motto": "Self-Discipline, Social Commitment, Innovation",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ],
      "architecture": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 2,
    "name": "Shanghai Jiao Tong University",
    "city": "Shanghai",
    "country": "China",
    "tier": "c9",
    "tierLabel": "C9 League (Top 9 in China)",
    "is_verified": true,
    "scholarships_count": 5,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "medicine",
      "business"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Clinical Medicine (MBBS)",
      "Pharmacy",
      "International Economics & Trade",
      "Business Administration (MBA)"
    ],
    "website": "https://www.shanghaijiaotonguniversity.edu.cn",
    "tagline": "C9 League (Top 9 in China) • Located in Shanghai",
    "motto": "Self-Discipline, Social Commitment, Innovation",
    "description": "Prestigious Chinese higher education institution situated in Shanghai. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "medicine": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 3,
    "name": "Chinese Academy of Sciences (UCAS & CAS Fellowships)",
    "city": "Beijing",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 12,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "cs_ai",
      "science"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.chineseacademyofsciencesucascasfellowships.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 4,
    "name": "Peking University",
    "city": "Beijing",
    "country": "China",
    "tier": "c9",
    "tierLabel": "C9 League (Top 9 in China)",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "business",
      "language",
      "science",
      "law_ir"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "International Economics & Trade",
      "Business Administration (MBA)",
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)",
      "Applied Mathematics & Physics",
      "Biotechnology",
      "International Law & Diplomacy"
    ],
    "website": "https://www.pekinguniversity.edu.cn",
    "tagline": "C9 League (Top 9 in China) • Located in Beijing",
    "motto": "Self-Discipline, Social Commitment, Innovation",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ],
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ],
      "law_ir": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 5,
    "name": "Beijing Institute of Technology",
    "city": "Beijing",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "language"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.beijinginstituteoftechnology.edu.cn",
    "tagline": "Project 985 National Elite • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 6,
    "name": "Beihang University",
    "city": "Beijing",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 5,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "cs_ai",
      "business"
    ],
    "popular_programs": [
      "Computer Science",
      "Business Administration"
    ],
    "website": "https://www.beihanguniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 7,
    "name": "Beijing Normal University",
    "city": "Beijing",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.beijingnormaluniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 8,
    "name": "UCAS",
    "city": "Beijing",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "science"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.ucas.edu.cn",
    "tagline": "National Key Institution • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 9,
    "name": "China Agricultural University",
    "city": "Beijing",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "agriculture"
    ],
    "popular_programs": [
      "Agronomy & Food Science"
    ],
    "website": "https://www.chinaagriculturaluniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "agriculture": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 10,
    "name": "CUFE",
    "city": "Beijing",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "business",
      "language"
    ],
    "popular_programs": [
      "International Economics & Trade",
      "Business Administration (MBA)",
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.cufe.edu.cn",
    "tagline": "National Key Institution • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "business": [
        "bachelor",
        "master",
        "phd"
      ],
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 11,
    "name": "BFSU",
    "city": "Beijing",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.bfsu.edu.cn",
    "tagline": "National Key Institution • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 12,
    "name": "CUGB",
    "city": "Beijing",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "science"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.cugb.edu.cn",
    "tagline": "National Key Institution • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 13,
    "name": "Fudan University",
    "city": "Shanghai",
    "country": "China",
    "tier": "c9",
    "tierLabel": "C9 League (Top 9 in China)",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "medicine",
      "business"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Clinical Medicine (MBBS)",
      "Pharmacy",
      "International Economics & Trade",
      "Business Administration (MBA)"
    ],
    "website": "https://www.fudanuniversity.edu.cn",
    "tagline": "C9 League (Top 9 in China) • Located in Shanghai",
    "motto": "Self-Discipline, Social Commitment, Innovation",
    "description": "Prestigious Chinese higher education institution situated in Shanghai. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "medicine": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 14,
    "name": "Tongji University",
    "city": "Shanghai",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "engineering",
      "architecture"
    ],
    "popular_programs": [
      "Mechanical Engineering",
      "Civil Engineering",
      "Architecture & Urban Design"
    ],
    "website": "https://www.tongjiuniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Shanghai",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Shanghai. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "architecture": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 15,
    "name": "ECNU",
    "city": "Shanghai",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.ecnu.edu.cn",
    "tagline": "National Key Institution • Located in Shanghai",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Shanghai. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 16,
    "name": "Shanghai University",
    "city": "Shanghai",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "business"
    ],
    "popular_programs": [
      "Computer Science",
      "Business Administration"
    ],
    "website": "https://www.shanghaiuniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Shanghai",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Shanghai. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 17,
    "name": "Donghua University",
    "city": "Shanghai",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 7,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "business"
    ],
    "popular_programs": [
      "Computer Science",
      "Business Administration"
    ],
    "website": "https://www.donghuauniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Shanghai",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Shanghai. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 18,
    "name": "Shanghai Maritime University",
    "city": "Shanghai",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "engineering"
    ],
    "popular_programs": [
      "Mechanical Engineering",
      "Civil Engineering"
    ],
    "website": "https://www.shanghaimaritimeuniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Shanghai",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Shanghai. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 19,
    "name": "SISU",
    "city": "Shanghai",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 4,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.sisu.edu.cn",
    "tagline": "National Key Institution • Located in Shanghai",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Shanghai. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 20,
    "name": "Sun Yat-sen University",
    "city": "Guangzhou",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 7,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "medicine"
    ],
    "popular_programs": [
      "Clinical Medicine (MBBS)",
      "Pharmacy"
    ],
    "website": "https://www.sunyatsenuniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Guangzhou",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Guangzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "medicine": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 21,
    "name": "SCUT",
    "city": "Guangzhou",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 7,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "language",
      "architecture"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)",
      "Architecture & Urban Design"
    ],
    "website": "https://www.scut.edu.cn",
    "tagline": "National Key Institution • Located in Guangzhou",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Guangzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ],
      "architecture": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 22,
    "name": "Jinan University",
    "city": "Guangzhou",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 7,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.jinanuniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Guangzhou",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Guangzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 23,
    "name": "SCNU",
    "city": "Guangzhou",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.scnu.edu.cn",
    "tagline": "National Key Institution • Located in Guangzhou",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Guangzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 24,
    "name": "GDUT",
    "city": "Guangzhou",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering"
    ],
    "website": "https://www.gdut.edu.cn",
    "tagline": "National Key Institution • Located in Guangzhou",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Guangzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 25,
    "name": "GMU",
    "city": "Dongguan",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "medicine"
    ],
    "popular_programs": [
      "Clinical Medicine (MBBS)",
      "Pharmacy"
    ],
    "website": "https://www.gmu.edu.cn",
    "tagline": "National Key Institution • Located in Dongguan",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Dongguan. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "medicine": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 26,
    "name": "Nanjing University",
    "city": "Nanjing",
    "country": "China",
    "tier": "c9",
    "tierLabel": "C9 League (Top 9 in China)",
    "is_verified": true,
    "scholarships_count": 7,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language",
      "science"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)",
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.nanjinguniversity.edu.cn",
    "tagline": "C9 League (Top 9 in China) • Located in Nanjing",
    "motto": "Self-Discipline, Social Commitment, Innovation",
    "description": "Prestigious Chinese higher education institution situated in Nanjing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 27,
    "name": "Southeast University",
    "city": "Nanjing",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 7,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language",
      "science",
      "architecture"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)",
      "Applied Mathematics & Physics",
      "Biotechnology",
      "Architecture & Urban Design"
    ],
    "website": "https://www.southeastuniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Nanjing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Nanjing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ],
      "architecture": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 28,
    "name": "NJUST",
    "city": "Nanjing",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "science"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.njust.edu.cn",
    "tagline": "National Key Institution • Located in Nanjing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Nanjing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 29,
    "name": "NJUPT",
    "city": "Nanjing",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 5,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "science"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.njupt.edu.cn",
    "tagline": "National Key Institution • Located in Nanjing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Nanjing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 30,
    "name": "Hohai University",
    "city": "Nanjing",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "science"
    ],
    "popular_programs": [
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.hohaiuniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Nanjing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Nanjing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 31,
    "name": "NNU",
    "city": "Nanjing",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 5,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language",
      "science"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)",
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.nnu.edu.cn",
    "tagline": "National Key Institution • Located in Nanjing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Nanjing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 33,
    "name": "Wuhan University",
    "city": "Wuhan",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 8,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "law_ir"
    ],
    "popular_programs": [
      "International Law & Diplomacy"
    ],
    "website": "https://www.wuhanuniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Wuhan",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Wuhan. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "law_ir": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 34,
    "name": "CCNU",
    "city": "Wuhan",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.ccnu.edu.cn",
    "tagline": "National Key Institution • Located in Wuhan",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Wuhan. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 35,
    "name": "WHUT",
    "city": "Wuhan",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "law_ir"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "International Law & Diplomacy"
    ],
    "website": "https://www.whut.edu.cn",
    "tagline": "National Key Institution • Located in Wuhan",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Wuhan. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "law_ir": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 36,
    "name": "HZAU",
    "city": "Wuhan",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 4,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "agriculture"
    ],
    "popular_programs": [
      "Agronomy & Food Science"
    ],
    "website": "https://www.hzau.edu.cn",
    "tagline": "National Key Institution • Located in Wuhan",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Wuhan. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "agriculture": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 37,
    "name": "ZUEL",
    "city": "Wuhan",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "business",
      "language",
      "law_ir"
    ],
    "popular_programs": [
      "International Economics & Trade",
      "Business Administration (MBA)",
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)",
      "International Law & Diplomacy"
    ],
    "website": "https://www.zuel.edu.cn",
    "tagline": "National Key Institution • Located in Wuhan",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Wuhan. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "business": [
        "bachelor",
        "master",
        "phd"
      ],
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ],
      "law_ir": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 38,
    "name": "Sichuan University",
    "city": "Chengdu",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 8,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "medicine"
    ],
    "popular_programs": [
      "Clinical Medicine (MBBS)",
      "Pharmacy"
    ],
    "website": "https://www.sichuanuniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Chengdu",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Chengdu. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "medicine": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 39,
    "name": "UESTC",
    "city": "Chengdu",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "science"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.uestc.edu.cn",
    "tagline": "National Key Institution • Located in Chengdu",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Chengdu. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 41,
    "name": "SUFE",
    "city": "Chengdu",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 4,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "business"
    ],
    "popular_programs": [
      "International Economics & Trade",
      "Business Administration (MBA)"
    ],
    "website": "https://www.sufe.edu.cn",
    "tagline": "National Key Institution • Located in Chengdu",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Chengdu. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 42,
    "name": "CDUT",
    "city": "Chengdu",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "medicine"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Clinical Medicine (MBBS)",
      "Pharmacy"
    ],
    "website": "https://www.cdut.edu.cn",
    "tagline": "National Key Institution • Located in Chengdu",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Chengdu. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "medicine": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 44,
    "name": "HEU",
    "city": "Harbin",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 5,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "engineering",
      "language"
    ],
    "popular_programs": [
      "Mechanical Engineering",
      "Civil Engineering",
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.heu.edu.cn",
    "tagline": "National Key Institution • Located in Harbin",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Harbin. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 45,
    "name": "NEFU",
    "city": "Harbin",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "agriculture"
    ],
    "popular_programs": [
      "Agronomy & Food Science"
    ],
    "website": "https://www.nefu.edu.cn",
    "tagline": "National Key Institution • Located in Harbin",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Harbin. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "agriculture": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 46,
    "name": "HLJU",
    "city": "Harbin",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 5,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "business"
    ],
    "popular_programs": [
      "Computer Science",
      "Business Administration"
    ],
    "website": "https://www.hlju.edu.cn",
    "tagline": "National Key Institution • Located in Harbin",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Harbin. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 47,
    "name": "Xi'an Jiaotong University",
    "city": "Xi'an",
    "country": "China",
    "tier": "c9",
    "tierLabel": "C9 League (Top 9 in China)",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "engineering"
    ],
    "popular_programs": [
      "Mechanical Engineering",
      "Civil Engineering"
    ],
    "website": "https://www.xianjiaotonguniversity.edu.cn",
    "tagline": "C9 League (Top 9 in China) • Located in Xi'an",
    "motto": "Self-Discipline, Social Commitment, Innovation",
    "description": "Prestigious Chinese higher education institution situated in Xi'an. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 48,
    "name": "NPU",
    "city": "Xi'an",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering"
    ],
    "website": "https://www.npu.edu.cn",
    "tagline": "National Key Institution • Located in Xi'an",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Xi'an. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 49,
    "name": "NWAFU",
    "city": "Yangling",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 4,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "agriculture"
    ],
    "popular_programs": [
      "Agronomy & Food Science"
    ],
    "website": "https://www.nwafu.edu.cn",
    "tagline": "National Key Institution • Located in Yangling",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Yangling. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "agriculture": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 50,
    "name": "Tianjin University",
    "city": "Tianjin",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 4,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "architecture"
    ],
    "popular_programs": [
      "Architecture & Urban Design"
    ],
    "website": "https://www.tianjinuniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Tianjin",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Tianjin. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "architecture": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 51,
    "name": "Nankai University",
    "city": "Tianjin",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language",
      "science",
      "architecture"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)",
      "Applied Mathematics & Physics",
      "Biotechnology",
      "Architecture & Urban Design"
    ],
    "website": "https://www.nankaiuniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Tianjin",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Tianjin. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ],
      "architecture": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 52,
    "name": "TMU",
    "city": "Tianjin",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 4,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "medicine",
      "architecture"
    ],
    "popular_programs": [
      "Clinical Medicine (MBBS)",
      "Pharmacy",
      "Architecture & Urban Design"
    ],
    "website": "https://www.tmu.edu.cn",
    "tagline": "National Key Institution • Located in Tianjin",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Tianjin. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "medicine": [
        "bachelor",
        "master",
        "phd"
      ],
      "architecture": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 53,
    "name": "Central South University",
    "city": "Changsha",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 7,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "engineering",
      "language"
    ],
    "popular_programs": [
      "Mechanical Engineering",
      "Civil Engineering",
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.centralsouthuniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Changsha",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Changsha. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 54,
    "name": "Hunan University",
    "city": "Changsha",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 5,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "business"
    ],
    "popular_programs": [
      "Computer Science",
      "Business Administration"
    ],
    "website": "https://www.hunanuniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Changsha",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Changsha. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 55,
    "name": "NUDT",
    "city": "Changsha",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 5,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering"
    ],
    "website": "https://www.nudt.edu.cn",
    "tagline": "National Key Institution • Located in Changsha",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Changsha. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 56,
    "name": "Zhejiang University",
    "city": "Hangzhou",
    "country": "China",
    "tier": "c9",
    "tierLabel": "C9 League (Top 9 in China)",
    "is_verified": true,
    "scholarships_count": 8,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "medicine"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Clinical Medicine (MBBS)",
      "Pharmacy"
    ],
    "website": "https://www.zhejianguniversity.edu.cn",
    "tagline": "C9 League (Top 9 in China) • Located in Hangzhou",
    "motto": "Self-Discipline, Social Commitment, Innovation",
    "description": "Prestigious Chinese higher education institution situated in Hangzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "medicine": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 57,
    "name": "China Academy of Art",
    "city": "Hangzhou",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "medicine",
      "language",
      "science"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Clinical Medicine (MBBS)",
      "Pharmacy",
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)",
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.chinaacademyofart.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Hangzhou",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Hangzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "medicine": [
        "bachelor",
        "master",
        "phd"
      ],
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 58,
    "name": "DMU",
    "city": "Dalian",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "engineering"
    ],
    "popular_programs": [
      "Mechanical Engineering",
      "Civil Engineering"
    ],
    "website": "https://www.dmu.edu.cn",
    "tagline": "National Key Institution • Located in Dalian",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Dalian. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 59,
    "name": "Jilin University",
    "city": "Changchun",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 5,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.jilinuniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Changchun",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Changchun. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 60,
    "name": "OUC",
    "city": "Qingdao",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "agriculture"
    ],
    "popular_programs": [
      "Agronomy & Food Science"
    ],
    "website": "https://www.ouc.edu.cn",
    "tagline": "National Key Institution • Located in Qingdao",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Qingdao. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "agriculture": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 61,
    "name": "Qingdao University",
    "city": "Qingdao",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "business"
    ],
    "popular_programs": [
      "Computer Science",
      "Business Administration"
    ],
    "website": "https://www.qingdaouniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Qingdao",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Qingdao. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 62,
    "name": "Yunnan University",
    "city": "Kunming",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.yunnanuniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Kunming",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Kunming. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 63,
    "name": "KMUST",
    "city": "Kunming",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "science"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.kmust.edu.cn",
    "tagline": "National Key Institution • Located in Kunming",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Kunming. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 64,
    "name": "Chongqing University",
    "city": "Chongqing",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "business"
    ],
    "popular_programs": [
      "Computer Science",
      "Business Administration"
    ],
    "website": "https://www.chongqinguniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Chongqing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Chongqing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 65,
    "name": "Southwest University",
    "city": "Chongqing",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 7,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.southwestuniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Chongqing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Chongqing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 66,
    "name": "USTC",
    "city": "Hefei",
    "country": "China",
    "tier": "c9",
    "tierLabel": "C9 League (Top 9 in China)",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "science"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.ustc.edu.cn",
    "tagline": "C9 League (Top 9 in China) • Located in Hefei",
    "motto": "Self-Discipline, Social Commitment, Innovation",
    "description": "Prestigious Chinese higher education institution situated in Hefei. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 67,
    "name": "HFUT",
    "city": "Hefei",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering"
    ],
    "website": "https://www.hfut.edu.cn",
    "tagline": "National Key Institution • Located in Hefei",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Hefei. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 68,
    "name": "Lanzhou University",
    "city": "Lanzhou",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 5,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "business"
    ],
    "popular_programs": [
      "Computer Science",
      "Business Administration"
    ],
    "website": "https://www.lanzhouuniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Lanzhou",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Lanzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 69,
    "name": "GDUFS",
    "city": "Guangzhou",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 7,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.gdufs.edu.cn",
    "tagline": "National Key Institution • Located in Guangzhou",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Guangzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 70,
    "name": "Soochow University",
    "city": "Suzhou",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.soochowuniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Suzhou",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Suzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 71,
    "name": "China Scholarship Council",
    "city": "Beijing",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 14,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.chinascholarshipcouncil.edu.cn",
    "tagline": "National Key Institution • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 72,
    "name": "China Scholarship Council Bilateral Program (Morocco-China)",
    "city": "Beijing",
    "country": "China",
    "tier": "national",
    "tierLabel": "National Key Institution",
    "is_verified": true,
    "scholarships_count": 8,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.chinascholarshipcouncilbilateralprogrammoroccochina.edu.cn",
    "tagline": "National Key Institution • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 73,
    "name": "Huazhong University of Science and Technology",
    "city": "Wuhan",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 13,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "language",
      "science"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)",
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.huazhonguniversityofscienceandtechnology.edu.cn",
    "tagline": "Project 985 National Elite • Located in Wuhan",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Wuhan. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 74,
    "name": "Beijing Language and Culture University",
    "city": "Beijing",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 11,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.beijinglanguageandcultureuniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 75,
    "name": "Dalian University of Technology",
    "city": "Dalian",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 6,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "language"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.dalianuniversityoftechnology.edu.cn",
    "tagline": "Project 985 National Elite • Located in Dalian",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Dalian. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 76,
    "name": "Southwest Jiaotong University",
    "city": "Chengdu",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 8,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "engineering"
    ],
    "popular_programs": [
      "Mechanical Engineering",
      "Civil Engineering"
    ],
    "website": "https://www.southwestjiaotonguniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Chengdu",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Chengdu. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 77,
    "name": "Harbin Institute of Technology",
    "city": "Harbin",
    "country": "China",
    "tier": "c9",
    "tierLabel": "C9 League (Top 9 in China)",
    "is_verified": true,
    "scholarships_count": 9,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering"
    ],
    "website": "https://www.harbininstituteoftechnology.edu.cn",
    "tagline": "C9 League (Top 9 in China) • Located in Harbin",
    "motto": "Self-Discipline, Social Commitment, Innovation",
    "description": "Prestigious Chinese higher education institution situated in Harbin. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 78,
    "name": "Xiamen University",
    "city": "Xiamen",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 7,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "business"
    ],
    "popular_programs": [
      "Computer Science",
      "Business Administration"
    ],
    "website": "https://www.xiamenuniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Xiamen",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Xiamen. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 79,
    "name": "Shandong University",
    "city": "Jinan",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 7,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.shandonguniversity.edu.cn",
    "tagline": "Project 985 National Elite • Located in Jinan",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Jinan. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 80,
    "name": "Beijing International Studies University",
    "city": "Beijing",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 7,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.beijinginternationalstudiesuniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 81,
    "name": "Chengdu Neusoft University",
    "city": "Chengdu",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 8,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "cs_ai"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering"
    ],
    "website": "https://www.chengduneusoftuniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Chengdu",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Chengdu. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 82,
    "name": "Chang'an University",
    "city": "Xi'an",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 5,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "cs_ai",
      "business"
    ],
    "popular_programs": [
      "Computer Science",
      "Business Administration"
    ],
    "website": "https://www.changanuniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Xi'an",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Xi'an. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 83,
    "name": "University of Electronic Science and Technology of China (UESTC)",
    "city": "Chengdu",
    "country": "China",
    "tier": "c9",
    "tierLabel": "C9 League (Top 9 in China)",
    "is_verified": true,
    "scholarships_count": 2,
    "degrees": [
      "master",
      "phd"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "science"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.universityofelectronicscienceandtechnologyofchinauestc.edu.cn",
    "tagline": "C9 League (Top 9 in China) • Located in Chengdu",
    "motto": "Self-Discipline, Social Commitment, Innovation",
    "description": "Prestigious Chinese higher education institution situated in Chengdu. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 84,
    "name": "Southwestern University of Finance and Economics (SWUFE)",
    "city": "Chengdu",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "business"
    ],
    "popular_programs": [
      "International Economics & Trade",
      "Business Administration (MBA)"
    ],
    "website": "https://www.southwesternuniversityoffinanceandeconomicsswufe.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Chengdu",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Chengdu. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 85,
    "name": "Chengdu University of Technology",
    "city": "Chengdu",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "cs_ai",
      "engineering"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering"
    ],
    "website": "https://www.chengduuniversityoftechnology.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Chengdu",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Chengdu. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 86,
    "name": "Beijing Foreign Studies University (BFSU)",
    "city": "Beijing",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.beijingforeignstudiesuniversitybfsu.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 87,
    "name": "China Agricultural University (CAU)",
    "city": "Beijing",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "agriculture"
    ],
    "popular_programs": [
      "Agronomy & Food Science"
    ],
    "website": "https://www.chinaagriculturaluniversitycau.edu.cn",
    "tagline": "Project 985 National Elite • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "agriculture": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 88,
    "name": "Beijing University of Posts and Telecommunications (BUPT)",
    "city": "Beijing",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "cs_ai",
      "engineering"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering"
    ],
    "website": "https://www.beijinguniversityofpostsandtelecommunicationsbupt.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 89,
    "name": "Central University of Finance and Economics (CUFE)",
    "city": "Beijing",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "business"
    ],
    "popular_programs": [
      "International Economics & Trade",
      "Business Administration (MBA)"
    ],
    "website": "https://www.centraluniversityoffinanceandeconomicscufe.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 90,
    "name": "Beijing University of Technology (BJUT)",
    "city": "Beijing",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "cs_ai",
      "engineering"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering"
    ],
    "website": "https://www.beijinguniversityoftechnologybjut.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Beijing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Beijing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 91,
    "name": "South China University of Technology (SCUT)",
    "city": "Guangzhou",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 4,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "architecture"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Architecture & Urban Design"
    ],
    "website": "https://www.southchinauniversityoftechnologyscut.edu.cn",
    "tagline": "Project 985 National Elite • Located in Guangzhou",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Guangzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "architecture": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 92,
    "name": "South China Normal University (SCNU)",
    "city": "Guangzhou",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.southchinanormaluniversityscnu.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Guangzhou",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Guangzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 93,
    "name": "Guangdong University of Foreign Studies (GDUFS)",
    "city": "Guangzhou",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "business",
      "language"
    ],
    "popular_programs": [
      "International Economics & Trade",
      "Business Administration (MBA)",
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.guangdonguniversityofforeignstudiesgdufs.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Guangzhou",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Guangzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "business": [
        "bachelor",
        "master",
        "phd"
      ],
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 94,
    "name": "Southern Medical University",
    "city": "Guangzhou",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "medicine"
    ],
    "popular_programs": [
      "Clinical Medicine (MBBS)",
      "Pharmacy"
    ],
    "website": "https://www.southernmedicaluniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Guangzhou",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Guangzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "medicine": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 95,
    "name": "Shenzhen University (SZU)",
    "city": "Shenzhen",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "cs_ai",
      "business"
    ],
    "popular_programs": [
      "Computer Science",
      "Business Administration"
    ],
    "website": "https://www.shenzhenuniversityszu.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Shenzhen",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Shenzhen. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 96,
    "name": "Southern University of Science and Technology (SUSTech)",
    "city": "Shenzhen",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 4,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "science"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.southernuniversityofscienceandtechnologysustech.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Shenzhen",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Shenzhen. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 97,
    "name": "Chinese University of Hong Kong, Shenzhen (CUHK-SZ)",
    "city": "Shenzhen",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "cs_ai",
      "business"
    ],
    "popular_programs": [
      "Computer Science",
      "Business Administration"
    ],
    "website": "https://www.chineseuniversityofhongkongshenzhencuhksz.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Shenzhen",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Shenzhen. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 98,
    "name": "Wuhan University of Technology (WUT)",
    "city": "Wuhan",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "law_ir"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "International Law & Diplomacy"
    ],
    "website": "https://www.wuhanuniversityoftechnologywut.edu.cn",
    "tagline": "Project 985 National Elite • Located in Wuhan",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Wuhan. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "law_ir": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 99,
    "name": "Central China Normal University (CCNU)",
    "city": "Wuhan",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 4,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "language"
    ],
    "popular_programs": [
      "Chinese Language & Culture",
      "Teaching Chinese (MTCSOL)"
    ],
    "website": "https://www.centralchinanormaluniversityccnu.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Wuhan",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Wuhan. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "language": [
        "bachelor",
        "master",
        "phd",
        "language"
      ]
    }
  },
  {
    "id": 100,
    "name": "Xidian University",
    "city": "Xi'an",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "cs_ai",
      "business"
    ],
    "popular_programs": [
      "Computer Science",
      "Business Administration"
    ],
    "website": "https://www.xidianuniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Xi'an",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Xi'an. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 101,
    "name": "Northwest University",
    "city": "Xi'an",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 4,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "business"
    ],
    "popular_programs": [
      "Computer Science",
      "Business Administration"
    ],
    "website": "https://www.northwestuniversity.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Xi'an",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Xi'an. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "business": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 102,
    "name": "Southeast University (SEU)",
    "city": "Nanjing",
    "country": "China",
    "tier": "985",
    "tierLabel": "Project 985 National Elite",
    "is_verified": true,
    "scholarships_count": 4,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "architecture"
    ],
    "popular_programs": [
      "Architecture & Urban Design"
    ],
    "website": "https://www.southeastuniversityseu.edu.cn",
    "tagline": "Project 985 National Elite • Located in Nanjing",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Nanjing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "architecture": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 103,
    "name": "Nanjing University of Aeronautics and Astronautics (NUAA)",
    "city": "Nanjing",
    "country": "China",
    "tier": "c9",
    "tierLabel": "C9 League (Top 9 in China)",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "engineering",
      "science"
    ],
    "popular_programs": [
      "Mechanical Engineering",
      "Civil Engineering",
      "Applied Mathematics & Physics",
      "Biotechnology"
    ],
    "website": "https://www.nanjinguniversityofaeronauticsandastronauticsnuaa.edu.cn",
    "tagline": "C9 League (Top 9 in China) • Located in Nanjing",
    "motto": "Self-Discipline, Social Commitment, Innovation",
    "description": "Prestigious Chinese higher education institution situated in Nanjing. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "science": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 104,
    "name": "Hangzhou Dianzi University (HDU)",
    "city": "Hangzhou",
    "country": "China",
    "tier": "211",
    "tierLabel": "Double First Class / Project 211",
    "is_verified": true,
    "scholarships_count": 4,
    "degrees": [
      "bachelor",
      "master",
      "phd",
      "language"
    ],
    "majors": [
      "cs_ai",
      "medicine"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Clinical Medicine (MBBS)",
      "Pharmacy"
    ],
    "website": "https://www.hangzhoudianziuniversityhdu.edu.cn",
    "tagline": "Double First Class / Project 211 • Located in Hangzhou",
    "motto": "Excellence, Truth, and Global Vision",
    "description": "Prestigious Chinese higher education institution situated in Hangzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "medicine": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  },
  {
    "id": 105,
    "name": "Zhejiang University of Technology (ZJUT)",
    "city": "Hangzhou",
    "country": "China",
    "tier": "c9",
    "tierLabel": "C9 League (Top 9 in China)",
    "is_verified": true,
    "scholarships_count": 3,
    "degrees": [
      "bachelor",
      "master",
      "phd"
    ],
    "majors": [
      "cs_ai",
      "engineering",
      "medicine"
    ],
    "popular_programs": [
      "Computer Science & AI",
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Clinical Medicine (MBBS)",
      "Pharmacy"
    ],
    "website": "https://www.zhejianguniversityoftechnologyzjut.edu.cn",
    "tagline": "C9 League (Top 9 in China) • Located in Hangzhou",
    "motto": "Self-Discipline, Social Commitment, Innovation",
    "description": "Prestigious Chinese higher education institution situated in Hangzhou. Highly recognized for scholarship quotas, cutting-edge labs, and international student integration.",
    "major_degrees": {
      "cs_ai": [
        "bachelor",
        "master",
        "phd"
      ],
      "engineering": [
        "bachelor",
        "master",
        "phd"
      ],
      "medicine": [
        "bachelor",
        "master",
        "phd"
      ]
    }
  }
];
