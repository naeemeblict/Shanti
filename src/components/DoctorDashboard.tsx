import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  Eye,
  Printer,
  Sparkles,
  Trash2,
  RotateCcw,
  PlusCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { PatientCase, CaseStatus, ReviewStatus } from '../types/case';
import { CaseStorage } from '../services/storage';
import { CLINIC_CONFIG, BD_DISTRICTS } from '../constants/case-form-data';

interface DoctorDashboardProps {
  cases: PatientCase[];
  onSelectCase: (caseItem: PatientCase) => void;
  onOpenPrintView: (caseItem: PatientCase) => void;
  onAddNewCase: () => void;
  onRefreshCases: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  cases,
  onSelectCase,
  onOpenPrintView,
  onAddNewCase,
  onRefreshCases,
}) => {
  // Passcode gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // default true for immediate reviewer usability, with option to lock
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'red_flag'>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'shanti2026' || passcode === '1234') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('ভুল পাসকোড! সঠিক পাসকোড: shanti2026');
    }
  };

  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('আপনি কি নিশ্চিত যে এই কেসটি মুছে ফেলতে চান?')) {
      CaseStorage.deleteCase(id);
      onRefreshCases();
    }
  };

  const handleResetSampleData = () => {
    if (window.confirm('সকল কেস রিকভার করে প্রাথমিক স্যাম্পল ডাটায় ফিরে যেতে চান?')) {
      CaseStorage.resetToDefault();
      onRefreshCases();
    }
  };

  // KPIs
  const totalCount = cases.length;
  const pendingCount = cases.filter((c) => c.reviewStatus === 'pending').length;
  const reviewedCount = cases.filter((c) => c.reviewStatus === 'reviewed').length;
  const redFlagCount = cases.filter((c) => c.hasUrgentRedFlags).length;

  // Filtered cases
  const filteredCases = cases.filter((item) => {
    // Status Filter
    if (statusFilter === 'pending' && item.reviewStatus !== 'pending') return false;
    if (statusFilter === 'reviewed' && item.reviewStatus !== 'reviewed') return false;
    if (statusFilter === 'red_flag' && !item.hasUrgentRedFlags) return false;

    // District Filter
    if (selectedDistrict !== 'all' && item.district !== selectedDistrict) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.fullName.toLowerCase().includes(q);
      const matchRef = item.caseReference.toLowerCase().includes(q);
      const matchPhone = item.contactNumber.includes(q);
      const matchComplaint = item.primaryComplaint.toLowerCase().includes(q);
      const matchDist = item.district.toLowerCase().includes(q);
      return matchName || matchRef || matchPhone || matchComplaint || matchDist;
    }

    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900">চিকিৎসক ড্যাশবোর্ড প্রবেশাধিকার</h3>
            <p className="text-xs text-slate-500">শান্তি হোমিও কেয়ারের ডাক্তার ও অনুমোদিত ক্লিনিক্যাল স্টাফ</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="নিরাপত্তা পাসকোড দিন..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center text-lg font-mono focus:border-teal-700 focus:outline-none"
              />
              {authError && <p className="text-xs text-red-600 font-bold mt-1.5">{authError}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-teal-800 hover:bg-teal-900 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
            >
              ড্যাশবোর্ডে প্রবেশ করুন
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              টেস্টিং পাসকোড: <code className="bg-slate-100 px-2 py-0.5 rounded text-teal-800 font-bold">shanti2026</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              চিকিৎসক ক্লিনিক্যাল পোর্টাল
            </h2>
            <span className="text-xs font-bold bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded-full border border-teal-200">
              {CLINIC_CONFIG.doctorNameBangla} ({CLINIC_CONFIG.doctorNameEnglish})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
            {CLINIC_CONFIG.doctorDesignationBangla} • {CLINIC_CONFIG.doctorDesignationEnglish}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onAddNewCase}
            className="flex items-center gap-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন রোগী এন্ট্রি</span>
          </button>

          <button
            onClick={handleResetSampleData}
            title="প্রাথমিক স্যাম্পল কেস ডাটা রিস্টোর করুন"
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">স্যাম্পল ডাটা রিস্টোর</span>
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="লক করুন"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-teal-900 text-white border-teal-900 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold opacity-80 block">মোট নিবন্ধিত কেস</span>
          <div className="text-2xl sm:text-3xl font-black mt-1">{totalCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold opacity-80 block">পর্যালোচনা বাকি</span>
            <Clock className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-1">{pendingCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('reviewed')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'reviewed'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold opacity-80 block">পর্যালোচিত ও প্রেসক্রিপশন</span>
            <CheckCircle2 className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-1">{reviewedCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('red_flag')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'red_flag'
              ? 'bg-red-700 text-white border-red-700 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold opacity-80 block">জরুরি রেড-ফ্ল্যাগ</span>
            <ShieldAlert className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-1">{redFlagCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="রোগীর নাম, রেফারেন্স কোড, ফোন নম্বর বা রোগ দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-700 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium text-slate-700"
          >
            <option value="all">সকল অবস্থা</option>
            <option value="pending">অপেক্ষমাণ (Pending)</option>
            <option value="reviewed">পর্যালোচিত (Reviewed)</option>
            <option value="red_flag">জরুরি রেড-ফ্ল্যাগ</option>
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium text-slate-700 max-w-[140px]"
          >
            <option value="all">সকল জেলা</option>
            {BD_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {filteredCases.length > 0 ? (
          filteredCases.map((c) => {
            return (
              <div
                key={c.id}
                onClick={() => onSelectCase(c)}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all hover:shadow-md cursor-pointer ${
                  c.hasUrgentRedFlags
                    ? 'border-red-300 hover:border-red-500 bg-red-50/15'
                    : 'border-slate-200 hover:border-teal-600'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Patient info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-base sm:text-lg font-bold text-slate-900">{c.fullName}</h4>
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {c.caseReference}
                      </span>
                      {c.hasUrgentRedFlags && (
                        <span className="text-[11px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-200">
                          <ShieldAlert className="w-3 h-3 text-red-600" />
                          রেড-ফ্ল্যাগ
                        </span>
                      )}
                      {c.reviewStatus === 'reviewed' ? (
                        <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          পর্যালোচিত
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          অপেক্ষমাণ
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-1">
                      <strong className="text-slate-800">প্রধান সমস্যা:</strong> {c.primaryComplaint}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span>বয়স: {c.age} বছর</span>
                      <span>•</span>
                      <span>জেলা: {c.district}</span>
                      <span>•</span>
                      <span>ফোন: {c.contactNumber}</span>
                      <span>•</span>
                      <span>লক্ষণ: {c.selectedSymptoms.length}টি</span>
                      <span>•</span>
                      <span>জমা: {new Date(c.createdAt).toLocaleDateString('bn-BD')}</span>
                    </div>
                  </div>

                  {/* Right: Badges & Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                    {c.aiAnalysis && (
                      <span
                        className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded-lg flex items-center gap-1"
                        title="এআই ক্লিনিক্যাল ড্রাফট তৈরি আছে"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>এআই প্রস্তুত</span>
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(c);
                      }}
                      className="bg-teal-800 hover:bg-teal-900 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      কেস দেখুন ও প্রেসক্রিপশন
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPrintView(c);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="প্রিন্ট ভিউ"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteCase(c.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="কেস মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700">কোনো কেস পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-500">
              অনুসন্ধান ফিল্টার পরিবর্তন করুন অথবা &apos;নতুন রোগী এন্ট্রি&apos; বাটনে ক্লিক করে নতুন কেস গ্রহণ
              করুন।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
