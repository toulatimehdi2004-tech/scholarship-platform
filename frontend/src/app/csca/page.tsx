"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  FileText,
  Calculator,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Laptop,
  Globe,
  Coins,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Check,
  Building2,
  ChevronDown,
  Layers,
  ArrowLeft,
  Code2,
  ShoppingBag,
  TrendingUp,
  Stethoscope,
  Pill,
  Cog,
  Zap,
  Search,
  Filter,
  CheckCircle,
  Briefcase,
  Languages,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useLang } from "@/lib/i18n";

interface SubjectDetail {
  id: string;
  nameEn: string;
  nameFr: string;
  nameAr: string;
  nameZh: string;
  isCompulsory: boolean;
  targetMajorsEn: string;
  targetMajorsFr: string;
  targetMajorsAr: string;
  formatEn: string;
  formatFr: string;
  formatAr: string;
  topics: { en: string; fr: string; ar: string }[];
}

const CSCA_SUBJECTS: SubjectDetail[] = [
  {
    id: "math",
    nameEn: "Mathematics (Compulsory)",
    nameFr: "Mathématiques (Obligatoire)",
    nameAr: "الرياضيات (إجباري لجميع الشعب)",
    nameZh: "数学 (必考科目)",
    isCompulsory: true,
    targetMajorsEn: "Compulsory for all Bachelor applicants (STEM, Medicine, Business, Economics & Arts)",
    targetMajorsFr: "Obligatoire pour tous les candidats Bachelor (Sciences, Ingénierie, Médecine, Commerce, Économie)",
    targetMajorsAr: "إجباري لجميع المتقدمين للبكالوريوس (الهندسة، الطب، التجارة، الاقتصاد والعلوم)",
    formatEn: "90 minutes • Multiple-choice & numerical calculation questions • English or Chinese",
    formatFr: "90 minutes • QCM et calculs numériques • Disponible en Anglais ou Chinois",
    formatAr: "90 دقيقة • أسئلة اختيارات متعددة وحسابات عددية • متاح باللغة الإنجليزية أو الصينية",
    topics: [
      {
        en: "Functions & Polynomials (Domain, range, composite, inverse functions)",
        fr: "Fonctions & Polynômes (Domaine, image, composées, réciproques)",
        ar: "الدوال والحدوديات (المجال، المدى، الدوال المركبة والعكسية)",
      },
      {
        en: "Calculus (Limits, derivatives, basic definite & indefinite integrals)",
        fr: "Calcul différentiel & intégral (Limites, dérivées, primitives, intégrales simples)",
        ar: "التفاضل والتكامل (النهايات، الاشتقاق، الدوال الأصلية والتكاملات)",
      },
      {
        en: "Trigonometry & Vectors (Trigonometric equations, 2D/3D vectors, dot product)",
        fr: "Trigonométrie & Vecteurs (Équations trigonométriques, produit scalaire)",
        ar: "حساب المثلثات والمتجهات (المعادلات المثلثية، الجداء السلمي)",
      },
      {
        en: "Sequences & Series (Arithmetic, geometric sequences, summation)",
        fr: "Suites numériques (Suites arithmétiques, géométriques, sommes)",
        ar: "المتتاليات العددية (المتتاليات الحسابية والهندسية، المجاميع)",
      },
      {
        en: "Probability & Elementary Statistics (Permutations, combinations, binomial distribution)",
        fr: "Probabilités & Statistiques élémentaires (Dénombrement, loi binomiale)",
        ar: "الاحتمالات والإحصاء الأولي (التعداد، التوزيع ثنائي الحد)",
      },
    ],
  },
  {
    id: "physics",
    nameEn: "Physics (STEM & Engineering)",
    nameFr: "Physique (Sciences & Ingénierie)",
    nameAr: "الفيزياء (الهندسة والعلوم التقنية)",
    nameZh: "物理 (理工类选考)",
    isCompulsory: false,
    targetMajorsEn: "Required for Computer Science, AI, Mechanical, Civil, Electrical Engineering & Architecture",
    targetMajorsFr: "Requis pour Génie Informatique, IA, Génie Mécanique, Civil, Électrique & Architecture",
    targetMajorsAr: "مطلوب لعلوم الحاسوب، الذكاء الاصطناعي، الهندسة الميكانيكية، المدنية والكهربائية",
    formatEn: "75 minutes • Multiple-choice conceptual & problem-solving • English or Chinese",
    formatFr: "75 minutes • QCM conceptuels et résolution de problèmes • Anglais ou Chinois",
    formatAr: "75 دقيقة • أسئلة اختيارات متعددة ومسائل فيزيائية • بالإنجليزية أو الصينية",
    topics: [
      {
        en: "Classical Mechanics (Newton's laws, momentum, kinetic/potential energy, circular motion)",
        fr: "Mécanique Newtonienne (Lois de Newton, quantité de mouvement, énergie cinétique/potentielle)",
        ar: "الميكانيكا الكلاسيكية (قوانين نيوتن، كمية الحركة، الطاقة الحركية والوضع)",
      },
      {
        en: "Electromagnetism & DC/AC Circuits (Ohm's law, Coulomb's law, magnetic force, Faraday induction)",
        fr: "Électromagnétisme & Circuits (Loi d'Ohm, loi de Coulomb, force de Lorentz, induction)",
        ar: "الكهرومغناطيسية والدوائر الكهربائية (قانون أوم، كولوم، التحريض الكهرومغناطيسي)",
      },
      {
        en: "Thermodynamics & Kinetic Theory (Ideal gas law, heat transfer, First law of thermodynamics)",
        fr: "Thermodynamique (Loi des gaz parfaits, transferts thermiques, 1er principe)",
        ar: "الديناميكا الحرارية والغازات المثالية (قانون الغازات، انتقال الحرارة)",
      },
      {
        en: "Optics & Waves (Snell-Descartes laws, wave superposition, interference, diffraction)",
        fr: "Optique géométrique & Ondes (Lois de Snell-Descartes, interférences, diffraction)",
        ar: "البصريات والموجات (قوانين الانكسار، تراكب الموجات، الحيود والتداخل)",
      },
    ],
  },
  {
    id: "chemistry",
    nameEn: "Chemistry (Medicine & Life Sciences)",
    nameFr: "Chimie (Médecine MBBS & Sciences de la Vie)",
    nameAr: "الكيمياء (الطب العام MBBS والصيدلة والبيولوجيا)",
    nameZh: "化学 (医学与生命科学类选考)",
    isCompulsory: false,
    targetMajorsEn: "Required for Clinical Medicine (MBBS), Pharmacy, Dentistry, Biomedical & Chemical Engineering",
    targetMajorsFr: "Requis pour Médecine Générale (MBBS), Pharmacie, Dentaire, Génie Biomédical & Chimie",
    targetMajorsAr: "مطلوب لدراسة الطب العام (MBBS)، الصيدلة، طب الأسنان، والهندسة الكيميائية والطبية",
    formatEn: "75 minutes • Multiple-choice & formula reactions • English or Chinese",
    formatFr: "75 minutes • QCM et réactions chimiques • Anglais ou Chinois",
    formatAr: "75 دقيقة • أسئلة متعددة الاختيارات وتفاعلات كيميائية • بالإنجليزية أو الصينية",
    topics: [
      {
        en: "Atomic Structure & Periodic Table Trends (Electron configurations, ionization energy, electronegativity)",
        fr: "Structure atomique & Tableau périodique (Configurations électroniques, électronégativité)",
        ar: "البنية الذرية والجدول الدوري (التوزيع الإلكتروني، الكهرسلبية، طاقة التأين)",
      },
      {
        en: "Chemical Bonding & Molecular Geometry (Ionic, covalent, hydrogen bonds, Lewis structures)",
        fr: "Liaisons chimiques & Géométrie moléculaire (Liaisons ioniques, covalentes, VSEPR)",
        ar: "الروابط الكيميائية والهندسة الجزيئية (الروابط الأيونية والتساهمية، تمثيل لويس)",
      },
      {
        en: "Chemical Equilibria & Acid-Base Chemistry (Le Chatelier's principle, pH, buffers, titrations)",
        fr: "Équilibres chimiques & Réactions acido-basiques (Principe de Le Chatelier, pH, titrages)",
        ar: "التوازنات الكيميائية والأحماض والقواعد (مبدأ لوشاتولييه، الرقم الهيدروجيني pH، المعايرة)",
      },
      {
        en: "Fundamental Organic Chemistry (Functional groups: alcohols, aldehydes, ketones, carboxylic acids)",
        fr: "Chimie organique fondamentale (Groupes fonctionnels : alcools, aldéhydes, acides carboxyliques)",
        ar: "الكيمياء العضوية الأساسية (المجموعات الوظيفية: الكحولات، الألدهيدات، الأحماض الكربوكسيلية)",
      },
    ],
  },
  {
    id: "chinese",
    nameEn: "Academic Chinese (For Chinese-Taught Majors)",
    nameFr: "Chinois Académique (Programmes Sinophones)",
    nameAr: "اللغة الصينية الأكاديمية (للتخصصات الموجهة باللغة الصينية)",
    nameZh: "科技/人文汉语 (中文授课必考)",
    isCompulsory: false,
    targetMajorsEn: "Required for Bachelor applicants enrolling in Chinese-taught programs (complementary to HSK)",
    targetMajorsFr: "Requis pour les programmes de Bachelor dispensés en chinois (en complément du HSK 4/5)",
    targetMajorsAr: "إلزامي للبرامج التي تُدرّس باللغة الصينية (مكمل لشهادة HSK 4 أو HSK 5)",
    formatEn: "90 minutes • Academic reading comprehension, technical terminology & essay • Chinese",
    formatFr: "90 minutes • Compréhension de textes scientifiques et vocabulaire académique • Chinois",
    formatAr: "90 دقيقة • فهم المقروء الأكاديمي، المصطلحات التقنية والإنشاء • باللغة الصينية",
    topics: [
      {
        en: "Scientific & Technical Terminology in Chinese (Math, science and economic characters)",
        fr: "Terminologie scientifique et technique en caractères chinois (Maths, sciences, économie)",
        ar: "المصطلحات العلمية والتقنية بالصينية (رموز الرياضيات والعلوم والاقتصاد)",
      },
      {
        en: "Academic Reading Comprehension (Analyzing Chinese academic texts & graphs)",
        fr: "Compréhension de lecture académique (Analyse d'articles et graphiques en chinois)",
        ar: "فهم النصوص الأكاديمية وقراءة الجداول والمبيانات العلمية بالصينية",
      },
      {
        en: "Short Academic Writing & Expression in Chinese characters",
        fr: "Rédaction académique synthétique et formulation en caractères chinois",
        ar: "التعبير والإنشاء الأكاديمي الموجز بالحروف الصينية",
      },
    ],
  },
];

export interface StudyMajor {
  id: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  category: "tech" | "business" | "medicine" | "engineering" | "humanities";
  categoryLabelFr: string;
  categoryLabelEn: string;
  categoryLabelAr: string;
  requiredSubjects: string[]; // ["math", "physics"]
  exemptSubjects: string[]; // ["chemistry"]
  whyFr: string;
  whyEn: string;
  whyAr: string;
  moroccanBacAdviceFr: string;
  moroccanBacAdviceEn: string;
  moroccanBacAdviceAr: string;
  topUnis: { name: string; city: string }[];
  cscaStepsFr: string[];
  cscaStepsEn: string[];
  cscaStepsAr: string[];
}

const STUDY_MAJORS: StudyMajor[] = [
  {
    id: "software",
    nameFr: "Génie Logiciel & Informatique (Software Engineering / Computer Science)",
    nameEn: "Software Engineering & Computer Science",
    nameAr: "هندسة البرمجيات وعلوم الحاسوب (Software & CS)",
    category: "tech",
    categoryLabelFr: "💻 Informatique & Logiciel",
    categoryLabelEn: "💻 Tech & Software",
    categoryLabelAr: "💻 المعلوميات والبرمجيات",
    requiredSubjects: ["math", "physics"],
    exemptSubjects: ["chemistry"],
    whyFr: "Les facultés d'informatique en Chine évaluent obligatoirement la logique mathématique (analyse, fonctions, probabilités) et la physique (électrocinétique, circuits, mécanique).",
    whyEn: "Chinese Computer Science faculties mandate testing in mathematical logic, calculus, and physics (circuits, mechanics, electromagnetism).",
    whyAr: "تتطلب كليات علوم الحاسوب الصينية تقييم المنطق الرياضي (التفاضل، الدوال، الاحتمالات) والفيزياء (الدوائر الكهربائية والكهرومغناطيسية).",
    moroccanBacAdviceFr: "Idéal pour les bacheliers Sciences Maths (SM A/B) et Sciences Physiques (PC). Les SVT doivent renforcer leur préparation en physique.",
    moroccanBacAdviceEn: "Ideal for Mathematical Sciences (SM) and Physical Sciences (PC) Moroccan Bac graduates.",
    moroccanBacAdviceAr: "مثالي لشعبتي العلوم الرياضية (أ / ب) والعلوم الفيزيائية (PC) بالمغرب.",
    topUnis: [
      { name: "Zhejiang University", city: "Hangzhou" },
      { name: "Tsinghua University", city: "Beijing" },
      { name: "Beihang University", city: "Beijing" },
      { name: "Harbin Institute of Technology", city: "Harbin" },
      { name: "HUST", city: "Wuhan" },
    ],
    cscaStepsFr: [
      "Sur csca.cn : Cochez l'épreuve 'Mathematics' (Voie STEM)",
      "Cochez l'épreuve 'Physics' (Science & Engineering)",
      "Ne cochez PAS la Chimie (Chemistry) : elle n'est pas requise",
      "Langue : Sélectionnez 'English' si vous postulez à un Bachelor enseigné en anglais",
    ],
    cscaStepsEn: [
      "On csca.cn: Check 'Mathematics' (STEM track)",
      "Check 'Physics' (Science & Engineering)",
      "Do NOT check 'Chemistry': it is not required",
      "Language: Choose 'English' for English-taught bachelor programs",
    ],
    cscaStepsAr: [
      "على csca.cn: اختر مادة الرياضيات (Mathematics مسار STEM)",
      "اختر مادة الفيزياء (Physics)",
      "لا تختر الكيمياء: غير مطلوبة لهندسة البرمجيات",
      "اللغة: حدد اللغة الإنجليزية للبرامج الموجهة بالإنجليزية",
    ],
  },
  {
    id: "ecommerce",
    nameFr: "Commerce Électronique & Digital Business (E-Commerce)",
    nameEn: "E-Commerce & Digital Business",
    nameAr: "التجارة الإلكترونية وإدارة الأعمال الرقمية (E-Commerce)",
    category: "business",
    categoryLabelFr: "🛍️ E-Commerce & Business",
    categoryLabelEn: "🛍️ E-Commerce & Business",
    categoryLabelAr: "🛍️ التجارة الإلكترونية وإدارة الأعمال",
    requiredSubjects: ["math"],
    exemptSubjects: ["physics", "chemistry"],
    whyFr: "La Chine est le leader mondial du e-commerce (Alibaba, Taobao, JD.com). Pour cette filière, AUCUNE PHYSIQUE NI CHIMIE N'EST REQUISE ! Seul le test de Mathématiques (voie générale/commerce) est obligatoire.",
    whyEn: "China is the global leader in E-Commerce (Alibaba, JD.com). For this major, NO PHYSICS OR CHEMISTRY IS REQUIRED! Only the Mathematics test (General/Business track) is required.",
    whyAr: "الصين هي الرائدة عالمياً في التجارة الإلكترونية (علي بابا، جيه دي). في هذا التخصص لا تحتاج إلى فيزياء ولا كيمياء نهائياً! يُطلب فقط اختبار الرياضيات الأساسية.",
    moroccanBacAdviceFr: "Accessible et très recommandé pour le Bac Économie, Bac Sciences Maths, Bac PC et Bac SVT. Une seule épreuve à payer et passer !",
    moroccanBacAdviceEn: "Accessible and ideal for Moroccan Economics Bac, SM, PC, or SVT. You only need to pay and sit for 1 exam!",
    moroccanBacAdviceAr: "متاح ومناسب جداً للبكالوريا علوم اقتصادية، علوم رياضية، فيزيائية وعلوم الحياة والأرض. مادة واحدة فقط للاجتياز!",
    topUnis: [
      { name: "Zhejiang Gongshang University", city: "Hangzhou (Berceau d'Alibaba)" },
      { name: "UIBE (Univ. of Intl Business & Econ)", city: "Beijing" },
      { name: "SUFE (Shanghai Univ of Finance & Econ)", city: "Shanghai" },
      { name: "SWUFE", city: "Chengdu" },
    ],
    cscaStepsFr: [
      "Sur csca.cn : Cochez UNIQUEMENT l'épreuve 'Mathematics' (General Track)",
      "Laissez les cases 'Physics' et 'Chemistry' VIDES (non requises)",
      "Économisez les frais : vous ne payez que pour 1 seule matière (~450 RMB / ~630 MAD) !",
      "Sélectionnez 'English' pour les programmes anglophones",
    ],
    cscaStepsEn: [
      "On csca.cn: Check ONLY 'Mathematics' (General Track)",
      "Leave 'Physics' and 'Chemistry' UNCHECKED (not needed)",
      "Save fees: You only pay for 1 single subject (~450 RMB / ~630 MAD)!",
      "Select 'English' for English-taught bachelor programs",
    ],
    cscaStepsAr: [
      "على csca.cn: حدد فقط مادة الرياضيات (Mathematics)",
      "اترك خانتي الفيزياء والكيمياء فارغتين (غير مطلوبتين)",
      "وفر التكاليف: ستدفع رسوم مادة واحدة فقط (~450 يوان / ~630 درهم مغربي)!",
      "اختر اللغة الإنجليزية للبرامج الموجهة بالإنجليزية",
    ],
  },
  {
    id: "ai",
    nameFr: "Intelligence Artificielle & Data Science (AI & Data)",
    nameEn: "Artificial Intelligence & Data Science",
    nameAr: "الذكاء الاصطناعي وعلم البيانات (AI & Big Data)",
    category: "tech",
    categoryLabelFr: "💻 Informatique & Logiciel",
    categoryLabelEn: "💻 Tech & Software",
    categoryLabelAr: "💻 المعلوميات والبرمجيات",
    requiredSubjects: ["math", "physics"],
    exemptSubjects: ["chemistry"],
    whyFr: "L'apprentissage automatique et le Deep Learning reposent sur l'algèbre linéaire, le calcul matriciel, les probabilités et l'architecture des circuits électroniques.",
    whyEn: "Machine Learning and Neural Networks rely heavily on linear algebra, matrix calculus, probabilities, and electronic circuit physics.",
    whyAr: "يعتمد تعلم الآلة والشبكات العصبية على الجبر الخطي والمصفوفات والاحتمالات وفيزياء المعالجات الإلكترونية.",
    moroccanBacAdviceFr: "Bac Sciences Maths (SM) ou Bac PC recommandé. Forte maîtrise des fonctions et probabilités exigée.",
    moroccanBacAdviceEn: "Bac Sciences Maths (SM) or Physical Sciences (PC) recommended.",
    moroccanBacAdviceAr: "يُفضل خريجو العلوم الرياضية (SM) أو العلوم الفيزيائية (PC).",
    topUnis: [
      { name: "Shanghai Jiao Tong University", city: "Shanghai" },
      { name: "Zhejiang University", city: "Hangzhou" },
      { name: "USTC", city: "Hefei" },
      { name: "Nanjing University", city: "Nanjing" },
    ],
    cscaStepsFr: [
      "Sur csca.cn : Cochez 'Mathematics' + 'Physics'",
      "Ne prenez pas la Chimie",
      "Langue : English",
    ],
    cscaStepsEn: [
      "On csca.cn: Select 'Mathematics' + 'Physics'",
      "Do not select Chemistry",
      "Language: English",
    ],
    cscaStepsAr: [
      "على csca.cn: اختر الرياضيات + الفيزياء",
      "لا تختر الكيمياء",
      "اللغة: English",
    ],
  },
  {
    id: "trade",
    nameFr: "Commerce International & Finance (International Trade & Finance)",
    nameEn: "International Economics & Trade",
    nameAr: "التجارة الدولية والاقتصاد المالي (Intl Trade & Finance)",
    category: "business",
    categoryLabelFr: "🛍️ E-Commerce & Business",
    categoryLabelEn: "🛍️ E-Commerce & Business",
    categoryLabelAr: "🛍️ التجارة الإلكترونية وإدارة الأعمال",
    requiredSubjects: ["math"],
    exemptSubjects: ["physics", "chemistry"],
    whyFr: "Pour étudier le commerce international et les marchés mondiaux en Chine, aucune science expérimentale (physique/chimie) n'est requise. Seules les mathématiques d'analyse et d'optimisation sont évaluées.",
    whyEn: "No physical sciences required. Chinese business universities only require the Mathematics exam (calculus, statistics, optimization).",
    whyAr: "لا حاجة لمادتي الفيزياء أو الكيمياء. تتطلب الجامعات الصينية لاقتصاد وتجارة العالم فقط مادة الرياضيات.",
    moroccanBacAdviceFr: "Excellente opportunité pour les bacheliers Sciences Économiques, SM, PC et SVT. Frais d'examen réduits (1 matière).",
    moroccanBacAdviceEn: "Excellent opportunity for Moroccan Economics, SM, PC, or SVT students. Reduced fee (1 subject).",
    moroccanBacAdviceAr: "فرصة رائعة لشعب الاقتصاد، العلوم الرياضية، الفيزيائية وSVT. رسم امتحان لمادة واحدة فقط.",
    topUnis: [
      { name: "UIBE Beijing", city: "Beijing" },
      { name: "Fudan University", city: "Shanghai" },
      { name: "Wuhan University", city: "Wuhan" },
      { name: "Xiamen University", city: "Xiamen" },
    ],
    cscaStepsFr: [
      "Sur csca.cn : Sélectionnez UNIQUEMENT 'Mathematics'",
      "Laissez les autres matières vides",
      "Frais : ~450 RMB (~630 MAD)",
    ],
    cscaStepsEn: [
      "On csca.cn: Select ONLY 'Mathematics'",
      "Leave other subjects blank",
      "Fee: ~450 RMB (~$63 USD)",
    ],
    cscaStepsAr: [
      "على csca.cn: اختر فقط الرياضيات (Mathematics)",
      "اترك المواد الأخرى فارغة",
      "الرسوم: ~450 يوان (~630 درهم مغربي)",
    ],
  },
  {
    id: "mbbs",
    nameFr: "Médecine Générale MBBS & Chirurgie (Clinical Medicine MBBS)",
    nameEn: "Clinical Medicine (MBBS) & Surgery",
    nameAr: "الطب البشري والجراحة العامة (MBBS Medicine)",
    category: "medicine",
    categoryLabelFr: "🩺 Médecine & Santé",
    categoryLabelEn: "🩺 Medicine & Health",
    categoryLabelAr: "🩺 الطب والعلوم الصحية",
    requiredSubjects: ["math", "chemistry", "physics"],
    exemptSubjects: ["chinese"],
    whyFr: "Le cursus de Médecine Générale MBBS en Chine (accrédité OMS et reconnu par le Ministère marocain de la Santé) exige une solide maîtrise en Chimie (organique, acido-basique), en Mathématiques et en Physique médicale.",
    whyEn: "WHO-accredited MBBS programs require strong chemistry (organic, solutions), math, and physics for medical diagnostics.",
    whyAr: "يتطلب برنامج الطب العام MBBS المعترف به من منظمة الصحة العالمية ووزارة الصحة المغربية اجتياز الكيمياء والرياضيات والفيزياء.",
    moroccanBacAdviceFr: "Parfaitement adapté aux bacheliers Sciences de la Vie et de la Terre (SVT), Sciences Physiques (PC) et Sciences Maths (SM).",
    moroccanBacAdviceEn: "Tailored for Moroccan SVT, PC, and SM Baccalaureate holders.",
    moroccanBacAdviceAr: "مناسب جداً لحاملي بكالوريا علوم الحياة والأرض (SVT) والعلوم الفيزيائية (PC) والرياضية.",
    topUnis: [
      { name: "Capital Medical University", city: "Beijing" },
      { name: "Zhejiang University School of Medicine", city: "Hangzhou" },
      { name: "Shandong University", city: "Jinan" },
      { name: "Nanjing Medical University", city: "Nanjing" },
      { name: "Dalian Medical University", city: "Dalian" },
    ],
    cscaStepsFr: [
      "Sur csca.cn : Cochez 'Mathematics' (obligatoire)",
      "Cochez 'Chemistry' (cruciale pour médecine)",
      "Cochez 'Physics' (recommandée par la majorité des facultés de médecine chinoises)",
      "Sélectionnez le forfait 3 matières (~950 RMB / ~1 330 MAD)",
    ],
    cscaStepsEn: [
      "On csca.cn: Check 'Mathematics' (compulsory)",
      "Check 'Chemistry' (crucial for medical schools)",
      "Check 'Physics' (recommended by medical faculties)",
      "Select the 3-subject bundle (~950 RMB / ~$135 USD)",
    ],
    cscaStepsAr: [
      "على csca.cn: اختر الرياضيات (Mathematics)",
      "اختر الكيمياء (Chemistry - ضرورية جداً لكليات الطب)",
      "اختر الفيزياء (Physics - موصى بها من الجامعات الطبية)",
      "حدد باقة 3 مواد (~950 يوان / ~1330 درهم مغربي)",
    ],
  },
  {
    id: "pharmacy",
    nameFr: "Pharmacie & Sciences Biomédicales (Pharmacy & Biotech)",
    nameEn: "Pharmacy & Biomedical Sciences",
    nameAr: "الصيدلة والتكنولوجيا الحيوية (Pharmacy & Biotech)",
    category: "medicine",
    categoryLabelFr: "🩺 Médecine & Santé",
    categoryLabelEn: "🩺 Medicine & Health",
    categoryLabelAr: "🩺 الطب والعلوم الصحية",
    requiredSubjects: ["math", "chemistry"],
    exemptSubjects: ["physics"],
    whyFr: "La pharmacie évalue en priorité la chimie moléculaire, la biochimie, la cinétique des réactions et la modélisation mathématique des solutions.",
    whyEn: "Pharmacy prioritizes organic chemistry, solutions, molecular kinetics, and mathematical dosing models.",
    whyAr: "يركز تخصص الصيدلة على الكيمياء العضوية والمحاليل والتفاعلات ونمذجة الجرعات الرياضية.",
    moroccanBacAdviceFr: "Idéal pour Bac PC et Bac SVT.",
    moroccanBacAdviceEn: "Ideal for Moroccan PC and SVT students.",
    moroccanBacAdviceAr: "مثالي لشعبتي العلوم الفيزيائية وعلوم الحياة والأرض.",
    topUnis: [
      { name: "China Pharmaceutical University", city: "Nanjing" },
      { name: "Fudan University Pharmacy", city: "Shanghai" },
      { name: "Shenyang Pharmaceutical University", city: "Shenyang" },
    ],
    cscaStepsFr: [
      "Sur csca.cn : Cochez 'Mathematics' + 'Chemistry'",
      "La physique est facultative",
      "Frais : ~750 RMB (~1 050 MAD)",
    ],
    cscaStepsEn: [
      "On csca.cn: Check 'Mathematics' + 'Chemistry'",
      "Physics is optional",
      "Fee: ~750 RMB (~$105 USD)",
    ],
    cscaStepsAr: [
      "على csca.cn: اختر الرياضيات + الكيمياء",
      "الفيزياء اختيارية",
      "الرسوم: ~750 يوان (~1050 درهم)",
    ],
  },
  {
    id: "civil",
    nameFr: "Génie Civil & Architecture (Civil Engineering & Architecture)",
    nameEn: "Civil Engineering & Architecture",
    nameAr: "الهندسة المدنية والعمارة (Civil Eng & Architecture)",
    category: "engineering",
    categoryLabelFr: "🏗️ Ingénierie & Industrie",
    categoryLabelEn: "🏗️ Engineering & Construction",
    categoryLabelAr: "🏗️ الهندسة والبناء",
    requiredSubjects: ["math", "physics"],
    exemptSubjects: ["chemistry"],
    whyFr: "La Chine possède les plus grandes prouesses d'ingénierie au monde. L'examen CSCA teste la résistance des matériaux, la statique et la géométrie analytique.",
    whyEn: "Civil engineering requires analytical geometry, structural statics, vectors, and Newtonian physics.",
    whyAr: "تتطلب الهندسة المدنية الهندسة التحليلية والميكانيكا الساكنة والمتجهات وفيزياء نيوتن.",
    moroccanBacAdviceFr: "Bac Sciences Maths (SM) ou Bac Sciences Physiques (PC).",
    moroccanBacAdviceEn: "Bac SM or PC holders.",
    moroccanBacAdviceAr: "لحاملي بكالوريا علوم رياضية أو علوم فيزيائية.",
    topUnis: [
      { name: "Tongji University (N°1 Mondial Génie Civil)", city: "Shanghai" },
      { name: "Southeast University", city: "Nanjing" },
      { name: "Tianjin University", city: "Tianjin" },
      { name: "Harbin Institute of Technology", city: "Harbin" },
    ],
    cscaStepsFr: [
      "Sur csca.cn : Cochez 'Mathematics' + 'Physics'",
      "Ne prenez pas la Chimie",
      "Langue : English",
    ],
    cscaStepsEn: [
      "On csca.cn: Check 'Mathematics' + 'Physics'",
      "Do not check Chemistry",
      "Language: English",
    ],
    cscaStepsAr: [
      "على csca.cn: اختر الرياضيات + الفيزياء",
      "لا تختر الكيمياء",
      "اللغة: English",
    ],
  },
  {
    id: "mechanical",
    nameFr: "Génie Mécanique & Robotique Industrielle (Mechanical & Robotics)",
    nameEn: "Mechanical Engineering & Robotics",
    nameAr: "الهندسة الميكانيكية والروبوتات (Mechanical & Robotics)",
    category: "engineering",
    categoryLabelFr: "🏗️ Ingénierie & Industrie",
    categoryLabelEn: "🏗️ Engineering & Construction",
    categoryLabelAr: "🏗️ الهندسة والبناء",
    requiredSubjects: ["math", "physics"],
    exemptSubjects: ["chemistry"],
    whyFr: "Cinématique, dynamique newtonienne, thermodynamique et calcul différentiel sont les piliers indispensables.",
    whyEn: "Kinematics, dynamics, thermodynamics, and calculus are the required pillars.",
    whyAr: "تعتمد على علم الحركة (السينماتيك)، قوانين نيوتن، الديناميكا الحرارية وحساب التفاضل.",
    moroccanBacAdviceFr: "Bac SM ou PC.",
    moroccanBacAdviceEn: "Bac SM or PC.",
    moroccanBacAdviceAr: "علوم رياضية أو علوم فيزيائية.",
    topUnis: [
      { name: "Beijing Institute of Technology (BIT)", city: "Beijing" },
      { name: "Shanghai Jiao Tong University", city: "Shanghai" },
      { name: "Xi'an Jiaotong University", city: "Xi'an" },
    ],
    cscaStepsFr: [
      "Sur csca.cn : Cochez 'Mathematics' + 'Physics'",
      "Langue : English",
    ],
    cscaStepsEn: [
      "On csca.cn: Check 'Mathematics' + 'Physics'",
      "Language: English",
    ],
    cscaStepsAr: [
      "على csca.cn: اختر الرياضيات + الفيزياء",
      "اللغة: English",
    ],
  },
  {
    id: "electrical",
    nameFr: "Génie Électrique, Électronique & Télécoms (Electrical & Telecom)",
    nameEn: "Electrical & Electronic Engineering / Telecom",
    nameAr: "الهندسة الكهربائية والإلكترونيات والاتصالات (Electrical & Telecom)",
    category: "engineering",
    categoryLabelFr: "🏗️ Ingénierie & Industrie",
    categoryLabelEn: "🏗️ Engineering & Construction",
    categoryLabelAr: "🏗️ الهندسة والبناء",
    requiredSubjects: ["math", "physics"],
    exemptSubjects: ["chemistry"],
    whyFr: "La Chine mène la technologie mondiale en réseaux 5G/6G et semi-conducteurs. Évaluation poussée en électromagnétisme et circuits.",
    whyEn: "China leads in 5G/6G and semiconductors. Rigorous evaluation in electromagnetism and AC/DC circuits.",
    whyAr: "تقود الصين تقنيات شبكات 5G/6G وأشباه الموصلات. اختبار دقيق في الكهرومغناطيسية والدوائر الكهربائية.",
    moroccanBacAdviceFr: "Bac SM ou Bac PC.",
    moroccanBacAdviceEn: "Bac SM or PC.",
    moroccanBacAdviceAr: "علوم رياضية أو علوم فيزيائية.",
    topUnis: [
      { name: "UESTC (Univ. of Electronic Science & Tech)", city: "Chengdu" },
      { name: "BUPT (Beijing Univ. of Posts & Telecoms)", city: "Beijing" },
      { name: "Xidian University", city: "Xi'an" },
    ],
    cscaStepsFr: [
      "Sur csca.cn : Cochez 'Mathematics' + 'Physics'",
      "Langue : English",
    ],
    cscaStepsEn: [
      "On csca.cn: Check 'Mathematics' + 'Physics'",
      "Language: English",
    ],
    cscaStepsAr: [
      "على csca.cn: اختر الرياضيات + الفيزياء",
      "اللغة: English",
    ],
  },
  {
    id: "finance",
    nameFr: "Finance Internationale & Fintech (International Finance & Banking)",
    nameEn: "Finance & International Accounting",
    nameAr: "المالية الدولية وتكنولوجيا المال (Finance & Fintech)",
    category: "business",
    categoryLabelFr: "🛍️ E-Commerce & Business",
    categoryLabelEn: "🛍️ E-Commerce & Business",
    categoryLabelAr: "🛍️ التجارة الإلكترونية وإدارة الأعمال",
    requiredSubjects: ["math"],
    exemptSubjects: ["physics", "chemistry"],
    whyFr: "AUCUNE PHYSIQUE NI CHIMIE. L'épreuve de mathématiques mesure les compétences quantitatives, les probabilités et la modélisation statistique.",
    whyEn: "NO PHYSICS OR CHEMISTRY. Mathematics evaluates quantitative skills, probabilities, and financial modeling.",
    whyAr: "بدون فيزياء وبدون كيمياء. تقييم الرياضيات يقيس المهارات الحسابية والاحتمالات والنمذجة المالية.",
    moroccanBacAdviceFr: "Bac Économie, Bac SM, Bac PC.",
    moroccanBacAdviceEn: "Moroccan Bac Economics, SM, PC.",
    moroccanBacAdviceAr: "بكالوريا علوم اقتصادية، علوم رياضية أو فيزيائية.",
    topUnis: [
      { name: "Central University of Finance and Economics (CUFE)", city: "Beijing" },
      { name: "SUFE", city: "Shanghai" },
      { name: "SWUFE", city: "Chengdu" },
    ],
    cscaStepsFr: [
      "Sur csca.cn : Cochez UNIQUEMENT 'Mathematics'",
      "Frais : ~450 RMB (~630 MAD)",
    ],
    cscaStepsEn: [
      "On csca.cn: Select ONLY 'Mathematics'",
      "Fee: ~450 RMB (~$63 USD)",
    ],
    cscaStepsAr: [
      "على csca.cn: حدد فقط مادة الرياضيات",
      "الرسوم: ~450 يوان (~630 درهم)",
    ],
  },
  {
    id: "chinese_lang",
    nameFr: "Langue & Littérature Chinoise (Chinese Language & Literature)",
    nameEn: "Chinese Language & Culture",
    nameAr: "اللغة الصينية وآدابها (Chinese Language & Culture)",
    category: "humanities",
    categoryLabelFr: "🌏 Langues & Tourisme",
    categoryLabelEn: "🌏 Languages & Humanities",
    categoryLabelAr: "🌏 اللغات والعلوم الإنسانية",
    requiredSubjects: ["chinese", "math"],
    exemptSubjects: ["physics", "chemistry"],
    whyFr: "Examen de chinois académique évaluant la compréhension de textes et la terminologie universitaire (en complément du HSK).",
    whyEn: "Academic Chinese exam evaluating reading comprehension and vocabulary alongside basic mathematics.",
    whyAr: "اختبار اللغة الصينية الأكاديمية لفهم النصوص والمصطلحات الجامعية مع الرياضيات الأساسية.",
    moroccanBacAdviceFr: "Accessible à toutes les séries de Bac (Lettres, Éco, Sciences).",
    moroccanBacAdviceEn: "Open to all Moroccan Baccalaureate series.",
    moroccanBacAdviceAr: "متاح لجميع شعب البكالوريا (آداب، اقتصاد، علوم).",
    topUnis: [
      { name: "BLCU (Beijing Language & Culture Univ.)", city: "Beijing" },
      { name: "BFSU (Beijing Foreign Studies Univ.)", city: "Beijing" },
      { name: "East China Normal University (ECNU)", city: "Shanghai" },
    ],
    cscaStepsFr: [
      "Sur csca.cn : Cochez 'Academic Chinese' + 'Mathematics'",
      "Langue : Chinese",
    ],
    cscaStepsEn: [
      "On csca.cn: Select 'Academic Chinese' + 'Mathematics'",
      "Language: Chinese",
    ],
    cscaStepsAr: [
      "على csca.cn: اختر اللغة الصينية الأكاديمية + الرياضيات",
      "اللغة: الصينية",
    ],
  },
  {
    id: "tourism",
    nameFr: "Management du Tourisme & Hôtellerie Internationale (Tourism & Hospitality)",
    nameEn: "Tourism Management & Hospitality",
    nameAr: "إدارة السياحة والفندقة الدولية (Tourism Management)",
    category: "humanities",
    categoryLabelFr: "🌏 Langues & Tourisme",
    categoryLabelEn: "🌏 Languages & Humanities",
    categoryLabelAr: "🌏 اللغات والعلوم الإنسانية",
    requiredSubjects: ["math"],
    exemptSubjects: ["physics", "chemistry"],
    whyFr: "AUCUNE PHYSIQUE NI CHIMIE. Seules les mathématiques générales sont requises pour l'analyse de gestion et statistiques hôtelières.",
    whyEn: "NO PHYSICS OR CHEMISTRY. Only general mathematics is tested for managerial analytics.",
    whyAr: "بدون فيزياء وبدون كيمياء. فقط الرياضيات العامة لإدارة وتحليل البيانات السياحية.",
    moroccanBacAdviceFr: "Bac Lettres, Bac Économie, Bac Sciences.",
    moroccanBacAdviceEn: "Bac Lettres, Economics, Sciences.",
    moroccanBacAdviceAr: "بكالوريا آداب، اقتصاد، أو علوم.",
    topUnis: [
      { name: "Sun Yat-sen University", city: "Guangzhou" },
      { name: "Nankai University", city: "Tianjin" },
      { name: "Xiamen University", city: "Xiamen" },
    ],
    cscaStepsFr: [
      "Sur csca.cn : Cochez UNIQUEMENT 'Mathematics'",
      "Frais : ~450 RMB (~630 MAD)",
    ],
    cscaStepsEn: [
      "On csca.cn: Select ONLY 'Mathematics'",
      "Fee: ~450 RMB (~$63 USD)",
    ],
    cscaStepsAr: [
      "على csca.cn: حدد فقط الرياضيات",
      "الرسوم: ~450 يوان (~630 درهم)",
    ],
  },
];

const MOROCCAN_BAC_PRESETS = [
  {
    id: "sm",
    nameFr: "Sciences Mathématiques (SM A / SM B)",
    nameEn: "Mathematical Sciences (SM A / SM B)",
    nameAr: "العلوم الرياضية (أ / ب)",
    recommendedSubjects: ["math", "physics"],
    suggestedMajorsFr: "Génie Logiciel, Intelligence Artificielle, Robotique, Aérospatial, Mathématiques Appliquées",
    suggestedMajorsEn: "Computer Science, AI, Robotics, Aerospace, Applied Mathematics",
    suggestedMajorsAr: "علوم الحاسوب، الذكاء الاصطناعي، الروبوتات، هندسة الطيران، الرياضيات التطبيقية",
    tipsFr: "Votre niveau en analyse mathématique et en mécanique newtonienne au Bac marocain est un énorme atout. Le test CSCA étant sous forme de QCM rapide, entraînez-vous surtout à la vitesse de calcul sans calculatrice graphique.",
    tipsEn: "Your Moroccan Baccalaureate level in calculus and mechanics is a great advantage. Since CSCA is fast multiple-choice, focus on calculation speed without graphing calculators.",
    tipsAr: "مستواك في التحليل الرياضي والميكانيكا في البكالوريا المغربية ممتاز جداً. تدرب على سرعة حل أسئلة الاختيارات المتعددة (QCM) باللغة الإنجليزية بدون آلة حاسبة بيانية.",
  },
  {
    id: "pc",
    nameFr: "Sciences Physiques & Chimiques (PC)",
    nameEn: "Physical & Chemical Sciences (PC)",
    nameAr: "العلوم الفيزيائية والكيميائية (PC)",
    recommendedSubjects: ["math", "physics"],
    suggestedMajorsFr: "Génie Civil, Électrique, Télécoms, Data Science, ou Médecine MBBS (ajouter Chimie)",
    suggestedMajorsEn: "Civil, Electrical, Telecom Engineering, Data Science, or MBBS Medicine (add Chemistry)",
    suggestedMajorsAr: "الهندسة المدنية، الكهربائية، الاتصالات، علم البيانات، أو الطب العام MBBS (مع إضافة الكيمياء)",
    tipsFr: "Si vous visez l'ingénierie, prenez Math + Physique. Si vous visez la médecine MBBS en Chine, réservez le pack 3 matières (Math + Physique + Chimie).",
    tipsEn: "If targeting engineering, take Math + Physics. If applying for MBBS Medicine in China, book the 3-subject package (Math + Physics + Chemistry).",
    tipsAr: "إذا كان هدفك الهندسة، اختر الرياضيات + الفيزياء. أما إذا كنت ترغب في دراسة الطب البشري MBBS في الصين، احجز باقة 3 مواد (رياضيات + فيزياء + كيمياء).",
  },
  {
    id: "svt",
    nameFr: "Sciences de la Vie et de la Terre (SVT)",
    nameEn: "Life & Earth Sciences (SVT)",
    nameAr: "علوم الحياة والأرض (SVT)",
    recommendedSubjects: ["math", "chemistry"],
    suggestedMajorsFr: "Médecine Générale (MBBS), Médecine Dentaire, Pharmacie, Biotechnologie, Agronomie",
    suggestedMajorsEn: "Clinical Medicine (MBBS), Dentistry, Pharmacy, Biotechnology, Agronomy",
    suggestedMajorsAr: "الطب البشري (MBBS)، طب الأسنان، الصيدلة، التكنولوجيا الحيوية، والعلوم الزراعية",
    tipsFr: "La chimie et les mathématiques sont cruciales pour les facultés de médecine chinoises (Capital Medical University, Zhejiang, Fudan). Révisez les concepts de chimie organique en anglais.",
    tipsEn: "Chemistry and Mathematics are critical for Chinese medical schools (Capital Medical, Zhejiang, Fudan). Revise organic chemistry concepts in English.",
    tipsAr: "مادتا الكيمياء والرياضيات هامتان جداً للقبول في كليات الطب الصينية المعتمدة. راجع مصطلحات الكيمياء العضوية باللغة الإنجليزية.",
  },
  {
    id: "eco",
    nameFr: "Sciences Économiques & Gestion (Eco/TGC)",
    nameEn: "Economics & Business Management (Eco)",
    nameAr: "العلوم الاقتصادية والتدبير (Eco/TGC)",
    recommendedSubjects: ["math"],
    suggestedMajorsFr: "Commerce International, E-Commerce, Finance, Logistique Mondiale, Management",
    suggestedMajorsEn: "International Economics & Trade, E-Commerce, Finance, Global Supply Chain, Management",
    suggestedMajorsAr: "التجارة الدولية، التجارة الإلكترونية، المالية، إدارة الأعمال واللوجستيك الدولي",
    tipsFr: "Pour les programmes d'économie et commerce (comme à UIBE Pékin ou SUFE Shanghai), seule l'épreuve de Mathématiques (voie générale) est exigée.",
    tipsEn: "For economics and business programs (e.g. UIBE Beijing or SUFE Shanghai), only the Mathematics exam (General Track) is required.",
    tipsAr: "للتخصصات الاقتصادية وإدارة الأعمال، تحتاج فقط لاجتياز اختبار الرياضيات في CSCA. ركز على الإحصاء والجبر والدوال المالية.",
  },
  {
    id: "lettres",
    nameFr: "Lettres & Sciences Humaines",
    nameEn: "Humanities, Languages & Arts",
    nameAr: "الآداب والعلوم الإنسانية واللغات",
    recommendedSubjects: ["math", "chinese"],
    suggestedMajorsFr: "Langue & Littérature Chinoise, Relations Internationales, Tourisme, Médias & Communication",
    suggestedMajorsEn: "Chinese Language & Culture, International Relations, Tourism, Media & Communication",
    suggestedMajorsAr: "اللغة الصينية وآدابها، العلاقات الدولية، السياحة، الإعلام والتواصل الدولي",
    tipsFr: "Pour les cursus en chinois, vous devez passer l'épreuve de Chinois académique CSCA ainsi que les Mathématiques élémentaires.",
    tipsEn: "For Chinese-taught humanities, you must take the Academic Chinese CSCA exam plus elementary Mathematics.",
    tipsAr: "للبرامج الأدبية باللغة الصينية، يُطلب اجتياز اختبار اللغة الصينية الأكاديمية والرياضيات الأساسية.",
  },
];

const FAQS = [
  {
    qEn: "Is the CSCA exam required for Master's or PhD applicants?",
    qFr: "L'examen CSCA est-il obligatoire pour les candidats en Master ou Doctorat (PhD) ?",
    qAr: "هل امتحان CSCA إجباري للمتقدمين للماستر أو الدكتوراه؟",
    aEn: "NO. The CSCA (China Scholastic Competency Assessment) is strictly required for Undergraduate / Bachelor's degree (Licence) applicants. Master's and PhD candidates DO NOT need to take this exam.",
    aFr: "NON. L'examen CSCA concerne EXCLUSIVEMENT les candidats au Bachelor (1er cycle / Licence). Les candidats postulant pour un Master ou un Doctorat (PhD) en sont totalement dispensés.",
    aAr: "لا. امتحان CSCA موجه حصرياً للمتقدمين لدرجة البكالوريوس (الإجازة / الليسانس). المتقدمون لبرامج الماستر أو الدكتوراه معفيون تماماً ولا يحتاجون لاجتيازه.",
  },
  {
    qEn: "Can Moroccan students take the CSCA exam online from home in Morocco?",
    qFr: "Les étudiants marocains peuvent-ils passer l'examen CSCA en ligne depuis leur domicile au Maroc ?",
    qAr: "هل يمكن للطلاب المغاربة اجتياز امتحان CSCA أونلاين من منازلهم في المغرب؟",
    aEn: "YES! CSCA provides an official Remote Online Proctored test format. You can take the exam from anywhere in Morocco using a computer with webcam, microphone, stable internet, and the official CSCA Secure Client software.",
    aFr: "OUI ! Le CSCA propose une formule officielle d'examen télésurveillé en ligne (Online Proctored). Vous pouvez le passer depuis votre chambre au Maroc avec un ordinateur équipé d'une webcam, d'un micro, d'une connexion internet stable et du logiciel sécurisé CSCA.",
    aAr: "نعم! يوفر نظام CSCA إمكانية اجتياز الامتحان عن بُعد بمراقبة إلكترونية مشددة (Remote Proctored). يمكنك اجتيازه من منزلك في أي مدينة بالمغرب بواسطة حاسوب متصل بالإنترنت ومزود بكاميرا وميكروفون.",
  },
  {
    qEn: "What language is the CSCA exam conducted in?",
    qFr: "En quelle langue se déroule l'examen CSCA ?",
    qAr: "بأي لغة تُجرى اختبارات CSCA؟",
    aEn: "You can choose your exam language during registration on csca.cn: ENGLISH (for English-taught Bachelor programs) or CHINESE (for Chinese-taught programs). Most Moroccan students applying for English-taught degrees select English.",
    aFr: "Vous choisissez la langue lors de votre inscription sur csca.cn : ANGLAIS (pour les programmes de Bachelor enseignés en anglais) ou CHINOIS (pour les cursus sinophones). La grande majorité des bacheliers marocains choisissent l'Anglais.",
    aAr: "يمكنك اختيار لغة الامتحان أثناء التسجيل على csca.cn: إما اللغة الإنجليزية (للبرامج الموجهة بالإنجليزية) أو اللغة الصينية. أغلب الطلاب المغاربة يختارون اللغة الإنجليزية.",
  },
  {
    qEn: "How much does the CSCA exam cost, and how can I pay from Morocco?",
    qFr: "Combien coûte l'examen CSCA et comment payer depuis le Maroc ?",
    qAr: "كم تبلغ رسوم امتحان CSCA وكيف يتم الدفع من المغرب؟",
    aEn: "Registration fees are approximately 420-450 RMB (~$60 USD / ~630 MAD) for a single subject, or ~700-850 RMB (~$100 USD / ~1,000 MAD) for a combined 2-3 subject package. You can pay online using any Moroccan international debit/credit card (with active e-commerce dotation), Visa, Mastercard, or digital wallets.",
    aFr: "Les frais d'inscription sont d'environ 420 à 450 RMB (~60 USD / ~630 MAD) pour une matière, ou 700 à 850 RMB (~100 USD / ~1 000 MAD) pour un forfait combiné de 2 à 3 matières. Le règlement s'effectue en ligne par carte bancaire internationale marocaine (avec dotation e-commerce activée), Visa, Mastercard ou Alipay/WeChat Pay.",
    aAr: "تبلغ الرسوم حوالي 420-450 يوان صيني (~630 درهم مغربي) للمادة الواحدة، أو 700-850 يوان (~1000 درهم) لحزمة مادتين أو ثلاث مواد. يمكن الدفع بواسطة أي بطاقة بنكية مغربية دولية مفعلة لخاصية الشراء عبر الإنترنت (Dotation e-commerce) أو فيزا وماستركارد.",
  },
  {
    qEn: "How long is the CSCA score certificate valid?",
    qFr: "Quelle est la durée de validité de l'attestation de score CSCA ?",
    qAr: "ما هي مدة صلاحية شهادة نقاط CSCA؟",
    aEn: "Your CSCA score report is valid for 2 YEARS from the test date. You can use it across multiple university applications and CSC Chinese Government Scholarship rounds.",
    aFr: "Le rapport de score CSCA est valable 2 ANS à compter de la date du test. Vous pouvez l'utiliser pour postuler à plusieurs universités chinoises ainsi qu'aux bourses du gouvernement chinois CSC.",
    aAr: "شهادة نقاط CSCA صالحة لمدة سنتين كاملتين من تاريخ اجتياز الاختبار. يمكنك استعمالها للتقديم على عدة جامعات صينية ومنح الحكومة الصينية CSC.",
  },
  {
    qEn: "Can I retake the CSCA exam if I am unhappy with my score?",
    qFr: "Puis-je repasser l'examen CSCA si ma note n'est pas suffisante ?",
    qAr: "هل يمكنني إعادة امتحان CSCA إذا لم تكن نتيجتي مرضية؟",
    aEn: "YES! CSCA holds multiple test windows every year (usually once or twice a month during peak admissions season from November to June). You can register for an upcoming session to improve your score.",
    aFr: "OUI ! Le CSCA organise plusieurs sessions chaque mois tout au long de la période de candidature (de novembre à juin). Vous êtes libre de vous réinscrire à une session suivante pour améliorer votre note.",
    aAr: "نعم! تنظم هيئة CSCA جلسات اختبار متعددة شهرياً على مدار العام (خاصة بين شهري نونبر ويونيو). يمكنك حجز موعد جديد وإعادة الاختبار لتحسين نتيجتك.",
  },
];

export default function CscaPage() {
  const { lang, t } = useLang();

  // Mode: "major" (Default: What do you want to study?) or "bac" (What is your Moroccan Bac?)
  const [matchMode, setMatchMode] = useState<"major" | "bac">("major");

  // Major-based state
  const [selectedMajorId, setSelectedMajorId] = useState<string>("software");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [majorSearch, setMajorSearch] = useState<string>("");

  // Bac-based state
  const [selectedBac, setSelectedBac] = useState<string>(MOROCCAN_BAC_PRESETS[0].id);
  const [targetDegreeLang, setTargetDegreeLang] = useState<"en" | "zh">("en");

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<string>("math");

  // Filtered majors by category and search
  const filteredMajors = useMemo(() => {
    return STUDY_MAJORS.filter((m) => {
      const matchCat = selectedCategory === "all" || m.category === selectedCategory;
      const q = majorSearch.toLowerCase().trim();
      if (!q) return matchCat;
      const matchText =
        m.nameFr.toLowerCase().includes(q) ||
        m.nameEn.toLowerCase().includes(q) ||
        m.nameAr.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q);
      return matchCat && matchText;
    });
  }, [selectedCategory, majorSearch]);

  const activeMajor =
    STUDY_MAJORS.find((m) => m.id === selectedMajorId) || STUDY_MAJORS[0];

  const currentPreset =
    MOROCCAN_BAC_PRESETS.find((p) => p.id === selectedBac) ||
    MOROCCAN_BAC_PRESETS[0];

  // Fee calculation for Major Mode
  const majorFeeRmb =
    activeMajor.requiredSubjects.length === 1
      ? 450
      : activeMajor.requiredSubjects.length === 2
      ? 750
      : 950;
  const majorFeeMad = Math.round(majorFeeRmb * 1.4);
  const majorFeeUsd = Math.round(majorFeeRmb * 0.14);

  // Subject recommendation for Bac Mode
  const recommendedSubjectList = CSCA_SUBJECTS.filter((s) => {
    if (s.id === "math") return true;
    if (targetDegreeLang === "zh" && s.id === "chinese") return true;
    return currentPreset.recommendedSubjects.includes(s.id);
  });
  const bacFeeRmb =
    recommendedSubjectList.length === 1
      ? 450
      : recommendedSubjectList.length === 2
      ? 750
      : 950;
  const bacFeeMad = Math.round(bacFeeRmb * 1.4);
  const bacFeeUsd = Math.round(bacFeeRmb * 0.14);

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/student-portal"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-text-muted hover:text-cyan transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl-flip" />
          <span>{lang === "ar" ? "العودة لبوابة الطلاب" : "Retour au Portail Étudiant"}</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CSC Admissions 2026/2027</span>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-3xl p-6 sm:p-10 border border-border-glass relative overflow-hidden mb-10 glow-cyan-sm"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-4 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>
              {lang === "ar"
                ? "إعلان رسمي وإجباري لمرحلة البكالوريوس"
                : "Examen Officiel Obligatoire pour Bachelor en Chine"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight leading-tight mb-4">
            CSCA : <span className="gradient-text">China Scholastic Competency Assessment</span>
            <br />
            <span className="text-2xl sm:text-3xl font-extrabold text-text-secondary">
              (来华留学本科入学学业水平测试)
            </span>
          </h1>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-6">
            {lang === "ar"
              ? "هل ترغب في دراسة هندسة البرمجيات (Software Engineering)، التجارة الإلكترونية (E-Commerce)، أو الطب في الصين ولا تعرف أي مادة يجب عليك اجتيازها؟ استخدم أداة المطابقة التفاعلية أدناه لمعرفة المواد الإجبارية بالضبط ورابط حجز الموعد على csca.cn."
              : "Vous voulez étudier le Génie Logiciel (Software), le E-Commerce, la Médecine ou l'Ingénierie en Chine et ne savez pas quelle épreuve passer ? Choisissez votre filière ci-dessous pour connaître exactement vos examens et réserver votre place officielle sur csca.cn."}
          </p>

          {/* Critical Notice Alert Box: Bachelor ONLY */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 mb-8">
            <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300 font-bold">
                {lang === "ar" ? "توضيح حاسم للطلاب :" : "Précision essentielle :"}
              </strong>{" "}
              {lang === "ar"
                ? "امتحان CSCA إلزامي حصرياً لطلاب مرحلة البكالوريوس (Undergraduate / Bachelor). طلاب الماستر والدكتوراه (Master / PhD) معفيون تماماً ولا يحتاجون للتسجيل في هذا الاختبار."
                : "L'examen CSCA est exigé uniquement pour les admissions en Bachelor (1er cycle universitaire). Les candidats pour un Master ou un Doctorat (PhD) ne sont PAS concernés et n'ont pas besoin de le passer."}
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#major-matcher"
              className="btn-gradient px-6 py-3.5 rounded-xl text-sm sm:text-base font-bold flex items-center gap-2 shadow-lg shadow-cyan/20 hover:scale-105 transition-transform cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>
                {lang === "ar"
                  ? "اختر تخصصك (Software، E-Commerce...)"
                  : "Choisir ma Filière (Software, E-Commerce...)"}
              </span>
            </a>

            <a
              href="https://www.csca.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="glass px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-text-primary hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{lang === "ar" ? "بوابة حجز الموعد csca.cn" : "Portail Rendez-vous csca.cn"}</span>
              <ExternalLink className="w-4 h-4 text-cyan" />
            </a>

            <a
              href="https://csca.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-cyan glass border border-border-glass flex items-center gap-1.5 transition-colors"
            >
              <Laptop className="w-4 h-4 text-cyan" />
              <span>{lang === "ar" ? "امتحانات تجريبية CSCA.ai" : "Examens Blancs CSCA.ai"}</span>
            </a>
          </div>
        </div>
      </motion.div>

      {/* 4 Key Pillar Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div className="glass rounded-2xl p-5 border border-border-glass">
          <div className="w-10 h-10 rounded-xl bg-cyan/15 text-cyan flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="text-xs text-text-muted font-bold uppercase tracking-wider">
            {lang === "ar" ? "المستوى الدراسي" : "Niveau Requis"}
          </div>
          <div className="text-lg font-black text-text-primary mt-1">
            {lang === "ar" ? "البكالوريوس فقط" : "Bachelor / Licence"}
          </div>
          <div className="text-xs text-text-secondary mt-1">
            {lang === "ar" ? "خريجو البكالوريا المغربية" : "Bacheliers marocains & intl."}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-border-glass">
          <div className="w-10 h-10 rounded-xl bg-purple/15 text-purple flex items-center justify-center mb-3">
            <Laptop className="w-5 h-5" />
          </div>
          <div className="text-xs text-text-muted font-bold uppercase tracking-wider">
            {lang === "ar" ? "طريقة الاجتياز" : "Format d'Examen"}
          </div>
          <div className="text-lg font-black text-text-primary mt-1">
            {lang === "ar" ? "أونلاين عن بُعد (Proctored)" : "En Ligne Télésurveillé"}
          </div>
          <div className="text-xs text-text-secondary mt-1">
            {lang === "ar" ? "من منزلك في المغرب" : "Passage à domicile au Maroc"}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-border-glass">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3">
            <Coins className="w-5 h-5" />
          </div>
          <div className="text-xs text-text-muted font-bold uppercase tracking-wider">
            {lang === "ar" ? "رسوم التسجيل" : "Frais d'Examen"}
          </div>
          <div className="text-lg font-black text-emerald-400 mt-1">
            ~450 RMB <span className="text-xs text-text-muted font-normal">(~630 MAD)</span>
          </div>
          <div className="text-xs text-text-secondary mt-1">
            {lang === "ar" ? "دفع بالبطاقة البنكية المغربية" : "Paiement CB dotation e-com"}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-border-glass">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-xs text-text-muted font-bold uppercase tracking-wider">
            {lang === "ar" ? "صلاحية الشهادة" : "Validité des Résultats"}
          </div>
          <div className="text-lg font-black text-text-primary mt-1">
            2 Ans (24 Mois)
          </div>
          <div className="text-xs text-text-secondary mt-1">
            {lang === "ar" ? "معترف بها لدى كل الجامعات" : "Valable universités & CSC"}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION VEDETTE: CHOOSE WHAT YOU WANT TO STUDY (MAJOR-TO-EXAM MATCHER)   */}
      {/* ========================================================================= */}
      <section id="major-matcher" className="mb-14 scroll-mt-24">
        {/* Header with Mode Switcher */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-cyan/15 text-cyan border border-cyan/30 mb-3 animate-shimmer">
            <Compass className="w-3.5 h-3.5" />
            <span>
              {lang === "ar"
                ? "دليل توجيه الامتحانات حسب التخصص الدراسي"
                : "Simulateur Officiel CSCA : Choisissez ce que vous voulez étudier"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-text-primary tracking-tight">
            {lang === "ar"
              ? "ماذا تريد أن تدرس في الصين؟"
              : "Que souhaitez-vous étudier en Chine ?"}
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mt-2">
            {lang === "ar"
              ? "اختر تخصصك المستهدف (هندسة البرمجيات Software، التجارة الإلكترونية E-Commerce، الطب MBBS...) لنخبرك بالمواد المطلوبة بالتفصيل وبما يجب عليك تحديده على csca.cn."
              : "Sélectionnez votre filière (Génie Logiciel Software, E-Commerce, Médecine MBBS, Commerce International...) pour savoir exactement quelles épreuves cocher et passer sur le portail csca.cn."}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl glass border border-border-glass mt-6 gap-1">
            <button
              onClick={() => setMatchMode("major")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                matchMode === "major"
                  ? "btn-gradient text-white shadow-md shadow-cyan/20"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>
                {lang === "ar"
                  ? "🎯 حسب التخصص الجامعي (موصى به)"
                  : "🎯 Par Filière d'Études (Recommandé)"}
              </span>
            </button>
            <button
              onClick={() => setMatchMode("bac")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                matchMode === "bac"
                  ? "btn-gradient text-white shadow-md shadow-cyan/20"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>
                {lang === "ar"
                  ? "🇲🇦 حسب شعبة البكالوريا المغربية"
                  : "🇲🇦 Par Série de Baccalauréat"}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* MODE A: BY STUDY MAJOR (SOFTWARE, E-COMMERCE, MBBS, ETC.) */}
        {/* ========================================================== */}
        {matchMode === "major" && (
          <div className="space-y-6">
            {/* Filter Pills & Live Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass rounded-2xl p-4 border border-border-glass">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {[
                  { id: "all", labelFr: "Toutes les filières", labelAr: "جميع التخصصات" },
                  { id: "tech", labelFr: "💻 Informatique & Logiciel", labelAr: "💻 المعلوميات" },
                  { id: "business", labelFr: "🛍️ E-Commerce & Business", labelAr: "🛍️ التجارة الإلكترونية" },
                  { id: "medicine", labelFr: "🩺 Médecine & Santé", labelAr: "🩺 الطب والصيدلة" },
                  { id: "engineering", labelFr: "🏗️ Ingénierie & BTP", labelAr: "🏗️ الهندسة والبناء" },
                  { id: "humanities", labelFr: "🌏 Langues & Tourisme", labelAr: "🌏 اللغات والسياحة" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-cyan text-slate-950 shadow-sm shadow-cyan/30"
                        : "glass text-text-secondary hover:text-cyan hover:bg-white/5"
                    }`}
                  >
                    {lang === "ar" ? cat.labelAr : cat.labelFr}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    lang === "ar"
                      ? "ابحث: software, e-commerce, mbbs..."
                      : "Filtrer: software, e-commerce, civil..."
                  }
                  value={majorSearch}
                  onChange={(e) => setMajorSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl glass border border-border-glass text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan"
                />
              </div>
            </div>

            {/* Main Interactive Grid: Major Selector (Left) + Detailed Requirements Card (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Selectable Majors List (5 Cols) */}
              <div className="lg:col-span-5 space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {filteredMajors.length === 0 ? (
                  <div className="glass rounded-2xl p-8 text-center text-text-muted text-xs">
                    {lang === "ar"
                      ? "لم يتم العثور على تخصص يطابق بحثك."
                      : "Aucune filière trouvée pour cette recherche."}
                  </div>
                ) : (
                  filteredMajors.map((major) => {
                    const isSelected = selectedMajorId === major.id;
                    return (
                      <button
                        key={major.id}
                        onClick={() => setSelectedMajorId(major.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer group ${
                          isSelected
                            ? "bg-gradient-to-r from-cyan/20 via-blue/15 to-transparent border-cyan text-text-primary shadow-lg shadow-cyan/10"
                            : "glass text-text-secondary border-border-glass hover:bg-white/5 hover:border-cyan/30"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-transform group-hover:scale-105 ${
                              isSelected
                                ? "bg-cyan text-slate-950 font-black"
                                : "bg-white/5 text-cyan"
                            }`}
                          >
                            {major.category === "tech"
                              ? "💻"
                              : major.category === "business"
                              ? "🛍️"
                              : major.category === "medicine"
                              ? "🩺"
                              : major.category === "engineering"
                              ? "🏗️"
                              : "🌏"}
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-extrabold text-text-primary leading-tight">
                              {lang === "ar"
                                ? major.nameAr
                                : lang === "en"
                                ? major.nameEn
                                : major.nameFr}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan/15 text-cyan font-bold">
                                {major.requiredSubjects.length === 1
                                  ? lang === "ar"
                                    ? "مادة واحدة فقط (رياضيات)"
                                    : "1 seule épreuve (Maths)"
                                  : lang === "ar"
                                  ? `${major.requiredSubjects.length} مواد مطلوبة`
                                  : `${major.requiredSubjects.length} matières requises`}
                              </span>
                              {major.exemptSubjects.includes("physics") && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold">
                                  {lang === "ar" ? "بدون فيزياء" : "Sans Physique"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform ${
                            isSelected
                              ? "text-cyan translate-x-1 rtl:-translate-x-1"
                              : "text-text-muted"
                          }`}
                        />
                      </button>
                    );
                  })
                )}
              </div>

              {/* Right Column: Dynamic Master Result Card (7 Cols) */}
              <div className="lg:col-span-7 glass rounded-3xl p-6 sm:p-8 border border-border-glass bg-gradient-to-br from-cyan/5 via-purple/5 to-transparent relative shadow-xl">
                {/* Header Badge & Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-border-glass gap-3 mb-6">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-cyan px-2.5 py-1 rounded-full bg-cyan/15 border border-cyan/30 inline-block mb-2">
                      {lang === "ar"
                        ? activeMajor.categoryLabelAr
                        : lang === "en"
                        ? activeMajor.categoryLabelEn
                        : activeMajor.categoryLabelFr}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-text-primary">
                      {lang === "ar"
                        ? activeMajor.nameAr
                        : lang === "en"
                        ? activeMajor.nameEn
                        : activeMajor.nameFr}
                    </h3>
                  </div>

                  {/* Fee badge */}
                  <div className="text-left sm:text-right bg-white/5 p-3 rounded-2xl border border-white/5 flex-shrink-0">
                    <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                      {lang === "ar" ? "رسوم التسجيل المقدرة" : "Frais Officiels CSCA"}
                    </div>
                    <div className="text-xl font-black text-emerald-400">
                      {majorFeeMad} MAD
                    </div>
                    <div className="text-[11px] text-text-muted">
                      ~{majorFeeRmb} RMB ({majorFeeUsd} USD)
                    </div>
                  </div>
                </div>

                {/* 1. REQUIRED SUBJECTS TO SIT FOR */}
                <div className="mb-6">
                  <div className="text-xs font-black text-text-primary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>
                      {lang === "ar"
                        ? "المواد الإجبارية التي يجب عليك اجتيازها في امتحان CSCA :"
                        : "Épreuves CSCA Obligatoires à Cocher & Passer :"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeMajor.requiredSubjects.map((subId) => {
                      const sub = CSCA_SUBJECTS.find((s) => s.id === subId);
                      return (
                        <div
                          key={subId}
                          className="p-3.5 rounded-2xl bg-cyan/10 border border-cyan/40 flex items-center gap-3 shadow-sm"
                        >
                          <div className="w-9 h-9 rounded-xl bg-cyan text-slate-950 font-black text-xs flex items-center justify-center">
                            {subId === "math"
                              ? "∑"
                              : subId === "physics"
                              ? "⚛"
                              : subId === "chemistry"
                              ? "🧪"
                              : "文"}
                          </div>
                          <div>
                            <div className="text-sm font-black text-text-primary">
                              {sub
                                ? lang === "ar"
                                  ? sub.nameAr
                                  : lang === "en"
                                  ? sub.nameEn
                                  : sub.nameFr
                                : subId}
                            </div>
                            <div className="text-[11px] text-cyan font-bold">
                              ✓ {lang === "ar" ? "مطلوبة للتسجيل" : "Épreuve Requise"}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Exempted Subjects Notice */}
                    {activeMajor.exemptSubjects.map((subId) => {
                      const subName =
                        subId === "physics"
                          ? lang === "ar"
                            ? "الفيزياء"
                            : "Physique"
                          : subId === "chemistry"
                          ? lang === "ar"
                            ? "الكيمياء"
                            : "Chimie"
                          : lang === "ar"
                          ? "اللغة الصينية"
                          : "Chinois";
                      return (
                        <div
                          key={subId}
                          className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3 opacity-75"
                        >
                          <div className="w-9 h-9 rounded-xl bg-white/5 text-text-muted font-bold text-xs flex items-center justify-center">
                            ✕
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-text-muted line-through">
                              {subName}
                            </div>
                            <div className="text-[11px] text-emerald-400 font-medium">
                              {lang === "ar" ? "غير مطلوبة (معفى منها)" : "Non requise (Dispensé)"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. WHY THIS COMBINATION? */}
                <div className="mb-5 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-xs font-black text-cyan uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {lang === "ar"
                        ? "لماذا تم تحديد هذه المواد تحديداً؟"
                        : "Pourquoi cette combinaison est demandée ?"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {lang === "ar"
                      ? activeMajor.whyAr
                      : lang === "en"
                      ? activeMajor.whyEn
                      : activeMajor.whyFr}
                  </p>
                </div>

                {/* 3. MOROCCAN HIGH SCHOOL BAC MATCH */}
                <div className="mb-5 p-4 rounded-2xl bg-purple/10 border border-purple/20">
                  <div className="text-xs font-black text-purple uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>
                      {lang === "ar"
                        ? "التوافق مع البكالوريا المغربية :"
                        : "Profil Baccalauréat Marocain Recommandé :"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-medium">
                    {lang === "ar"
                      ? activeMajor.moroccanBacAdviceAr
                      : lang === "en"
                      ? activeMajor.moroccanBacAdviceEn
                      : activeMajor.moroccanBacAdviceFr}
                  </p>
                </div>

                {/* 4. STEP-BY-STEP CHECKBOX GUIDE FOR CSCA.CN */}
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-xs font-black text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {lang === "ar"
                        ? "ما يجب عليك تحديده بالضبط على بوابة csca.cn :"
                        : "Ce que vous devez cocher exactement sur csca.cn :"}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-200/90 font-medium">
                    {(lang === "ar"
                      ? activeMajor.cscaStepsAr
                      : lang === "en"
                      ? activeMajor.cscaStepsEn
                      : activeMajor.cscaStepsFr
                    ).map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 5. TOP CHINESE UNIVERSITIES FOR THIS MAJOR */}
                <div className="mb-6">
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan" />
                    <span>
                      {lang === "ar"
                        ? "أفضل الجامعات الصينية الرائدة في هذا التخصص :"
                        : "Meilleures universités chinoises pour cette filière :"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeMajor.topUnis.map((uni, idx) => (
                      <Link
                        key={idx}
                        href={`/scholarships?city=${encodeURIComponent(uni.city.split(" ")[0])}`}
                        className="px-3 py-1.5 rounded-xl glass hover:bg-white/10 hover:border-cyan/40 transition-all text-xs font-semibold text-text-primary flex items-center gap-1.5"
                      >
                        <span>🏛️ {uni.name}</span>
                        <span className="text-[10px] text-cyan font-normal">({uni.city})</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <a
                    href="https://www.csca.cn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex-1 btn-gradient py-3.5 px-6 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan/20 cursor-pointer"
                  >
                    <span>
                      {lang === "ar"
                        ? `حجز موعد ${activeMajor.nameAr.split(" ")[0]} على csca.cn`
                        : `Prendre Rendez-vous sur csca.cn`}
                    </span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <Link
                    href={`/scholarships?level=bachelor`}
                    className="w-full sm:w-auto glass py-3.5 px-5 rounded-xl text-center text-xs sm:text-sm font-semibold text-text-secondary hover:text-cyan transition-colors"
                  >
                    {lang === "ar" ? "تصفح منح هذا التخصص" : "Voir les bourses CSC"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* MODE B: BY MOROCCAN HIGH SCHOOL BACCALAUREATE SERIES      */}
        {/* ========================================================== */}
        {matchMode === "bac" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Controls (Left 5 Cols) */}
            <div className="lg:col-span-5 space-y-6 glass rounded-3xl p-6 border border-border-glass">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  1. {lang === "ar" ? "شعبة البكالوريا في المغرب" : "Série du Baccalauréat Marocain"}
                </label>
                <div className="space-y-2">
                  {MOROCCAN_BAC_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedBac(preset.id)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        selectedBac === preset.id
                          ? "bg-cyan/15 text-cyan border-cyan/50 shadow-md shadow-cyan/10"
                          : "glass text-text-secondary border-border-glass hover:bg-white/5"
                      }`}
                    >
                      <span>
                        {lang === "ar"
                          ? preset.nameAr
                          : lang === "en"
                          ? preset.nameEn
                          : preset.nameFr}
                      </span>
                      {selectedBac === preset.id && (
                        <CheckCircle2 className="w-4 h-4 text-cyan flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  2. {lang === "ar" ? "لغة التدريس في الجامعة الصينية" : "Langue d'Enseignement du Programme en Chine"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTargetDegreeLang("en")}
                    className={`p-3 rounded-xl border text-xs sm:text-sm font-bold text-center transition-all cursor-pointer ${
                      targetDegreeLang === "en"
                        ? "bg-purple/20 text-purple border-purple shadow-md shadow-purple/10"
                        : "glass text-text-secondary border-border-glass hover:bg-white/5"
                    }`}
                  >
                    🇬🇧 {lang === "ar" ? "برنامج بالإنجليزية" : "English-Taught"}
                  </button>
                  <button
                    onClick={() => setTargetDegreeLang("zh")}
                    className={`p-3 rounded-xl border text-xs sm:text-sm font-bold text-center transition-all cursor-pointer ${
                      targetDegreeLang === "zh"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500 shadow-md shadow-rose-500/10"
                        : "glass text-text-secondary border-border-glass hover:bg-white/5"
                    }`}
                  >
                    🇨🇳 {lang === "ar" ? "برنامج بالصينية" : "Chinese-Taught"}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Card (Right 7 Cols) */}
            <div className="lg:col-span-7 glass rounded-3xl p-6 sm:p-8 border border-border-glass bg-gradient-to-br from-cyan/5 via-purple/5 to-transparent relative">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-glass">
                <div>
                  <span className="text-xs font-bold text-cyan uppercase tracking-wider">
                    {lang === "ar" ? "نتيجة التوجيه الأكاديمي" : "Recommandation d'Examen"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-text-primary mt-1">
                    {lang === "ar"
                      ? currentPreset.nameAr
                      : lang === "en"
                      ? currentPreset.nameEn
                      : currentPreset.nameFr}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-text-muted font-bold">
                    {lang === "ar" ? "تقدير الرسوم" : "Coût Estimé"}
                  </div>
                  <div className="text-xl font-black text-emerald-400">
                    {bacFeeMad} MAD
                  </div>
                  <div className="text-[11px] text-text-muted">
                    ~{bacFeeRmb} RMB ({bacFeeUsd} USD)
                  </div>
                </div>
              </div>

              {/* Recommended Subjects Badges */}
              <div className="mb-6">
                <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5">
                  {lang === "ar"
                    ? "المواد الواجب حجزها على csca.cn :"
                    : "Matières à Réserver sur le Portail csca.cn :"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {recommendedSubjectList.map((subject) => (
                    <div
                      key={subject.id}
                      className="p-3 rounded-xl glass border border-border-glass flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyan/15 text-cyan flex items-center justify-center font-bold text-xs">
                        {subject.id === "math"
                          ? "∑"
                          : subject.id === "physics"
                          ? "⚛"
                          : subject.id === "chemistry"
                          ? "🧪"
                          : "文"}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-text-primary">
                          {lang === "ar"
                            ? subject.nameAr
                            : lang === "en"
                            ? subject.nameEn
                            : subject.nameFr}
                        </div>
                        <div className="text-[11px] text-text-muted">
                          {subject.id === "math"
                            ? lang === "ar"
                              ? "مادة إجبارية"
                              : "Obligatoire"
                            : lang === "ar"
                            ? "مادة تخصصية"
                            : "Électif de spécialité"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Majors in China */}
              <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-xs font-bold text-cyan uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "التخصصات المتوافقة في الصين" : "Filières universitaires idéales en Chine"}</span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {lang === "ar"
                    ? currentPreset.suggestedMajorsAr
                    : lang === "en"
                    ? currentPreset.suggestedMajorsEn
                    : currentPreset.suggestedMajorsFr}
                </p>
              </div>

              {/* Golden Moroccan Bac Preparation Tip */}
              <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                <strong className="text-amber-300 font-bold block mb-1">
                  💡 {lang === "ar" ? "نصيحة ذهبية للطلاب المغاربة :" : "Conseil de préparation pour bacheliers marocains :"}
                </strong>
                {lang === "ar"
                  ? currentPreset.tipsAr
                  : lang === "en"
                  ? currentPreset.tipsEn
                  : currentPreset.tipsFr}
              </div>

              {/* Action CTA with direct booking link */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href="https://www.csca.cn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 btn-gradient py-3.5 px-6 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan/20 cursor-pointer"
                >
                  <span>{lang === "ar" ? "حجز هذا الموعد رسمياً على csca.cn" : "Réserver ce pack sur csca.cn"}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <Link
                  href="/ai-chat"
                  className="w-full sm:w-auto glass py-3.5 px-5 rounded-xl text-center text-xs sm:text-sm font-semibold text-text-secondary hover:text-cyan transition-colors"
                >
                  {lang === "ar" ? "استشارة المساعد الذكي" : "Poser une question à l'IA"}
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Step-by-Step Appointment Booking Walkthrough */}
      <section className="mb-14">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple/10 text-purple border border-purple/20 mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "دليل حجز الموعد خطوة بخطوة" : "Procédure Officielle de Rendez-vous"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            {lang === "ar"
              ? "كيف تأخذ موعداً وتجتاز امتحان CSCA من المغرب؟"
              : "Comment prendre rendez-vous et passer le CSCA depuis le Maroc ?"}
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mt-2">
            {lang === "ar"
              ? "اتبع هذه الخطوات الست للتسجيل في الامتحان وتحميل شهادة النقاط المعتمدة لملف منحتك."
              : "Suivez ces étapes chronologiques pour valider votre inscription, réussir l'épreuve à distance et obtenir votre attestation officielle."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              titleFr: "Création de compte sur csca.cn",
              titleEn: "Account Creation on csca.cn",
              titleAr: "إنشاء حساب على منصة csca.cn",
              descFr: "Rendez-vous sur le site officiel csca.cn. Créez votre profil candidat en renseignant votre numéro de passeport marocain et une adresse email valide.",
              descEn: "Visit official csca.cn portal. Create your applicant profile using your Moroccan passport number and a valid email address.",
              descAr: "ادخل للموقع الرسمي csca.cn وأنشئ حسابك الشخصي باستخدام رقم جواز السفر المغربي وبريدك الإلكتروني.",
              icon: Globe,
            },
            {
              step: "02",
              titleFr: "Choix de la session & Date",
              titleEn: "Select Exam Window & Date",
              titleAr: "اختيار موعد وتاريخ الجلسة",
              descFr: "Sélectionnez le créneau horaire souhaité. Les sessions ont lieu plusieurs fois par mois, tout au long de la période de candidature aux bourses CSC.",
              descEn: "Select your preferred date. Test windows run several times per month throughout the Chinese university and CSC admissions cycle.",
              descAr: "حدد الموعد الأنسب لك. تُعقد جلسات الاختبار عدة مرات شهرياً بالتزامن مع فترات التقديم على المنح الصينية.",
              icon: Calendar,
            },
            {
              step: "03",
              titleFr: "Sélection des matières & Langue",
              titleEn: "Choose Subjects & Test Language",
              titleAr: "تحديد المواد ولغة الاختبار",
              descFr: "Cochez Mathématiques (obligatoire) + vos spécialités (Physique/Chimie). Choisissez la langue de test : Anglais pour les filières en anglais.",
              descEn: "Select Mathematics (compulsory) plus your electives (Physics/Chemistry). Choose English if applying for English-taught degrees.",
              descAr: "اختر الرياضيات (إجبارية) بالإضافة للمواد التخصصية (فيزياء/كيمياء). اختر الإنجليزية لاختبار باللغة الإنجليزية.",
              icon: BookOpen,
            },
            {
              step: "04",
              titleFr: "Paiement en ligne sécurisé",
              titleEn: "Online Fee Payment",
              titleAr: "سداد الرسوم أونلاين بأمان",
              descFr: "Réglez les frais (~450 RMB par matière / ~750 RMB pack) via carte bancaire marocaine internationale dotée de l'option e-commerce, Visa ou Mastercard.",
              descEn: "Pay registration fee (~450 RMB single / ~750 RMB pack) via international credit/debit card, Visa, Mastercard or digital wallet.",
              descAr: "قم بدفع رسوم التسجيل بواسطة بطاقتك البنكية المغربية الدولية (Dotation e-commerce) أو فيزا وماستركارد.",
              icon: Coins,
            },
            {
              step: "05",
              titleFr: "Installation du logiciel de test",
              titleEn: "Download Secure Client & Diagnostic",
              titleAr: "تثبيت برنامج الامتحان وفحص الكاميرا",
              descFr: "Téléchargez le logiciel sécurisé CSCA sur votre PC (Windows ou Mac). Effectuez le test de compatibilité caméra, micro et débit internet 48h avant l'épreuve.",
              descEn: "Download the official CSCA secure browser on Windows or Mac. Run camera, microphone, and network speed diagnostic 48h prior.",
              descAr: "حمّل برنامج المراقبة الآمن CSCA على حاسوبك، وافحص الكاميرا والميكروفون وسرعة الإنترنت قبل الامتحان بـ 48 ساعة.",
              icon: Laptop,
            },
            {
              step: "06",
              titleFr: "Passage & Attestation QR Code",
              titleEn: "Exam & Official Verified Transcript",
              titleAr: "اجتياز الامتحان وتحميل الشهادة",
              descFr: "Passez l'épreuve télésurveillée. Vos résultats et l'attestation électronique officielle munie d'un QR code infalsifiable sont délivrés sous 7 à 14 jours.",
              descEn: "Complete your proctored test. Your official score certificate with cryptographic QR code will be ready within 7-14 business days.",
              descAr: "اجتز الامتحان، وستحصل على شهادة النقاط الرسمية المعتمدة برمز QR الإلكتروني خلال 7 إلى 14 يوماً لرفعها على بوابة CSC.",
              icon: Award,
            },
          ].map((item) => (
            <div
              key={item.step}
              className="glass rounded-3xl p-6 border border-border-glass relative overflow-hidden group card-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black gradient-text tracking-tight">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-cyan/10 text-cyan flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-text-primary mb-2">
                {lang === "ar"
                  ? item.titleAr
                  : lang === "en"
                  ? item.titleEn
                  : item.titleFr}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {lang === "ar"
                  ? item.descAr
                  : lang === "en"
                  ? item.descEn
                  : item.descFr}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Syllabus Tabs */}
      <section className="mb-14">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "محتوى وبرامج الاختبارات" : "Programme Officiel des Matières"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            {lang === "ar"
              ? "المحاور والمقررات بالتفصيل لكل مادة"
              : "Programme & Format Détaillé de Chaque Épreuve"}
          </h2>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {CSCA_SUBJECTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === s.id
                  ? "btn-gradient shadow-md shadow-cyan/20 text-white"
                  : "glass text-text-secondary border border-border-glass hover:bg-white/5"
              }`}
            >
              <span>
                {lang === "ar"
                  ? s.nameAr.split(" ")[0]
                  : lang === "en"
                  ? s.nameEn.split(" ")[0]
                  : s.nameFr.split(" ")[0]}
              </span>
              {s.isCompulsory && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-extrabold uppercase">
                  {lang === "ar" ? "إجباري" : "Requis"}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Active Content */}
        {(() => {
          const currentSub =
            CSCA_SUBJECTS.find((s) => s.id === activeTab) || CSCA_SUBJECTS[0];
          return (
            <div className="glass rounded-3xl p-6 sm:p-8 border border-border-glass">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-border-glass">
                <div>
                  <div className="text-xs font-bold text-cyan uppercase tracking-wider mb-1">
                    {currentSub.nameZh}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-text-primary">
                    {lang === "ar"
                      ? currentSub.nameAr
                      : lang === "en"
                      ? currentSub.nameEn
                      : currentSub.nameFr}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1">
                    {lang === "ar"
                      ? currentSub.targetMajorsAr
                      : lang === "en"
                      ? currentSub.targetMajorsEn
                      : currentSub.targetMajorsFr}
                  </p>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-cyan/10 border border-cyan/30 text-cyan text-xs font-bold self-start md:self-auto">
                  ⏱️{" "}
                  {lang === "ar"
                    ? currentSub.formatAr
                    : lang === "en"
                    ? currentSub.formatEn
                    : currentSub.formatFr}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSub.topics.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl glass border border-border-glass flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-lg bg-cyan/20 text-cyan font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="text-xs sm:text-sm text-text-primary font-medium leading-relaxed">
                      {lang === "ar" ? t.ar : lang === "en" ? t.en : t.fr}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* Online Proctored Exam Technical Checklist */}
      <section className="mb-14 glass rounded-3xl p-6 sm:p-8 border border-border-glass bg-gradient-to-r from-cyan/5 via-blue/5 to-purple/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan/20 text-cyan flex items-center justify-center">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-text-primary">
              {lang === "ar"
                ? "قائمة الشروط التقنية للاختبار أونلاين من المغرب"
                : "Checklist Technique pour le Test en Ligne au Maroc"}
            </h3>
            <p className="text-xs text-text-secondary">
              {lang === "ar"
                ? "تأكد من توفر هذه المتطلبات لتفادي أي إلغاء للاختبار من قِبل المراقب الافتراضي."
                : "Assurez-vous de respecter ces conditions techniques pour éviter toute disqualification lors de la session."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {[
            {
              fr: "PC portable ou bureau avec Windows 10/11 ou macOS récent",
              en: "Laptop or Desktop PC running Windows 10/11 or macOS",
              ar: "حاسوب محمول أو مكتبي بنظام Windows 10/11 أو macOS",
            },
            {
              fr: "Webcam HD fonctionnelle et microphone opérationnel",
              en: "Working HD webcam and clear microphone enabled",
              ar: "كاميرا ويب عالية الدقة وميكروفون يعمل بوضوح",
            },
            {
              fr: "Connexion Internet stable (débit descendant ≥ 5 Mbps)",
              en: "Stable Internet connection (download speed ≥ 5 Mbps)",
              ar: "اتصال إنترنت سريع ومستقر (سرعة لا تقل عن 5 ميغابت)",
            },
            {
              fr: "Pièce fermée, calme et éclairée sans tierce personne",
              en: "Private, quiet, well-lit room with no other people present",
              ar: "غرفة خاصة وهادئة ومضاءة جيداً بدون تواجد أي شخص آخر",
            },
            {
              fr: "Passeport marocain original à portée de main pour vérification",
              en: "Original Moroccan passport at hand for proctor identity check",
              ar: "أصل جواز السفر المغربي في متناول يدك للتحقق من الهوية",
            },
            {
              fr: "Fermeture de toutes les applications d'arrière-plan (Zoom, Discord...)",
              en: "Close all background apps and communicators (Zoom, Discord)",
              ar: "إغلاق جميع التطبيقات وبرامج المراسلة في الخلفية",
            },
          ].map((c, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5"
            >
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-text-secondary font-medium">
                {lang === "ar" ? c.ar : lang === "en" ? c.en : c.fr}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="mb-14">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "الأسئلة الأكثر تداولاً" : "Questions Fréquentes"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            {lang === "ar" ? "كل ما تريد معرفته عن امتحان CSCA" : "Foire Aux Questions sur l'Examen CSCA"}
          </h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass rounded-2xl border border-border-glass overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-text-primary hover:text-cyan transition-colors cursor-pointer"
                >
                  <span>{lang === "ar" ? faq.qAr : lang === "en" ? faq.qEn : faq.qFr}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-cyan transition-transform flex-shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border-glass pt-3 bg-white/[0.02]">
                    {lang === "ar" ? faq.aAr : lang === "en" ? faq.aEn : faq.aFr}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Action Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass rounded-3xl p-8 sm:p-12 text-center border border-cyan/30 glow-cyan relative overflow-hidden"
      >
        <h2 className="text-2xl sm:text-4xl font-black text-text-primary tracking-tight mb-3">
          {lang === "ar"
            ? "جاهز لحجز موعدك في امتحان CSCA؟"
            : "Prêt(e) à réserver votre rendez-vous pour le CSCA ?"}
        </h2>
        <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto mb-8">
          {lang === "ar"
            ? "لا تدع المواعيد تفوتك! احجز مقعدك في الجلسة القادمة عبر الموقع الرسمي، وأضف شهادة النقاط إلى ملف منحة الحكومة الصينية لتضمن قبولك."
            : "Ne laissez pas passer les créneaux d'examen ! Réservez votre place sur le portail officiel dès maintenant pour soumettre votre dossier de bourse CSC complet dans les délais."}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://www.csca.cn"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gradient px-8 py-4 rounded-xl text-base font-bold flex items-center gap-2 shadow-lg shadow-cyan/20 hover:scale-105 transition-transform cursor-pointer"
          >
            <span>{lang === "ar" ? "الدخول للبوابة الرسمية csca.cn" : "Accéder au Portail Officiel csca.cn"}</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <Link
            href="/scholarships?level=bachelor"
            className="glass px-8 py-4 rounded-xl text-base font-semibold text-text-primary hover:bg-white/10 transition-all cursor-pointer"
          >
            {lang === "ar" ? "استكشاف منح البكالوريوس" : "Explorer les Bourses Bachelor"}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
