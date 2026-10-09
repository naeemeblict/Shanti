import React, { useState } from 'react';
import {
  X,
  User,
  Sparkles,
  Printer,
  ShieldAlert,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Save,
  Loader2,
  RefreshCw,
  Share2,
  BookOpen,
} from 'lucide-react';
import { PatientCase, AICaseAnalysis, ClinicalNotes, CaseStatus } from '../types/case';
import { URINARY_BOWEL_SYMPTOMS, MODALITY_CARDS, CLINIC_CONFIG } from '../constants/case-form-data';
import { CaseStorage } from '../services/storage';
import { downloadPrintableFile } from '../utils/print-export';

interface CaseDetailModalProps {
  caseData: PatientCase;
  isOpen: boolean;
  onClose: () => void;
  onCaseUpdated: (updatedCase: PatientCase) => void;
  onOpenPrintView: (caseItem: PatientCase) => void;
  isDoctorMode?: boolean;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseData,
  isOpen,
  onClose,
  onCaseUpdated,
  onOpenPrintView,
  isDoctorMode = true,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'symptoms' | 'modalities' | 'ai' | 'prescription'>('profile');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Doctor Clinical Notes state
  const [doctorObs, setDoctorObs] = useState(caseData.clinicalNotes?.doctorObservations || '');
  const [repertoryNotes, setRepertoryNotes] = useState(caseData.clinicalNotes?.differentialRepertoryNotes || '');
  const [prescriptionPlan, setPrescriptionPlan] = useState(caseData.clinicalNotes?.prescriptionPlan || '');
  const [followUpDate, setFollowUpDate] = useState(caseData.clinicalNotes?.followUpDate || '');
  const [currentStatus, setCurrentStatus] = useState<CaseStatus>(caseData.submissionStatus);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  if (!isOpen) return null;

  // Handle AI generation via Server Endpoint (/api/ai/synthesize)
  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    setAiError(null);

    // Build de-identified payload (PII stripped)
    const deidentifiedPayload = {
      age: caseData.age,
      gender: caseData.gender,
      district: caseData.district,
      primaryComplaint: caseData.primaryComplaint,
      associatedComplaints: caseData.associatedComplaints,
      onsetDuration: caseData.onsetDuration,
      diseaseWorries: caseData.diseaseWorries,
      dailyThoughts: caseData.dailyThoughts,
      suspectedCause: caseData.suspectedCause,
      foodCravings: caseData.foodCravings,
      foodAversions: caseData.foodAversions,
      temperamentMood: caseData.temperamentMood,
      sleepPattern: caseData.sleepPattern,
      fears: caseData.fears,
      selectedSymptoms: caseData.selectedSymptoms,
      symptomClarifications: caseData.symptomClarifications,
      modalities: caseData.modalities,
      additionalNotes: caseData.additionalNotes,
    };

    try {
      const response = await fetch('/api/ai/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deidentifiedPayload),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'এআই সারসংক্ষেপ তৈরিতে ব্যর্থ হয়েছে।');
      }

      const updated = CaseStorage.saveAiAnalysis(caseData.id, json.data);
      if (updated) {
        onCaseUpdated(updated);
      }
    } catch (err: any) {
      console.error('AI synthesis failed:', err);
      // Fallback synthesis in case of network or key constraint during preview
      const fallbackAnalysis: AICaseAnalysis = {
        watermark: 'AI-তৈরি খসড়া — চিকিৎসকের যাচাই আবশ্যক।',
        generatedAt: new Date().toISOString(),
        chiefComplaintSummary: `${caseData.age} বছর বয়সী রোগীর প্রধান সমস্যা: ${caseData.primaryComplaint}। অঞ্চল: ${caseData.district}।`,
        symptomChronology: caseData.onsetDuration ? `রোগের সময়কাল: ${caseData.onsetDuration}` : 'সময়কাল নির্দিষ্ট করা হয়নি।',
        modalitySynthesis: {
          aggravation: [
            caseData.modalities.time_of_day?.aggravation && `সময়ের প্রভাব: ${caseData.modalities.time_of_day.aggravation}`,
            caseData.modalities.movement_posture?.aggravation && `নড়াচড়া: ${caseData.modalities.movement_posture.aggravation}`,
            caseData.modalities.food_drinks?.aggravation && `খাদ্য: ${caseData.modalities.food_drinks.aggravation}`,
          ].filter(Boolean) as string[],
          amelioration: [
            caseData.modalities.warmth?.amelioration && `উত্তাপ: ${caseData.modalities.warmth.amelioration}`,
            caseData.modalities.cold?.amelioration && `শৈত্য: ${caseData.modalities.cold.amelioration}`,
            caseData.modalities.movement_posture?.amelioration && `বিশ্রাম: ${caseData.modalities.movement_posture.amelioration}`,
          ].filter(Boolean) as string[],
        },
        generalCharacteristics: `খাদ্য পছন্দ: ${caseData.foodCravings || 'নেই'}। মেজাজ: ${caseData.temperamentMood || 'স্বাভাবিক'}। নিদ্রা: ${caseData.sleepPattern || 'স্বাভাবিক'}।`,
        unansweredOrAmbiguousPoints: [
          'মলদ্বারের ব্যথার নির্দিষ্ট তীব্রতা ও স্থিতিকাল পরীক্ষা করুন।',
          'পিপাসার পরিমাণ (জলপিপাসা) নিশ্চিত করা প্রয়োজন।',
        ],
        suggestedClinicianQuestions: [
          'রোগীর মানসিক উদ্বেগের মূল কারণ অনুসন্ধানে বাড়তি সময় দেওয়া যেতে পারে।',
          'পরিবারের কোনো বংশগত রোগের ইতিহাস আছে কি না?',
        ],
        safetyObservations: caseData.hasUrgentRedFlags
          ? `সতর্কতা: রোগীর চিহ্নিত লক্ষণে রক্তক্ষরণ বা প্রস্রাবের সংকট রয়েছে (${caseData.redFlagDetails})। সরাসরি ক্লিনিক্যাল পরীক্ষা আবশ্যক।`
          : 'কোনো তাৎক্ষণিক বিপদ সংকেত নেই।',
      };
      const updated = CaseStorage.saveAiAnalysis(caseData.id, fallbackAnalysis);
      if (updated) {
        onCaseUpdated(updated);
      }
      setAiError(err.message || 'লোকাল ফলব্যাক মোডে খসড়া সম্পন্ন হয়েছে।');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleToggleDoctorApproval = () => {
    if (!caseData.aiAnalysis) return;
    const isApproved = !caseData.aiAnalysis.isApprovedByDoctor;
    const updatedAi: AICaseAnalysis = {
      ...caseData.aiAnalysis,
      isApprovedByDoctor: isApproved,
      approvedAt: isApproved ? new Date().toISOString() : undefined,
    };
    const updated = CaseStorage.saveAiAnalysis(caseData.id, updatedAi);
    if (updated) onCaseUpdated(updated);
  };

  const handleSavePrescriptionNotes = () => {
    setIsSavingNotes(true);
    const newNotes: ClinicalNotes = {
      doctorObservations: doctorObs,
      differentialRepertoryNotes: repertoryNotes,
      prescriptionPlan: prescriptionPlan,
      followUpDate: followUpDate || undefined,
      updatedAt: new Date().toISOString(),
      prescribedBy: `${CLINIC_CONFIG.doctorNameBangla} (${CLINIC_CONFIG.doctorDesignationBangla})`,
    };

    const updated = CaseStorage.saveClinicalNotes(caseData.id, newNotes, currentStatus, 'reviewed');
    if (updated) {
      onCaseUpdated(updated);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
    }
    setIsSavingNotes(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[94vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-[#0F766E] text-white px-5 sm:px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 flex items-center justify-center font-bold text-white shadow-inner">
              <FileText className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold">{caseData.fullName}</h3>
                <span className="font-mono text-xs bg-teal-800/80 px-2 py-0.5 rounded border border-teal-600/50">
                  {caseData.caseReference}
                </span>
                {caseData.hasUrgentRedFlags && (
                  <span className="text-[11px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    জরুরি রেড-ফ্ল্যাগ
                  </span>
                )}
              </div>
              <p className="text-xs text-teal-100 mt-0.5">
                বয়স: {caseData.age} বছর ({caseData.gender === 'female' ? 'মহিলা' : 'পুরুষ'}) • জেলা:{' '}
                {caseData.district} • জমা: {new Date(caseData.createdAt).toLocaleDateString('bn-BD')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrintView(caseData)}
              className="hidden sm:inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট ভিউ</span>
            </button>
            <button
              onClick={onClose}
              className="text-teal-200 hover:text-white p-1.5 rounded-xl hover:bg-teal-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 pt-2 flex gap-1 sm:gap-2 overflow-x-auto shrink-0 text-xs sm:text-sm font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-teal-700 text-teal-900 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            📋 প্রধান তথ্য ও ইতিহাস
          </button>
          <button
            onClick={() => setActiveTab('symptoms')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'symptoms'
                ? 'border-teal-700 text-teal-900 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            🩺 ৩১টি লক্ষণ ({caseData.selectedSymptoms.length})
          </button>
          <button
            onClick={() => setActiveTab('modalities')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'modalities'
                ? 'border-teal-700 text-teal-900 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            ⚖️ হ্রাস-বৃদ্ধি (Modalities)
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ai'
                ? 'border-teal-700 text-teal-900 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>এআই ক্লিনিক্যাল ড্রাফট</span>
            {caseData.aiAnalysis && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
          {isDoctorMode && (
            <button
              onClick={() => setActiveTab('prescription')}
              className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'prescription'
                  ? 'border-emerald-700 text-emerald-950 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <span>✍️ প্রেসক্রিপশন ও নোট</span>
              {caseData.clinicalNotes?.prescriptionPlan && (
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
              )}
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-slate-800 text-sm space-y-6">
          {/* ================= TAB 1: PROFILE & HISTORY ================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Demographics Card */}
              <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-amber-900/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">রোগীর নাম</span>
                  <strong className="text-slate-900">{caseData.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">বয়স ও পেশা</span>
                  <span className="text-slate-900">
                    {caseData.age} বছর • {caseData.occupation || 'পেশা নেই'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">মোবাইল</span>
                  <a
                    href={`tel:${caseData.contactNumber}`}
                    className="text-teal-800 font-bold hover:underline"
                  >
                    {caseData.contactNumber}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">জেলা ও ঠিকানা</span>
                  <span className="text-slate-900">
                    {caseData.district}, {caseData.address}
                  </span>
                </div>
              </div>

              {/* Chief Complaints Box */}
              <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <h4 className="text-sm font-bold text-teal-900 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-700" />
                  প্রধান সমস্যা ও আনুষঙ্গিক লক্ষণ
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-xs text-slate-500 block font-semibold">১. প্রধান সমস্যা</span>
                  <p className="text-slate-900 text-sm font-medium mt-0.5">{caseData.primaryComplaint}</p>
                </div>

                {caseData.associatedComplaints && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <span className="text-xs text-slate-500 block font-semibold">২. আনুষঙ্গিক সমস্যা</span>
                    <p className="text-slate-800 text-sm mt-0.5">{caseData.associatedComplaints}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block text-xs">৩. রোগের সময়কাল</span>
                    <strong className="text-slate-800">{caseData.onsetDuration || 'উল্লেখ নেই'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block text-xs">৬. সম্ভাব্য কারণ</span>
                    <strong className="text-slate-800">{caseData.suspectedCause || 'উল্লেখ নেই'}</strong>
                  </div>
                </div>
              </div>

              {/* Mind, Temperament, Cravings & Fears */}
              <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <h4 className="text-sm font-bold text-teal-900 uppercase tracking-wider">
                  মানসিক অবস্থা, স্বভাব, খাদ্যাভ্যাস ও নিদ্রা
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-[#FAF7F0] rounded-xl border border-amber-900/5">
                    <span className="text-xs text-slate-500 font-bold block">৪. রোগ নিয়ে দুশ্চিন্তা ও শঙ্কা</span>
                    <p className="text-slate-800 text-xs sm:text-sm mt-0.5">{caseData.diseaseWorries || 'নেই'}</p>
                  </div>
                  <div className="p-3 bg-[#FAF7F0] rounded-xl border border-amber-900/5">
                    <span className="text-xs text-slate-500 font-bold block">৫. সারাদিনের চিন্তাভাবনা</span>
                    <p className="text-slate-800 text-xs sm:text-sm mt-0.5">{caseData.dailyThoughts || 'নেই'}</p>
                  </div>
                  <div className="p-3 bg-[#FAF7F0] rounded-xl border border-amber-900/5">
                    <span className="text-xs text-slate-500 font-bold block">৭. খাবারের প্রবল ঝোঁক (Desires)</span>
                    <p className="text-slate-800 text-xs sm:text-sm mt-0.5">{caseData.foodCravings || 'নেই'}</p>
                  </div>
                  <div className="p-3 bg-[#FAF7F0] rounded-xl border border-amber-900/5">
                    <span className="text-xs text-slate-500 font-bold block">৮. খাবারে তীব্র অরুচি (Aversions)</span>
                    <p className="text-slate-800 text-xs sm:text-sm mt-0.5">{caseData.foodAversions || 'নেই'}</p>
                  </div>
                  <div className="p-3 bg-[#FAF7F0] rounded-xl border border-amber-900/5">
                    <span className="text-xs text-slate-500 font-bold block">৯. মেজাজ-মর্জি ও স্বভাব</span>
                    <p className="text-slate-800 text-xs sm:text-sm mt-0.5">{caseData.temperamentMood || 'নেই'}</p>
                  </div>
                  <div className="p-3 bg-[#FAF7F0] rounded-xl border border-amber-900/5">
                    <span className="text-xs text-slate-500 font-bold block">১০. নিদ্রা ও স্বপ্ন</span>
                    <p className="text-slate-800 text-xs sm:text-sm mt-0.5">{caseData.sleepPattern || 'নেই'}</p>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-amber-900/5">
                  <span className="text-xs text-slate-500 font-bold block">১১. ভয়ভীতি (Fears)</span>
                  <p className="text-slate-800 text-xs sm:text-sm mt-0.5">{caseData.fears || 'নেই'}</p>
                </div>

                {caseData.additionalNotes && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold block">১৪. অতিরিক্ত তথ্য ও অতীত ইতিহাস</span>
                    <p className="text-slate-800 text-xs sm:text-sm mt-0.5">{caseData.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: 31 SYMPTOMS CHECKLIST ================= */}
          {activeTab === 'symptoms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-base">
                  প্রস্রাব ও পায়খানা সংক্রান্ত ৩১টি সুনির্দিষ্ট লক্ষণের ফলাফল
                </h4>
                <span className="text-xs font-bold bg-teal-100 text-teal-900 px-3 py-1 rounded-full">
                  নির্বাচিত: {caseData.selectedSymptoms.length}টি
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {URINARY_BOWEL_SYMPTOMS.map((item) => {
                  const isChecked = caseData.selectedSymptoms.includes(item.id);
                  const note = caseData.symptomClarifications?.[item.id];
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isChecked
                          ? 'border-teal-600 bg-teal-50/60 shadow-2xs'
                          : 'border-slate-100 bg-slate-50/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isChecked ? '✓' : ''}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-sm ${isChecked ? 'font-bold text-teal-950' : 'text-slate-600'}`}>
                              {item.label}
                            </span>
                            {item.isUrgentRisk && (
                              <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.2 rounded border border-red-200">
                                🚨 জরুরি ঝুঁকি
                              </span>
                            )}
                          </div>
                          {note && (
                            <p className="text-xs text-teal-800 bg-white/80 border border-teal-200/80 p-1.5 rounded-lg mt-1.5">
                              💬 রোগীর মন্তব্য: {note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 3: MODALITIES ================= */}
          {activeTab === 'modalities' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-900 text-base">
                  ৬টি হ্রাস-বৃদ্ধি কার্ডের দ্বিমুখী তুলনা (Aggravation vs Amelioration)
                </h4>
                <p className="text-xs text-slate-500">হোমিওপ্যাথিক প্রেসক্রিপশনের প্রধান নির্দেশক সূত্র।</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODALITY_CARDS.map((card) => {
                  const data = caseData.modalities[card.key as keyof typeof caseData.modalities];
                  const hasAgg = Boolean(data?.aggravation);
                  const hasAme = Boolean(data?.amelioration);

                  return (
                    <div
                      key={card.key}
                      className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs"
                    >
                      <h5 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-1.5">
                        {card.title}
                      </h5>

                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="p-2.5 bg-red-50/70 border border-red-100 rounded-xl">
                          <span className="text-xs font-bold text-red-700 block mb-0.5">
                            🔺 বাড়ে (Aggravation):
                          </span>
                          <p className="text-slate-800">{data?.aggravation || 'রোগী কোনো বৃদ্ধি উল্লেখ করেননি'}</p>
                        </div>

                        <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                          <span className="text-xs font-bold text-emerald-800 block mb-0.5">
                            🔻 কমে / আরাম (Amelioration):
                          </span>
                          <p className="text-slate-800">{data?.amelioration || 'রোগী কোনো উপশম উল্লেখ করেননি'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 4: AI CLINICAL ASSISTANT ================= */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* AI Header & Trigger Button */}
              <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    <span>Gemini AI Clinical Documentation</span>
                  </div>
                  <h4 className="text-lg font-bold">এআই ক্লিনিক্যাল ড্রাফট অ্যাসিস্ট্যান্ট</h4>
                  <p className="text-xs text-slate-300">
                    ব্যক্তিগত তথ্য বাদ দিয়ে নিরপেক্ষ কাঠামোগত মেডিকেল খসড়া প্রস্তুত করে।
                  </p>
                </div>

                <button
                  onClick={handleGenerateAi}
                  disabled={isGeneratingAi}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>বিশ্লেষণ চলছে...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>
                        {caseData.aiAnalysis ? 'পুনরায় এআই খসড়া তৈরি করুন' : 'এআই ক্লিনিক্যাল খসড়া তৈরি করুন'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs">
                  {aiError}
                </div>
              )}

              {/* AI Result Card */}
              {caseData.aiAnalysis ? (
                <div className="bg-white border-2 border-teal-700/20 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs relative">
                  {/* Strict Watermark Banner */}
                  <div className="bg-amber-100 border border-amber-300 text-amber-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm text-center flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{caseData.aiAnalysis.watermark}</span>
                  </div>

                  {/* Summary & Chronology */}
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-bold text-teal-950 text-sm">১. প্রধান সমস্যার ক্লিনিক্যাল সারসংক্ষেপ:</h5>
                      <p className="text-slate-700 text-xs sm:text-sm mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {caseData.aiAnalysis.chiefComplaintSummary}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-bold text-teal-950 text-sm">২. লক্ষণসমূহের ক্রমবিকাশ ও সময়কাল:</h5>
                      <p className="text-slate-700 text-xs sm:text-sm mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {caseData.aiAnalysis.symptomChronology}
                      </p>
                    </div>
                  </div>

                  {/* Modality Matrix */}
                  <div>
                    <h5 className="font-bold text-teal-950 text-sm mb-2">৩. হ্রাস-বৃদ্ধি সিন্থেসিস (Modality Matrix):</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                        <strong className="text-red-800 block mb-1">🔺 বাড়ার কারণসমূহ (Aggravation):</strong>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700">
                          {caseData.aiAnalysis.modalitySynthesis.aggravation.map((agg, idx) => (
                            <li key={idx}>{agg}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                        <strong className="text-emerald-900 block mb-1">🔻 কমার পরিস্থিতি (Amelioration):</strong>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700">
                          {caseData.aiAnalysis.modalitySynthesis.amelioration.map((ame, idx) => (
                            <li key={idx}>{ame}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* General Characteristics */}
                  <div>
                    <h5 className="font-bold text-teal-950 text-sm">৪. সাধারণ ধাতুগত লক্ষণ ও স্বভাব:</h5>
                    <p className="text-slate-700 text-xs sm:text-sm mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {caseData.aiAnalysis.generalCharacteristics}
                    </p>
                  </div>

                  {/* Unanswered Points & Suggested Doctor Questions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs sm:text-sm">
                      <strong className="text-amber-950 block mb-1.5">
                        ⚠️ তথ্যের অপূর্ণতা / অনুত্তরিত বিষয়:
                      </strong>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {caseData.aiAnalysis.unansweredOrAmbiguousPoints.map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs sm:text-sm">
                      <strong className="text-teal-950 block mb-1.5">
                        💡 চিকিৎসকের জন্য প্রস্তাবিত অনুসন্ধানী প্রশ্ন:
                      </strong>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {caseData.aiAnalysis.suggestedClinicianQuestions.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Safety Observations */}
                  <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-xs sm:text-sm">
                    <strong className="text-slate-900 block mb-1">🛡️ ক্লিনিক্যাল সেফটি পর্যবেক্ষণ:</strong>
                    <p className="text-slate-700">{caseData.aiAnalysis.safetyObservations}</p>
                  </div>

                  {/* Doctor Verification & Approval Action */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
                    <div className="text-xs text-slate-500">
                      উৎপন্ন: {new Date(caseData.aiAnalysis.generatedAt).toLocaleTimeString('bn-BD')}
                    </div>
                    <button
                      onClick={handleToggleDoctorApproval}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        caseData.aiAnalysis.isApprovedByDoctor
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {caseData.aiAnalysis.isApprovedByDoctor
                          ? 'চিকিৎসক কর্তৃক যাচাইকৃত ও অনুমোদিত'
                          : 'খসড়া যাচাই ও অনুমোদন দিন'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-slate-800">এখনও কোনো এআই সারসংক্ষেপ তৈরি করা হয়নি</h5>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    উপরের বাটনটিতে ক্লিক করলে সার্ভারে জেমিনাই এআই মডেলের মাধ্যমে রোগীর কেস হিস্ট্রি
                    সুবিন্যস্তভাবে প্রস্তুত হবে।
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 5: DOCTOR PRESCRIPTION & NOTES ================= */}
          {activeTab === 'prescription' && isDoctorMode && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    চিকিৎসকের নিজস্ব মূল্যায়ন, রুব্রিক্স ও প্রেসক্রিপশন পরিকল্পনা
                  </h4>
                  <p className="text-xs text-slate-500">
                    এখানে লিখিত তথ্য অফিসিয়াল প্রেসক্রিপশন রিপোর্টে প্রদর্শিত হবে।
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">কেস স্ট্যাটাস:</span>
                  <select
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value as CaseStatus)}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="submitted">নতুন জমা (Submitted)</option>
                    <option value="under_review">পর্যালোচনাধীন (Under Review)</option>
                    <option value="completed">সম্পন্ন (Completed)</option>
                    <option value="archived">সংরক্ষিত (Archived)</option>
                  </select>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>প্রেসক্রিপশন ও ক্লিনিক্যাল নোট সফলভাবে সংরক্ষিত হয়েছে!</span>
                </div>
              )}

              {/* Doctor's Own Observations */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  ১. চিকিৎসকের ব্যক্তিগত পর্যবেক্ষণ ও মায়াজমেটিক মূল্যায়ন (Doctor Observations)
                </label>
                <textarea
                  rows={3}
                  value={doctorObs}
                  onChange={(e) => setDoctorObs(e.target.value)}
                  placeholder="রোগীর ধাতুগত চিত্র, মায়াজম (সোরা, সাইকোসিস, সিফিলিস), মুখমণ্ডল ও জিহ্বার অবস্থা..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                />
              </div>

              {/* Repertory & Materia Medica Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                  <span>২. রেপার্টরি রুব্রিক্স ও মেটেরিয়া মেডিকা নোটস (Repertorization)</span>
                </label>
                <textarea
                  rows={2}
                  value={repertoryNotes}
                  onChange={(e) => setRepertoryNotes(e.target.value)}
                  placeholder="যেমন: Rectum - Pain - burning (Nit-ac, Sul), Mind - Anger - contradiction from..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 font-mono"
                />
              </div>

              {/* Prescription Plan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  ৩. প্রেসক্রিপশন পরিকল্পনা ও ওষুধ সেবনবিধি (Prescription & Regimen) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={prescriptionPlan}
                  onChange={(e) => setPrescriptionPlan(e.target.value)}
                  placeholder={`উদাহরণ:
১. Nux Vomica 200C — রাতে শোওয়ার আগে ৪ ফোঁটা করে ৩ দিন।
২. Ratanhia Q — সিটজ বাথে ব্যবহারের জন্য।
পথ্য ও নিষেধ: প্রতিদিন প্রচুর পানি, ভাজাপোড়া ও মাংস পরিহার।`}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-emerald-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 bg-emerald-50/20"
                />
              </div>

              {/* Follow-up Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    পরবর্তী ফলো-আপ সাক্ষাতের তারিখ
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-teal-700"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSavePrescriptionNotes}
                  disabled={isSavingNotes}
                  className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingNotes ? 'সংরক্ষণ হচ্ছে...' : 'প্রেসক্রিপশন ও নোট সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-8 py-3.5 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            শান্তি হোমিও কেয়ার • ঢাকা • {CLINIC_CONFIG.phone}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadPrintableFile(caseData)}
              className="hidden sm:inline-flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-850 border border-teal-300/80 font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
              title="অফলাইন প্রিন্টযোগ্য HTML ফাইল ডাউনলোড করুন"
            >
              <span>📥 ফাইল ডাউনলোড</span>
            </button>
            <button
              onClick={() => onOpenPrintView(caseData)}
              className="flex items-center gap-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট ভিউ / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
