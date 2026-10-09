import React, { useState, useEffect } from 'react';
import {
  Printer,
  X,
  ShieldAlert,
  CheckCircle2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Info,
} from 'lucide-react';
import { PatientCase } from '../types/case';
import { CLINIC_CONFIG, URINARY_BOWEL_SYMPTOMS, MODALITY_CARDS } from '../constants/case-form-data';
import {
  downloadPrintableFile,
  copyCaseSummaryText,
  createPrintBlobUrl,
  printViaHiddenIframe,
} from '../utils/print-export';

interface PrintCaseReportProps {
  caseData: PatientCase;
  onClose: () => void;
}

export const PrintCaseReport: React.FC<PrintCaseReportProps> = ({ caseData, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string>('');

  useEffect(() => {
    const url = createPrintBlobUrl(caseData);
    setBlobUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [caseData]);

  const selectedSymptomLabels = caseData.selectedSymptoms.map((id) => {
    const item = URINARY_BOWEL_SYMPTOMS.find((s) => s.id === id);
    const clarification = caseData.symptomClarifications?.[id];
    return {
      label: item?.label || id,
      clarification,
      isUrgent: item?.isUrgentRisk,
    };
  });

  const handleDirectPrint = () => {
    // Try hidden iframe first
    const iframeWorked = printViaHiddenIframe(caseData);
    if (!iframeWorked) {
      try {
        window.print();
      } catch (err) {
        console.warn('Direct print blocked by iframe container:', err);
        downloadPrintableFile(caseData);
        setNoticeMsg('আইফ্রেমের সীমাবদ্ধতার কারণে অফলাইন প্রিন্ট ফাইল ডাউনলোড করা হয়েছে।');
      }
    }
  };

  const handleDownload = () => {
    downloadPrintableFile(caseData);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleCopy = async () => {
    const success = await copyCaseSummaryText(caseData);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/85 p-2 sm:p-6 flex justify-center items-start">
      {/* Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full my-4 overflow-hidden shadow-2xl border border-slate-300">
        {/* Floating Print Action Bar (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-sm block">
                {CLINIC_CONFIG.nameBangla} — অফিশিয়াল প্রেসক্রিপশন ও কেস রিপোর্ট
              </span>
              <span className="text-[11px] text-slate-400">
                কনসালট্যান্ট: {CLINIC_CONFIG.doctorNameBangla} ({CLINIC_CONFIG.doctorDesignationBangla})
              </span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Primary Option 1: Native External Tab Auto-Print Link (100% immune to iframe restrictions) */}
            {blobUrl && (
              <a
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                title="নতুন ব্রাউজার ট্যাবে ওপেন করে অটো-প্রিন্ট বা PDF সেভ করুন"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট / PDF (নতুন ট্যাবে)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            )}

            {/* Option 2: Direct in-page print button */}
            <button
              onClick={handleDirectPrint}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              title="এই পেজেই প্রিন্ট ডায়ালগ চেষ্টা করুন"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">সরাসরি প্রিন্ট</span>
            </button>

            {/* Option 3: Offline File Download */}
            <button
              onClick={handleDownload}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              title="অফলাইন প্রিন্টযোগ্য HTML ফাইল ডাউনলোড করুন"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">ডাউনলোড হয়েছে</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>ফাইল ডাউনলোড</span>
                </>
              )}
            </button>

            {/* Option 4: Copy Prescription Text */}
            <button
              onClick={handleCopy}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              title="প্রেসক্রিপশনের বিবরণ ক্লিপবোর্ডে কপি করুন"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 hidden sm:inline">কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">কপি</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl text-sm transition-colors cursor-pointer ml-1"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        {noticeMsg && (
          <div className="no-print bg-amber-50 border-b border-amber-200 p-3 text-amber-950 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{noticeMsg}</span>
          </div>
        )}

        {/* Helpful Tip for iFrame users */}
        <div className="no-print bg-teal-50 border-b border-teal-200 px-6 py-2.5 text-xs text-teal-950 flex flex-wrap items-center justify-between gap-2">
          <span>
            💡 <strong>প্রিন্ট করতে:</strong> উপরের সবুজ <strong>&apos;প্রিন্ট / PDF (নতুন ট্যাবে)&apos;</strong> বাটনে ক্লিক করলেই স্বয়ংক্রিয়ভাবে ঝকঝকে A4 সাইজের প্রিন্ট ও PDF সেভ ডায়ালগ ওপেন হবে।
          </span>
          <span className="font-mono text-teal-900 font-bold bg-teal-100/80 px-2 py-0.5 rounded">
            {caseData.caseReference}
          </span>
        </div>

        {/* ================= Printable Document Body ================= */}
        <div className="p-6 sm:p-12 text-slate-900 bg-white space-y-6 text-sm">
          {/* Official Clinic Header */}
          <div className="border-b-2 border-teal-800 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-800 text-white flex items-center justify-center text-2xl font-bold font-serif shrink-0">
                  শ
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-teal-950 tracking-tight">
                    {CLINIC_CONFIG.nameBangla}
                  </h1>
                  <p className="text-xs font-bold text-teal-800 uppercase tracking-widest">
                    {CLINIC_CONFIG.nameEnglish} • Classical Homeopathy Care
                  </p>
                  <div className="mt-1.5 pt-1 border-t border-teal-700/20 text-xs">
                    <span className="font-bold text-teal-950 block text-sm">
                      {CLINIC_CONFIG.doctorNameBangla} ({CLINIC_CONFIG.doctorNameEnglish})
                    </span>
                    <span className="text-[11px] text-slate-700 block font-medium">
                      {CLINIC_CONFIG.doctorDesignationBangla}
                    </span>
                    <span className="text-[10px] text-slate-500 block italic font-medium">
                      {CLINIC_CONFIG.doctorDesignationEnglish}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-600 sm:text-right space-y-0.5">
              <p className="font-semibold text-slate-900">{CLINIC_CONFIG.address}</p>
              <p>হটলাইন: <strong className="font-mono text-teal-900">{CLINIC_CONFIG.phone}</strong></p>
              <p className="text-[11px] text-slate-500">{CLINIC_CONFIG.consultationHours}</p>
            </div>
          </div>

          {/* Patient Meta Strip */}
          <div className="bg-[#FAF7F0] border border-amber-900/15 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-xs">রোগীর নাম</span>
              <strong className="text-slate-900 text-base">{caseData.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">রেফারেন্স কোড</span>
              <span className="font-mono font-bold text-teal-900">{caseData.caseReference}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">বয়স ও লিঙ্গ</span>
              <span className="text-slate-900 font-medium">
                {caseData.age} বছর ({caseData.gender === 'female' ? 'মহিলা' : 'পুরুষ'})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">তারিখ ও জেলা</span>
              <span className="text-slate-900">
                {new Date(caseData.createdAt).toLocaleDateString('bn-BD')} • {caseData.district}
              </span>
            </div>
          </div>

          {/* Red Flag Notice if any */}
          {caseData.hasUrgentRedFlags && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-red-950 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>ক্লিনিক্যাল সতর্কতা:</strong> রোগীর তথ্যে জরুরি ঝুঁকি চিহ্নিত হয়েছে ({caseData.redFlagDetails})।
              </span>
            </div>
          )}

          {/* Section 1: Chief Complaints */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-950 border-b border-slate-200 pb-1">
              ১. প্রধান উপসর্গ ও আনুষঙ্গিক সমস্যা (Chief Complaints & History)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block font-semibold">প্রধান সমস্যা:</span>
                <p className="text-slate-900 mt-0.5">{caseData.primaryComplaint}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block font-semibold">সময়কাল ও সম্ভাব্য কারণ:</span>
                <p className="text-slate-900 mt-0.5">
                  সময়: {caseData.onsetDuration || 'অনুল্লিখিত'} | কারণ: {caseData.suspectedCause || 'অনুল্লিখিত'}
                </p>
              </div>
            </div>
            {caseData.associatedComplaints && (
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <strong>আনুষঙ্গিক সমস্যা:</strong> {caseData.associatedComplaints}
              </p>
            )}
          </div>

          {/* Section 2: 31 Symptoms Findings */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-950 border-b border-slate-200 pb-1">
              ২. প্রস্রাব ও পায়খানা সংক্রান্ত লক্ষণাবলী ({selectedSymptomLabels.length}টি চিহ্নিত)
            </h2>
            {selectedSymptomLabels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedSymptomLabels.map((s, idx) => (
                  <div key={idx} className="p-2 rounded border border-slate-200 bg-slate-50/60 flex items-start gap-1.5">
                    <span className="text-teal-700 font-bold">•</span>
                    <div>
                      <span className="font-semibold text-slate-900">{s.label}</span>
                      {s.clarification && (
                        <span className="block text-[11px] text-teal-800 italic">({s.clarification})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">কোনো বিশেষ লক্ষণ চিহ্নিত করা হয়নি।</p>
            )}
          </div>

          {/* Section 3: Modalities Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-950 border-b border-slate-200 pb-1">
              ৩. রোগের হ্রাস-বৃদ্ধি বিবরণী (Modalities Matrix)
            </h2>
            <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-2 text-left border-r border-b border-slate-200 w-1/3">পরিস্থিতি</th>
                  <th className="p-2 text-left border-r border-b border-slate-200 text-red-700">বাড়ে (Aggravation)</th>
                  <th className="p-2 text-left border-b border-slate-200 text-emerald-800">কমে (Amelioration)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {MODALITY_CARDS.map((card) => {
                  const m = caseData.modalities[card.key as keyof typeof caseData.modalities];
                  return (
                    <tr key={card.key} className="hover:bg-slate-50">
                      <td className="p-2 font-medium border-r border-slate-200 text-slate-800">{card.title}</td>
                      <td className="p-2 border-r border-slate-200 text-slate-700">{m?.aggravation || '—'}</td>
                      <td className="p-2 text-slate-700">{m?.amelioration || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 4: General Constitution */}
          <div className="space-y-1 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-950 border-b border-slate-200 pb-1">
              ৪. ধাতুগত অবস্থা, স্বভাব ও খাদ্যাভ্যাস
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">খাবারের আকর্ষণ:</span>
                <span className="font-semibold text-slate-800">{caseData.foodCravings || 'অনুল্লিখিত'}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">খাবারে অরুচি:</span>
                <span className="font-semibold text-slate-800">{caseData.foodAversions || 'অনুল্লিখিত'}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">মেজাজ ও স্বভাব:</span>
                <span className="font-semibold text-slate-800">{caseData.temperamentMood || 'অনুল্লিখিত'}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">নিদ্রা ও ভীতি:</span>
                <span className="font-semibold text-slate-800">
                  ঘুম: {caseData.sleepPattern || 'স্বাভাবিক'} | ভয়: {caseData.fears || 'নেই'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 5: AI Clinical Summary (if available) */}
          {caseData.aiAnalysis && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-amber-200 pb-1">
                <span className="font-bold text-amber-950 uppercase tracking-wider">
                  এআই ক্লিনিক্যাল খসড়া সারসংক্ষেপ
                </span>
                <span className="font-bold text-amber-800 text-[11px]">
                  {caseData.aiAnalysis.watermark}
                </span>
              </div>
              <p className="text-slate-800 leading-relaxed">
                {caseData.aiAnalysis.chiefComplaintSummary}
              </p>
              {caseData.aiAnalysis.isApprovedByDoctor && (
                <p className="text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  চিকিৎসক কর্তৃক যাচাই ও পর্যালোচিত।
                </p>
              )}
            </div>
          )}

          {/* Section 6: Official Doctor Prescription Plan */}
          <div className="border-2 border-teal-800 rounded-2xl p-5 space-y-3 bg-teal-50/20">
            <h2 className="text-sm font-black text-teal-950 uppercase tracking-wider border-b border-teal-200 pb-1">
              ৫. চিকিৎসকের ব্যবস্থাপত্র ও পথ্য-নিষেধ (Prescription & Advice)
            </h2>

            {caseData.clinicalNotes?.doctorObservations && (
              <div className="text-xs text-slate-700">
                <strong>চিকিৎসকের পর্যবেক্ষণ:</strong> {caseData.clinicalNotes.doctorObservations}
              </div>
            )}

            {caseData.clinicalNotes?.differentialRepertoryNotes && (
              <div className="text-xs text-slate-600 font-mono">
                <strong>রুব্রিক্স নোটস:</strong> {caseData.clinicalNotes.differentialRepertoryNotes}
              </div>
            )}

            <div className="bg-white p-4 rounded-xl border border-teal-200 text-slate-900 text-xs sm:text-sm">
              <span className="font-bold text-teal-950 block text-xs mb-1">
                Rx (নির্বাচিত ওষুধ, শক্তি ও সেবনবিধি):
              </span>
              <p className="whitespace-pre-line leading-relaxed font-semibold text-slate-800">
                {caseData.clinicalNotes?.prescriptionPlan || 'ব্যবস্থাপত্র চেম্বারে সরাসরি সাক্ষাতের পর নির্ধারিত হবে।'}
              </p>
            </div>

            {caseData.clinicalNotes?.followUpDate && (
              <div className="text-xs font-bold text-teal-900">
                পরবর্তী ফলো-আপের তারিখ: {caseData.clinicalNotes.followUpDate}
              </div>
            )}
          </div>

          {/* Signature & Clinic Footer */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-200 text-xs text-slate-600">
            <div>
              <p>রিপোর্ট প্রস্তুতের সময়: {new Date().toLocaleString('bn-BD')}</p>
              <p className="text-[11px] text-slate-400">শান্তি হোমিও কেয়ার ডিজিটাল সিস্টেম দ্বারা স্বয়ংক্রিয়ভাবে সংকলিত</p>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="w-56 border-b border-slate-800 mx-auto sm:ml-auto mb-1"></div>
              <p className="font-bold text-slate-900 text-sm">{CLINIC_CONFIG.doctorNameBangla}</p>
              <p className="text-xs text-teal-900 font-bold">{CLINIC_CONFIG.doctorNameEnglish}</p>
              <p className="text-[11px] text-slate-700 font-medium">{CLINIC_CONFIG.doctorDesignationBangla}</p>
              <p className="text-[10px] text-slate-500 italic">{CLINIC_CONFIG.doctorDesignationEnglish}</p>
              <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">{CLINIC_CONFIG.doctorRole}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
