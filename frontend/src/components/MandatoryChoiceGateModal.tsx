"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Check,
  Languages,
  BookOpen,
  Cpu,
  TrendingUp,
  Stethoscope,
  Wrench,
  Globe,
  Award,
  RotateCcw,
  X,
  Compass,
  FileCheck2,
  HelpCircle,
} from "lucide-react";
import Logo from "./Logo";
import { useApplicationMode, type ApplicationMode } from "@/lib/ApplicationModeContext";
import { useLang, type Lang } from "@/lib/i18n";

interface QuizAnswers {
  lang: Lang;
  level: "bachelor" | "master" | "phd" | "language";
  field: "tech" | "business" | "medicine" | "engineering" | "humanities";
  grade: "excellent" | "good" | "average" | "pass";
  instructionLang: "english" | "chinese" | "any";
  mode: ApplicationMode;
}

const DEFAULT_ANSWERS: QuizAnswers = {
  lang: "ar",
  level: "bachelor",
  field: "tech",
  grade: "good",
  instructionLang: "english",
  mode: "assisted",
};

export default function MandatoryChoiceGateModal() {
  const { showChoiceModal, chooseMode, closeChoiceModal, hasChosenMode } = useApplicationMode();
  const { lang, setLang } = useLang();

  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    ...DEFAULT_ANSWERS,
    lang: (lang as Lang) || "ar",
  });

  // Load previously saved answers if any
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("student_orientation_answers");
        if (saved) {
          const parsed = JSON.parse(saved);
          setAnswers((prev) => ({ ...prev, ...parsed, lang: (lang as Lang) || parsed.lang }));
        }
      } catch {}
    }
  }, [lang]);

  if (!showChoiceModal) return null;

  const handleSelectLang = (selectedLang: Lang) => {
    setLang(selectedLang);
    setAnswers((prev) => ({ ...prev, lang: selectedLang }));
    // Auto-advance to step 2 after picking language
    setStep(2);
  };

  const handleFinish = (finalMode: ApplicationMode) => {
    try {
      localStorage.setItem("student_orientation_answers", JSON.stringify({ ...answers, mode: finalMode }));
      localStorage.setItem("student_orientation_completed", "true");
    } catch {}
    chooseMode(finalMode);
  };

  const resetQuiz = () => {
    setStep(1);
  };

  /* ─────────────────────────────────────────────────────────────
      DICTIONARY OF SIMPLE, USER-FRIENDLY TEXTS (AR / FR / EN)
  ───────────────────────────────────────────────────────────── */
  const texts = {
    ar: {
      stepLabel: (cur: number, total: number) => `المرحلة ${cur} من ${total}`,
      skipBtn: "تخطي والاستكشاف السريع",
      backBtn: "السابق",
      nextBtn: "متابعة",
      refakeBtn: "إعادة الاستبيان وتغيير الأجوبة",
      closeBtn: "إغلاق",
      // Step 1: Language
      step1Title: "أهلاً بك! باشمن لغة كتفضل نتواصلو معاك؟",
      step1Sub: "اختر لغتك المفضلة للإجابة على بعض الأسئلة البسيطة ونعطيوك المنحة والمسار الأنسب لمعدلك وتخصصك.",
      langArTitle: "العربية (المغرب)",
      langArSub: "بالدارجة المغربية المبسطة وساهلة للجميع",
      langFrTitle: "Français",
      langFrSub: "Pour tous les étudiants francophones",
      langEnTitle: "English",
      langEnSub: "Direct & international friendly",
      // Step 2: Level
      step2Title: "شنو هو المستوى الدراسي ديالك حالياً؟",
      step2Sub: "باش نعرفو السلك الجامعي ونوع المنحة لي تناسب ديبلومك الحالي.",
      levelBac: "باكلوريا (باغي نقرا البكالوريوس / Bachelor)",
      levelBacSub: "دراسة جامعية لمدة 4 سنوات بعد نيل شهادة الباكالوريا",
      levelLicence: "إجازة / دبلوم جامعي (باغي نقرا الماستر / Master)",
      levelLicenceSub: "دراسة وتخصص لمدة سنتين إلى 3 سنوات بعد الإجازة أو الباك+3",
      levelMaster: "ماستر أو ديبلوم مهندس (باغي نقرا الدكتوراه / PhD)",
      levelMasterSub: "بحث علمي بتمويل كامل وراتب شهري وتأطير عالي المستوى",
      levelLang: "باغي غير سنة لغة صينية تحضيرية أولاً",
      levelLangSub: "سنة كاملة لتعلم وإتقان اللغة الصينية بدون ضغط جامعي",
      // Step 3: Field
      step3Title: "شنو هو التخصص أو المجال لي باغي تقراه؟",
      step3Sub: "الصين رائدة عالمياً وتمنح أولويات تمويل لهذه الشعب.",
      fieldTech: "الإعلاميات، البرمجة والذكاء الاصطناعي",
      fieldTechSub: "Computer Science, AI, Big Data, هندسة البرمجيات",
      fieldBiz: "التجارة، إدارة الأعمال والتجارة الإلكترونية",
      fieldBizSub: "Business, Management, E-Commerce, التجارة الدولية",
      fieldMed: "الطب العام، الصيدلة وطب الأسنان",
      fieldMedSub: "MBBS بالإنجليزية، جراحة الأسنان، العلوم الصحية",
      fieldEng: "الهندسة والعلوم التطبيقية والصناعة",
      fieldEngSub: "هندسة مدنية، ميكانيك، طاقة شمسية وكهرباء",
      fieldHum: "اللغات، الآداب والعلاقات الدولية",
      fieldHumSub: "لغات وترجمة، دراسات دولية، دبلوماسية وثقافة",
      // Step 4: Grades
      step4Title: "شحال المعدل العام أو النقطة التقريبية ديالك؟",
      step4Sub: "مهما كانت نقطتك، كاينين منح دراسية وتسهيلات كتناسب كاع النقط.",
      gradeEx: "ممتاز (16 فما فوق) - Mention Très Bien",
      gradeExSub: "أولوية قصوى للمنح الحكومية الكاملة مع راتب شهري وسكن مجاني",
      gradeGd: "جيد (14 إلى 15.99) - Mention Bien",
      gradeGdSub: "مؤهل بقوة لمنح المقاطعات والجامعات الكبرى الممولة",
      gradeAv: "متوسط (12 إلى 13.99) - Mention Assez Bien",
      gradeAvSub: "مؤهل لمنح الإعفاء من رسوم الدراسة والسكن الجامعي",
      gradePs: "مقبول (10 إلى 11.99) - Passable",
      gradePsSub: "فرص قبول ممتازة مع منح جزئية وتخفيضات جامعية",
      // Step 5: Instruction Language
      step5Title: "باشمن لغة باغي تقرا فالجامعة الصينية؟",
      step5Sub: "مكاين حتى شرط باش تكون كتعرف الصينية مسبقاً، كلشي ميسر.",
      instEng: "100% بالإنجليزية (بدون الحاجة لتعلم الصينية مسبقاً)",
      instEngSub: "جميع المحاضرات، الامتحانات والمراجع باللغة الإنجليزية",
      instCn: "باللغة الصينية (مع سنة لغة تمهيدية ممولة بالكامل)",
      instCnSub: "سنة لغة أولى مدفوعة المصاريف بالكامل قبل بداية التخصص",
      instAny: "ماعنديش مشكل / لي فيه أفضل فرصة ومنحة مضمونة",
      instAnySub: "المهم هو الحصول على قبول جامعي موثوق وأكبر نسبة تمويل",
      // Step 6: Mode / Application Method
      step6Title: "كيفاش باغي تدفع للجامعات؟ واش نعاونوك ونتكلفو بيك ولا باغي تدفع لراسك؟",
      step6Sub: "اختر الطريقة لي كتناسبك، حنا معاك فجميع الحالات:",
      modeAssistedTitle: "بغيتكم تكلفو بيا من الألف للياء (قبول مضمون 100% وزيرو صداع الرأس)",
      modeAssistedBadge: "⭐ الأكثر طلباً • ضمان القبول أو استرجاع الأموال",
      modeAssistedPoints: [
        "ترجمة وراقك الرسمية للغة الصينية ترجمة محلفة وتصديقها من الخارجية (Apostille).",
        "كتابة رسالة الدوافع (SOP) وخطة الدراسة باحترافية لإقناع لجنة القبول.",
        "مراسلة الجامعات الشريكة مباشرة واستخراج القبول الرسمي واستمارة الفيزا JW202.",
        "ضمان استرجاع 100% لأموال الخدمة في حالة عدم الحصول على القبول!",
      ],
      modeAssistedBtn: "اختيار خدمة التكفل والضمان ➔",
      modeSelfTitle: "باغي نقلب وندفع لراسي بوحدي (بالمجان وبدون وسيط)",
      modeSelfBadge: "مسار مستقل 100% مجاني",
      modeSelfPoints: [
        "تصفح مجاني لكتالوج أكثر من 100 جامعة ومنحة صينية رسمية.",
        "الحصول على كود الوكالة (Agency Number) وروابط التقديم الرسمية مجاناً.",
        "دليل مجاني لتحضير الفحص الطبي والوثائق والتأشيرة بنفسك.",
      ],
      modeSelfBtn: "اختيار التقديم الذاتي المستقل ➔",
      // Step 7: Results
      resultTitle: "🎉 تهانينا! ها هي نتيجة التوجيه الخاصة بملفك:",
      resultSub: "بناءً على أجوبتك، حضرنا ليك التوصية المناسبة والمنح المتاحة:",
      resFieldLabel: "التخصص الموصى به",
      resSchLabel: "المنح المتوافقة مع معدلك",
      resBenefitsLabel: "الامتيازات المقدرة لملفك",
      resCscaLabel: "وضع اختبار CSCA",
      benefit1: "إعفاء 100% من رسوم الدراسة (0 درهم مصاريف)",
      benefit2: "سكن جامعي مجاني داخل الحرم الجامعي",
      benefit3: "منحة ومصروف شهري: 2,500 إلى 3,500 درهم صيني / شهر",
      cscaText: "اختبار CSCA مبسط أو معفى مبني على التخصص والملف الأكاديمي",
      actionAssistedBtn: "🚀 ابدأ ملفك الآن مع خدمة التكفل والضمان ➔",
      actionSelfBtn: "🎓 الانتقال لكتالوج المنح وبدء التقديم الذاتي ➔",
    },
    fr: {
      stepLabel: (cur: number, total: number) => `Étape ${cur} sur ${total}`,
      skipBtn: "Passer et explorer",
      backBtn: "Précédent",
      nextBtn: "Continuer",
      refakeBtn: "Refaire le questionnaire",
      closeBtn: "Fermer",
      // Step 1: Language
      step1Title: "Bienvenue ! Dans quelle langue préférez-vous échanger ?",
      step1Sub: "Choisissez votre langue préférée pour répondre à quelques questions très simples et identifier la bourse idéale en Chine.",
      langArTitle: "العربية (المغرب)",
      langArSub: "بالدارجة المغربية المبسطة وساهلة للجميع",
      langFrTitle: "Français",
      langFrSub: "Simple, clair et accessible à tous les étudiants",
      langEnTitle: "English",
      langEnSub: "Direct & international friendly",
      // Step 2: Level
      step2Title: "Quel est votre niveau d'études actuel ?",
      step2Sub: "Pour déterminer le cycle universitaire et le type de bourse correspondant.",
      levelBac: "Baccalauréat (Je vise une Licence / Bachelor en Chine)",
      levelBacSub: "Formation universitaire de 4 ans après l'obtention du Bac",
      levelLicence: "Licence / Bac+3 (Je vise un Master en Chine)",
      levelLicenceSub: "Spécialisation de 2 à 3 ans après Bac+3 ou Licence",
      levelMaster: "Master ou Ingénieur (Je vise un Doctorat / PhD)",
      levelMasterSub: "Recherche scientifique rémunérée avec allocation mensuelle",
      levelLang: "Année préparatoire de langue chinoise seule",
      levelLangSub: "1 an intensif pour maîtriser le mandarin sans pression universitaire",
      // Step 3: Field
      step3Title: "Quel domaine d'études vous intéresse le plus ?",
      step3Sub: "Les universités chinoises sont leaders mondiaux dans ces filières prioritaires.",
      fieldTech: "Informatique, Logiciel & Intelligence Artificielle",
      fieldTechSub: "Computer Science, IA, Big Data, Cybersécurité",
      fieldBiz: "Commerce, Gestion & E-Commerce",
      fieldBizSub: "Business, Management, Finance & Commerce International",
      fieldMed: "Médecine Générale, Pharmacie & Santé",
      fieldMedSub: "Programme MBBS en anglais, Dentaire, Soins",
      fieldEng: "Ingénierie & Sciences Appliquées",
      fieldEngSub: "Génie civil, Énergie, Mécanique, Électrique",
      fieldHum: "Langues, Traduction & Relations Internationales",
      fieldHumSub: "Langues appliquées, Diplomatie, Communication globale",
      // Step 4: Grades
      step4Title: "Quelle est votre moyenne générale approximative ?",
      step4Sub: "Des bourses et facilités existent pour chaque tranche de moyenne.",
      gradeEx: "Excellent (16/20 ou plus) - Mention Très Bien",
      gradeExSub: "Priorité Bourses Gouvernementales CSC Complètes + Salaire mensuel",
      gradeGd: "Bien (14 à 15.99/20) - Mention Bien",
      gradeGdSub: "Très fortes chances pour bourses provinciales et grandes universités",
      gradeAv: "Assez Bien (12 à 13.99/20)",
      gradeAvSub: "Éligible aux bourses d'exemption de scolarité et hébergement",
      gradePs: "Passable (10 à 11.99/20)",
      gradePsSub: "Excellentes options avec bourses partielles et réductions garanties",
      // Step 5: Instruction Language
      step5Title: "Dans quelle langue souhaitez-vous étudier en Chine ?",
      step5Sub: "Aucun niveau préalable en chinois n'est requis pour les filières en anglais.",
      instEng: "100% en Anglais (Aucun chinois requis)",
      instEngSub: "Tous les cours, examens et travaux dirigés en anglais",
      instCn: "En Chinois (avec 1 an préparatoire de langue financé)",
      instCnSub: "1 an de mandarin intensif boursé avant de débuter la spécialité",
      instAny: "Peu importe (Priorité à la meilleure opportunité)",
      instAnySub: "Priorité absolue à l'admission garantie et au meilleur financement",
      // Step 6: Mode
      step6Title: "Comment souhaitez-vous postuler ? Avec notre aide ou en toute autonomie ?",
      step6Sub: "Choisissez la formule qui vous convient le mieux :",
      modeAssistedTitle: "Je veux que votre équipe s'occupe de TOUT (Admission Garantie & Zéro Tracas)",
      modeAssistedBadge: "⭐ Plus Populaire • Admission Garantie 100%",
      modeAssistedPoints: [
        "Traduction assermentée en mandarin et légalisation MAEC (Apostille).",
        "Rédaction experte de votre lettre de motivation & plan d'études (SOP).",
        "Dépôt prioritaire auprès de nos universités partenaires et délivrance du JW202.",
        "Garantie 100% : Admission officielle obtenue ou remboursement intégral !",
      ],
      modeAssistedBtn: "Choisir la Délégation & Garantie ➔",
      modeSelfTitle: "Je préfère chercher et postuler tout seul (100% Gratuit)",
      modeSelfBadge: "Parcours 100% Autonome",
      modeSelfPoints: [
        "Accès gratuit au catalogue de plus de 100 universités et bourses.",
        "Codes Agency Numbers officiels et liens directs vers les portails.",
        "Guides gratuits pour la visite médicale, l'équivalence et le visa.",
      ],
      modeSelfBtn: "Choisir la Candidature Autonome ➔",
      // Step 7: Results
      resultTitle: "🎉 Félicitations ! Voici votre diagnostic personnalisé :",
      resultSub: "Sur la base de vos réponses, voici la recommandation optimale pour votre dossier :",
      resFieldLabel: "Filière Recommandée",
      resSchLabel: "Bourses Éligibles",
      resBenefitsLabel: "Avantages Estimés",
      resCscaLabel: "Test Académique CSCA",
      benefit1: "Exemption 100% des frais de scolarité (0 DH)",
      benefit2: "Logement universitaire sur campus inclus",
      benefit3: "Allocation mensuelle : 2 500 à 3 500 RMB / mois",
      cscaText: "Test CSCA adapté ou dispensé selon votre filière et votre dossier",
      actionAssistedBtn: "🚀 Lancer mon Dossier avec Garantie d'Admission ➔",
      actionSelfBtn: "🎓 Accéder au Catalogue des Bourses Gratuites ➔",
    },
    en: {
      stepLabel: (cur: number, total: number) => `Step ${cur} of ${total}`,
      skipBtn: "Skip and explore",
      backBtn: "Back",
      nextBtn: "Continue",
      refakeBtn: "Retake Questionnaire",
      closeBtn: "Close",
      // Step 1: Language
      step1Title: "Welcome! Which language do you prefer?",
      step1Sub: "Choose your preferred language to answer a few quick questions and match your ideal Chinese scholarship.",
      langArTitle: "العربية (المغرب)",
      langArSub: "بالدارجة المغربية المبسطة وساهلة للجميع",
      langFrTitle: "Français",
      langFrSub: "Simple, clair et direct",
      langEnTitle: "English",
      langEnSub: "Direct & international friendly",
      // Step 2: Level
      step2Title: "What is your current education level?",
      step2Sub: "To identify matching degree cycles and scholarship eligibility.",
      levelBac: "High School / Baccalaureate (Applying for Bachelor)",
      levelBacSub: "4-year undergraduate degree in China",
      levelLicence: "Bachelor's Degree / Bac+3 (Applying for Master)",
      levelLicenceSub: "2 to 3 years specialized master program",
      levelMaster: "Master's Degree / Engineering (Applying for PhD)",
      levelMasterSub: "Funded scientific research + monthly stipend",
      levelLang: "Chinese Language Foundation Year Only",
      levelLangSub: "1 full year of intensive Mandarin immersion without degree pressure",
      // Step 3: Field
      step3Title: "Which study field interests you the most?",
      step3Sub: "Chinese universities lead globally in these high-demand fields.",
      fieldTech: "Computer Science, AI & Software Engineering",
      fieldTechSub: "Coding, AI, Big Data, Cybersecurity, Robotics",
      fieldBiz: "Business, Management & E-Commerce",
      fieldBizSub: "International Trade, Finance, Supply Chain & Marketing",
      fieldMed: "General Medicine (MBBS) & Health",
      fieldMedSub: "English-taught MBBS, Pharmacy, Dental surgery",
      fieldEng: "Engineering & Applied Sciences",
      fieldEngSub: "Civil, Mechanical, Electrical & Renewable Energy",
      fieldHum: "Languages, Humanities & Global Affairs",
      fieldHumSub: "Applied linguistics, diplomacy, translation & cultural studies",
      // Step 4: Grades
      step4Title: "What is your approximate overall average grade?",
      step4Sub: "Scholarships and admissions exist for every grade category.",
      gradeEx: "Excellent (16/20 or higher) - High Honors",
      gradeExSub: "Top priority for Full CSC Government Scholarships + Monthly stipend",
      gradeGd: "Good (14 to 15.99/20) - Honors",
      gradeGdSub: "Strong eligibility for Provincial and Top University grants",
      gradeAv: "Average (12 to 13.99/20)",
      gradeAvSub: "Tuition waiver and free dormitory accommodation",
      gradePs: "Passing (10 to 11.99/20)",
      gradePsSub: "Guaranteed admissions with partial scholarship fee discounts",
      // Step 5: Instruction Language
      step5Title: "In which language do you want your courses taught?",
      step5Sub: "No prior Chinese language knowledge is required for English degrees.",
      instEng: "100% English-Taught (No Chinese required)",
      instEngSub: "All lectures, course materials and exams fully in English",
      instCn: "Chinese-Taught (With 1-year funded language preparatory)",
      instCnSub: "1 year intensive funded Mandarin before entering major",
      instAny: "No Preference (Best available scholarship)",
      instAnySub: "Prioritize guaranteed admission and maximum scholarship coverage",
      // Step 6: Mode
      step6Title: "How would you like to apply? Let our team handle it or apply on your own?",
      step6Sub: "Pick the pathway that fits your lifestyle best:",
      modeAssistedTitle: "I want your team to handle EVERYTHING (100% Guaranteed Admission & Zero Stress)",
      modeAssistedBadge: "⭐ Most Popular • 100% Admission Guarantee",
      modeAssistedPoints: [
        "Sworn Chinese translation and Foreign Affairs legalization (Apostille).",
        "Expert Statement of Purpose (SOP) & study plan tailored for approval.",
        "Direct submission to partner universities & official JW202 visa form.",
        "100% money-back guarantee if university admission is not secured!",
      ],
      modeAssistedBtn: "Choose Concierge & Guarantee ➔",
      modeSelfTitle: "I prefer to explore and apply by myself (100% Free)",
      modeSelfBadge: "100% Independent Pathway",
      modeSelfPoints: [
        "Free access to directory of 100+ Chinese universities and scholarships.",
        "Official Agency Numbers and direct university application links.",
        "Free self-service guides for medical checkup and visa preparation.",
      ],
      modeSelfBtn: "Choose Free Self-Apply ➔",
      // Step 7: Results
      resultTitle: "🎉 Congratulations! Here is your personalized recommendation:",
      resultSub: "Based on your selections, here are the optimal scholarships matching your profile:",
      resFieldLabel: "Recommended Major",
      resSchLabel: "Matching Scholarships",
      resBenefitsLabel: "Estimated Coverage",
      resCscaLabel: "CSCA Exam Status",
      benefit1: "100% tuition fee waiver (0 DH tuition)",
      benefit2: "Free on-campus university accommodation",
      benefit3: "Monthly living stipend: 2,500 to 3,500 RMB / month",
      cscaText: "Simplified or waived CSCA test depending on major & degree cycle",
      actionAssistedBtn: "🚀 Launch My Application with Guaranteed Admission ➔",
      actionSelfBtn: "🎓 Explore Free Scholarships & Apply by Myself ➔",
    },
  };

  const t = texts[answers.lang] || texts.ar;
  const totalSteps = 7;

  // Resolve matching scholarship name based on grade & level
  const getScholarshipName = () => {
    if (answers.grade === "excellent") {
      return answers.lang === "ar"
        ? "منحة الحكومة الصينية الكاملة (CSC Type B) + منحة المقاطعة الرئاسية"
        : answers.lang === "fr"
        ? "Bourse Complète du Gouvernement Chinois (CSC Type B) + Bourse Provinciale d'Excellence"
        : "Full Chinese Government Scholarship (CSC Type B) + Provincial Excellence Grant";
    }
    if (answers.grade === "good") {
      return answers.lang === "ar"
        ? "منحة المقاطعات الكبرى (Provincial Government) + منحة تميز الجامعة"
        : answers.lang === "fr"
        ? "Bourse Gouvernementale Provinciale + Bourse d'Excellence Universitaire"
        : "Provincial Government Scholarship + University Excellence Grant";
    }
    if (answers.grade === "average") {
      return answers.lang === "ar"
        ? "منحة طريق الحرير (Silk Road Belt) + إعفاء كامل من مصاريف الدراسة"
        : answers.lang === "fr"
        ? "Bourse Route de la Soie (Silk Road) + Exemption Totale des Frais de Scolarité"
        : "Silk Road Scholarship + Full Tuition Fee Waiver";
    }
    return answers.lang === "ar"
      ? "منحة التميز الجامعي الجزئية (خصم 50% إلى 100% من الدراسة) مع قبول مؤكد"
      : answers.lang === "fr"
      ? "Bourse Universitaire Partielle (Réduction de 50% à 100%) & Admission Garantie"
      : "University Partial Scholarship (50% to 100% tuition cut) & Guaranteed Admission";
  };

  const getFieldTitle = () => {
    switch (answers.field) {
      case "tech":
        return t.fieldTech;
      case "business":
        return t.fieldBiz;
      case "medicine":
        return t.fieldMed;
      case "engineering":
        return t.fieldEng;
      case "humanities":
        return t.fieldHum;
      default:
        return t.fieldTech;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Darkened backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#020611]/92 backdrop-blur-2xl"
          onClick={() => {
            if (hasChosenMode) closeChoiceModal();
          }}
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative w-full max-w-3xl rounded-3xl p-5 sm:p-8 bg-[#091022] border border-blue-500/30 text-white shadow-2xl shadow-blue-500/15 z-10 overflow-hidden my-auto"
        >
          {/* Subtle Ambient Glows */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-24 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Top Bar: Brand, Language Pills, Close Button */}
          <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan p-0.5 flex items-center justify-center shadow-md">
                <Logo size={30} showText={false} />
              </div>
              <div>
                <span className="text-xs font-black tracking-wider uppercase text-cyan block">
                  SCHOLAR<span className="text-white">CHINA</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block">
                  {answers.lang === "ar"
                    ? "استبيان التوجيه والمنح الدراسية 2026/2027"
                    : "Diagnostic & Orientation Chine 2026/2027"}
                </span>
              </div>
            </div>

            {/* Quick Language Switcher & Optional Close Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleSelectLang("ar")}
                  className={`px-2 py-0.5 rounded-lg transition-all text-xs cursor-pointer ${
                    answers.lang === "ar" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                  title="العربية"
                >
                  🇲🇦 AR
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLang("fr")}
                  className={`px-2 py-0.5 rounded-lg transition-all text-xs cursor-pointer ${
                    answers.lang === "fr" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                  title="Français"
                >
                  🇫🇷 FR
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLang("en")}
                  className={`px-2 py-0.5 rounded-lg transition-all text-xs cursor-pointer ${
                    answers.lang === "en" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                  title="English"
                >
                  🇬🇧 EN
                </button>
              </div>

              {hasChosenMode && (
                <button
                  type="button"
                  onClick={closeChoiceModal}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title={t.closeBtn}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar (Steps 1 to 6) */}
          <div className="mb-6 relative z-10">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
              <span>{t.stepLabel(step, totalSteps)}</span>
              <span className="text-cyan font-black">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan"
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* STEP 1: LANGUAGE SELECTION FIRST */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 relative z-10"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-cyan border border-blue-500/20 mb-2">
                  <Languages className="w-3.5 h-3.5" />
                  <span>اللغة / Language</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">{t.step1Title}</h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                  {t.step1Sub}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Arabic Card */}
                <button
                  type="button"
                  onClick={() => handleSelectLang("ar")}
                  className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between group cursor-pointer ${
                    answers.lang === "ar"
                      ? "bg-blue-600/20 border-cyan shadow-lg shadow-blue-500/20 ring-1 ring-cyan"
                      : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="text-3xl mb-2">🇲🇦</div>
                  <div>
                    <h3 className="text-sm font-black text-white group-hover:text-cyan transition-colors">
                      {t.langArTitle}
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-1">{t.langArSub}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-cyan">
                    <span>اختيار</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl-flip" />
                  </div>
                </button>

                {/* French Card */}
                <button
                  type="button"
                  onClick={() => handleSelectLang("fr")}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group cursor-pointer ${
                    answers.lang === "fr"
                      ? "bg-blue-600/20 border-cyan shadow-lg shadow-blue-500/20 ring-1 ring-cyan"
                      : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="text-3xl mb-2">🇫🇷</div>
                  <div>
                    <h3 className="text-sm font-black text-white group-hover:text-cyan transition-colors">
                      {t.langFrTitle}
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-1">{t.langFrSub}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-cyan">
                    <span>Choisir</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* English Card */}
                <button
                  type="button"
                  onClick={() => handleSelectLang("en")}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group cursor-pointer ${
                    answers.lang === "en"
                      ? "bg-blue-600/20 border-cyan shadow-lg shadow-blue-500/20 ring-1 ring-cyan"
                      : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="text-3xl mb-2">🇬🇧</div>
                  <div>
                    <h3 className="text-sm font-black text-white group-hover:text-cyan transition-colors">
                      {t.langEnTitle}
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-1">{t.langEnSub}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-cyan">
                    <span>Select</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: EDUCATION LEVEL */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 relative z-10"
            >
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-cyan border border-blue-500/20 mb-2">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{answers.lang === "ar" ? "المستوى الدراسي" : "Niveau d'études"}</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white">{t.step2Title}</h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1">{t.step2Sub}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "bachelor", icon: "🎓", title: t.levelBac, sub: t.levelBacSub },
                  { id: "master", icon: "📜", title: t.levelLicence, sub: t.levelLicenceSub },
                  { id: "phd", icon: "🔬", title: t.levelMaster, sub: t.levelMasterSub },
                  { id: "language", icon: "🇨🇳", title: t.levelLang, sub: t.levelLangSub },
                ].map((item) => {
                  const isSelected = answers.level === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setAnswers((prev) => ({ ...prev, level: item.id as any }))}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? "bg-blue-600/20 border-cyan shadow-lg shadow-blue-500/20 ring-1 ring-cyan"
                          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs sm:text-sm font-bold text-white">{item.title}</h3>
                          {isSelected && <Check className="w-4 h-4 text-cyan flex-shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: FIELD OF STUDY */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 relative z-10"
            >
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-cyan border border-blue-500/20 mb-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{answers.lang === "ar" ? "التخصص الجامعي" : "Filière / Domaine"}</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white">{t.step3Title}</h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1">{t.step3Sub}</p>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: "tech", icon: <Cpu className="w-5 h-5 text-cyan" />, title: t.fieldTech, sub: t.fieldTechSub },
                  { id: "business", icon: <TrendingUp className="w-5 h-5 text-amber-400" />, title: t.fieldBiz, sub: t.fieldBizSub },
                  { id: "medicine", icon: <Stethoscope className="w-5 h-5 text-rose-400" />, title: t.fieldMed, sub: t.fieldMedSub },
                  { id: "engineering", icon: <Wrench className="w-5 h-5 text-emerald-400" />, title: t.fieldEng, sub: t.fieldEngSub },
                  { id: "humanities", icon: <Globe className="w-5 h-5 text-indigo-400" />, title: t.fieldHum, sub: t.fieldHumSub },
                ].map((item) => {
                  const isSelected = answers.field === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setAnswers((prev) => ({ ...prev, field: item.id as any }))}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-blue-600/20 border-cyan shadow-lg shadow-blue-500/20 ring-1 ring-cyan"
                          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-white">{item.title}</h3>
                          <p className="text-[11px] text-slate-400">{item.sub}</p>
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-cyan text-slate-950 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 4: ACADEMIC GRADES */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 relative z-10"
            >
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-cyan border border-blue-500/20 mb-2">
                  <Award className="w-3.5 h-3.5" />
                  <span>{answers.lang === "ar" ? "المعدل والنقطة" : "Moyenne / Notes"}</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white">{t.step4Title}</h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1">{t.step4Sub}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "excellent", badge: "🌟", title: t.gradeEx, sub: t.gradeExSub },
                  { id: "good", badge: "👍", title: t.gradeGd, sub: t.gradeGdSub },
                  { id: "average", badge: "⚖️", title: t.gradeAv, sub: t.gradeAvSub },
                  { id: "pass", badge: "🎯", title: t.gradePs, sub: t.gradePsSub },
                ].map((item) => {
                  const isSelected = answers.grade === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setAnswers((prev) => ({ ...prev, grade: item.id as any }))}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? "bg-blue-600/20 border-cyan shadow-lg shadow-blue-500/20 ring-1 ring-cyan"
                          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0 mt-0.5">{item.badge}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs sm:text-sm font-bold text-white">{item.title}</h3>
                          {isSelected && <Check className="w-4 h-4 text-cyan flex-shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 5: INSTRUCTION LANGUAGE */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 relative z-10"
            >
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-cyan border border-blue-500/20 mb-2">
                  <Languages className="w-3.5 h-3.5" />
                  <span>{answers.lang === "ar" ? "لغة التدريس" : "Langue d'enseignement"}</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white">{t.step5Title}</h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1">{t.step5Sub}</p>
              </div>

              <div className="space-y-3">
                {[
                  { id: "english", flag: "🇬🇧", title: t.instEng, sub: t.instEngSub },
                  { id: "chinese", flag: "🇨🇳", title: t.instCn, sub: t.instCnSub },
                  { id: "any", flag: "🌐", title: t.instAny, sub: t.instAnySub },
                ].map((item) => {
                  const isSelected = answers.instructionLang === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setAnswers((prev) => ({ ...prev, instructionLang: item.id as any }))}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-blue-600/20 border-cyan shadow-lg shadow-blue-500/20 ring-1 ring-cyan"
                          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-3xl flex-shrink-0">{item.flag}</span>
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-white">{item.title}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-cyan text-slate-950 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 6: HOW DO YOU WANT TO APPLY (SIMPLE CONCIERGE VS INDEPENDENT) */}
          {step === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 relative z-10"
            >
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-2">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{answers.lang === "ar" ? "طريقة التقديم" : "Méthode de candidature"}</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white">{t.step6Title}</h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-1 leading-relaxed">
                  {t.step6Sub}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* OPTION 1: Concierge & Guarantee */}
                <div
                  onClick={() => setAnswers((prev) => ({ ...prev, mode: "assisted" }))}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                    answers.mode === "assisted"
                      ? "bg-gradient-to-b from-[#221609] via-[#101b2f] to-[#07101f] border-amber-500/80 shadow-xl shadow-amber-500/20 ring-1 ring-amber-400"
                      : "bg-white/5 border-white/10 hover:border-amber-500/40 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 font-black flex items-center justify-center shadow-md">
                        <Sparkles className="w-5 h-5 text-slate-950" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm">
                        {t.modeAssistedBadge}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-white mb-3 group-hover:text-amber-300 transition-colors">
                      {t.modeAssistedTitle}
                    </h3>

                    <ul className="space-y-2 mb-4 text-xs text-slate-300">
                      {t.modeAssistedPoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-black text-amber-300">
                    <span>{t.modeAssistedBtn}</span>
                    <ArrowRight className="w-4 h-4 rtl-flip" />
                  </div>
                </div>

                {/* OPTION 2: Free Self-Apply */}
                <div
                  onClick={() => setAnswers((prev) => ({ ...prev, mode: "self" }))}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                    answers.mode === "self"
                      ? "bg-slate-900 border-blue-500/80 shadow-xl shadow-blue-500/20 ring-1 ring-cyan"
                      : "bg-white/5 border-white/10 hover:border-blue-500/40 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-cyan border border-blue-500/30 flex items-center justify-center shadow-md">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                        {t.modeSelfBadge}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-white mb-3 group-hover:text-cyan transition-colors">
                      {t.modeSelfTitle}
                    </h3>

                    <ul className="space-y-2 mb-4 text-xs text-slate-300">
                      {t.modeSelfPoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-black text-cyan">
                    <span>{t.modeSelfBtn}</span>
                    <ArrowRight className="w-4 h-4 rtl-flip" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 7: PERSONALIZED RECOMMENDATION & RESULTS */}
          {step === 7 && (
            <motion.div
              key="step-7"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="space-y-5 relative z-10"
            >
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>{answers.lang === "ar" ? "تقرير التوجيه المخصص" : "Diagnostic Personnalisé"}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">{t.resultTitle}</h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1">{t.resultSub}</p>
              </div>

              {/* Recommendation Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-blue-500/40 shadow-xl space-y-4">
                {/* Field & Degree badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">{t.resFieldLabel}</span>
                    <span className="text-sm sm:text-base font-black text-cyan">{getFieldTitle()}</span>
                  </div>
                  <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-black bg-blue-600/30 text-blue-300 border border-blue-500/30">
                    {answers.level === "bachelor"
                      ? "Bachelor (4 ans)"
                      : answers.level === "master"
                      ? "Master (2-3 ans)"
                      : answers.level === "phd"
                      ? "Doctorat / PhD"
                      : "Année de langue chinoise"}
                  </span>
                </div>

                {/* Scholarships Matched */}
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold mb-1">{t.resSchLabel}</span>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>{getScholarshipName()}</span>
                  </div>
                </div>

                {/* Estimated Benefits Grid */}
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold mb-2">{t.resBenefitsLabel}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-emerald-300 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                      <span>{t.benefit1}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-blue-300 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
                      <span>{t.benefit2}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-amber-300 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                      <span>{t.benefit3}</span>
                    </div>
                  </div>
                </div>

                {/* CSCA Status */}
                <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/20 text-xs text-slate-300 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan flex-shrink-0" />
                  <span>
                    <strong className="text-white">{t.resCscaLabel}:</strong> {t.cscaText}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTON (Assisted vs Self) */}
              <div className="pt-2">
                {answers.mode === "assisted" ? (
                  <button
                    type="button"
                    onClick={() => handleFinish("assisted")}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:brightness-110 text-white font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5 text-amber-200" />
                    <span>{t.actionAssistedBtn}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleFinish("self")}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan hover:brightness-110 text-white font-black text-sm sm:text-base shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <GraduationCap className="w-5 h-5 text-white" />
                    <span>{t.actionSelfBtn}</span>
                  </button>
                )}
              </div>

              {/* Retake button */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={resetQuiz}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.refakeBtn}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Bottom Navigation Buttons (Steps 1 to 6) */}
          {step < 7 && (
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3 relative z-10">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl-flip" />
                  <span>{t.backBtn}</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {/* Skip button if already completed before */}
                {hasChosenMode && (
                  <button
                    type="button"
                    onClick={closeChoiceModal}
                    className="py-2.5 px-3 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {t.skipBtn}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan hover:brightness-110 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <span>{t.nextBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl-flip" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
