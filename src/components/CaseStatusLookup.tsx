import React, { useState } from 'react';
import { Search, FileText, CheckCircle2, Clock, Phone, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { PatientCase } from '../types/case';
import { CaseStorage } from '../services/storage';
import { CLINIC_CONFIG } from '../constants/case-form-data';

interface CaseStatusLookupProps {
  onSelectCaseToView: (caseItem: PatientCase) => void;
  onNavigateToForm: () => void;
}

export const CaseStatusLookup: React.FC<CaseStatusLookupProps> = ({
  onSelectCaseToView,
  onNavigateToForm,
}) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<PatientCase | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const match = CaseStorage.getCaseByReference(query.trim());
    setResult(match || null);
    setSearched(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          কেস হিস্ট্রি ও পর্যালোচনার অবস্থা অনুসন্ধান
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          আপনার কেস রেফারেন্স কোড (যেমন: <span className="font-mono text-teal-800 font-bold">SHC-C-2026-XXXX</span>)
          অথবা জমা দেওয়া মোবাইল নম্বর দিয়ে বর্তমান অবস্থা জানুন।
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto">
        <div className="flex gap-2 p-1.5 bg-white border-2 border-teal-700/40 focus-within:border-teal-700 rounded-2xl shadow-md">
          <div className="relative flex-1 flex items-center pl-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="রেফারেন্স কোড বা মোবাইল নম্বর লিখুন..."
              className="w-full px-3 py-2 text-sm sm:text-base focus:outline-none text-slate-800"
            />
          </div>
          <button
            type="submit"
            className="bg-teal-800 hover:bg-teal-900 text-white font-bold px-5 sm:px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            অনুসন্ধান
          </button>
        </div>
      </form>

      {/* Search Result */}
      {searched && (
        <div className="max-w-xl mx-auto animate-in fade-in duration-200">
          {result ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-slate-400">কেস রেফারেন্স</span>
                  <p className="text-lg font-black font-mono text-teal-950">{result.caseReference}</p>
                </div>
                <div className="text-right">
                  {result.reviewStatus === 'reviewed' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      চিকিৎসক পর্যবেক্ষণ সম্পন্ন
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      পর্যালোচনার জন্য অপেক্ষমাণ
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">রোগীর নাম</span>
                  <strong className="text-slate-800">{result.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">জমা দেওয়ার তারিখ</span>
                  <span className="text-slate-800">
                    {new Date(result.createdAt).toLocaleDateString('bn-BD')}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-xs">প্রধান সমস্যা</span>
                  <p className="text-slate-700 text-xs sm:text-sm line-clamp-2">{result.primaryComplaint}</p>
                </div>
              </div>

              {result.clinicalNotes?.prescriptionPlan && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs sm:text-sm space-y-1">
                  <strong className="text-emerald-950 block font-bold">
                    চিকিৎসকের পরামর্শ ও দিকনির্দেশনা:
                  </strong>
                  <p className="text-slate-700 whitespace-pre-line text-xs">
                    {result.clinicalNotes.prescriptionPlan}
                  </p>
                  {result.clinicalNotes.followUpDate && (
                    <p className="text-emerald-800 font-bold pt-1">
                      পরবর্তী সাক্ষাতের সম্ভাব্য তারিখ: {result.clinicalNotes.followUpDate}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => onSelectCaseToView(result)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>সম্পূর্ণ কেস ফাইল দেখুন</span>
                </button>
                <a
                  href={`tel:${CLINIC_CONFIG.phoneRaw}`}
                  className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>চেম্বারে কল করুন</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 text-center shadow-xs border border-slate-200 space-y-3">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800">কোনো রেকর্ড পাওয়া যায়নি</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                রেফারেন্স কোড বা ফোন নম্বরটি সঠিক কি না নিশ্চিত করুন। প্রয়োজনে নতুন কেস ফর্ম জমা দিন।
              </p>
              <button
                onClick={onNavigateToForm}
                className="inline-flex items-center gap-1.5 text-teal-800 hover:text-teal-950 font-bold text-xs sm:text-sm cursor-pointer"
              >
                <span>নতুন কেস ফর্ম পূরণ করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
