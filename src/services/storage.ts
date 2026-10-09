import { PatientCase, AICaseAnalysis, ClinicalNotes, CaseStatus } from '../types/case';
import { CaseTakingFormData } from '../lib/validations/case-form-schema';
import { URINARY_BOWEL_SYMPTOMS } from '../constants/case-form-data';

const STORAGE_KEY = 'shanti_homeo_cases_v1';

export const INITIAL_SAMPLE_CASES: PatientCase[] = [
  {
    id: 'case-demo-01',
    caseReference: 'SHC-C-2026-8192',
    patientCode: 'SHC-P-2026-8192',
    createdAt: '2026-10-06T14:30:00.000Z',
    updatedAt: '2026-10-07T18:15:00.000Z',
    fullName: 'মো: রফিকুল ইসলাম',
    age: 44,
    gender: 'male',
    occupation: 'ব্যবসায়ী',
    contactNumber: '01711223344',
    address: 'বাড়ি ১২, রোড ৪, মোহাম্মদপুর',
    district: 'ঢাকা',
    primaryComplaint: 'গত ৮ মাস ধরে তীব্র কোষ্ঠকাঠিন্য ও মলত্যাগের সময় মলদ্বারে অসহ্য জ্বালাপোড়া ও রক্তপাত।',
    associatedComplaints: 'গ্যাস্ট্রিকের সমস্যা, বুক জ্বালা, পেটে ফাঁপ এবং মলত্যাগের পর প্রায় ২-৩ ঘণ্টা টনটন ব্যথা থাকে।',
    onsetDuration: 'প্রায় ৮ মাস যাবৎ, তবে গত ১ মাস ধরে বৃদ্ধি পেয়েছে।',
    diseaseWorries: 'ক্যান্সার বা মারাত্মক কোনো রোগ হলো কি না তা নিয়ে সার্বক্ষণিক উৎকণ্ঠা।',
    dailyThoughts: 'ব্যবসার কাজের চেয়ে পেটের অস্বস্তি এবং টয়লেটের ভয়ে দুশ্চিন্তা কাজ করে।',
    suspectedCause: 'বাইরের অনিয়মিত খাবার গ্রহণ ও দীর্ঘদিন একটানা বসে কাজ করা।',
    foodCravings: 'মিষ্টি খাবার ও কড়া ঝাল খাবারের প্রতি প্রবল টান।',
    foodAversions: 'দুধ ও চর্বিযুক্ত তৈলাক্ত খাবারে অরুচি।',
    temperamentMood: 'স্বভাবগতভাবে দ্রুত রেগে যান, শান্তনা দিলে বা ভুল ধরলে বিরক্তি প্রকাশ করেন।',
    sleepPattern: 'ঘুম অত্যন্ত হালকা, রাত ৩টার দিকে ঘুম ভেঙে যায় আর সহজে ঘুম আসে না।',
    fears: 'মারাত্মক দুরারোগ্য ব্যাধির ভয় এবং আর্থিক ক্ষতির ভয়।',
    selectedSymptoms: [
      'symptom_07', // পায়খানা শক্ত/কোষ্ঠকাঠিন্য
      'symptom_08', // পায়খানা ক্লিয়ার হয় না
      'symptom_18', // এনাল ফিসার
      'symptom_20', // অর্শ/পাইলস
      'symptom_21', // মলদ্বারে রক্ত যায় (Urgent)
      'symptom_22', // রক্ত যায় পায়খানার সময় (Urgent)
      'symptom_27', // পাইলসে ব্যথা করে
    ],
    symptomClarifications: {
      symptom_21: 'পায়খানার সাথে ফোঁটা ফোঁটা তাজা রক্ত পড়ে',
      symptom_27: 'মলত্যাগের পর কাঁচ দিয়ে কাটার মতো জ্বালা',
    },
    modalities: {
      time_of_day: {
        aggravation: 'সকালে ঘুম থেকে ওঠার পর ও মলত্যাগের ঠিক পরপরই প্রচণ্ড বৃদ্ধি।',
        amelioration: 'বিকাল ও সন্ধ্যার দিকে কিছুটা সহনশীল থাকে।',
      },
      movement_posture: {
        aggravation: 'হাঁটাহাঁটি করলে ও শক্ত চেয়ারে দীর্ঘক্ষণ বসলে ব্যথা বাড়ে।',
        amelioration: 'সোজা হয়ে শুয়ে বিশ্রাম নিলে কিছুটা আরাম লাগে।',
      },
      food_drinks: {
        aggravation: 'গরুর মাংস, পোলাও বা শুকনা রুটি খেলে পায়খানা আরও শক্ত হয়।',
        amelioration: 'বেশি পানি বা ইসবগুলের ভুসি খেলে সাময়িক নরম হয়।',
      },
      weather_season: {
        aggravation: 'শীতকালে ও শুষ্ক আবহাওয়ায় সমস্যা বাড়ে।',
        amelioration: 'নাতিশীতোষ্ণ আবহাওয়ায় ভালো থাকেন।',
      },
      warmth: {
        aggravation: 'গরম ঘরে বা রোদে গেলে মলদ্বারে জ্বালা অনুভূতি বাড়ে।',
        amelioration: 'হালকা কুসুম গরম পানিতে সিটজ বাথ (Sitz bath) নিলে সাময়িক উপশম হয়।',
      },
      cold: {
        aggravation: 'ঠান্ডা মেঝেতে বসলে রোগ লক্ষণ বৃদ্ধি পায়।',
        amelioration: 'ঠান্ডা পানি ব্যবহারে কোনো বিশেষ পরিবর্তন নেই।',
      },
    },
    additionalNotes: 'পূর্বে একাধিক এলোপ্যাথিক মলম ও ল্যাক্সেটিভ সেবন করেছেন, তবে কোনো স্থায়ী সমাধান পাননি।',
    consentGiven: true,
    consentTimestamp: '2026-10-06T14:30:00.000Z',
    hasUrgentRedFlags: true,
    redFlagDetails: 'মলদ্বারে রক্ত যায়, রক্ত যায় পায়খানার সময়',
    submissionStatus: 'under_review',
    reviewStatus: 'reviewed',
    aiAnalysis: {
      watermark: 'AI-তৈরি খসড়া — চিকিৎসকের যাচাই আবশ্যক।',
      generatedAt: '2026-10-06T15:00:00.000Z',
      chiefComplaintSummary:
        '৪৪ বছর বয়সী পুরুষ রোগী দীর্ঘস্থায়ী তীব্র কোষ্ঠকাঠিন্য, এনাল ফিসার এবং মলত্যাগে তাজা রক্তপাতের লক্ষণ নিয়ে উপস্থিত হয়েছেন। মলত্যাগের পর কাঁচ কাটার মতো দীর্ঘস্থায়ী জ্বালা ও ব্যথা প্রধান বৈশিষ্ট্য।',
      symptomChronology:
        'প্রায় ৮ মাসের ক্রনিক ইতিহাস। অনিয়মিত খাদ্যাভ্যাস ও সিডেন্টারি জীবনযাত্রার পর গত ১ মাসে তীব্র রক্তপাত ও যন্ত্রণার বৃদ্ধি ঘটেছে।',
      modalitySynthesis: {
        aggravation: [
          'সকালে মলত্যাগের পর ও দীর্ঘক্ষণ বসে থাকলে',
          'শুকনো খাবার, ভারী মাংস ও তৈলাক্ত খাবার গ্রহণে',
          'শীতকালে এবং শক্ত আসনে উপবেশনে',
        ],
        amelioration: [
          'বিশ্রামে শয়ন অবস্থায়',
          'হালকা কুসুম গরম পানির ছোঁয়ায় সাময়িক উপশম',
        ],
      },
      generalCharacteristics:
        'রোগীর মেজাজ খিটখিটে ও দ্রুত ক্রোধী, সান্ত্বনায় অসহিষ্ণু। মিষ্টি ও ঝাল খাবারের তীব্র আকাঙ্ক্ষা। নিদ্রাহীনতা (রাত ৩টায় ঘুম ভঙ্গ)। গভীর স্বাস্থ্য-উদ্বেগ বিদ্যমান।',
      unansweredOrAmbiguousPoints: [
        'মলদ্বারের রক্তপাত কি স্পার্ট (spray) আকারে হয় নাকি শুধুই ফোঁটা ফোঁটা?',
        'পরিবারে অন্য কারও অর্শ বা কলোরেক্টাল সমস্যার সুনির্দিষ্ট ইতিহাস আছে কি না?',
        'রোগীর পিপাসা (Thirst) কেমন—ঠান্ডা পানি নাকি গরম পানি বেশি পান করেন তা অনুত্তরিত।',
      ],
      suggestedClinicianQuestions: [
        'মলদ্বারে রক্ত জমাট বাঁধার কোনো ইতিহাস আছে কি?',
        'পিপাসার পরিমাণ ও তীব্রতা সম্পর্কে সুনির্দিষ্ট প্রশ্ন করা প্রয়োজন।',
        'পূর্বে কোনো সার্জারি বা ইনজেকশন থেরাপি নেওয়া হয়েছে কি না তা নিশ্চিত করা।',
      ],
      safetyObservations:
        'রোগীর মলদ্বারে নিয়মিত রক্তপাতের লক্ষণ রয়েছে। হিমোগ্লোবিন ড্রপ বা গুরুতর অভ্যন্তরীণ ক্ষত বাদ দিতে সিবিসি এবং চিকিৎসকের সরাসরি প্রোব আবশ্যক।',
      isApprovedByDoctor: true,
      approvedAt: '2026-10-07T18:10:00.000Z',
    },
    clinicalNotes: {
      doctorObservations:
        'রোগীর ধাত ও মানসিক চিত্র অত্যন্ত সুস্পষ্ট। সালফার বনাম নাক্স ভমিকার ধাতুগত সামঞ্জস্য লক্ষণীয়। মলদ্বারে ফিসারের কারণে নাইট্রিক এসিডের বৈশিষ্ট্যও মিল রয়েছে।',
      differentialRepertoryNotes:
        'রুব্রিক্স: Rectum - Pain - burning - after stool (Nit-ac, Ratan, Sul). Mind - Anger - contradiction from (Nux-v, Ign). Generals - Food - sweets - desire (Arg-n, Lyc, Sul).',
      prescriptionPlan:
        '১. Nux Vomica 200C — রাতে শোওয়ার আগে ৪ ফোঁটা করে ৩ দিন।\n২. এর পর Ratanhia Q — সিটজ বাথে ব্যবহারের জন্য।\nপথ্য: প্রতিদিন অন্তত ৩ লিটার পানি, মৌসুমি শাকসবজি, ভাজাপোড়া ও গরুর মাংস সম্পূর্ণ নিষিদ্ধ।',
      followUpDate: '2026-10-21',
      updatedAt: '2026-10-07T18:15:00.000Z',
      prescribedBy: 'ডাঃ মোঃ ওয়ালিউল বারী (Controller in-charge of Exams, ASA University Bangladesh)',
    },
  },
  {
    id: 'case-demo-02',
    caseReference: 'SHC-C-2026-3914',
    patientCode: 'SHC-P-2026-3914',
    createdAt: '2026-10-07T10:15:00.000Z',
    updatedAt: '2026-10-07T11:00:00.000Z',
    fullName: 'ফাতেমা বেগম',
    age: 32,
    gender: 'female',
    occupation: 'গৃহিণী',
    contactNumber: '01819556677',
    address: 'গ্রাম: শাসনগাছা, সদর',
    district: 'কুমিল্লা',
    primaryComplaint: 'পেটে তীব্র মোচড় ও কিছুদিন আমাশয় আবার কিছুদিন পেটে শক্ত পায়খানা জমে থাকা।',
    associatedComplaints: 'খাওয়ার পরপরই পেটে ভুটভাট শব্দ ও বাথরুমে যাওয়ার তীব্র বেগ হওয়া।',
    onsetDuration: 'দেড় বছর ধরে এই অবস্থা চলছে।',
    diseaseWorries: 'বাইরে কোথাও গেলে বাথরুম পাওয়া যাবে না এই ভয়ে সামাজিক অনুষ্ঠানে যেতে পারেন না।',
    dailyThoughts: 'পেটের অস্বস্তি ও গ্যাসের চাপে শরীর দুর্বল লাগে।',
    suspectedCause: 'মানসিক উৎকণ্ঠা ও পারিবারিক মানসিক চাপ।',
    foodCravings: 'টক ও ঠান্ডা মিষ্টি ফলের প্রতি আকর্ষণ।',
    foodAversions: 'দুধ ও পনির একেবারেই সহ্য হয় না, খেলে পেট ফাঁপে।',
    temperamentMood: 'অত্যন্ত আবেগপ্রবণ, সামান্য কথায় কেঁদে ফেলেন, শান্তনা দিলে ভালো লাগে।',
    sleepPattern: 'ঘুম ভালো কিন্তু শেষ রাতের দিকে পেটের ডাকে জেগে যান।',
    fears: 'একাকী থাকা এবং উঁচু স্থানের ভয়।',
    selectedSymptoms: [
      'symptom_01', // ঘনঘন প্রস্রাব হয়
      'symptom_14', // কিছুদিন কোষ্ঠবদ্ধতা আবার কিছুদিন ডায়রিয়া (IBS)
      'symptom_15', // পায়খানার সাথে আম যায়
      'symptom_16', // খাওয়ার সাথে সাথেই টয়লেটে যেতে হয়
    ],
    symptomClarifications: {
      symptom_16: 'সকালের নাস্তার পরই দৌড়াতে হয়',
    },
    modalities: {
      time_of_day: {
        aggravation: 'সকালবেলা ঘুম থেকে ওঠার পর সমস্যা সবচেয়ে বেশি থাকে।',
        amelioration: 'সন্ধ্যার পর শান্ত থাকে।',
      },
      movement_posture: {
        aggravation: 'নড়াচড়া করলে বা দ্রুত হাঁটলে পেটে চাপ লাগে।',
        amelioration: 'বিশ্রাম নিলে আরাম অনুভূত হয়।',
      },
      food_drinks: {
        aggravation: 'দুধ, চর্বিযুক্ত খাবার ও ফাস্টফুড খেলে সঙ্গে সঙ্গে পেটে মোচড় দেয়।',
        amelioration: 'হালকা জিরা পানি খেলে আরাম পাওয়া যায়।',
      },
      weather_season: {
        aggravation: 'আর্দ্র ও মেঘলা আবহাওয়ায় অলসতা বাড়ে।',
        amelioration: 'খোলা নির্মল বাতাসে স্বস্তি পান।',
      },
      warmth: {
        aggravation: 'গরম সহ্য করতে পারেন না, দমবন্ধ ভাব লাগে।',
        amelioration: 'স্বাভাবিক শীতল পরিবেশে স্বাচ্ছন্দ্য বোধ করেন।',
      },
      cold: {
        aggravation: 'ঠান্ডা পানিতে গোসল করলে হাঁচি শুরু হয়।',
        amelioration: 'খোলা ঠান্ডা বাতাসে মাথা হালকা লাগে।',
      },
    },
    additionalNotes: 'রক্তস্বল্পতা রয়েছে বলে পূর্বে রিপোর্ট এসেছিল।',
    consentGiven: true,
    consentTimestamp: '2026-10-07T10:15:00.000Z',
    hasUrgentRedFlags: false,
    submissionStatus: 'submitted',
    reviewStatus: 'pending',
  },
];

export const CaseStorage = {
  getAllCases(): PatientCase[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_CASES));
        return INITIAL_SAMPLE_CASES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SAMPLE_CASES;
    }
  },

  getCaseById(id: string): PatientCase | undefined {
    const list = this.getAllCases();
    return list.find((c) => c.id === id);
  },

  getCaseByReference(ref: string): PatientCase | undefined {
    const cleanRef = ref.trim().toUpperCase();
    const list = this.getAllCases();
    return list.find(
      (c) =>
        c.caseReference.toUpperCase() === cleanRef ||
        c.patientCode.toUpperCase() === cleanRef ||
        c.contactNumber.includes(cleanRef)
    );
  },

  saveNewCase(formData: CaseTakingFormData): PatientCase {
    const cases = this.getAllCases();
    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const caseRef = `SHC-C-${datePrefix}-${randomSuffix}`;
    const patientCode = `SHC-P-${datePrefix}-${randomSuffix}`;

    // Urgent Red Flags Check
    const urgentSymptoms = URINARY_BOWEL_SYMPTOMS.filter(
      (s) => s.isUrgentRisk && formData.selectedSymptoms.includes(s.id)
    );
    const hasUrgentRedFlags = urgentSymptoms.length > 0;
    const redFlagDetails = hasUrgentRedFlags
      ? urgentSymptoms.map((s) => s.label).join(', ')
      : undefined;

    const newCase: PatientCase = {
      id: `case-${Date.now()}-${randomSuffix}`,
      caseReference: caseRef,
      patientCode: patientCode,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      fullName: formData.fullName.trim(),
      age: formData.age,
      gender: formData.gender,
      occupation: formData.occupation?.trim() || 'উল্লেখ নেই',
      contactNumber: formData.contactNumber.trim(),
      address: formData.address.trim(),
      district: formData.district,
      primaryComplaint: formData.primaryComplaint.trim(),
      associatedComplaints: formData.associatedComplaints?.trim(),
      onsetDuration: formData.onsetDuration?.trim(),
      diseaseWorries: formData.diseaseWorries?.trim(),
      dailyThoughts: formData.dailyThoughts?.trim(),
      suspectedCause: formData.suspectedCause?.trim(),
      foodCravings: formData.foodCravings?.trim(),
      foodAversions: formData.foodAversions?.trim(),
      temperamentMood: formData.temperamentMood?.trim(),
      sleepPattern: formData.sleepPattern?.trim(),
      fears: formData.fears?.trim(),
      selectedSymptoms: formData.selectedSymptoms,
      symptomClarifications: formData.symptomClarifications,
      modalities: formData.modalities,
      additionalNotes: formData.additionalNotes?.trim(),
      consentGiven: Boolean(formData.consentGiven),
      consentTimestamp: now.toISOString(),
      hasUrgentRedFlags,
      redFlagDetails,
      submissionStatus: 'submitted',
      reviewStatus: 'pending',
    };

    const updatedList = [newCase, ...cases];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    return newCase;
  },

  updateCase(updatedCase: PatientCase): void {
    const list = this.getAllCases();
    const index = list.findIndex((c) => c.id === updatedCase.id);
    if (index !== -1) {
      list[index] = {
        ...updatedCase,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  },

  saveAiAnalysis(caseId: string, analysis: AICaseAnalysis): PatientCase | null {
    const list = this.getAllCases();
    const item = list.find((c) => c.id === caseId);
    if (!item) return null;

    item.aiAnalysis = analysis;
    item.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return item;
  },

  saveClinicalNotes(
    caseId: string,
    notes: ClinicalNotes,
    newStatus: CaseStatus = 'under_review',
    newReviewStatus: 'reviewed' | 'requires_followup' = 'reviewed'
  ): PatientCase | null {
    const list = this.getAllCases();
    const item = list.find((c) => c.id === caseId);
    if (!item) return null;

    item.clinicalNotes = notes;
    item.submissionStatus = newStatus;
    item.reviewStatus = newReviewStatus;
    item.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return item;
  },

  deleteCase(caseId: string): void {
    const list = this.getAllCases().filter((c) => c.id !== caseId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  },

  resetToDefault(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_CASES));
  },
};
