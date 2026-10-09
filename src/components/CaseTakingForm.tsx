import React, { useState } from 'react';
import {
  User,
  MapPin,
  Calendar,
  Phone,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Clock,
  Activity,
  Coffee,
  CloudRain,
  Sun,
  Snowflake,
  MessageSquare,
  Printer,
  Sparkles,
  FileCheck2,
  Heart,
} from 'lucide-react';
import {
  CLINIC_CONFIG,
  BD_DISTRICTS,
  URINARY_BOWEL_SYMPTOMS,
  MODALITY_CARDS,
  CATEGORY_LABELS,
  SymptomItem,
} from '../constants/case-form-data';
import { CaseTakingFormData, CaseTakingFormSchema } from '../lib/validations/case-form-schema';
import { PatientCase } from '../types/case';
import { CaseStorage } from '../services/storage';

interface CaseTakingFormProps {
  onCaseSubmitted: (newCase: PatientCase) => void;
  onOpenEmergencyModal: (reason?: string) => void;
}

const INITIAL_FORM_DATA: CaseTakingFormData = {
  fullName: '',
  age: 30,
  gender: 'male',
  occupation: '',
  contactNumber: '',
  address: '',
  district: 'ঢাকা',
  primaryComplaint: '',
  associatedComplaints: '',
  onsetDuration: '',
  diseaseWorries: '',
  dailyThoughts: '',
  suspectedCause: '',
  foodCravings: '',
  foodAversions: '',
  temperamentMood: '',
  sleepPattern: '',
  fears: '',
  selectedSymptoms: [],
  symptomClarifications: {},
  modalities: {
    time_of_day: { aggravation: '', amelioration: '' },
    movement_posture: { aggravation: '', amelioration: '' },
    food_drinks: { aggravation: '', amelioration: '' },
    weather_season: { aggravation: '', amelioration: '' },
    warmth: { aggravation: '', amelioration: '' },
    cold: { aggravation: '', amelioration: '' },
  },
  additionalNotes: '',
  consentGiven: true,
};

export const CaseTakingForm: React.FC<CaseTakingFormProps> = ({
  onCaseSubmitted,
  onOpenEmergencyModal,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<CaseTakingFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [symptomSearch, setSymptomSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [submittedCase, setSubmittedCase] = useState<PatientCase | null>(null);
  const [hasTriggeredUrgentAlert, setHasTriggeredUrgentAlert] = useState<boolean>(false);

  // Field change helpers
  const handleInputChange = (
    field: keyof CaseTakingFormData,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleModalityChange = (
    cardKey: keyof typeof formData.modalities,
    field: 'aggravation' | 'amelioration',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      modalities: {
        ...prev.modalities,
        [cardKey]: {
          ...prev.modalities[cardKey],
          [field]: value,
        },
      },
    }));
  };

  const handleToggleSymptom = (item: SymptomItem) => {
    const isSelected = formData.selectedSymptoms.includes(item.id);
    let nextSelected: string[];

    if (isSelected) {
      nextSelected = formData.selectedSymptoms.filter((id) => id !== item.id);
      const nextClarifications = { ...formData.symptomClarifications };
      delete nextClarifications[item.id];
      setFormData((prev) => ({
        ...prev,
        selectedSymptoms: nextSelected,
        symptomClarifications: nextClarifications,
      }));
    } else {
      nextSelected = [...formData.selectedSymptoms, item.id];
      setFormData((prev) => ({
        ...prev,
        selectedSymptoms: nextSelected,
      }));

      // Trigger urgency alert if an urgent risk is selected for the first time
      if (item.isUrgentRisk && !hasTriggeredUrgentAlert) {
        setHasTriggeredUrgentAlert(true);
        onOpenEmergencyModal(item.label);
      }
    }
  };

  const handleSymptomClarification = (id: string, text: string) => {
    setFormData((prev) => ({
      ...prev,
      symptomClarifications: {
        ...prev.symptomClarifications,
        [id]: text,
      },
    }));
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName || formData.fullName.trim().length < 2) {
        newErrors.fullName = 'রোগীর নাম কমপক্ষে ২ অক্ষরের হতে হবে।';
      }
      if (!formData.age || formData.age < 0 || formData.age > 125) {
        newErrors.age = 'সঠিক বয়স লিখুন।';
      }
      if (!formData.contactNumber || !/^(?:\+88|88)?(01[3-9]\d{8})$/.test(formData.contactNumber)) {
        newErrors.contactNumber = 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)।';
      }
      if (!formData.district) {
        newErrors.district = 'জেলা নির্বাচন করুন।';
      }
      if (!formData.address || formData.address.trim().length < 4) {
        newErrors.address = 'বর্তমান ঠিকানা বিস্তারিত লিখুন।';
      }
    } else if (step === 2) {
      if (!formData.primaryComplaint || formData.primaryComplaint.trim().length < 4) {
        newErrors.primaryComplaint = 'আপনার প্রধান সমস্যাটি অনুগ্রহ করে বিস্তারিত লিখুন।';
      }
    } else if (step === 5) {
      if (!formData.consentGiven) {
        newErrors.consentGiven = 'চিকিৎসকের নীতিমালা ও তথ্যের সত্যতায় সম্মতি আবশ্যক।';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    try {
      const savedCase = CaseStorage.saveNewCase(formData);
      setSubmittedCase(savedCase);
      onCaseSubmitted(savedCase);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('কেস হিস্ট্রি জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setSubmittedCase(null);
    setCurrentStep(1);
    setErrors({});
    setHasTriggeredUrgentAlert(false);
  };

  // Filter symptoms for Step 3
  const filteredSymptoms = URINARY_BOWEL_SYMPTOMS.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !symptomSearch ||
      item.label.toLowerCase().includes(symptomSearch.toLowerCase()) ||
      (item.descriptionHint && item.descriptionHint.toLowerCase().includes(symptomSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const urgentSymptomsSelected = URINARY_BOWEL_SYMPTOMS.filter(
    (s) => s.isUrgentRisk && formData.selectedSymptoms.includes(s.id)
  );

  // Success view
  if (submittedCase) {
    const whatsappMsg = encodeURIComponent(
      `সালাম, আমি শান্তি হোমিও কেয়ারে কেস ফর্ম জমা দিয়েছি।\nরোগীর নাম: ${submittedCase.fullName}\nরেফারেন্স কোড: ${submittedCase.caseReference}\nমোবাইল: ${submittedCase.contactNumber}\nঅনুগ্রহ করে কেসটি পর্যবেক্ষণ করুন।`
    );
    const whatsappLink = `https://wa.me/8801552406707?text=${whatsappMsg}`;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/10 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
              সফলভাবে জমাকৃত (Submitted)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 pt-2">
              আপনার কেস হিস্ট্রি গৃহীত হয়েছে
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base">
              ধন্যবাদ! শান্তি হোমিও কেয়ারের চিকিৎসকের পর্যবেক্ষণের জন্য আপনার তথ্য সুরক্ষিতভাবে
              লিপিবদ্ধ করা হয়েছে।
            </p>
          </div>

          {/* Reference Badge Card */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-600/30 rounded-2xl p-6 max-w-md mx-auto space-y-2 text-slate-800 shadow-xs">
            <p className="text-xs font-semibold text-teal-800 uppercase tracking-widest">
              আপনার কেস রেফারেন্স কোড
            </p>
            <div className="text-2xl sm:text-3xl font-black font-mono text-teal-950 tracking-wider select-all">
              {submittedCase.caseReference}
            </div>
            <p className="text-xs text-slate-500">
              রোগীর আইডি: <span className="font-mono font-medium">{submittedCase.patientCode}</span> •{' '}
              {new Date(submittedCase.createdAt).toLocaleDateString('bn-BD')}
            </p>
          </div>

          {submittedCase.hasUrgentRedFlags && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-left flex items-start gap-3 text-red-950 text-sm max-w-md mx-auto">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-red-800">জরুরি স্বাস্থ্য লক্ষণ বিদ্যমান</strong>
                <span>
                  আপনার কেসে রক্তপাত বা প্রস্রাবের সংকটের মতো তীব্র উপসর্গ রয়েছে। প্রয়োজনে অনতিবিলম্বে
                  নিকটস্থ হাসপাতালে যোগাযোগ করুন।
                </span>
              </div>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3.5 px-6 rounded-xl text-sm shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp-এ ডাক্তারকে জানান</span>
            </a>

            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 px-5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>কপি প্রিন্ট / সেভ করুন</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={resetForm}
              className="text-teal-800 hover:text-teal-950 font-semibold text-sm underline underline-offset-4 cursor-pointer"
            >
              + আরেকটি নতুন কেস ফর্ম পূরণ করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      {/* Intro Welcome Card */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-lg shadow-teal-950/10 border border-teal-700/50 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>প্রমিত হোমিওপ্যাথিক কেস হিস্ট্রি গ্রহণ ফর্ম</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            শান্তি হোমিও কেয়ার ডিজিটাল কেস টেকিং
          </h2>
          <p className="text-teal-100 text-sm sm:text-base leading-relaxed max-w-2xl">
            {CLINIC_CONFIG.disclaimerBengali}
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none text-9xl font-serif">
          🌿
        </div>
      </div>

      {/* Form Progress Stepper */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 mb-6">
        <div className="flex items-center justify-between mb-3 text-xs sm:text-sm font-semibold text-slate-600">
          <span>ধাপ {currentStep} / ৫:</span>
          <span className="text-teal-900 font-bold">
            {currentStep === 1 && '১. রোগীর ব্যক্তিগত তথ্য'}
            {currentStep === 2 && '২. সাধারণ প্রশ্নাবলি ও শারীরিক বিবরণ'}
            {currentStep === 3 && '৩. প্রস্রাব ও পায়খানার ৩১টি লক্ষণ'}
            {currentStep === 4 && '৪. রোগের হ্রাস-বৃদ্ধি (Modalities)'}
            {currentStep === 5 && '৫. পর্যালোচনা, অতিরিক্ত তথ্য ও সম্মতি'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-700 to-emerald-600 h-2.5 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Stepper Dots */}
        <div className="flex justify-between items-center mt-3 pt-2 text-[11px] sm:text-xs text-slate-500 font-medium">
          <button
            type="button"
            onClick={() => validateStep(1) && setCurrentStep(1)}
            className={`cursor-pointer ${currentStep >= 1 ? 'text-teal-800 font-bold' : ''}`}
          >
            ১. রোগী
          </button>
          <button
            type="button"
            onClick={() => validateStep(1) && setCurrentStep(2)}
            className={`cursor-pointer ${currentStep >= 2 ? 'text-teal-800 font-bold' : ''}`}
          >
            ২. সমস্যা
          </button>
          <button
            type="button"
            onClick={() => validateStep(2) && setCurrentStep(3)}
            className={`cursor-pointer ${currentStep >= 3 ? 'text-teal-800 font-bold' : ''}`}
          >
            ৩. লক্ষণ (৩১)
          </button>
          <button
            type="button"
            onClick={() => validateStep(3) && setCurrentStep(4)}
            className={`cursor-pointer ${currentStep >= 4 ? 'text-teal-800 font-bold' : ''}`}
          >
            ৪. হ্রাস-বৃদ্ধি
          </button>
          <button
            type="button"
            onClick={() => validateStep(4) && setCurrentStep(5)}
            className={`cursor-pointer ${currentStep === 5 ? 'text-teal-800 font-bold' : ''}`}
          >
            ৫. জমা
          </button>
        </div>
      </div>

      {/* Urgent Warning Banner if symptoms selected */}
      {urgentSymptomsSelected.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-2xl flex items-start justify-between gap-3 text-red-900 shadow-xs">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold block text-red-800">
                জরুরি স্বাস্থ্য লক্ষণ চিহ্নিত হয়েছে ({urgentSymptomsSelected.length}টি)
              </span>
              <span>
                মলদ্বারে রক্তপাত বা প্রস্রাব মারাত্মক কমে যাওয়ার মতো উপসর্গ থাকলে নিকটস্থ জরুরি বিভাগে
                যোগাযোগ রাখুন।
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenEmergencyModal(urgentSymptomsSelected.map((s) => s.label).join(', '))}
            className="shrink-0 text-xs font-bold text-red-800 bg-red-200/80 hover:bg-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            বিস্তারিত
          </button>
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-8 shadow-md border border-slate-200/90 space-y-6">
        {/* ================= STEP 1: PATIENT DEMOGRAPHICS ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-700" />
                ১. রোগীর প্রাথমিক পরিচিতি ও যোগাযোগের তথ্য
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                রোগীর পূর্ণ নাম, যোগাযোগের নম্বর ও বর্তমান ঠিকানা প্রদান করুন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Full Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-sm font-bold text-slate-800">
                  রোগীর পূর্ণ নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="যেমন: মো: কামরুল হাসান / রহিমা খাতুন"
                  className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base transition-colors ${
                    errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700'
                  }`}
                />
                {errors.fullName && <p className="text-xs text-red-600 font-medium">{errors.fullName}</p>}
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800">
                  বয়স (পূর্ণসংখ্যায়) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="125"
                    value={formData.age || ''}
                    onChange={(e) => handleInputChange('age', Number(e.target.value))}
                    placeholder="যেমন: ৩৫"
                    className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base transition-colors ${
                      errors.age ? 'border-red-500 bg-red-50/50' : 'border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700'
                    }`}
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
                {errors.age && <p className="text-xs text-red-600 font-medium">{errors.age}</p>}
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800">
                  লিঙ্গ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'male', label: 'পুরুষ' },
                    { value: 'female', label: 'মহিলা' },
                    { value: 'other', label: 'অন্যান্য' },
                  ].map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => handleInputChange('gender', g.value)}
                      className={`py-3 px-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                        formData.gender === g.value
                          ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800">
                  মোবাইল নম্বর <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    placeholder="০১৭১২-৩৪৫৬৭৮"
                    className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base transition-colors ${
                      errors.contactNumber ? 'border-red-500 bg-red-50/50' : 'border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
                {errors.contactNumber ? (
                  <p className="text-xs text-red-600 font-medium">{errors.contactNumber}</p>
                ) : (
                  <p className="text-xs text-slate-500">বাংলাদেশি মোবাইল নম্বর (১১ ডিজিট)</p>
                )}
              </div>

              {/* Occupation */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800">
                  পেশা / কর্মক্ষেত্র
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    placeholder="যেমন: শিক্ষক / গৃহিণী / চাকরি / ব্যবসা"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-sm sm:text-base"
                  />
                  <Briefcase className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* District */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800">
                  জেলা নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-sm sm:text-base bg-white"
                >
                  {BD_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detailed Address */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-sm font-bold text-slate-800">
                  পূর্ণাঙ্গ বর্তমান ঠিকানা <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="বাড়ি, রোড নম্বর, থানা/উপজেলা, ইউনিয়ন বা মহল্লা..."
                  className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base transition-colors ${
                    errors.address ? 'border-red-500 bg-red-50/50' : 'border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700'
                  }`}
                />
                {errors.address && <p className="text-xs text-red-600 font-medium">{errors.address}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: GENERAL QUESTIONNAIRE ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-700" />
                ২. প্রধান সমস্যা ও শারীরিক-মানসিক ইতিহাস
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                হোমিওপ্যাথিতে প্রতিটি লক্ষণ ও মানসিক অনুভূতির গুরুত্ব রয়েছে। বিস্তারিত লিখুন।
              </p>
            </div>

            <div className="space-y-4">
              {/* Primary Complaint */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800">
                  ১. প্রধান সমস্যা কী কী? (বিস্তারিত লিখুন) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.primaryComplaint}
                  onChange={(e) => handleInputChange('primaryComplaint', e.target.value)}
                  placeholder="আপনার শরীরের কোন কোন স্থানে কী ধরণের সমস্যা বা যন্ত্রণা অনুভূত হয়? যেমন: কোষ্ঠকাঠিন্য, জ্বালাপোড়া, চুলকানি, পেটব্যথা..."
                  className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base transition-colors ${
                    errors.primaryComplaint ? 'border-red-500 bg-red-50/50' : 'border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700'
                  }`}
                />
                {errors.primaryComplaint && (
                  <p className="text-xs text-red-600 font-medium">{errors.primaryComplaint}</p>
                )}
              </div>

              {/* Associated Complaints */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800">
                  ২. প্রধান সমস্যার পাশাপাশি অন্যান্য আনুষঙ্গিক সমস্যা
                </label>
                <textarea
                  rows={2}
                  value={formData.associatedComplaints}
                  onChange={(e) => handleInputChange('associatedComplaints', e.target.value)}
                  placeholder="যেমন: মাথাব্যথা, গ্যাস্ট্রিক, দুর্বলতা, বুক ধড়ফড়..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-sm sm:text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Onset & Duration */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    ৩. বর্তমান রোগ হওয়ার আনুমানিক সময়কাল
                  </label>
                  <input
                    type="text"
                    value={formData.onsetDuration}
                    onChange={(e) => handleInputChange('onsetDuration', e.target.value)}
                    placeholder="যেমন: ৬ মাস / ২ বছর / গত সপ্তাহ থেকে"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-sm"
                  />
                </div>

                {/* Suspected Cause */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    ৬. আপনার মতে রোগটি শুরুর সম্ভাব্য কারণ
                  </label>
                  <input
                    type="text"
                    value={formData.suspectedCause}
                    onChange={(e) => handleInputChange('suspectedCause', e.target.value)}
                    placeholder="যেমন: অতিরিক্ত মানসিক চাপ, অনিয়মিত খাদ্যাভ্যাস, কোনো আঘাত..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-sm"
                  />
                </div>
              </div>

              {/* Mental State & Worries */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    ৪. রোগটি নিয়ে মনে কী ধরণের চিন্তা বা উদ্বেগ হয়?
                  </label>
                  <textarea
                    rows={2}
                    value={formData.diseaseWorries}
                    onChange={(e) => handleInputChange('diseaseWorries', e.target.value)}
                    placeholder="রোগ নিরাময় না হওয়ার ভয়, বড় কোনো রোগ হওয়ার শঙ্কা..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    ৫. সারাদিনের চিন্তাভাবনা ও মানসিক অবস্থা
                  </label>
                  <textarea
                    rows={2}
                    value={formData.dailyThoughts}
                    onChange={(e) => handleInputChange('dailyThoughts', e.target.value)}
                    placeholder="সারা দিন মন মেজাজ কেমন থাকে? কোনো বিশেষ বিষয় বেশি মাথায় ঘোরে?"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-sm"
                  />
                </div>
              </div>

              {/* Food cravings & aversions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    ৭. খাবার/পানীয়ের প্রতি প্রবল টান বা ঝোঁক (Desires)
                  </label>
                  <input
                    type="text"
                    value={formData.foodCravings}
                    onChange={(e) => handleInputChange('foodCravings', e.target.value)}
                    placeholder="যেমন: মিষ্টি, ঝাল, টক, নোনতা, ঠান্ডা পানি, মাংস, চা..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    ৮. খাবার/পানীয়তে ভীষণ অরুচি বা অপছন্দ (Aversions)
                  </label>
                  <input
                    type="text"
                    value={formData.foodAversions}
                    onChange={(e) => handleInputChange('foodAversions', e.target.value)}
                    placeholder="যেমন: দুধ, চর্বিযুক্ত খাবার, রুটি, মাছ..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-sm"
                  />
                </div>
              </div>

              {/* Temperament, sleep, fears */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    ৯. মেজাজ-মর্জি কেমন?
                  </label>
                  <input
                    type="text"
                    value={formData.temperamentMood}
                    onChange={(e) => handleInputChange('temperamentMood', e.target.value)}
                    placeholder="শান্ত, খিটখিটে, সহজে রাগ, সান্ত্বনায় বৃদ্ধি..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    ১০. ঘুম কেমন হয় ও স্বপ্ন?
                  </label>
                  <input
                    type="text"
                    value={formData.sleepPattern}
                    onChange={(e) => handleInputChange('sleepPattern', e.target.value)}
                    placeholder="গভীর, হালকা, দুঃস্বপ্ন, অনিদ্রা..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    ১১. কিসে কিসে ভয় পান?
                  </label>
                  <input
                    type="text"
                    value={formData.fears}
                    onChange={(e) => handleInputChange('fears', e.target.value)}
                    placeholder="অন্ধকার, একাকীত্ব, বজ্রপাত, রোগ..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: URINARY & BOWEL SYMPTOMS (31 ITEMS) ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-700" />
                    ৩. প্রস্রাব ও পায়খানা সংক্রান্ত ৩১টি সুনির্দিষ্ট লক্ষণ
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    নিচের তালিকা থেকে আপনার সাথে মিলে যাওয়া লক্ষণগুলোতে টিক দিন। প্রয়োজনে স্পষ্টীকরণ লিখুন।
                  </p>
                </div>
                <div className="text-xs font-bold bg-teal-100 text-teal-900 px-3 py-1.5 rounded-full shrink-0">
                  নির্বাচিত: {formData.selectedSymptoms.length} / ৩১টি
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs sm:text-sm font-bold text-slate-600 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                    selectedCategory === 'all' ? 'bg-white text-teal-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  সবগুলো (৩১)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('urinary')}
                  className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                    selectedCategory === 'urinary' ? 'bg-white text-teal-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  প্রস্রাব (১-৬)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('bowel')}
                  className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                    selectedCategory === 'bowel' ? 'bg-white text-teal-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  পায়খানা (৭-১৭)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('rectal')}
                  className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                    selectedCategory === 'rectal' ? 'bg-white text-teal-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  মলদ্বার ও অর্শ (১৮-৩১)
                </button>
              </div>

              <input
                type="text"
                placeholder="লক্ষণ সার্চ করুন..."
                value={symptomSearch}
                onChange={(e) => setSymptomSearch(e.target.value)}
                className="px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-700 focus:ring-1 focus:ring-teal-700 sm:w-64"
              />
            </div>

            {/* Symptoms List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredSymptoms.map((item) => {
                const isSelected = formData.selectedSymptoms.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`border rounded-2xl p-3.5 transition-all text-left ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSymptom(item)}
                        className="mt-1 w-5 h-5 text-teal-700 rounded border-slate-300 focus:ring-teal-600 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-bold ${
                              isSelected ? 'text-teal-950' : 'text-slate-800'
                            }`}
                          >
                            {item.label}
                          </span>
                          {item.isUrgentRisk && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200">
                              🚨 জরুরি ঝুঁকি
                            </span>
                          )}
                        </div>
                        {item.descriptionHint && (
                          <p className="text-xs text-slate-500 mt-0.5">{item.descriptionHint}</p>
                        )}
                      </div>
                    </label>

                    {/* Clarification input appears when item is checked */}
                    {isSelected && (
                      <div className="mt-2.5 pt-2.5 border-t border-teal-200/60 pl-8">
                        <input
                          type="text"
                          placeholder="অতিরিক্ত বিস্তারিত (ঐচ্ছিক): যেমন কখন বেশি হয়..."
                          value={formData.symptomClarifications?.[item.id] || ''}
                          onChange={(e) => handleSymptomClarification(item.id, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-teal-300/80 bg-white focus:outline-none focus:border-teal-700"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 4: MODALITIES (HRAAS-BRRIDDHI - 6 CARDS) ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-700" />
                ৪. রোগের হ্রাস-বৃদ্ধি সংক্রান্ত বিবরণ (Modalities)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                কোন পরিস্থিতিতে আপনার সমস্যা বাড়ে এবং কোন অবস্থায় কমে বা স্বস্তি লাগে? নিচের ৬টি
                কার্ডে লিখুন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {MODALITY_CARDS.map((card) => {
                const cardState = formData.modalities[card.key as keyof typeof formData.modalities];
                return (
                  <div
                    key={card.key}
                    className="bg-[#FAF7F0] border border-amber-900/10 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-amber-900/10 pb-2">
                      {card.key === 'time_of_day' && <Clock className="w-4 h-4 text-teal-700" />}
                      {card.key === 'movement_posture' && <Activity className="w-4 h-4 text-teal-700" />}
                      {card.key === 'food_drinks' && <Coffee className="w-4 h-4 text-teal-700" />}
                      {card.key === 'weather_season' && <CloudRain className="w-4 h-4 text-teal-700" />}
                      {card.key === 'warmth' && <Sun className="w-4 h-4 text-amber-600" />}
                      {card.key === 'cold' && <Snowflake className="w-4 h-4 text-cyan-600" />}
                      <span>{card.title}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{card.prompt}</p>

                    {/* Aggravation Input */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-red-700">
                        🔺 কোন সমস্যা ও কী পরিস্থিতিতে বাড়ে? (Aggravation)
                      </label>
                      <input
                        type="text"
                        value={cardState.aggravation || ''}
                        onChange={(e) =>
                          handleModalityChange(
                            card.key as keyof typeof formData.modalities,
                            'aggravation',
                            e.target.value
                          )
                        }
                        placeholder={card.placeholderAgg}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                      />
                    </div>

                    {/* Amelioration Input */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-emerald-800">
                        🔻 কোন সমস্যা ও কী পরিস্থিতিতে কমে বা আরাম লাগে? (Amelioration)
                      </label>
                      <input
                        type="text"
                        value={cardState.amelioration || ''}
                        onChange={(e) =>
                          handleModalityChange(
                            card.key as keyof typeof formData.modalities,
                            'amelioration',
                            e.target.value
                          )
                        }
                        placeholder={card.placeholderAme}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 5: REVIEW, ADDITIONAL NOTES & CONSENT ================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-teal-700" />
                ৫. অতিরিক্ত তথ্য, সারসংক্ষেপ ও ডিজিটাল সম্মতি
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                ফর্ম জমা দেওয়ার পূর্বে আপনার দেওয়া তথ্যসমূহ এক নজরে দেখে নিন।
              </p>
            </div>

            {/* Quick Review Card */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">রোগীর নাম</span>
                  <strong className="text-slate-900">{formData.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">বয়স ও লিঙ্গ</span>
                  <strong className="text-slate-900">
                    {formData.age} বছর ({formData.gender === 'female' ? 'মহিলা' : 'পুরুষ'})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">মোবাইল</span>
                  <strong className="text-slate-900 font-mono">{formData.contactNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">জেলা</span>
                  <strong className="text-slate-900">{formData.district}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80">
                <span className="text-slate-500 block text-xs">প্রধান সমস্যা</span>
                <p className="text-slate-800 text-xs sm:text-sm">{formData.primaryComplaint}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/80">
                <span className="text-slate-500 block text-xs">নির্বাচিত লক্ষণসমূহ</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {formData.selectedSymptoms.length > 0 ? (
                    formData.selectedSymptoms.map((symId) => {
                      const item = URINARY_BOWEL_SYMPTOMS.find((s) => s.id === symId);
                      return (
                        <span
                          key={symId}
                          className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 font-medium"
                        >
                          {item?.label || symId}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-400">কোনো বিশেষ লক্ষণ চিহ্নিত করা হয়নি</span>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-800">
                ১৪. অতিরিক্ত কোনো তথ্য বা পূর্ববর্তী চিকিৎসার ইতিহাস (ঐচ্ছিক)
              </label>
              <textarea
                rows={3}
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                placeholder="পূর্বে কোনো এলোপ্যাথিক বা হোমিওপ্যাথিক ওষুধ সেবন করে থাকলে, কোনো সার্জারি বা অ্যালার্জির ইতিহাস থাকলে উল্লেখ করুন..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-sm sm:text-base"
              />
            </div>

            {/* Mandatory Digital Consent */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                errors.consentGiven ? 'border-red-500 bg-red-50/50' : 'border-teal-600/40 bg-teal-50/40'
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.consentGiven)}
                  onChange={(e) => handleInputChange('consentGiven', e.target.checked)}
                  className="mt-1 w-5 h-5 text-teal-700 rounded border-slate-300 focus:ring-teal-600 cursor-pointer"
                />
                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  <strong className="block text-teal-950 font-bold mb-0.5">
                    ডিজিটাল সম্মতি ও তথ্যের সত্যতা ঘোষণা:
                  </strong>
                  আমি নিশ্চিত করছি যে শান্তি হোমিও কেয়ারের অনলাইন কেস টেকিং ফর্মে প্রদত্ত স্বাস্থ্য
                  বিবরণ সম্পূর্ণ সত্য ও সঠিক। আমি বুঝতে পারছি যে এটি চিকিৎসকের সরাসরি কেস পর্যালোচনার
                  উদ্দেশ্যে সংরক্ষিত হচ্ছে এবং কোনো জরুরি প্রাণঘাতী পরিস্থিতিতে আমি অবিলম্বে নিকটস্থ
                  জরুরি স্বাস্থ্যসেবায় যোগাযোগ করব।
                </div>
              </label>
              {errors.consentGiven && (
                <p className="text-xs text-red-600 font-medium mt-2 pl-8">{errors.consentGiven}</p>
              )}
            </div>
          </div>
        )}

        {/* Step Navigation Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>পূর্ববর্তী ধাপ</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-teal-900/10 transition-colors cursor-pointer"
            >
              <span>পরবর্তী ধাপ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-teal-800 to-emerald-700 hover:from-teal-900 hover:to-emerald-800 text-white font-extrabold text-sm sm:text-base px-8 py-3 rounded-xl shadow-lg shadow-teal-950/15 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-amber-300" />
              <span>কেস হিস্ট্রি জমা দিন (Submit Case)</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
