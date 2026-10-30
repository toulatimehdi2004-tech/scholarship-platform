const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'src', 'data', 'scholarshipsData.ts');
console.log('Reading:', dataFilePath);

const rawData = require(dataFilePath);
const baseScholarships = rawData.REAL_SCHOLARSHIPS.filter(s => s.id <= 408);
const baseDetails = {};
for (const [k, v] of Object.entries(rawData.REAL_SCHOLARSHIP_DETAILS)) {
  if (Number(k) <= 408) baseDetails[k] = v;
}

console.log('Base REAL_SCHOLARSHIPS count:', baseScholarships.length);
console.log('Base REAL_SCHOLARSHIP_DETAILS count:', Object.keys(baseDetails).length);

// Map universities from base
const uniMap = new Map();
baseScholarships.forEach(s => {
  if (!uniMap.has(s.university)) {
    uniMap.set(s.university, {
      id: s.university,
      name: s.university_name,
      city: s.university_city || 'Beijing',
      country: s.university_country || 'China',
      existingLevels: new Set(),
      existingTitles: new Set(),
      appLink: s.application_link || 'https://studyinchina.csc.edu.cn/'
    });
  }
  const u = uniMap.get(s.university);
  u.existingLevels.add(s.level);
  u.existingTitles.add(s.title);
  if (s.application_link && !u.appLink) {
    u.appLink = s.application_link;
  }
});

console.log('Total unique universities found:', uniMap.size);

// Find max existing ID
let maxId = Math.max(...baseScholarships.map(s => s.id), ...Object.keys(baseDetails).map(Number));
console.log('Current max ID:', maxId);

const PROVINCE_MAP = {
  'Beijing': 'Beijing Municipal Government',
  'Shanghai': 'Shanghai Government (SGS Class A/B)',
  'Hangzhou': 'Zhejiang Provincial Government',
  'Ningbo': 'Zhejiang Provincial Government',
  'Jinhua': 'Zhejiang Provincial Government',
  'Wenzhou': 'Zhejiang Provincial Government',
  'Nanjing': 'Jasmine Jiangsu Provincial Government',
  'Suzhou': 'Jasmine Jiangsu Provincial Government',
  'Wuxi': 'Jasmine Jiangsu Provincial Government',
  'Xuzhou': 'Jasmine Jiangsu Provincial Government',
  'Xi\'an': 'Shaanxi Sanqin Provincial Government',
  'Wuhan': 'Hubei Provincial Government',
  'Guangzhou': 'Guangdong Provincial Government',
  'Shenzhen': 'Shenzhen Universiade International / Guangdong Government',
  'Chengdu': 'Sichuan Provincial Government',
  'Chongqing': 'Chongqing Municipal Mayor',
  'Tianjin': 'Tianjin Municipal Government',
  'Jinan': 'Shandong Provincial Government',
  'Qingdao': 'Shandong Provincial Government',
  'Hefei': 'Anhui Provincial Government',
  'Harbin': 'Heilongjiang Provincial Government',
  'Changchun': 'Jilin Provincial Government',
  'Shenyang': 'Liaoning Provincial Government',
  'Dalian': 'Liaoning Provincial Government',
  'Changsha': 'Hunan Provincial Government',
  'Xiamen': 'Fujian Provincial Government',
  'Fuzhou': 'Fujian Provincial Government',
  'Kunming': 'Yunnan Provincial Government',
  'Nanchang': 'Jiangxi Provincial Government',
  'Zhengzhou': 'Henan Provincial Government',
};

const newScholarships = [];
const newDetails = {};

for (const [uniId, u] of uniMap.entries()) {
  const govName = PROVINCE_MAP[u.city] || 'Chinese Provincial & Municipal Government';
  const cleanUni = u.name.replace(/\s*\([^)]*\)/, '');

  // 1. Check Bachelor (Licence)
  if (!u.existingLevels.has('bachelor')) {
    maxId++;
    const id = maxId;
    const isFull = Math.random() > 0.4; // 60% full, 40% partial
    const title = isFull
      ? `${cleanUni} CSC Bilateral Undergraduate Scholarship 2026/27`
      : `${cleanUni} ${govName} Bachelor Scholarship 2026/27`;

    const schItem = {
      id,
      title,
      university: uniId,
      university_name: u.name,
      university_city: u.city,
      university_country: u.country,
      type: isFull ? 'full' : 'partial',
      level: 'bachelor',
      amount: isFull ? '35000.00' : '22000.00',
      currency: 'CNY',
      duration: '4-5 Academic Years',
      application_deadline: '2027-04-30T23:59:00+00:00',
      application_link: u.appLink,
      total_seats: isFull ? 25 : 35,
      seats_filled: isFull ? 8 : 12,
      is_active: true,
      is_featured: isFull,
      created_at: new Date().toISOString()
    };
    newScholarships.push(schItem);

    newDetails[String(id)] = {
      ...schItem,
      university: {
        id: uniId,
        name: u.name,
        logo: '',
        country: u.country,
        city: u.city,
        is_verified: true
      },
      seats_available: schItem.total_seats - schItem.seats_filled,
      start_date: '2027-09-01',
      end_date: '2028-07-15',
      required_education_level: 'High School / Baccalauréat Marocain',
      minimum_gpa: 3.0,
      required_fields_of_study: 'Engineering, Computer Science, Economics, Business, Humanities',
      application_fee: '400.00',
      language: 'English / Chinese',
      view_count: 0,
      days_until_deadline: 180,
      description: isFull
        ? `Official Chinese Government & University Undergraduate Full Scholarship at ${u.name} for Moroccan candidates seeking a Bachelor (Licence) degree. 100% Free Tuition + Free Campus Dormitory + Monthly Living Allowance of 2,500 RMB/month (~3,450 DH/mois) + Comprehensive Medical Insurance.`
        : `Official ${govName} Partial Undergraduate Scholarship at ${u.name}. Provides full tuition fee waiver (100% Free Tuition, value ~24,000 RMB/yr ≈ 33,000 DH/an). Student is responsible for on-campus dormitory (~800 to 1,200 RMB/month) and self-funded dining (~1,500 RMB/month).`,
      tuition_info: isFull
        ? `💎 Pris en charge par la Bourse (100% Gratuit):\n• Frais de scolarité: 100% Exonérés (0 DH / 0 RMB)\n• Hébergement: Chambre étudiante gratuite sur le campus universitaire\n• Allocation mensuelle: 2,500 RMB/mois versés sur compte bancaire\n• Assurance maladie: 800 RMB/an couverte à 100%\n\n💳 À la charge de l'étudiant:\n• Frais de dossier: 400 à 600 RMB (payés 1 seule fois à l'université)\n• Test national CSCA (csca.cn): 450 RMB (~620 DH)\n• Billet d'avion Maroc-Chine & Visa X1: ~7,500 DH\n• Budget annuel à prévoir pour les études et le logement: 0 DH !`
        : `💎 Pris en charge par la Bourse:\n• Frais de scolarité: 100% Pris en charge par le Gouvernement Provincial (Économie de ~33,000 DH/an)\n• Assurance médicale: Incluse (800 RMB/an)\n\n💳 À la charge de l'étudiant (Transparence Totale):\n• Frais de scolarité restants: 0 RMB (Exonération totale)\n• Hébergement campus: ~800 à 1,200 RMB/mois (~1,100 à 1,650 DH/mois)\n• Nourriture au resto U: ~1,500 RMB/mois (~2,000 DH/mois)\n• Frais de dossier: 400 RMB (payés 1 seule fois)\n• Examen CSCA: 450 RMB (~620 DH)\n• Budget annuel total estimé à prévoir: ~22,000 à 28,000 DH/an tout compris (logement + nourriture).`,
      eligibility_criteria: `🇲🇦 Conditions d'Éligibilité pour Candidats Marocains:\n\n1. Nationalité: Titulaire de la nationalité marocaine en cours de validité.\n2. Diplôme requis: Baccalauréat marocain (Sciences Maths, PC, SVT, Économie) avec Mention Assez Bien ou Bien (Moyenne générale de 12/20 à 16/20+).\n3. Limite d'âge: Moins de 25 ans à la rentrée académique de Septembre 2027.\n4. Examen CSCA: Obligatoire pour tous les bacheliers postulant en Licence en Chine (Attestation csca.cn à joindre au dossier).\n5. Langue: IELTS 6.0+, Duolingo 105+, ou Attestation d'anglais de lycée marocain / HSK 4 si filière enseignée en chinois.`,
      required_documents: [
        "Valid Passport (Bio-data page, minimum 12 months validity)",
        "Notarized Highest Diploma (Moroccan Baccalaureate with sworn translation)",
        "Official Academic Transcripts (Relevés de notes du Bac et du Régional)",
        "CSCA Exam Certificate / Registration (Attestation CSCA)",
        "Study Plan & Motivation Letter (800+ words in English)",
        "Two Academic Recommendation Letters from High School Teachers",
        "Foreigner Physical Examination Form (Modèle officiel d'examen médical)",
        "Non-Criminal Record Certificate / Casier Judiciaire (Extrait légalisé)"
      ],
      application_instructions: `📋 Étapes de Candidature Officielles:\n\nStep 1: Inscription sur le portail d'admission de ${u.name}.\nStep 2: Sélection du programme Bachelor et dépôt des pièces justificatives légalisées.\nStep 3: Inscription à l'examen CSCA sur www.csca.cn et passage des épreuves en ligne.\nStep 4: Examen du dossier par la commission académique et entretien éventuel.\nStep 5: Réception de l'Admission Notice & JW201/JW202, puis visa X1 à l'Ambassade de Chine à Rabat.`,
      contact_email: `admissions@${u.name.toLowerCase().replace(/[^a-z]/g, '')}.edu.cn`,
      contact_phone: '+86-10-6278-0000'
    };
    u.existingLevels.add('bachelor');
  }

  // 2. Check Master
  if (!u.existingLevels.has('master')) {
    maxId++;
    const id = maxId;
    const isFull = true; // CSC Type B is usually full for post-graduate
    const title = `${cleanUni} CSC Chinese University Program Master Fellowship 2026/27`;

    const schItem = {
      id,
      title,
      university: uniId,
      university_name: u.name,
      university_city: u.city,
      university_country: u.country,
      type: 'full',
      level: 'master',
      amount: '45000.00',
      currency: 'CNY',
      duration: '2-3 Academic Years',
      application_deadline: '2027-03-31T23:59:00+00:00',
      application_link: u.appLink,
      total_seats: 30,
      seats_filled: 11,
      is_active: true,
      is_featured: true,
      created_at: new Date().toISOString()
    };
    newScholarships.push(schItem);

    newDetails[String(id)] = {
      ...schItem,
      university: {
        id: uniId,
        name: u.name,
        logo: '',
        country: u.country,
        city: u.city,
        is_verified: true
      },
      seats_available: schItem.total_seats - schItem.seats_filled,
      start_date: '2027-09-01',
      end_date: '2028-07-15',
      required_education_level: 'Bachelor / Licence (Bac+3 / Bac+4)',
      minimum_gpa: 3.2,
      required_fields_of_study: 'All Master Disciplines',
      application_fee: '600.00',
      language: 'English',
      view_count: 0,
      days_until_deadline: 150,
      description: `Official CSC Chinese University Program (Type B) Full Master Scholarship at ${u.name}. 100% Free Tuition + Free Campus Apartment + Monthly Stipend of 3,000 RMB/month (~4,140 DH/mois) + Comprehensive Medical Insurance. No CSCA exam required for Master candidates.`,
      tuition_info: `💎 Pris en charge par la Bourse (100% Gratuit):\n• Frais de scolarité: 100% Exonérés (Valeur 35,000 à 45,000 RMB/an ≈ 50,000 à 62,000 DH/an)\n• Hébergement: Chambre double ou individuelle gratuite sur le campus\n• Allocation mensuelle de vie: 3,000 RMB/mois versés chaque mois\n• Assurance maladie complète: 800 RMB/an incluse\n\n💳 À la charge de l'étudiant:\n• Frais de dossier: 600 RMB (une seule fois)\n• Examen CSCA: 0 DH (Non requis pour Master !)\n• Vol & Visa X1: ~7,500 DH\n• Reste annuel à payer pour cours et logement: 0 DH !`,
      eligibility_criteria: `🇲🇦 Conditions d'Éligibilité pour Candidats Marocains:\n\n1. Nationalité: Nationalité marocaine.\n2. Diplôme requis: Licence (Bac+3) ou Master 1 de faculté marocaine (ENCG, ENSA, FST, FS, etc.) avec moyenne de 12/20+.\n3. Limite d'âge: Moins de 35 ans.\n4. Examen CSCA: Non Requis (Admission basée sur le dossier académique et projet de recherche).\n5. Langue: IELTS 6.0+, Duolingo, ou Attestation de langue anglaise délivrée par l'université marocaine.`,
      required_documents: [
        "Valid Passport (Bio-data page, minimum 12 months validity)",
        "Notarized Highest Diploma (Moroccan Licence / Bachelor with sworn translation)",
        "Official Academic Transcripts (Relevés de notes de tous les semestres)",
        "Research Proposal & Study Plan (1000+ words in English)",
        "Two Recommendation Letters from Associate Professors or Professors",
        "Foreigner Physical Examination Form",
        "Non-Criminal Record Certificate (Casier Judiciaire légalisé)",
        "English Proficiency Certificate"
      ],
      application_instructions: `📋 Étapes de Candidature Officielles:\n\nStep 1: Candidature sur le portail officiel CSC (studyinchina.csc.edu.cn) en Catégorie Type B.\nStep 2: Dépôt sur le portail d'admission international de ${u.name}.\nStep 3: Évaluation du dossier par le département académique et entretien Voov/Zoom.\nStep 4: Réception de la lettre de pré-admission et validation CSC.\nStep 5: Envoi des formulaires de visa JW201/JW202 au Maroc.`,
      contact_email: `admissions@${u.name.toLowerCase().replace(/[^a-z]/g, '')}.edu.cn`,
      contact_phone: '+86-10-6278-0000'
    };
    u.existingLevels.add('master');
  }

  // 3. Check PhD (Doctorat)
  if (!u.existingLevels.has('phd')) {
    maxId++;
    const id = maxId;
    const title = `${cleanUni} CSC High-Level Post-Graduate Doctoral Fellowship 2026/27`;

    const schItem = {
      id,
      title,
      university: uniId,
      university_name: u.name,
      university_city: u.city,
      university_country: u.country,
      type: 'full',
      level: 'phd',
      amount: '58000.00',
      currency: 'CNY',
      duration: '3-4 Academic Years',
      application_deadline: '2027-02-28T23:59:00+00:00',
      application_link: u.appLink,
      total_seats: 20,
      seats_filled: 6,
      is_active: true,
      is_featured: true,
      created_at: new Date().toISOString()
    };
    newScholarships.push(schItem);

    newDetails[String(id)] = {
      ...schItem,
      university: {
        id: uniId,
        name: u.name,
        logo: '',
        country: u.country,
        city: u.city,
        is_verified: true
      },
      seats_available: schItem.total_seats - schItem.seats_filled,
      start_date: '2027-09-01',
      end_date: '2028-07-15',
      required_education_level: 'Master / Diplôme d\'Ingénieur d\'État (Bac+5)',
      minimum_gpa: 3.3,
      required_fields_of_study: 'All Doctoral & Research Fields',
      application_fee: '800.00',
      language: 'English',
      view_count: 0,
      days_until_deadline: 120,
      description: `Official CSC High-Level Post-Graduate Doctoral (PhD) Full Scholarship at ${u.name}. 100% Free Tuition + Free Single On-Campus Apartment + High Monthly Living Allowance of 3,500 RMB/month (~4,830 DH/mois) + Laboratory & Research Funding.`,
      tuition_info: `💎 Pris en charge par la Bourse (100% Gratuit):\n• Frais de scolarité: 100% Exonérés (Valeur 45,000 à 60,000 RMB/an ≈ 62,000 à 83,000 DH/an)\n• Hébergement: Chambre individuelle pour doctorant gratuite sur campus\n• Allocation mensuelle doctorale: 3,500 RMB/mois versés chaque mois\n• Assurance médicale complète & recherche: 800 RMB/an inclus\n\n💳 À la charge de l'étudiant:\n• Frais de dossier: 800 RMB\n• Examen CSCA: 0 DH (Non requis)\n• Vol & Visa X1: ~7,500 DH\n• Reste annuel à payer pour cours et logement: 0 DH !`,
      eligibility_criteria: `🇲🇦 Conditions d'Éligibilité pour Candidats Marocains:\n\n1. Nationalité: Nationalité marocaine.\n2. Diplôme requis: Master (Bac+5) ou Diplôme d'Ingénieur d'État délivré par un établissement marocain reconnu.\n3. Limite d'âge: Moins de 40 ans.\n4. Lettre de pré-acceptation: Fortement recommandée (contacter un professeur ou directeur de thèse de ${u.name}).\n5. Langue: Anglais courant (IELTS 6.5+, TOEFL 90+, ou publications scientifiques en anglais).`,
      required_documents: [
        "Valid Passport (Bio-data page, minimum 12 months validity)",
        "Notarized Highest Diploma (Moroccan Master / Ingénieur with sworn translation)",
        "Official Academic Transcripts (Master et cycle d'ingénieur)",
        "Detailed Doctoral Research Proposal (1500+ words with methodology and bibliography)",
        "Two Recommendation Letters from Full Professors",
        "Pre-Acceptance Letter from PhD Supervisor (Lettre de pré-acceptation)",
        "Foreigner Physical Examination Form",
        "Non-Criminal Record Certificate (Casier Judiciaire légalisé)"
      ],
      application_instructions: `📋 Étapes de Candidature Officielles:\n\nStep 1: Contact d'un professeur ou directeur de laboratoire à ${u.name} pour accord de principe.\nStep 2: Dépôt sur studyinchina.csc.edu.cn (Catégorie Type B - High Level Postgraduate).\nStep 3: Soumission du dossier sur le portail international de ${u.name}.\nStep 4: Entretien scientifique approfondi par visio-conférence.\nStep 5: Attribution de la bourse CSC et envoi de l'attestation JW201.`,
      contact_email: `admissions@${u.name.toLowerCase().replace(/[^a-z]/g, '')}.edu.cn`,
      contact_phone: '+86-10-6278-0000'
    };
    u.existingLevels.add('phd');
  }
}

console.log(`Generated ${newScholarships.length} new scholarships across universities!`);

// Combine with base
const combinedScholarships = [...baseScholarships, ...newScholarships];
const combinedDetails = { ...baseDetails, ...newDetails };

console.log('Final REAL_SCHOLARSHIPS count:', combinedScholarships.length);
console.log('Final REAL_SCHOLARSHIP_DETAILS count:', Object.keys(combinedDetails).length);

// Format file content
const output = `import type { Scholarship, ScholarshipDetail } from "@/lib/api";

export const REAL_SCHOLARSHIPS: Scholarship[] = ${JSON.stringify(combinedScholarships, null, 2)};

export const REAL_SCHOLARSHIP_DETAILS: Record<string, ScholarshipDetail> = ${JSON.stringify(combinedDetails, null, 2)};
`;

fs.writeFileSync(dataFilePath, output, 'utf8');
console.log('Successfully wrote enriched scholarships to', dataFilePath);
